import express from "express";
import protect from "../middleware/authMiddleware.js";
import { cashierFinanceOnly, superAdminOnly } from "../middleware/roleMiddleware.js";
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

// Stats — accessible by Cashier/Finance & Super Admin
router.get("/stats", protect, cashierFinanceOnly, getPaymentStats);

// Payment method configuration — Super Admin / Finance
router.get("/methods",            protect, cashierFinanceOnly, getAllPaymentMethods);
router.post("/methods",           protect, superAdminOnly,
  upload.fields([{ name:"logo", maxCount:1 }, { name:"qrCode", maxCount:1 }]),
  createPaymentMethod
);
router.patch("/methods/:id",      protect, superAdminOnly,
  upload.fields([{ name:"logo", maxCount:1 }, { name:"qrCode", maxCount:1 }]),
  updatePaymentMethod
);
router.patch("/methods/:id/toggle", protect, cashierFinanceOnly, togglePaymentMethod);
router.delete("/methods/:id",     protect, superAdminOnly, deletePaymentMethod);

// ── Payment record routes (Cashier / Finance exclusive operational duties) ───
router.get("/",              protect, cashierFinanceOnly, getAllPaymentsAdmin);
router.get("/:id",           protect, cashierFinanceOnly, getPaymentAdmin);
router.patch("/:id/verify",  protect, cashierFinanceOnly, approvePayment);
router.patch("/:id/reject",  protect, cashierFinanceOnly, rejectPayment);
router.patch("/:id/collect", protect, cashierFinanceOnly, markCodCollected);
router.put("/:id",           protect, cashierFinanceOnly, updatePaymentStatus);   // legacy
router.delete("/:id",        protect, superAdminOnly,     deletePaymentAdmin);

export default router;
