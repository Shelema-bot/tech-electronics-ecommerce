import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOrSuper, sellerOrAdmin } from "../middleware/roleMiddleware.js";
import {
  getPlans, getPlansAdmin, getPlan,
  createPlan, updatePlan, deletePlan,
  assignPlan, getSellersWithPlans, getMyPlan,
} from "../controllers/sellerPlanController.js";

const router = express.Router();

// ── Public (sellers can view available plans) ────────────────────
router.get("/",          protect, sellerOrAdmin, getPlans);

// ── Admin plan management ────────────────────────────────────────
router.get("/admin",                 protect, adminOrSuper, getPlansAdmin);
router.post("/",                     protect, adminOrSuper, createPlan);
router.put("/:id",                   protect, adminOrSuper, updatePlan);
router.delete("/:id",                protect, adminOrSuper, deletePlan);
router.post("/assign/:sellerId",     protect, adminOrSuper, assignPlan);
router.get("/sellers",               protect, adminOrSuper, getSellersWithPlans);

// ── Seller: get own plan ─────────────────────────────────────────
router.get("/me",    protect, getMyPlan);
router.get("/:id",   protect, sellerOrAdmin, getPlan);

export default router;
