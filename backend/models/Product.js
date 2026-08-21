import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    brand:       { type: String, default: "" },
    category:    { type: String, required: true, trim: true },
    price:       { type: Number, required: true },
    stock:       { type: Number, default: 0 },
    images:      [String],
    rating:      { type: Number, default: 0 },

    // ── Seller workflow ───────────────────────────
    // Existing products (created by admin/super_admin) remain isPublic:true
    // Products submitted by sellers start as isPublic:false until approved
    isPublic: { type: Boolean, default: true },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",   // admin-created products auto-approved
    },

    approvalNote: { type: String, default: "" },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes for faster queries ────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ isPublic: 1 });
productSchema.index({ approvalStatus: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: "text", brand: "text", description: "text" }); // text search

export default mongoose.model("Product", productSchema);
