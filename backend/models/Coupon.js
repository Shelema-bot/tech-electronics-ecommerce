import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
    description:    { type: String, default: "" },
    discountType:   { type: String, enum: ["percentage","fixed"], default: "percentage" },
    discountValue:  { type: Number, required: true },          // % or ETB amount
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount:    { type: Number, default: null },           // cap for % coupons
    maxUses:        { type: Number, default: null },           // null = unlimited
    usedCount:      { type: Number, default: 0 },
    usedBy:         [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    allowMultiUse:  { type: Boolean, default: false },         // same user can use multiple times
    validFrom:      { type: Date, default: Date.now },
    validUntil:     { type: Date, default: null },             // null = no expiry
    isActive:       { type: Boolean, default: true },
    categories:     [String],   // restrict to categories (empty = all)
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });

export default mongoose.model("Coupon", couponSchema);
