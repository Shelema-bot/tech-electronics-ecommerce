import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin   from "../middleware/adminMiddleware.js";
import { adminOrSuper } from "../middleware/roleMiddleware.js";
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

// ── IMPORTANT: specific routes MUST come before /:id ─────────────

// Stats
router.get("/stats", protect, admin, getPaymentStats);

// Payment method management — must be before /:id  
router.get("/methods",            protect, adminOrSuper, getAllPaymentMethods);
router.post("/methods",           protect, adminOrSuper,
  upload.fields([{ name:"logo", maxCount:1 }, { name:"qrCode", maxCount:1 }]),
  createPaymentMethod
);
router.patch("/methods/:id",      protect, adminOrSuper,
  upload.fields([{ name:"logo", maxCount:1 }, { name:"qrCode", maxCount:1 }]),
  updatePaymentMethod
);
router.patch("/methods/:id/toggle", protect, adminOrSuper, togglePaymentMethod);
router.delete("/methods/:id",     protect, adminOrSuper, deletePaymentMethod);

// ── Payment record routes ─────────────────────────────────────────
router.get("/",              protect, admin, getAllPaymentsAdmin);
router.get("/:id",           protect, admin, getPaymentAdmin);
router.patch("/:id/verify",  protect, admin, approvePayment);
router.patch("/:id/reject",  protect, admin, rejectPayment);
router.patch("/:id/collect", protect, admin, markCodCollected);
router.put("/:id",           protect, admin, updatePaymentStatus);   // legacy
router.delete("/:id",        protect, admin, deletePaymentAdmin);

export default router;
