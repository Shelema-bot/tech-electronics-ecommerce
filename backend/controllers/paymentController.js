import Payment from "../models/Payment.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { initializeChapaPayment, verifyChapaPayment } from "../services/chapaService.js";
import { sendPaymentConfirmation } from "../utils/sendEmail.js";
import logger from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── helpers ─────────────────────────────────────────────────────────────────
const addAudit = (payment, action, userId, fromStatus, toStatus, note = "") => {
  payment.auditLog.push({ action, performedBy: userId, fromStatus, toStatus, note, timestamp: new Date() });
};

// ──────────────────────────────────────────────────────────────────────────────
// GET ENABLED PAYMENT METHODS (public — loaded by checkout page)
// GET /api/payment-methods
// ──────────────────────────────────────────────────────────────────────────────
export const getEnabledPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find({ enabled: true })
    .sort({ displayOrder: 1, createdAt: 1 })
    .select("-createdBy -updatedBy -__v");
  res.json({ success: true, methods });
});

// ──────────────────────────────────────────────────────────────────────────────
// INITIALIZE / CREATE PAYMENT
// POST /api/payments
// Body: { orderId, methodCode }
// AMOUNT IS ALWAYS READ FROM THE ORDER — frontend amount is ignored.
// ──────────────────────────────────────────────────────────────────────────────
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, methodCode } = req.body;

  if (!orderId || !methodCode) {
    return res.status(400).json({ success: false, message: "orderId and methodCode are required" });
  }

  // Fetch order — verify it belongs to this user
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized for this order" });
  }

  // ── Guard: order already paid ──────────────────────────────────────────────
  if (order.isPaid) {
    return res.status(409).json({
      success: false,
      message: "This order has already been paid. No further payment is required.",
    });
  }

  // Amount comes from order, never from frontend
  const amount = order.totalPrice;

  // Fetch payment method config
  const method = await PaymentMethod.findOne({ code: methodCode, enabled: true });
  if (!method) return res.status(400).json({ success: false, message: "Payment method not available" });

  // ── Check for ANY existing payment for this order ────────────────────────────
  const existingPayment = await Payment.findOne({ order: orderId }).sort({ createdAt: -1 });

  // ── CHAPA ─────────────────────────────────────────────────────────────────
  if (method.type === "chapa") {
    // Reuse pending payment's tx_ref; generate fresh one otherwise
    let tx_ref;
    const canReuse = existingPayment
      && existingPayment.tx_ref
      && ["Pending", "Awaiting Payment"].includes(existingPayment.status);

    if (canReuse) {
      tx_ref = existingPayment.tx_ref;
    } else {
      const orderIdSuffix = orderId.toString().slice(-6);
      const randomPart = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 5);
      tx_ref = `TX-${Date.now()}-${orderIdSuffix}-${randomPart}`;
    }

    const names = req.user.name.trim().split(" ");

    // Call Chapa — catch errors explicitly so we return a meaningful response
    let chapaData;
    try {
      chapaData = await initializeChapaPayment({
        amount,
        email: req.user.email,
        first_name: names[0] || "Customer",
        last_name:  names.slice(1).join(" ") || "User",
        tx_ref,
      });
    } catch (chapaErr) {
      // If Chapa rejects because tx_ref already exists, generate a new one and retry once
      const chapaMsg = chapaErr?.response?.data?.message || chapaErr?.message || "";
      if (chapaMsg.toLowerCase().includes("tx_ref") && canReuse) {
        // The reused tx_ref was rejected by Chapa — generate a fresh one
        const orderIdSuffix = orderId.toString().slice(-6);
        const randomPart = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 5);
        tx_ref = `TX-${Date.now()}-${orderIdSuffix}-${randomPart}`;
        try {
          chapaData = await initializeChapaPayment({
            amount,
            email: req.user.email,
            first_name: names[0] || "Customer",
            last_name:  names.slice(1).join(" ") || "User",
            tx_ref,
          });
        } catch (retryErr) {
          logger.error(`Chapa retry failed: ${retryErr?.response?.data?.message || retryErr?.message}`);
          return res.status(502).json({
            success: false,
            message: "Payment provider error. Please try again or choose a different payment method.",
          });
        }
      } else {
        logger.error(`Chapa init failed: ${chapaMsg}`);
        return res.status(502).json({
          success: false,
          message: chapaMsg || "Failed to initialize payment with the provider.",
        });
      }
    }

    const checkoutUrl = chapaData?.data?.checkout_url || chapaData?.checkout_url;
    if (!checkoutUrl) {
      return res.status(502).json({ success: false, message: "Payment provider did not return a checkout URL" });
    }

    // Create or reuse the Payment record — handle duplicate key gracefully
    let payment;
    if (canReuse && existingPayment.tx_ref === tx_ref) {
      payment = existingPayment;
    } else {
      try {
        payment = await Payment.create({
          order: orderId, user: req.user._id, amount, currency: "ETB",
          methodCode: method.code, methodName: method.name, methodType: "chapa",
          tx_ref, status: "Pending",
        });
        addAudit(payment, "PAYMENT_CREATED", req.user._id, null, "Pending");
        await payment.save();
      } catch (createErr) {
        // E11000 duplicate key — find the existing record and reuse it
        if (createErr.code === 11000) {
          payment = await Payment.findOne({ tx_ref }) || existingPayment;
          if (!payment) {
            return res.status(500).json({ success: false, message: "Payment record conflict. Please try again." });
          }
        } else {
          throw createErr;
        }
      }
    }

    return res.json({ success: true, type: "chapa", checkout_url: checkoutUrl, tx_ref, paymentId: payment._id });
  }

  // ── CASH ON DELIVERY ──────────────────────────────────────────────────────
  if (method.type === "cash_on_delivery") {
    // Reuse existing COD payment if one exists for this order
    let payment;
    if (existingPayment && existingPayment.methodType === "cash_on_delivery") {
      payment = existingPayment;
    } else {
      try {
        payment = await Payment.create({
          order: orderId, user: req.user._id, amount, currency: "ETB",
          methodCode: method.code, methodName: method.name, methodType: "cash_on_delivery",
          status: "Awaiting Payment",
        });
        addAudit(payment, "PAYMENT_CREATED", req.user._id, null, "Awaiting Payment", "Cash on Delivery");
        await payment.save();
      } catch (createErr) {
        if (createErr.code === 11000) {
          payment = await Payment.findOne({ order: orderId, methodType: "cash_on_delivery" });
          if (!payment) throw createErr;
        } else {
          throw createErr;
        }
      }
    }

    // Update order status
    order.status = "Processing";
    order.paymentMethod = method.name;
    await order.save();

    return res.json({ success: true, type: "cash_on_delivery", paymentId: payment._id, message: "Order placed. Pay on delivery." });
  }

  // ── MANUAL (Telebirr, CBE, BOA, etc.) ────────────────────────────────────
  if (method.type === "manual") {
    let payment;
    if (existingPayment && existingPayment.methodType === "manual"
        && ["Awaiting Payment", "Pending Verification"].includes(existingPayment.status)) {
      payment = existingPayment;
    } else {
      try {
        payment = await Payment.create({
          order: orderId, user: req.user._id, amount, currency: "ETB",
          methodCode: method.code, methodName: method.name, methodType: "manual",
          status: "Awaiting Payment",
        });
        addAudit(payment, "PAYMENT_CREATED", req.user._id, null, "Awaiting Payment");
        await payment.save();
      } catch (createErr) {
        if (createErr.code === 11000) {
          payment = await Payment.findOne({ order: orderId, methodType: "manual" });
          if (!payment) throw createErr;
        } else {
          throw createErr;
        }
      }
    }

    order.paymentMethod = method.name;
    await order.save();

    return res.json({
      success: true, type: "manual", paymentId: payment._id,
      method: {
        name: method.name, accountName: method.accountName,
        accountNumber: method.accountNumber, phoneNumber: method.phoneNumber,
        bankName: method.bankName, instructions: method.instructions,
        qrCode: method.qrCode, requiresScreenshot: method.requiresScreenshot,
        requiresReference: method.requiresReference,
      },
    });
  }

  return res.status(400).json({ success: false, message: "Unsupported payment method type" });
});

// ──────────────────────────────────────────────────────────────────────────────
// CHAPA VERIFY (called after redirect from Chapa)
// GET /api/payments/verify?tx_ref=...
// ──────────────────────────────────────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
  const { tx_ref } = req.query;
  if (!tx_ref) return res.status(400).json({ success: false, message: "tx_ref required" });

  const chapaData = await verifyChapaPayment(tx_ref);
  const payment   = await Payment.findOne({ tx_ref });
  if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

  const isSuccess =
    (chapaData?.status === "success" && chapaData?.data?.status === "success") ||
    chapaData?.data?.status === "success";

  if (isSuccess) {
    const prev = payment.status;
    payment.status = "Paid";
    payment.paidAt = new Date();
    addAudit(payment, "CHAPA_VERIFIED", payment.user, prev, "Paid");
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) { order.isPaid = true; order.paidAt = new Date(); order.status = "Processing"; await order.save(); }

    const user = await User.findById(payment.user).select("name email");
    if (user) sendPaymentConfirmation(payment, user.email, user.name).catch(() => {});

    logger.info(`Chapa payment verified: ${tx_ref}`);
    return res.json({ success: true, message: "Payment verified successfully" });
  }

  return res.json({ success: false, message: "Payment not completed yet", chapaStatus: chapaData?.data?.status });
});

// ──────────────────────────────────────────────────────────────────────────────
// SUBMIT MANUAL PAYMENT PROOF
// POST /api/payments/:id/proof
// Body: multipart — transactionReference, customerNote + file upload
// ──────────────────────────────────────────────────────────────────────────────
export const submitPaymentProof = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  if (payment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const { transactionReference, customerNote } = req.body;
  const proofFile = req.file;

  const method = await PaymentMethod.findOne({ code: payment.methodCode });
  if (method?.requiresReference && !transactionReference?.trim()) {
    return res.status(400).json({ success: false, message: "Transaction reference is required for this payment method" });
  }
  if (method?.requiresScreenshot && !proofFile) {
    return res.status(400).json({ success: false, message: "Payment screenshot is required" });
  }

  const prev = payment.status;
  payment.transactionReference = transactionReference?.trim() || payment.transactionReference;
  payment.customerNote         = customerNote?.trim() || "";
  if (proofFile)    payment.paymentProof = proofFile.path;  // Cloudinary URL
  payment.proofSubmittedAt     = new Date();
  payment.status               = "Pending Verification";
  addAudit(payment, "PROOF_SUBMITTED", req.user._id, prev, "Pending Verification", transactionReference);
  await payment.save();

  logger.info(`Payment proof submitted: ${payment._id}`);
  res.json({ success: true, message: "Payment proof submitted. Awaiting admin verification.", payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// GET MY PAYMENTS
// GET /api/payments/my
// ──────────────────────────────────────────────────────────────────────────────
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("order", "totalPrice status orderItems")
    .sort({ createdAt: -1 })
    .select("-auditLog");
  res.json({ success: true, payments });
});

// ──────────────────────────────────────────────────────────────────────────────
// GET SINGLE PAYMENT (owner or admin)
// GET /api/payments/:id
// ──────────────────────────────────────────────────────────────────────────────
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("order", "totalPrice status orderItems paymentMethod")
    .populate("verifiedBy", "name")
    .populate("collectedBy", "name");

  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

  const isOwner = payment.user.toString() === req.user._id.toString();
  const isAdmin = ["admin","super_admin","cashier"].includes(req.user.role);
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.json({ success: true, payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// LEGACY: initialize Chapa (kept for backward compatibility with old checkout)
// POST /api/payments/initialize  { orderId, amount }
// ──────────────────────────────────────────────────────────────────────────────
export const initializePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  // Delegate to createPayment with methodCode "chapa"
  req.body.methodCode = "chapa";
  return createPayment(req, res);
});
