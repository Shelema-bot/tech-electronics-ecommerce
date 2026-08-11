import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initialize", protect, initializePayment);
router.get("/verify", verifyPayment);

export default router;