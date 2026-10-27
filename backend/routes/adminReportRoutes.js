import express from "express";
import protect from "../middleware/authMiddleware.js";
import { analyticsAccess } from "../middleware/roleMiddleware.js";
import { getAdminReports } from "../controllers/adminReportController.js";

const router = express.Router();

// Financial reports, analytics & sales summary — all staff roles (SuperAdmin, Admin, CashierFinance, Delivery)
router.get("/", protect, analyticsAccess, getAdminReports);

export default router;
