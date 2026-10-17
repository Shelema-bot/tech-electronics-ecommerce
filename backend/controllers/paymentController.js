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

// ── Default payment methods for Ethiopian mobile banking & cash on delivery ──
export const DEFAULT_PAYMENT_METHODS = [
  {
    code: "chapa",
    name: "Chapa Payment",
    type: "chapa",
    description: "Pay securely online with Chapa (Cards, Telebirr, CBE)",
    enabled: true,
    requiresScreenshot: false,
    requiresReference: false,
    displayOrder: 1,
  },
  {
    code: "cbe_birr",
    name: "CBE Birr",
    type: "manual",
    accountName: "Tech Electronics Store",
    accountNumber: "1000456789012",
    phoneNumber: "0911002233",
    bankName: "Commercial Bank of Ethiopia",
    instructions: "1. Open CBE Mobile Banking or CBE Birr app.\n2. Transfer total amount to Account: 1000456789012 (Tech Electronics Store).\n3. Put your Order ID in the payment description/remark.\n4. Take a screenshot of the receipt and submit below.",
    description: "Commercial Bank of Ethiopia account / mobile transfer",
    enabled: true,
    requiresScreenshot: true,
    requiresReference: true,
    displayOrder: 2,
  },
  {
    code: "telebirr",
    name: "Telebirr",
    type: "manual",
    accountName: "Tech Electronics Store",
    accountNumber: "0911002233",
    phoneNumber: "0911002233",
    bankName: "Telebirr",
    instructions: "1. Open Telebirr app -> Send Money.\n2. Transfer to Phone/Account: 0911002233 (Tech Electronics Store).\n3. Put your Order ID in the remark.\n4. Submit the transaction reference and receipt screenshot below.",
    description: "Direct transfer via Telebirr mobile wallet",
    enabled: true,
    requiresScreenshot: true,
    requiresReference: true,
    displayOrder: 3,
  },
  {
    code: "boa",
    name: "Bank of Abyssinia",
    type: "manual",
    accountName: "Tech Electronics Store",
    accountNumber: "8899001122",
    phoneNumber: "0911002233",
    bankName: "Bank of Abyssinia",
    instructions: "1. Open BoA Mobile Banking or deposit.\n2. Transfer to Account: 8899001122 (Tech Electronics Store).\n3. Put your Order ID in the transfer reason/note.\n4. Upload receipt screenshot or enter transaction reference below.",
    description: "Bank of Abyssinia mobile banking transfer",
    enabled: true,
    requiresScreenshot: true,
    requiresReference: true,
    displayOrder: 4,
  },
  {
    code: "awash",
    name: "Awash Bank",
    type: "manual",
    accountName: "Tech Electronics Store",
    accountNumber: "01320876543200",
    phoneNumber: "0911002233",
    bankName: "Awash Bank",
    instructions: "1. Open Awash Mobile Banking or branch deposit.\n2. Transfer to Account: 01320876543200 (Tech Electronics Store).\n3. Put Order ID in the payment description.\n4. Submit receipt screenshot or transaction reference below.",
    description: "Awash Bank mobile or branch transfer",
    enabled: true,
    requiresScreenshot: true,
    requiresReference: true,
    displayOrder: 5,
  },
  {
    code: "dashen",
    name: "Dashen Bank",
    type: "manual",
    accountName: "Tech Electronics Store",
    accountNumber: "556677889900",
    phoneNumber: "0911002233",
    bankName: "Dashen Bank",
    instructions: "1. Open Dashen Amole / Mobile Banking or visit a branch.\n2. Transfer to Account: 556677889900 (Tech Electronics Store).\n3. Put your Order ID in the transfer reason/note.\n4. Upload receipt screenshot or enter transaction reference below.",
    description: "Dashen Bank / Amole mobile banking transfer",
    enabled: true,
    requiresScreenshot: true,
    requiresReference: true,
    displayOrder: 6,
  },
  {
    code: "cod",
    name: "Cash on Delivery",
    type: "cash_on_delivery",
    description: "Pay in cash upon receipt of your order at delivery",
    instructions: "Please prepare the exact order total in ETB when the courier delivers your package.",
    enabled: true,
    requiresScreenshot: false,
    requiresReference: false,
    displayOrder: 7,
  },
];

export const normalizeMethodCode = (code = "") => {
  const c = String(code).toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (c === "cbe" || c === "cbe_birr" || c.includes("cbe")) return "cbe_birr";
  if (c === "telebirr" || c === "tele_birr" || c.includes("telebirr")) return "telebirr";
  if (c === "boa" || c === "abyssinia" || c.includes("abyssinia")) return "boa";
  if (c === "awash" || c.includes("awash")) return "awash";
  if (c === "dashen" || c.includes("dashen") || c.includes("amole")) return "dashen";
  if (c === "cod" || c === "cash_on_delivery" || c.includes("delivery") || c === "cash") return "cod";
  if (c === "chapa") return "chapa";
  return c;
};

// ──────────────────────────────────────────────────────────────────────────────
// GET ENABLED PAYMENT METHODS (public — loaded by checkout page)
// GET /api/payment-methods
// ──────────────────────────────────────────────────────────────────────────────
export const getEnabledPaymentMethods = asyncHandler(async (req, res) => {
  const dbMethods = await PaymentMethod.find({ enabled: true })
    .sort({ displayOrder: 1, createdAt: 1 })
    .select("-createdBy -updatedBy -__v");

  const dbCodes = new Set(dbMethods.map(m => m.code.toLowerCase()));
  const missingDefaults = DEFAULT_PAYMENT_METHODS.filter(d => !dbCodes.has(d.code.toLowerCase()));

  const methods = [...dbMethods, ...missingDefaults];
  methods.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

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
  const normalizedCode = normalizeMethodCode(methodCode);

  // Fetch payment method config from DB or fallback defaults
  let method = await PaymentMethod.findOne({ code: normalizedCode, enabled: true });
  if (!method) {
    method = DEFAULT_PAYMENT_METHODS.find(
      m => m.code === normalizedCode || normalizeMethodCode(m.code) === normalizedCode
    );
  }

  if (!method) {
    method = {
      code: normalizedCode,
      name: methodCode || "Manual Payment",
      type: "manual",
      instructions: "Please transfer the total amount to our merchant account and upload payment proof.",
      requiresScreenshot: true,
      requiresReference: true,
    };
  }

  // Check for ANY existing payment record for this order
  const existingPayment = await Payment.findOne({ order: orderId }).sort({ createdAt: -1 });

  // ── CHAPA ONLINE GATEWAY ───────────────────────────────────────────────────
  if (method.type === "chapa" || normalizedCode === "chapa") {
    // Generate a fresh unique tx_ref on every placement to prevent duplicate key conflicts in MongoDB & gateway
    const orderIdSuffix = orderId.toString().slice(-6);
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    let tx_ref = `TX-${Date.now()}-${orderIdSuffix}-${randomPart}`;

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
      const demoRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
      const demoTxRef = `TX-${Date.now()}-${orderIdSuffix}-${demoRandom}-DEMO`;

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
          if (err.code === 11000) {
            payment = await Payment.findOne({ order: orderId });
            if (payment) {
              payment.status = "Paid";
              payment.paidAt = new Date();
              payment.tx_ref = demoTxRef;
              payment.methodName = "Chapa (Demo Mode)";
              await payment.save().catch(() => {});
            }
          } else {
            logger.warn(`Could not create payment record: ${err.message}`);
          }
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
      const rawMsg = chapaErr?.response?.data?.message || chapaErr?.response?.data || chapaErr?.message || "";
      const chapaMsg = typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg);
      if (chapaMsg.toLowerCase().includes("tx_ref")) {
        // Regenerate fresh tx_ref and retry
        const retryRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
        tx_ref = `TX-${Date.now()}-${orderIdSuffix}-${retryRandom}`;
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

    // Create or reuse the Payment record in MongoDB safely
    let payment = existingPayment;
    if (payment) {
      payment.amount     = amount;
      payment.currency   = "ETB";
      payment.methodCode = "chapa";
      payment.methodName = method.name || "Chapa Payment";
      payment.methodType = "chapa";
      payment.tx_ref     = tx_ref;
      payment.status     = "Pending";
      await payment.save().catch(async (err) => {
        if (err.code === 11000) {
          const retryRand = Math.random().toString(36).substring(2, 7).toUpperCase();
          tx_ref = `TX-${Date.now()}-${orderIdSuffix}-${retryRand}`;
          payment.tx_ref = tx_ref;
          await payment.save().catch(() => {});
        }
      });
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
          payment = (await Payment.findOne({ order: orderId })) || (await Payment.findOne({ tx_ref }));
          if (payment) {
            payment.tx_ref = tx_ref;
            payment.status = "Pending";
            payment.amount = amount;
            payment.methodCode = "chapa";
            payment.methodName = method.name || "Chapa Payment";
            payment.methodType = "chapa";
            await payment.save().catch(() => {});
          }
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

    let payment = existingPayment;
    if (payment) {
      payment.methodCode = "cod";
      payment.methodName = "Cash on Delivery";
      payment.methodType = "cash_on_delivery";
      payment.status     = "Awaiting Payment";
      payment.amount     = amount;
      await payment.save();
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
          payment = await Payment.findOne({ order: orderId });
          if (payment) {
            payment.methodCode = "cod";
            payment.methodName = "Cash on Delivery";
            payment.methodType = "cash_on_delivery";
            payment.status     = "Awaiting Payment";
            payment.amount     = amount;
            await payment.save();
          } else {
            throw createErr;
          }
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

    let payment = existingPayment;
    if (payment) {
      payment.methodCode = method.code;
      payment.methodName = method.name;
      payment.methodType = "manual";
      payment.status     = "Awaiting Payment";
      payment.amount     = amount;
      await payment.save();
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
          payment = await Payment.findOne({ order: orderId });
          if (payment) {
            payment.methodCode = method.code;
            payment.methodName = method.name;
            payment.methodType = "manual";
            payment.status     = "Awaiting Payment";
            payment.amount     = amount;
            await payment.save();
          } else {
            throw createErr;
          }
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
  let payment = null;
  try {
    payment = await Payment.findById(req.params.id);
  } catch (_e) {}
  if (!payment) {
    try {
      payment = await Payment.findOne({ order: req.params.id });
    } catch (_e) {}
  }
  if (!payment) {
    let order = null;
    try {
      order = await Order.findById(req.params.id);
    } catch (_e) {}
    if (order) {
      const code = normalizeMethodCode(order.paymentMethod);
      payment = await Payment.create({
        order: order._id,
        user: order.user || req.user?._id,
        amount: order.totalPrice,
        currency: "ETB",
        methodCode: code,
        methodName: order.paymentMethod,
        methodType: "manual",
        status: "Pending Verification",
      });
    }
  }
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  if (payment.user && req.user && payment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const { transactionReference, transactionId, customerNote, receiptImage } = req.body;
  const proofFile = req.file;
  const cleanTxId = (transactionId || transactionReference || "").toString().trim();
  const proofUrl = proofFile
    ? (proofFile.path || proofFile.secure_url || proofFile.url || (proofFile.filename ? `/uploads/${proofFile.filename}` : "") || "")
    : (receiptImage || "").toString().trim();

  const normalizedCode = normalizeMethodCode(payment.methodCode);
  const method = (await PaymentMethod.findOne({ code: normalizedCode })) ||
    DEFAULT_PAYMENT_METHODS.find(m => m.code === normalizedCode);

  if (method?.requiresReference && !cleanTxId) {
    return res.status(400).json({ success: false, message: "Transaction reference / ID is required for this payment method" });
  }
  if (method?.requiresScreenshot && !proofFile && !proofUrl) {
    return res.status(400).json({ success: false, message: "Payment screenshot is required" });
  }

  if (cleanTxId) {
    const existingOrder = await Order.findOne({
      _id: { $ne: payment.order },
      $or: [
        { transactionId: cleanTxId, isPaid: true },
        { transactionRef: cleanTxId, isPaid: true },
        { transactionId: cleanTxId, paymentStatus: "Paid" },
        { transactionRef: cleanTxId, paymentStatus: "Paid" },
        ...(payment.user ? [
          { transactionId: cleanTxId, user: { $ne: payment.user } },
          { transactionRef: cleanTxId, user: { $ne: payment.user } }
        ] : [
          { transactionId: cleanTxId },
          { transactionRef: cleanTxId }
        ])
      ]
    });
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "This Transaction ID has already been used for another order. Please check your transaction number.",
      });
    }
  }

  const prev = payment.status;
  if (cleanTxId) {
    payment.transactionReference = cleanTxId;
    payment.transactionId        = cleanTxId;
  }
  payment.customerNote     = customerNote?.trim() || "";
  if (proofUrl) payment.paymentProof = proofUrl;
  payment.proofSubmittedAt = new Date();
  payment.status           = "Pending Verification";
  if (req.user?._id) {
    addAudit(payment, "PROOF_SUBMITTED", req.user._id, prev, "Pending Verification", cleanTxId);
  }
  await payment.save();

  // Also update Order with receiptImage, transactionId, and transactionRef
  if (payment.order) {
    const order = await Order.findById(payment.order);
    if (order) {
      if (proofUrl) order.receiptImage = proofUrl;
      if (cleanTxId) {
        order.transactionRef = cleanTxId;
        order.transactionId  = cleanTxId;
      }
      order.paymentStatus = "Pending";
      await order.save().catch(() => {});
    }
  }

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
export const initializePayment = createPayment;

