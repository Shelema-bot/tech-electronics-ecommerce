import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import {
  superAdminOnly,
  ownerOnlySellerApproval,
  checkRole,
} from "../middleware/roleMiddleware.js";
import {
  verifySeller,
  getPendingVerifications,
  approveProduct,
  getPendingProducts,
} from "../controllers/staffController.js";

const router = express.Router();

// Test admin access
router.get("/", protect, admin, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
  });
});

// ── Seller Approval (Strictly Owner / SuperAdmin Shelema Only) ─
router.get("/sellers/pending",     protect, superAdminOnly,          getPendingVerifications);
router.put("/sellers/:id/approve", protect, ownerOnlySellerApproval, verifySeller);

// ── Product Approval (SuperAdmin & InventoryManager) ───────────
router.get("/products/pending",     protect, checkRole(["SuperAdmin", "InventoryManager"]), getPendingProducts);
router.put("/products/:id/approve", protect, checkRole(["SuperAdmin", "InventoryManager"]), approveProduct);

export default router;
