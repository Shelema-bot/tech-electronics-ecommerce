import express from "express";
import protect from "../middleware/authMiddleware.js";
import { anyStaff, ownerOnlyMeetingScheduler } from "../middleware/roleMiddleware.js";
import {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  getMyMeetings,
  respondToMeeting,
  addInvitee,
  getStaffList,
  joinMeeting,
  sendMeetingMessage,
  getMeetingMessages,
} from "../controllers/meetingController.js";

const router = express.Router();

// ── Staff directory for scheduling ───────────────────────────────
router.get("/staff/members", protect, anyStaff, getStaffList);

// ── Meeting listings & single meeting details ────────────────────
router.get("/my",          protect, anyStaff, getMyMeetings);
router.get("/",            protect, anyStaff, getMeetings);
router.get("/:id",         protect, anyStaff, getMeeting);

// ── Strict Owner-Only Meeting Scheduling & Management ────────────
router.post("/",           protect, ownerOnlyMeetingScheduler, createMeeting);
router.put("/:id",         protect, ownerOnlyMeetingScheduler, updateMeeting);
router.patch("/:id/cancel",protect, ownerOnlyMeetingScheduler, cancelMeeting);
router.post("/:id/invite", protect, ownerOnlyMeetingScheduler, addInvitee);

// ── Video room participation, attendance & live chat (All Staff) ──
router.patch("/:id/join",       protect, anyStaff, joinMeeting);
router.patch("/:id/respond",    protect, anyStaff, respondToMeeting);
router.post("/:id/messages",    protect, anyStaff, sendMeetingMessage);
router.get("/:id/messages",     protect, anyStaff, getMeetingMessages);

export default router;
