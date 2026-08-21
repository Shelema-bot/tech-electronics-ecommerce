import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profileImage: { type: String, default: "" },

    // ── Role system ──────────────────────────────
    // super_admin : full control, can manage staff
    // admin       : legacy (treated as super_admin for backward compat)
    // seller      : can submit products for approval
    // cashier     : can view/manage orders & payments only
    // customer    : default
    role: {
      type: String,
      enum: ["customer", "admin", "super_admin", "seller", "cashier"],
      default: "customer",
    },

    // ── Seller / Staff info ──────────────────────
    staffInfo: {
      businessName:   { type: String, default: "" },
      nationalIdImage:{ type: String, default: "" },   // Cloudinary URL
      nationalIdNumber:{ type: String, default: "" },
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      verificationNote: { type: String, default: "" },
      appliedAt: { type: Date },
    },

    // ── Auth ─────────────────────────────────────
    resetPasswordToken:  { type: String,  default: "" },
    resetPasswordExpire: { type: Date,    default: null },
    isActive:            { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
