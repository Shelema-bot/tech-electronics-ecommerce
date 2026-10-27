import Meeting from "../models/Meeting.js";
import User    from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "./notificationController.js";

// ── CREATE meeting (owner/admin) ────────────────────────────────────
export const createMeeting = asyncHandler(async (req, res) => {
  const {
    title, description, type, scheduledAt, durationMin,
    location, platform, meetingLink, targetAll, inviteeIds, notes,
  } = req.body;

  if (!title || !scheduledAt) {
    return res.status(400).json({ success: false, message: "title and scheduledAt are required" });
  }

  let invitees = [];

  if (targetAll) {
    // Invite all verified sellers automatically
    const sellers = await User.find({
      role: "seller",
      "staffInfo.verificationStatus": "verified",
      isActive: true,
    }).select("_id");
    invitees = sellers.map(s => ({ user: s._id, status: "pending" }));
  } else if (Array.isArray(inviteeIds) && inviteeIds.length > 0) {
    invitees = inviteeIds.map(id => ({ user: id, status: "pending" }));
  }

  const meeting = await Meeting.create({
    title, description, type: type || "general",
    scheduledAt: new Date(scheduledAt),
    durationMin: Number(durationMin || 60),
    location: location || "",
    platform:    platform    || "other",
    meetingLink: meetingLink || "",
    organizer:   req.user._id,
    targetAll:   !!targetAll,
    invitees,
    notes: notes || "",
    status: "scheduled",
  });

  await meeting.populate("organizer", "name email");
  await meeting.populate("invitees.user", "name email");

  // Notify all invitees
  const dateStr = new Date(scheduledAt).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
  const notifTargets = meeting.targetAll
    ? (await User.find({ role:"seller", "staffInfo.verificationStatus":"verified", isActive:true }).select("_id")).map(u => u._id)
    : meeting.invitees.map(i => i.user);

  notifTargets.forEach(uid => {
    createNotification(
      uid,
      `Meeting Scheduled: ${meeting.title}`,
      `You've been invited to a meeting on ${dateStr}. Check your meetings for details.`,
      "system", "/admin/my-plan", "📅"
    );
  });

  res.status(201).json({ success: true, message: "Meeting scheduled", meeting });
});

// ── GET all meetings (admin/owner) ──────────────────────────────────
export const getMeetings = asyncHandler(async (req, res) => {
  const { status, upcoming } = req.query;
  const filter = {};
  if (status)   filter.status = status;
  if (upcoming === "true") filter.scheduledAt = { $gte: new Date() };

  const meetings = await Meeting.find(filter)
    .populate("organizer",      "name email")
    .populate("invitees.user",  "name email")
    .sort({ scheduledAt: 1 });

  res.json({ success: true, meetings });
});

// ── GET single meeting ──────────────────────────────────────────────
export const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate("organizer",     "name email")
    .populate("invitees.user", "name email");
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
  res.json({ success: true, meeting });
});

// ── UPDATE meeting (organizer / admin/owner) ────────────────────────
export const updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  const updatableFields = [
    "title","description","type","scheduledAt","durationMin",
    "location","platform","meetingLink","status","cancelReason","notes",
  ];
  updatableFields.forEach(f => { if (req.body[f] !== undefined) meeting[f] = req.body[f]; });
  await meeting.save();
  await meeting.populate("organizer",     "name email");
  await meeting.populate("invitees.user", "name email");

  res.json({ success: true, message: "Meeting updated", meeting });
});

// ── DELETE / CANCEL meeting ─────────────────────────────────────────
export const cancelMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
  meeting.status       = "cancelled";
  meeting.cancelReason = req.body.reason || "Cancelled by admin";
  await meeting.save();
  res.json({ success: true, message: "Meeting cancelled" });
});

// ── SELLER: get my meetings ─────────────────────────────────────────
export const getMyMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({
    $or: [
      { targetAll: true },
      { "invitees.user": req.user._id },
    ],
    status: { $ne: "cancelled" },
  })
    .populate("organizer", "name email")
    .sort({ scheduledAt: 1 });

  // Attach this seller's RSVP status
  const result = meetings.map(m => {
    const invite = m.invitees.find(i => i.user?._id?.toString() === req.user._id.toString());
    return {
      ...m.toObject(),
      myStatus: invite ? invite.status : (m.targetAll ? "pending" : "not_invited"),
    };
  });

  res.json({ success: true, meetings: result });
});

// ── SELLER: respond to meeting invitation ───────────────────────────
export const respondToMeeting = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!["accepted","declined"].includes(status)) {
    return res.status(400).json({ success: false, message: "status must be accepted or declined" });
  }

  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  if (meeting.targetAll) {
    // Add this seller to invitees if not already there
    const exists = meeting.invitees.find(i => i.user?.toString() === req.user._id.toString());
    if (exists) {
      exists.status = status;
      exists.note   = note || "";
    } else {
      meeting.invitees.push({ user: req.user._id, status, note: note || "" });
    }
  } else {
    const invite = meeting.invitees.find(i => i.user?.toString() === req.user._id.toString());
    if (!invite) return res.status(403).json({ success: false, message: "You are not invited to this meeting" });
    invite.status = status;
    invite.note   = note || "";
  }

  await meeting.save();
  res.json({ success: true, message: `RSVP recorded: ${status}` });
});

// ── ADD individual invitee (admin) ─────────────────────────────────
export const addInvitee = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  const already = meeting.invitees.find(i => i.user?.toString() === userId);
  if (already) return res.status(409).json({ success: false, message: "Already invited" });

  meeting.invitees.push({ user: userId, status: "pending" });
  await meeting.save();
  await meeting.populate("invitees.user", "name email");
  res.json({ success: true, message: "Invitee added", meeting });
});
