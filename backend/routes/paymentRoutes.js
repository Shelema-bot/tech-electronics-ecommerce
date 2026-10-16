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
  initializePayment,
  chapaWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

// Optional auth middleware for guest / authenticated customer checkout
const optionalProtect = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      const token = req.headers.authorization.split(" ")[1];
      if (token && token !== "null" && token !== "undefined" && token.trim()) {
        return protect(req, res, next);
      }
    }
    next();
  } catch (_err) {
    next();
  }
};

// Public — loaded by checkout page
router.get("/methods", getEnabledPaymentMethods);

// Chapa callback / return verification (public — called on return from gateway)
router.get("/verify/:tx_ref",   verifyPayment);
router.get("/verify",           verifyPayment);
router.post("/webhook",         chapaWebhook);

// Payment initialization
router.post("/initialize",      optionalProtect, createPayment);
router.post("/",                optionalProtect, createPayment);

// Customer payment management
router.get("/my",               protect, getMyPayments);
router.get("/my-payments",      protect, getMyPayments);   // legacy alias
router.get("/:id",              protect, getPaymentById);
router.post("/:id/proof",       protect, upload.single("paymentProof"), submitPaymentProof);

export default router;

