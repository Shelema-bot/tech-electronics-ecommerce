import mongoose from "mongoose";

/**
 * Payment — extended to support Chapa, COD, and all manual methods.
 * Backward compatible: existing records retain their fields.
 */
const paymentSchema = new mongoose.Schema(
  {
    order:  { type: mongoose.Schema.Types.ObjectId, ref: "Order",  required: true },
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },

    // ── Amount (always read from order on backend — never trust frontend) ──
    amount:   { type: Number, required: true },
    currency: { type: String, default: "ETB" },

    // ── Payment method ────────────────────────────────────────────────────
    // methodCode: "chapa" | "cod" | "telebirr" | "cbe" | "boa" | custom
    methodCode:   { type: String, default: "chapa" },
    methodName:   { type: String, default: "Chapa Payment" },
    methodType:   { type: String, enum: ["chapa","cash_on_delivery","manual"], default: "chapa" },

    // ── Status lifecycle ──────────────────────────────────────────────────
    // Pending → Awaiting Payment → Pending Verification → Paid / Failed / Rejected / Refunded / Cancelled
    status: {
      type: String,
      enum: ["Pending","Awaiting Payment","Pending Verification","Paid","Failed","Rejected","Refunded","Cancelled"],
      default: "Pending",
    },

    // ── Chapa fields (preserved from existing schema) ─────────────────────
    tx_ref:    { type: String, sparse: true }, // sparse: allows multiple nulls
    paidAt:    { type: Date },

    // ── Manual payment proof ──────────────────────────────────────────────
    transactionReference:  { type: String, default: "" },   // customer-entered ref
    paymentProof:          { type: String, default: "" },   // Cloudinary URL of screenshot
    proofSubmittedAt:      { type: Date },
    customerNote:          { type: String, default: "" },

    // ── Admin verification ────────────────────────────────────────────────
    verifiedAt:            { type: Date },
    verifiedBy:            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason:       { type: String, default: "" },
    adminNote:             { type: String, default: "" },

    // ── COD collection ────────────────────────────────────────────────────
    collectedAt:           { type: Date },
    collectedBy:           { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ── Refund ────────────────────────────────────────────────────────────
    refundStatus:    { type: String, enum: ["none","requested","approved","rejected","completed"], default: "none" },
    refundAmount:    { type: Number },
    refundReason:    { type: String, default: "" },
    refundReference: { type: String, default: "" },
    refundedAt:      { type: Date },
    refundedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ── Audit log ─────────────────────────────────────────────────────────
    auditLog: [
      {
        action:     { type: String },
        performedBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
        fromStatus: { type: String },
        toStatus:   { type: String },
        note:       { type: String },
        timestamp:  { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ methodCode: 1 });
paymentSchema.index({ tx_ref: 1 }, { sparse: true });

export default mongoose.model("Payment", paymentSchema);
