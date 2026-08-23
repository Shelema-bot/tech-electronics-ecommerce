import mongoose from "mongoose";

/**
 * PaymentMethod — admin-configurable payment methods.
 * Real account details are stored in DB, never in source code.
 *
 * Types:
 *   "chapa"           — automated via Chapa API
 *   "cash_on_delivery"— no proof needed; collected on delivery
 *   "manual"          — customer uploads proof; admin verifies
 */
const paymentMethodSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },   // "Telebirr"
    code:        { type: String, required: true, trim: true, unique: true, lowercase: true }, // "telebirr"
    type:        {
      type: String,
      enum: ["chapa", "cash_on_delivery", "manual"],
      required: true,
    },
    description:  { type: String, default: "" },
    logo:         { type: String, default: "" },          // Cloudinary URL
    qrCode:       { type: String, default: "" },          // Cloudinary URL

    // Account information (public-facing instructions)
    accountName:  { type: String, default: "" },
    accountNumber:{ type: String, default: "" },
    phoneNumber:  { type: String, default: "" },
    bankName:     { type: String, default: "" },
    branch:       { type: String, default: "" },
    instructions: { type: String, default: "" },          // Markdown/plain text

    // Behavior flags
    enabled:                  { type: Boolean, default: true },
    requiresScreenshot:       { type: Boolean, default: false },
    requiresReference:        { type: Boolean, default: false },
    requiresAdminVerification:{ type: Boolean, default: false },

    displayOrder: { type: Number, default: 0 },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

paymentMethodSchema.index({ enabled: 1, displayOrder: 1 });
paymentMethodSchema.index({ code: 1 });

export default mongoose.model("PaymentMethod", paymentMethodSchema);
