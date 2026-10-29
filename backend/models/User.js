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
      enum: [
        "customer", "Customer", "admin", "Admin", "super_admin", "SuperAdmin",
        "seller", "Seller", "cashier", "finance", "cashier_finance", "CashierFinance",
        "inventory_manager", "InventoryManager", "delivery", "Delivery", "owner",
        "web_app_manager"
      ],
      default: "customer",
    },

    // ── Seller / Staff info ──────────────────────
    staffInfo: {
      businessName:        { type: String, default: "" },
      legalRepresentative: { type: String, default: "" },
      businessType:        { type: String, default: "Individual" },
      tinNumber:           { type: String, default: "" },
      tradeLicenseNumber:  { type: String, default: "" },
      tradeLicenseImage:   { type: String, default: "" },
      idType:              { type: String, default: "National ID" },
      nationalIdNumber:    { type: String, default: "" },
      nationalIdImage:     { type: String, default: "" },
      businessPhone:       { type: String, default: "" },
      altPhone:            { type: String, default: "" },
      businessEmail:       { type: String, default: "" },
      city:                { type: String, default: "Addis Ababa" },
      subcity:             { type: String, default: "" },
      woredaKebele:        { type: String, default: "" },
      physicalAddress:     { type: String, default: "" },
      payoutBank:          { type: String, default: "Commercial Bank of Ethiopia" },
      bankAccountHolder:   { type: String, default: "" },
      bankAccountNumber:   { type: String, default: "" },
      plannedCategories:   [{ type: String }],
      termsAccepted:       { type: Boolean, default: false },
      antiFraudAccepted:   { type: Boolean, default: false },
      appliedIp:           { type: String, default: "" },
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      verificationNote: { type: String, default: "" },
      appliedAt: { type: Date },

      // ── External Web Applications / Integrations (Staff role handling) ──
      assignedWebApps:   [{ type: String }],
      webAppAccessLevel: { type: String, default: "Operator" },
      webAppNotes:       { type: String, default: "" },

      // ── Seller subscription plan ─────────────────────────
      plan:            { type: mongoose.Schema.Types.ObjectId, ref: "SellerPlan", default: null },
      planAssignedAt:  { type: Date },
      planExpiresAt:   { type: Date },
      subscriptionStatus: {
        type: String,
        enum: ["none","trial","active","overdue","suspended"],
        default: "none",
      },
      // Monthly product listing counter (reset each billing cycle)
      productListingsThisMonth: { type: Number, default: 0 },
      listingMonthYear:         { type: String, default: "" }, // "2026-10" format — reset trigger
      totalRevenue:             { type: Number, default: 0 },  // lifetime sales revenue
      totalOrders:              { type: Number, default: 0 },  // lifetime order count
    },

    // ── Auth ─────────────────────────────────────
    resetPasswordToken:  { type: String,  default: "" },
    resetPasswordExpire: { type: Date,    default: null },
    isActive:            { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

export default mongoose.model("User", userSchema);
