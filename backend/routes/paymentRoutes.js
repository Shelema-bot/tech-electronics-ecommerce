import express from "express";
import protect from "../middleware/authMiddleware.js";
import { validatePayment } from "../middleware/validation.middleware.js";
import {
  initializePayment,
  verifyPayment,
  getMyPayments,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initialize", protect, validatePayment, initializePayment);
router.get("/verify",                                verifyPayment);
router.get("/my-payments", protect,                 getMyPayments);

export default router;