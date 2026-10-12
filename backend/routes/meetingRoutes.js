import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOrSuper, sellerOrAdmin } from "../middleware/roleMiddleware.js";
import {
  createMeeting, getMeetings, getMeeting, updateMeeting,
  cancelMeeting, getMyMeetings, respondToMeeting, addInvitee,
} from "../controllers/meetingController.js";

const router = express.Router();

// ── Admin / owner ────────────────────────────────────────────────
router.post("/",              protect, adminOrSuper, createMeeting);
router.get("/",               protect, adminOrSuper, getMeetings);
router.put("/:id",            protect, adminOrSuper, updateMeeting);
router.patch("/:id/cancel",   protect, adminOrSuper, cancelMeeting);
router.post("/:id/invite",    protect, adminOrSuper, addInvitee);

// ── Seller ───────────────────────────────────────────────────────
router.get("/my",              protect, sellerOrAdmin, getMyMeetings);
router.patch("/:id/respond",   protect, sellerOrAdmin, respondToMeeting);

// ── Both (single meeting detail) ─────────────────────────────────
router.get("/:id",             protect, sellerOrAdmin, getMeeting);

export default router;
