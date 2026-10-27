import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOrSuper } from "../middleware/roleMiddleware.js";
import {
  validateCoupon, getAllCoupons, createCoupon,
  updateCoupon, deleteCoupon, toggleCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.post("/validate", protect, validateCoupon);          // customer applies coupon
router.get("/",          protect, adminOrSuper, getAllCoupons);
router.post("/",         protect, adminOrSuper, createCoupon);
router.patch("/:id",     protect, adminOrSuper, updateCoupon);
router.patch("/:id/toggle", protect, adminOrSuper, toggleCoupon);
router.delete("/:id",    protect, adminOrSuper, deleteCoupon);

export default router;
