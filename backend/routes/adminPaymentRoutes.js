import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin   from "../middleware/adminMiddleware.js";
import { superAdmin } from "../middleware/roleMiddleware.js";
import upload  from "../middleware/uploadMiddleware.js";
import {
  getAllPaymentsAdmin,
  getPaymentAdmin,
  approvePayment,
  rejectPayment,
  markCodCollected,
  updatePaymentStatus,
  deletePaymentAdmin,
  getPaymentStats,
  getAllPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
} from "../controllers/adminPaymentController.js";

const router = express.Router();

// ── Payment records ─────────────────────────────────────────────
router.get("/stats",        protect, admin,      getPaymentStats);
router.get("/",             protect, admin,      getAllPaymentsAdmin);
router.get("/:id",          protect, admin,      getPaymentAdmin);
router.patch("/:id/verify", protect, admin,      approvePayment);
router.patch("/:id/reject", protect, admin,      rejectPayment);
router.patch("/:id/collect",protect, admin,      markCodCollected);
router.put("/:id",          protect, admin,      updatePaymentStatus);   // legacy
router.delete("/:id",       protect, admin,      deletePaymentAdmin);

// ── Payment method management (super_admin only) ─────────────────
router.get(   "/methods",        protect, superAdmin, getAllPaymentMethods);
router.post(  "/methods",        protect, superAdmin,
  upload.fields([{ name:"logo", maxCount:1 }, { name:"qrCode", maxCount:1 }]),
  createPaymentMethod
);
router.patch( "/methods/:id",    protect, superAdmin,
  upload.fields([{ name:"logo", maxCount:1 }, { name:"qrCode", maxCount:1 }]),
  updatePaymentMethod
);
router.patch( "/methods/:id/toggle", protect, superAdmin, togglePaymentMethod);
router.delete("/methods/:id",    protect, superAdmin, deletePaymentMethod);

export default router;
