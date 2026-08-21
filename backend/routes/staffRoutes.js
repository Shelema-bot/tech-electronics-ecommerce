import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOrSuper, superAdmin, sellerOrAdmin } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  getAllStaff,
  assignRole,
  toggleUserStatus,
  getPendingVerifications,
  verifySeller,
  applyAsSeller,
  sellerSubmitProduct,
  approveProduct,
  getPendingProducts,
  getMyProducts,
} from "../controllers/staffController.js";

const router = express.Router();

// ── Super Admin: Staff management ────────────────
router.get("/all",                   protect, superAdmin,   getAllStaff);
router.put("/:id/role",              protect, superAdmin,   assignRole);
router.put("/:id/toggle-status",     protect, adminOrSuper, toggleUserStatus);

// ── Super Admin: Seller verification ─────────────
router.get("/verifications/pending", protect, superAdmin,   getPendingVerifications);
router.put("/verify/:id",            protect, superAdmin,   verifySeller);

// ── Super Admin: Product approval ────────────────
router.get("/products/pending",      protect, superAdmin,   getPendingProducts);
router.put("/products/:id/approve",  protect, superAdmin,   approveProduct);

// ── Seller: Apply & manage products ──────────────
router.post("/apply-seller",         protect, upload.single("nationalIdImage"), applyAsSeller);
router.post("/seller/products",      protect, upload.array("images", 5),       sellerSubmitProduct);
router.get("/seller/my-products",    protect, sellerOrAdmin, getMyProducts);

export default router;
