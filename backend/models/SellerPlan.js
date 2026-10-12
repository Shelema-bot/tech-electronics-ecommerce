/**
 * SellerPlan — subscription tiers for marketplace sellers.
 * Admin/owner creates and manages plans.
 * Sellers are assigned a plan on verification.
 */
import mongoose from "mongoose";

const sellerPlanSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },  // "Starter", "Pro", "Premium"
    description: { type: String, default: "" },
    color:       { type: String, default: "#2563eb" },          // badge colour in UI
    icon:        { type: String, default: "🏪" },

    // ── Pricing ──────────────────────────────────────────────
    monthlyFee:  { type: Number, required: true, default: 0 },  // ETB / month  (0 = free)
    billingCycle:{ type: String, enum: ["monthly","quarterly","yearly"], default: "monthly" },
    trialDays:   { type: Number, default: 0 },                  // free trial days before first payment

    // ── Limits ───────────────────────────────────────────────
    productLimit:   { type: Number, default: 10 },              // max active listings per period
    minProductPrice:{ type: Number, default: 0 },               // min allowed listing price (ETB)
    maxProductPrice:{ type: Number, default: 0 },               // 0 = no cap

    // ── Commission ───────────────────────────────────────────
    commissionRate: { type: Number, default: 5 },               // % commission on each sale

    // ── Features (displayed as bullet points) ────────────────
    features: [{ type: String }],

    isActive:    { type: Boolean, default: true },
    displayOrder:{ type: Number,  default: 0 },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

sellerPlanSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model("SellerPlan", sellerPlanSchema);
