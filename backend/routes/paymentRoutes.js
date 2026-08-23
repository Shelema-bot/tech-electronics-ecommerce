import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload  from "../middleware/uploadMiddleware.js";
import {
  getEnabledPaymentMethods,
  createPayment,
  verifyPayment,
  submitPaymentProof,
  getMyPayments,
  getPaymentById,
  initializePayment,   // legacy backward-compat
} from "../controllers/paymentController.js";

const router = express.Router();

// Public — loaded by checkout page
router.get("/methods", getEnabledPaymentMethods);

// Authenticated customer routes
router.post("/",                protect, createPayment);
router.get("/my",               protect, getMyPayments);
router.get("/my-payments",      protect, getMyPayments);   // legacy alias
router.get("/:id",              protect, getPaymentById);
router.post("/:id/proof",       protect, upload.single("paymentProof"), submitPaymentProof);

// Chapa callback/return verification (no auth — called by Chapa)
router.get("/verify",           verifyPayment);

// Legacy Chapa initialize (backward compat with old checkout)
router.post("/initialize",      protect, initializePayment);

export default router;
