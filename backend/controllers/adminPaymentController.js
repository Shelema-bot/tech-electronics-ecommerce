import Payment from "../models/Payment.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

const addAudit = (payment, action, userId, fromStatus, toStatus, note = "") => {
  payment.auditLog.push({ action, performedBy: userId, fromStatus, toStatus, note, timestamp: new Date() });
};

// ──────────────────────────────────────────────────────────────────────────────
// GET ALL PAYMENTS (ADMIN)
// ──────────────────────────────────────────────────────────────────────────────
export const getAllPaymentsAdmin = asyncHandler(async (req, res) => {
  const { status, methodCode, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status)     filter.status     = status;
  if (methodCode) filter.methodCode = methodCode;

  const skip = (Number(page) - 1) * Number(limit);
  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("user",  "name email phone")
      .populate("order", "_id totalPrice status")
      .populate("verifiedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit)),
    Payment.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), count: payments.length, payments });
});

// ──────────────────────────────────────────────────────────────────────────────
// GET SINGLE PAYMENT (ADMIN)
// ──────────────────────────────────────────────────────────────────────────────
export const getPaymentAdmin = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("user",       "name email phone")
    .populate("order",      "totalPrice status orderItems paymentMethod")
    .populate("verifiedBy", "name email")
    .populate("collectedBy","name email");

  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  res.json({ success: true, payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// APPROVE PAYMENT (ADMIN)
// PATCH /api/admin/payments/:id/verify
// ──────────────────────────────────────────────────────────────────────────────
export const approvePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

  if (payment.status === "Paid") {
    return res.status(400).json({ success: false, message: "Payment is already marked as Paid" });
  }

  const prev = payment.status;
  payment.status      = "Paid";
  payment.paidAt      = new Date();
  payment.verifiedAt  = new Date();
  payment.verifiedBy  = req.user._id;
  payment.adminNote   = req.body.note || "";
  addAudit(payment, "ADMIN_APPROVED_PAYMENT", req.user._id, prev, "Paid", req.body.note);
  await payment.save();

  // Update order
  const order = await Order.findById(payment.order);
  if (order) {
    order.isPaid  = true;
    order.paidAt  = new Date();
    order.status  = "Processing";
    await order.save();
  }

  logger.info(`Payment approved by admin: ${payment._id} (${req.user.email})`);
  res.json({ success: true, message: "Payment approved and marked as Paid", payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// REJECT PAYMENT (ADMIN)
// PATCH /api/admin/payments/:id/reject
// ──────────────────────────────────────────────────────────────────────────────
export const rejectPayment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason?.trim()) {
    return res.status(400).json({ success: false, message: "Rejection reason is required" });
  }

  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

  const prev = payment.status;
  payment.status          = "Rejected";
  payment.rejectionReason = reason.trim();
  payment.verifiedAt      = new Date();
  payment.verifiedBy      = req.user._id;
  addAudit(payment, "ADMIN_REJECTED_PAYMENT", req.user._id, prev, "Rejected", reason);
  await payment.save();

  // Update order to indicate payment verification required
  const order = await Order.findById(payment.order);
  if (order && order.status !== "Cancelled") {
    order.status = "Pending";
    await order.save();
  }

  logger.info(`Payment rejected by admin: ${payment._id} reason: ${reason}`);
  res.json({ success: true, message: "Payment rejected", payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// MARK COD AS COLLECTED (ADMIN/CASHIER)
// PATCH /api/admin/payments/:id/collect
// ──────────────────────────────────────────────────────────────────────────────
export const markCodCollected = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  if (payment.methodType !== "cash_on_delivery") {
    return res.status(400).json({ success: false, message: "This endpoint is for Cash on Delivery only" });
  }

  const prev = payment.status;
  payment.status      = "Paid";
  payment.paidAt      = new Date();
  payment.collectedAt = new Date();
  payment.collectedBy = req.user._id;
  addAudit(payment, "ADMIN_MARKED_COD_AS_PAID", req.user._id, prev, "Paid");
  await payment.save();

  const order = await Order.findById(payment.order);
  if (order) { order.isPaid = true; order.paidAt = new Date(); order.status = "Delivered"; await order.save(); }

  res.json({ success: true, message: "Cash payment collected and marked as Paid", payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// UPDATE PAYMENT STATUS (legacy — preserved for backward compat)
// ──────────────────────────────────────────────────────────────────────────────
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

  const prev = payment.status;
  payment.status = req.body.status || payment.status;
  addAudit(payment, "ADMIN_UPDATED_STATUS", req.user._id, prev, payment.status);
  await payment.save();

  res.json({ success: true, message: "Payment status updated", payment });
});

// ──────────────────────────────────────────────────────────────────────────────
// DELETE PAYMENT (ADMIN)
// ──────────────────────────────────────────────────────────────────────────────
export const deletePaymentAdmin = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  await payment.deleteOne();
  res.json({ success: true, message: "Payment deleted" });
});

// ──────────────────────────────────────────────────────────────────────────────
// PAYMENT DASHBOARD STATS (ADMIN)
// GET /api/admin/payments/stats
// ──────────────────────────────────────────────────────────────────────────────
export const getPaymentStats = asyncHandler(async (req, res) => {
  const [statusCounts, methodCounts, total] = await Promise.all([
    Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $group: { _id: "$methodCode", count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
  ]);
  res.json({ success: true, byStatus: statusCounts, byMethod: methodCounts, overall: total[0] || { total: 0, count: 0 } });
});

// ──────────────────────────────────────────────────────────────────────────────
// PAYMENT METHOD MANAGEMENT (SUPER ADMIN)
// ──────────────────────────────────────────────────────────────────────────────

export const getAllPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await PaymentMethod.find().sort({ displayOrder: 1 });
  res.json({ success: true, methods });
});

export const createPaymentMethod = asyncHandler(async (req, res) => {
  const { name, code, type, description, accountName, accountNumber, phoneNumber,
          bankName, branch, instructions, requiresScreenshot, requiresReference,
          requiresAdminVerification, enabled, displayOrder } = req.body;

  if (!name || !code || !type) {
    return res.status(400).json({ success: false, message: "name, code, and type are required" });
  }

  const existing = await PaymentMethod.findOne({ code: code.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: "Payment method code already exists" });

  const logo  = req.files?.logo?.[0]?.path   || "";
  const qrCode= req.files?.qrCode?.[0]?.path || "";

  const method = await PaymentMethod.create({
    name, code: code.toLowerCase(), type, description,
    accountName, accountNumber, phoneNumber, bankName, branch, instructions,
    logo, qrCode,
    requiresScreenshot: requiresScreenshot === "true" || requiresScreenshot === true,
    requiresReference:  requiresReference  === "true" || requiresReference  === true,
    requiresAdminVerification: requiresAdminVerification === "true" || requiresAdminVerification === true,
    enabled: enabled !== "false" && enabled !== false,
    displayOrder: Number(displayOrder) || 0,
    createdBy: req.user._id,
  });

  logger.info(`Payment method created: ${code} by ${req.user.email}`);
  res.status(201).json({ success: true, message: "Payment method created", method });
});

export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method) return res.status(404).json({ success: false, message: "Payment method not found" });

  const fields = ["name","description","accountName","accountNumber","phoneNumber",
                  "bankName","branch","instructions","requiresScreenshot","requiresReference",
                  "requiresAdminVerification","enabled","displayOrder"];
  fields.forEach(f => {
    if (req.body[f] !== undefined) method[f] = req.body[f];
  });

  if (req.files?.logo?.[0])   method.logo   = req.files.logo[0].path;
  if (req.files?.qrCode?.[0]) method.qrCode = req.files.qrCode[0].path;
  method.updatedBy = req.user._id;
  await method.save();

  res.json({ success: true, message: "Payment method updated", method });
});

export const togglePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method) return res.status(404).json({ success: false, message: "Payment method not found" });
  method.enabled   = !method.enabled;
  method.updatedBy = req.user._id;
  await method.save();
  logger.info(`Payment method ${method.code} ${method.enabled ? "enabled" : "disabled"} by ${req.user.email}`);
  res.json({ success: true, message: `Payment method ${method.enabled ? "enabled" : "disabled"}`, method });
});

export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const method = await PaymentMethod.findById(req.params.id);
  if (!method) return res.status(404).json({ success: false, message: "Payment method not found" });
  if (["chapa","cod"].includes(method.code)) {
    return res.status(400).json({ success: false, message: "Built-in payment methods cannot be deleted" });
  }
  await method.deleteOne();
  res.json({ success: true, message: "Payment method deleted" });
});
