import SellerPlan from "../models/SellerPlan.js";
import User       from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── GET all plans (public — shown to sellers on plan selection) ────
export const getPlans = asyncHandler(async (req, res) => {
  const plans = await SellerPlan.find({ isActive: true }).sort({ displayOrder: 1 });
  res.json({ success: true, plans });
});

// ── GET all plans including inactive (admin) ────────────────────────
export const getPlansAdmin = asyncHandler(async (req, res) => {
  const plans = await SellerPlan.find().sort({ displayOrder: 1 }).populate("createdBy","name email");
  res.json({ success: true, plans });
});

// ── GET single plan ─────────────────────────────────────────────────
export const getPlan = asyncHandler(async (req, res) => {
  const plan = await SellerPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
  res.json({ success: true, plan });
});

// ── CREATE plan (admin/owner) ───────────────────────────────────────
export const createPlan = asyncHandler(async (req, res) => {
  const {
    name, description, color, icon, monthlyFee, billingCycle,
    trialDays, productLimit, minProductPrice, maxProductPrice,
    commissionRate, features, isActive, displayOrder,
  } = req.body;

  if (!name || monthlyFee === undefined) {
    return res.status(400).json({ success: false, message: "name and monthlyFee are required" });
  }

  const plan = await SellerPlan.create({
    name, description, color, icon,
    monthlyFee:      Number(monthlyFee),
    billingCycle:    billingCycle    || "monthly",
    trialDays:       Number(trialDays || 0),
    productLimit:    Number(productLimit ?? 10),
    minProductPrice: Number(minProductPrice ?? 0),
    maxProductPrice: Number(maxProductPrice ?? 0),
    commissionRate:  Number(commissionRate ?? 5),
    features:        Array.isArray(features) ? features : (features ? [features] : []),
    isActive:        isActive !== false,
    displayOrder:    Number(displayOrder || 0),
    createdBy:       req.user._id,
  });

  res.status(201).json({ success: true, message: "Plan created", plan });
});

// ── UPDATE plan (admin/owner) ───────────────────────────────────────
export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await SellerPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

  const fields = [
    "name","description","color","icon","monthlyFee","billingCycle","trialDays",
    "productLimit","minProductPrice","maxProductPrice","commissionRate",
    "features","isActive","displayOrder",
  ];
  fields.forEach(f => { if (req.body[f] !== undefined) plan[f] = req.body[f]; });
  await plan.save();

  res.json({ success: true, message: "Plan updated", plan });
});

// ── DELETE plan (admin/owner) ───────────────────────────────────────
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await SellerPlan.findById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

  // Check if any seller is on this plan
  const inUse = await User.countDocuments({ "staffInfo.plan": plan._id });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete — ${inUse} seller(s) are on this plan. Reassign them first.`,
    });
  }

  await plan.deleteOne();
  res.json({ success: true, message: "Plan deleted" });
});

// ── ASSIGN plan to a seller (admin/owner) ──────────────────────────
export const assignPlan = asyncHandler(async (req, res) => {
  const { planId, subscriptionStatus } = req.body;

  const seller = await User.findById(req.params.sellerId);
  if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
  if (seller.role !== "seller") return res.status(400).json({ success: false, message: "User is not a seller" });

  const plan = await SellerPlan.findById(planId);
  if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

  // Calculate expiry (1 billing cycle from now)
  const now = new Date();
  let expiresAt = new Date(now);
  if (plan.billingCycle === "monthly")    expiresAt.setMonth(expiresAt.getMonth() + 1);
  else if (plan.billingCycle === "quarterly") expiresAt.setMonth(expiresAt.getMonth() + 3);
  else if (plan.billingCycle === "yearly")    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  seller.staffInfo.plan               = plan._id;
  seller.staffInfo.planAssignedAt     = now;
  seller.staffInfo.planExpiresAt      = expiresAt;
  seller.staffInfo.subscriptionStatus = subscriptionStatus || "active";
  await seller.save();

  res.json({
    success: true,
    message: `Plan "${plan.name}" assigned to ${seller.name}`,
    seller: { _id: seller._id, name: seller.name, email: seller.email, staffInfo: seller.staffInfo },
  });
});

// ── GET all sellers with their plan info (admin) ───────────────────
export const getSellersWithPlans = asyncHandler(async (req, res) => {
  const sellers = await User.find({ role: "seller" })
    .select("-password")
    .populate("staffInfo.plan", "name monthlyFee color icon productLimit commissionRate")
    .sort({ createdAt: -1 });

  res.json({ success: true, sellers });
});

// ── GET current seller's plan (seller self) ────────────────────────
export const getMyPlan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("staffInfo.plan");

  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  // Count this month's products
  const Product = (await import("../models/Product.js")).default;
  const monthYear = new Date().toISOString().slice(0, 7); // "2026-10"
  const listingsThisMonth = await Product.countDocuments({
    submittedBy: user._id,
    approvalStatus: { $in: ["pending", "approved"] },
    createdAt: {
      $gte: new Date(monthYear + "-01"),
      $lte: new Date(),
    },
  });

  res.json({
    success: true,
    user: {
      name:   user.name,
      email:  user.email,
      staffInfo: user.staffInfo,
    },
    plan: user.staffInfo.plan || null,
    listingsThisMonth,
  });
});
