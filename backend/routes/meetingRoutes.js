import express from "express";
import protect from "../middleware/authMiddleware.js";
import { superAdmin, adminOrSuper, sellerOrAdmin } from "../middleware/roleMiddleware.js";
import {
  createMeeting, getMeetings, getMeeting, updateMeeting,
  cancelMeeting, getMyMeetings, respondToMeeting, addInvitee,
} from "../controllers/meetingController.js";

const router = express.Router();

// ── Only owner / super_admin can CREATE or MANAGE meetings ───────
router.post("/",              protect, superAdmin, createMeeting);
router.put("/:id",            protect, superAdmin, updateMeeting);
router.patch("/:id/cancel",   protect, superAdmin, cancelMeeting);
router.post("/:id/invite",    protect, superAdmin, addInvitee);

// ── All admins can VIEW meetings ─────────────────────────────────
router.get("/",               protect, adminOrSuper, getMeetings);

// ── Seller / staff: view own meetings and respond ────────────────
router.get("/my",             protect, sellerOrAdmin, getMyMeetings);
router.patch("/:id/respond",  protect, sellerOrAdmin, respondToMeeting);
router.get("/:id",            protect, sellerOrAdmin, getMeeting);

export default router;
