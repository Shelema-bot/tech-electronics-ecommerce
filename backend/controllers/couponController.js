import Coupon from "../models/Coupon.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

// ── PUBLIC: Validate a coupon code ────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ success: false, message: "Coupon code is required" });

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return res.status(400).json({ success: false, message: "This coupon is not yet active" });
  }
  if (coupon.validUntil && now > coupon.validUntil) {
    return res.status(400).json({ success: false, message: "This coupon has expired" });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ success: false, message: "This coupon has reached its usage limit" });
  }
  if (orderAmount && coupon.minOrderAmount > 0 && Number(orderAmount) < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of ${coupon.minOrderAmount.toLocaleString()} ETB required for this coupon`,
    });
  }
  if (!coupon.allowMultiUse && coupon.usedBy.includes(req.user._id)) {
    return res.status(400).json({ success: false, message: "You have already used this coupon" });
  }

  // Calculate discount
  let discount = 0;
  const amount = Number(orderAmount) || 0;
  if (coupon.discountType === "percentage") {
    discount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }
  discount = Math.min(discount, amount); // can't discount more than total

  res.json({
    success: true,
    message: `Coupon applied: ${coupon.description || coupon.code}`,
    coupon: {
      _id: coupon._id, code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    },
    discount: Math.round(discount),
    newTotal: Math.round(amount - discount),
  });
});

// ── ADMIN: Get all coupons ─────────────────────────────────────
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).populate("createdBy","name");
  res.json({ success: true, coupons });
});

// ── ADMIN: Create coupon ──────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, description, discountType, discountValue, minOrderAmount,
          maxDiscount, maxUses, allowMultiUse, validFrom, validUntil,
          isActive, categories } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ success: false, message: "code and discountValue are required" });
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existing) return res.status(409).json({ success: false, message: "Coupon code already exists" });

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(), description, discountType,
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : null,
    maxUses: maxUses ? Number(maxUses) : null,
    allowMultiUse: allowMultiUse === true || allowMultiUse === "true",
    validFrom: validFrom || Date.now(),
    validUntil: validUntil || null,
    isActive: isActive !== false && isActive !== "false",
    categories: categories || [],
    createdBy: req.user._id,
  });

  logger.info(`Coupon created: ${coupon.code} by ${req.user.email}`);
  res.status(201).json({ success: true, message: "Coupon created", coupon });
});

// ── ADMIN: Update coupon ──────────────────────────────────────
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

  const fields = ["description","discountType","discountValue","minOrderAmount","maxDiscount",
                  "maxUses","allowMultiUse","validFrom","validUntil","isActive","categories"];
  fields.forEach(f => { if (req.body[f] !== undefined) coupon[f] = req.body[f]; });
  await coupon.save();

  res.json({ success: true, message: "Coupon updated", coupon });
});

// ── ADMIN: Delete coupon ──────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
  await coupon.deleteOne();
  res.json({ success: true, message: "Coupon deleted" });
});

// ── ADMIN: Toggle coupon ──────────────────────────────────────
export const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json({ success: true, message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}`, coupon });
});
