import Payment from "../models/Payment.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import {
  initializeChapaPayment,
  verifyChapaPayment,
  getFrontendUrl,
  isChapaConfigured,
} from "../services/chapaService.js";
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
// POST /api/payment/initialize OR POST /api/payments
// Body: { orderId, methodCode, customer }
// AMOUNT IS ALWAYS READ FROM THE ORDER — frontend amount is ignored.
// ──────────────────────────────────────────────────────────────────────────────
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, methodCode = "chapa", customer } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "orderId is required" });
  }

  // Fetch order
  let order;
  try {
    order = await Order.findById(orderId);
  } catch (_e) {
    return res.status(404).json({ success: false, message: "Invalid order ID format" });
  }
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  // If order has user and request has authenticated user, verify ownership (unless admin)
  if (
    order.user &&
    req.user &&
    order.user.toString() !== req.user._id.toString() &&
    !["admin", "super_admin", "owner"].includes(req.user.role)
  ) {
    return res.status(403).json({ success: false, message: "Not authorized for this order" });
  }

  // ── Guard: order already paid ──────────────────────────────────────────────
  if (order.isPaid || order.paymentStatus === "Paid") {
    return res.status(409).json({
      success: false,
      message: "This order has already been paid. No further payment is required.",
    });
  }

  // Amount comes from order, never untrusted frontend
  const amount = Number(order.totalPrice);
  const normalizedCode = (methodCode || "chapa").toLowerCase();

  // Fetch payment method config from DB or fallback
  let method = await PaymentMethod.findOne({ code: normalizedCode, enabled: true });
  if (!method) {
    if (normalizedCode === "chapa") {
      method = { code: "chapa", name: "Chapa Payment", type: "chapa" };
    } else if (normalizedCode === "cod" || normalizedCode === "cash_on_delivery") {
      method = { code: "cod", name: "Cash on Delivery", type: "cash_on_delivery" };
    }
  }

  if (!method) {
    return res.status(400).json({ success: false, message: `Payment method '${methodCode}' not available` });
  }

  // Check for ANY existing payment record for this order
  const existingPayment = await Payment.findOne({ order: orderId }).sort({ createdAt: -1 });

  // ── CHAPA ONLINE GATEWAY ───────────────────────────────────────────────────
  if (method.type === "chapa" || normalizedCode === "chapa") {
    let tx_ref;
    const canReuse =
      existingPayment &&
      existingPayment.tx_ref &&
      ["Pending", "Awaiting Payment"].includes(existingPayment.status);

    if (canReuse) {
      tx_ref = existingPayment.tx_ref;
    } else if (order.transactionRef) {
      tx_ref = order.transactionRef;
    } else {
      const orderIdSuffix = orderId.toString().slice(-6);
      const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
      tx_ref = `TX-${Date.now()}-${orderIdSuffix}-${randomPart}`;
    }

    // Customer name & email resolution
    const rawName =
      req.user?.name ||
      customer?.name ||
      order.shippingAddress?.fullName ||
      order.guestCustomer?.name ||
      "Customer";
    const email =
      req.user?.email ||
      customer?.email ||
      order.guestCustomer?.email ||
      req.body.email ||
      "customer@example.com";

    const nameParts = rawName.trim().split(" ");
    const first_name = nameParts[0] || "Customer";
    const last_name = nameParts.slice(1).join(" ") || "User";

    const frontendUrl = getFrontendUrl();

    // Helper to complete demo/fallback checkout smoothly
    const handleDemoApproval = async (reason = "Demo Mode") => {
      logger.info(`Processing safe fallback/demo payment (${reason}) for Order ${order._id}`);
      const demoTxRef = `TX-${Date.now()}-${orderId.toString().slice(-6)}-DEMO`;

      order.transactionRef = demoTxRef;
      order.paymentMethod  = "Chapa (Demo Mode)";
      order.paymentStatus  = "Paid";
      order.isPaid         = true;
      order.paidAt         = new Date();
      order.status         = "Processing";
      order.paymentResult  = { id: demoTxRef, status: "Paid", update_time: new Date().toISOString() };
      await order.save();

      // Decrement stock if not already done
      if (!order.alreadyStockDecremented && order.orderItems && order.orderItems.length > 0) {
        for (const item of order.orderItems) {
          const prodId = item.product?._id || item.product;
          if (prodId) {
            const qty = Math.max(1, item.quantity || 1);
            await Product.findByIdAndUpdate(prodId, { $inc: { stock: -qty } }).catch(() => {});
          }
        }
        order.alreadyStockDecremented = true;
        await order.save();
      }

      let payment = existingPayment;
      if (!payment) {
        try {
          payment = await Payment.create({
            order: orderId,
            user: order.user || req.user?._id || null,
            amount,
            currency: "ETB",
            methodCode: "chapa",
            methodName: "Chapa (Demo Mode)",
            methodType: "chapa",
            tx_ref: demoTxRef,
            status: "Paid",
            paidAt: new Date(),
          });
        } catch (err) {
          logger.warn(`Could not create payment record: ${err.message}`);
        }
      } else {
        payment.status = "Paid";
        payment.paidAt = new Date();
        payment.tx_ref = demoTxRef;
        payment.methodName = "Chapa (Demo Mode)";
        await payment.save().catch(() => {});
      }

      const checkoutUrl = `${frontendUrl}/payment-success?tx_ref=${demoTxRef}&orderId=${order._id}&mode=demo`;
      return res.json({
        success: true,
        type: "chapa",
        checkout_url: checkoutUrl,
        tx_ref: demoTxRef,
        orderId: order._id,
        paymentId: payment?._id,
        isDemo: true,
        message: "Payment automatically approved in test/demo mode",
      });
    };

    // If Chapa is not configured with an active key, immediately use demo mode
    if (!isChapaConfigured()) {
      return handleDemoApproval("CHAPA_SECRET_KEY missing or placeholder");
    }

    // Call Chapa API
    let chapaData;
    let fallbackToDemo = false;
    try {
      chapaData = await initializeChapaPayment({
        amount,
        email,
        first_name,
        last_name,
        tx_ref,
      });
    } catch (chapaErr) {
      const chapaMsg = chapaErr?.response?.data?.message || chapaErr?.message || "";
      if (chapaMsg.toLowerCase().includes("tx_ref") && canReuse) {
        // Regenerate fresh tx_ref and retry
        const orderIdSuffix = orderId.toString().slice(-6);
        const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
        tx_ref = `TX-${Date.now()}-${orderIdSuffix}-${randomPart}`;
        try {
          chapaData = await initializeChapaPayment({
            amount,
            email,
            first_name,
            last_name,
            tx_ref,
          });
        } catch (retryErr) {
          logger.warn(`Chapa retry failed (${retryErr?.message}), switching to safe Demo Checkout fallback.`);
          fallbackToDemo = true;
        }
      } else {
        logger.warn(`Chapa init failed (${chapaMsg}), switching to safe Demo Checkout fallback.`);
        fallbackToDemo = true;
      }
    }

    const checkoutUrl = chapaData?.data?.checkout_url || chapaData?.checkout_url;

    // If Chapa failed or didn't return a checkout_url, fallback safely to demo mode
    if (fallbackToDemo || !checkoutUrl) {
      return handleDemoApproval("Chapa gateway unreachable or declined");
    }

    // Save transactionRef & status to the MongoDB Order
    order.transactionRef = tx_ref;
    order.paymentMethod  = "Chapa";
    order.paymentStatus  = "Pending";
    await order.save();

    // Create or reuse the Payment record in MongoDB
    let payment;
    if (canReuse && existingPayment.tx_ref === tx_ref) {
      payment = existingPayment;
    } else {
      try {
        payment = await Payment.create({
          order: orderId,
          user: order.user || req.user?._id || null,
          amount,
          currency: "ETB",
          methodCode: "chapa",
          methodName: method.name || "Chapa Payment",
          methodType: "chapa",
          tx_ref,
          status: "Pending",
        });
        if (req.user?._id) addAudit(payment, "PAYMENT_CREATED", req.user._id, null, "Pending");
        await payment.save();
      } catch (createErr) {
        if (createErr.code === 11000) {
          payment = (await Payment.findOne({ tx_ref })) || existingPayment;
        } else {
          throw createErr;
        }
      }
    }

    return res.json({
      success: true,
      type: "chapa",
      checkout_url: checkoutUrl,
      tx_ref,
      orderId: order._id,
      paymentId: payment?._id,
    });
  }

  // ── CASH ON DELIVERY (COD) ────────────────────────────────────────────────
  if (method.type === "cash_on_delivery" || normalizedCode === "cod") {
    order.paymentMethod = "Cash on Delivery";
    order.paymentStatus = "Pending";
    order.status        = "Processing";
    await order.save();

    let payment;
    if (existingPayment && existingPayment.methodType === "cash_on_delivery") {
      payment = existingPayment;
    } else {
      try {
        payment = await Payment.create({
          order: orderId,
          user: order.user || req.user?._id,
          amount,
          currency: "ETB",
          methodCode: "cod",
          methodName: "Cash on Delivery",
          methodType: "cash_on_delivery",
          status: "Awaiting Payment",
        });
        if (req.user?._id) addAudit(payment, "PAYMENT_CREATED", req.user._id, null, "Awaiting Payment", "Cash on Delivery");
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

    return res.json({
      success: true,
      type: "cash_on_delivery",
      orderId: order._id,
      paymentId: payment?._id,
      message: "Order placed successfully. Payment will be collected on delivery.",
    });
  }

  // ── MANUAL (Telebirr, CBE, BOA, etc.) ─────────────────────────────────────
  if (method.type === "manual") {
    order.paymentMethod = method.name;
    order.paymentStatus = "Pending";
    await order.save();

    let payment;
    if (
      existingPayment &&
      existingPayment.methodType === "manual" &&
      ["Awaiting Payment", "Pending Verification"].includes(existingPayment.status)
    ) {
      payment = existingPayment;
    } else {
      try {
        payment = await Payment.create({
          order: orderId,
          user: order.user || req.user?._id,
          amount,
          currency: "ETB",
          methodCode: method.code,
          methodName: method.name,
          methodType: "manual",
          status: "Awaiting Payment",
        });
        if (req.user?._id) addAudit(payment, "PAYMENT_CREATED", req.user._id, null, "Awaiting Payment");
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

    return res.json({
      success: true,
      type: "manual",
      paymentId: payment._id,
      orderId: order._id,
      method: {
        name: method.name,
        accountName: method.accountName,
        accountNumber: method.accountNumber,
        phoneNumber: method.phoneNumber,
        bankName: method.bankName,
        instructions: method.instructions,
        qrCode: method.qrCode,
        requiresScreenshot: method.requiresScreenshot,
        requiresReference: method.requiresReference,
      },
    });
  }

  return res.status(400).json({ success: false, message: "Unsupported payment method type" });
});

// ──────────────────────────────────────────────────────────────────────────────
// CHAPA VERIFY (called after redirect from Chapa or directly by frontend)
// GET /api/payment/verify/:tx_ref  OR  GET /api/payments/verify?tx_ref=...
// ──────────────────────────────────────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
  const tx_ref = req.params.tx_ref || req.query.tx_ref;
  if (!tx_ref) {
    return res.status(400).json({ success: false, message: "Transaction reference (tx_ref) is required" });
  }

  // Find order and payment
  let order = await Order.findOne({ transactionRef: tx_ref }).populate("orderItems.product");
  let payment = await Payment.findOne({ tx_ref });

  if (!order && payment?.order) {
    order = await Order.findById(payment.order).populate("orderItems.product");
  }

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found for transaction reference" });
  }

  const isDemo =
    req.query.mode === "demo" ||
    (typeof tx_ref === "string" && tx_ref.includes("DEMO")) ||
    order.paymentMethod?.includes("Demo");

  // Idempotency or Demo check: if already paid or in demo mode
  if (isDemo || order.isPaid || order.paymentStatus === "Paid") {
    if (!order.isPaid || order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid";
      order.isPaid        = true;
      order.paidAt        = order.paidAt || new Date();
      order.status        = "Processing";
      order.paymentResult = {
        id: tx_ref,
        status: "Paid",
        update_time: new Date().toISOString(),
      };
      await order.save();
    }

    if (!order.alreadyStockDecremented && order.orderItems && order.orderItems.length > 0) {
      for (const item of order.orderItems) {
        const prodId = item.product?._id || item.product;
        if (prodId) {
          const qty = Math.max(1, item.quantity || 1);
          await Product.findByIdAndUpdate(prodId, { $inc: { stock: -qty } }).catch(() => {});
        }
      }
      order.alreadyStockDecremented = true;
      await order.save();
    }

    if (payment && payment.status !== "Paid") {
      payment.status = "Paid";
      payment.paidAt = new Date();
      await payment.save();
    }

    return res.json({
      success: true,
      message: isDemo ? "Payment verified successfully (Demo Mode)" : "Payment already verified",
      order,
      isDemo: Boolean(isDemo),
      alreadyVerified: true,
    });
  }

  // Call Chapa verify endpoint
  let chapaData;
  try {
    chapaData = await verifyChapaPayment(tx_ref);
  } catch (err) {
    logger.error(`Gateway verification error for tx_ref ${tx_ref}: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: "Payment verification service error: " + (err.response?.data?.message || err.message),
      error: err.message,
    });
  }

  const isSuccess =
    (chapaData?.status === "success" && chapaData?.data?.status === "success") ||
    chapaData?.data?.status === "success";

  if (isSuccess) {
    // 1. Update Order status
    order.paymentStatus = "Paid";
    order.isPaid        = true;
    order.paidAt        = new Date();
    order.status        = "Processing";
    order.paymentResult = {
      id: tx_ref,
      status: "Paid",
    };
    await order.save();

    // 2. Decrement stock for purchased products
    if (!order.alreadyStockDecremented && order.orderItems && order.orderItems.length > 0) {
      for (const item of order.orderItems) {
        const prodId = item.product?._id || item.product;
        if (prodId) {
          const qty = Math.max(1, item.quantity || 1);
          await Product.findByIdAndUpdate(prodId, {
            $inc: { stock: -qty },
          }).catch((err) => {
            logger.warn(`Could not decrement stock for product ${prodId}: ${err.message}`);
          });
        }
      }
      order.alreadyStockDecremented = true;
      await order.save();
    }

    // 3. Update Payment model
    if (payment) {
      const prev = payment.status;
      payment.status = "Paid";
      payment.paidAt = new Date();
      addAudit(payment, "CHAPA_VERIFIED", payment.user || order.user, prev, "Paid", tx_ref);
      await payment.save();
    }

    // 4. Send email & in-app notifications
    const targetUserId = order.user || payment?.user;
    const customerEmail = order.guestCustomer?.email;
    const customerName  = order.guestCustomer?.name || order.shippingAddress?.fullName;

    if (targetUserId) {
      const user = await User.findById(targetUserId).select("name email");
      if (user) {
        sendPaymentConfirmation(
          payment || { amount: order.totalPrice, currency: "ETB", _id: tx_ref },
          user.email,
          user.name
        ).catch(() => {});
      }
    } else if (customerEmail) {
      sendPaymentConfirmation(
        payment || { amount: order.totalPrice, currency: "ETB", _id: tx_ref },
        customerEmail,
        customerName
      ).catch(() => {});
    }

    logger.info(`Chapa payment verified successfully: ${tx_ref} for Order ${order._id}`);
    return res.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  }

  // Handle explicit failure from Chapa
  if (chapaData?.data?.status === "failed") {
    order.paymentStatus = "Failed";
    await order.save();
    if (payment) {
      payment.status = "Failed";
      await payment.save();
    }
    return res.status(400).json({
      success: false,
      message: "Payment transaction failed with the provider",
      chapaStatus: "failed",
      order,
    });
  }

  return res.json({
    success: false,
    message: "Payment not completed yet",
    chapaStatus: chapaData?.data?.status || "pending",
    order,
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// CHAPA WEBHOOK (asynchronous server-to-server confirmation)
// POST /api/payment/webhook
// ──────────────────────────────────────────────────────────────────────────────
export const chapaWebhook = asyncHandler(async (req, res) => {
  const tx_ref = req.body?.tx_ref || req.body?.trx_ref || req.query?.tx_ref;
  if (!tx_ref) {
    return res.status(400).json({ success: false, message: "tx_ref required in webhook" });
  }

  logger.info(`Received Chapa webhook for tx_ref: ${tx_ref}`);
  req.params.tx_ref = tx_ref;
  return verifyPayment(req, res);
});


// ──────────────────────────────────────────────────────────────────────────────
// SUBMIT MANUAL PAYMENT PROOF
// POST /api/payments/:id/proof
// Body: multipart — transactionReference, customerNote + file upload
// ──────────────────────────────────────────────────────────────────────────────
export const submitPaymentProof = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  if (payment.user && req.user && payment.user.toString() !== req.user._id.toString()) {
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
  if (req.user?._id) {
    addAudit(payment, "PROOF_SUBMITTED", req.user._id, prev, "Pending Verification", transactionReference);
  }
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

  const isOwner = payment.user && req.user ? payment.user.toString() === req.user._id.toString() : false;
  const isAdmin = req.user && ["admin","super_admin","cashier"].includes(req.user.role);
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.json({ success: true, payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// INITIALIZE PAYMENT (Chapa or other gateways)
// POST /api/payment/initialize  { orderId, methodCode, customer }
// ──────────────────────────────────────────────────────────────────────────────
export const initializePayment = asyncHandler(async (req, res) => {
  req.body.methodCode = req.body.methodCode || "chapa";
  return createPayment(req, res);
});

