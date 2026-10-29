import Meeting from "../models/Meeting.js";
import User    from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "./notificationController.js";
import { normalizeRole, isShelema } from "../middleware/roleMiddleware.js";

const STAFF_ROLES = [
  "admin", "Admin", "super_admin", "SuperAdmin", "owner",
  "cashier", "finance", "cashier_finance", "CashierFinance",
  "inventory_manager", "InventoryManager", "delivery", "Delivery",
  "seller", "Seller", "web_app_manager"
];

const generateRoomId = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let code = "stf-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += "-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

// ── GET staff directory for meeting invites ────────────────────────
export const getStaffList = asyncHandler(async (req, res) => {
  const staff = await User.find({
    $or: [
      { role: { $in: STAFF_ROLES } },
      { "staffInfo.verificationStatus": "verified" }
    ],
    isActive: true,
  })
    .select("_id name email role profileImage staffInfo.businessName")
    .sort({ name: 1 });

  res.json({ success: true, staff });
});

// ── CREATE meeting (Staff & Video — Owner Only) ───────────────────────
export const createMeeting = asyncHandler(async (req, res) => {
  if (!isShelema(req.user)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only the Owner (Shelema) has permission to schedule staff meetings.",
    });
  }

  const {
    title, description, type, scheduledAt, durationMin,
    location, platform, meetingLink, targetAudience, targetRoles,
    targetAll, inviteeIds, notes,
  } = req.body;

  if (!title || !scheduledAt) {
    return res.status(400).json({ success: false, message: "Title and scheduled date/time are required" });
  }

  const roomId = generateRoomId();
  const selectedPlatform = platform || "in_app_video";
  let resolvedLink = meetingLink || "";

  if (!resolvedLink) {
    if (selectedPlatform === "jitsi") {
      resolvedLink = `https://meet.jit.si/TechStoreEthiopia-${roomId}`;
    } else if (selectedPlatform === "in_app_video" || selectedPlatform === "video_room") {
      resolvedLink = `/admin/meetings?room=${roomId}`;
    }
  }

  let invitees = [];
  const aud = targetAudience || (targetAll ? "all_sellers" : "all_staff");

  if (aud === "all_staff") {
    const staffMembers = await User.find({
      $or: [
        { role: { $in: STAFF_ROLES } },
        { "staffInfo.verificationStatus": "verified" }
      ],
      isActive: true,
    }).select("_id");
    invitees = staffMembers.map(s => ({ user: s._id, status: "pending" }));
  } else if (aud === "all_sellers") {
    const sellers = await User.find({
      role: { $in: ["seller", "Seller"] },
      "staffInfo.verificationStatus": "verified",
      isActive: true,
    }).select("_id");
    invitees = sellers.map(s => ({ user: s._id, status: "pending" }));
  } else if (aud === "roles" && Array.isArray(targetRoles) && targetRoles.length > 0) {
    const roleRegexes = targetRoles.map(r => new RegExp(`^${r}$`, "i"));
    const staffByRole = await User.find({
      role: { $in: roleRegexes },
      isActive: true,
    }).select("_id");
    invitees = staffByRole.map(s => ({ user: s._id, status: "pending" }));
  } else if (Array.isArray(inviteeIds) && inviteeIds.length > 0) {
    invitees = inviteeIds.map(id => ({ user: id, status: "pending" }));
  }

  // Ensure organizer is not duplicate in invitees
  invitees = invitees.filter(i => String(i.user) !== String(req.user._id));

  const meeting = await Meeting.create({
    title,
    description: description || "",
    type: type || "staff_sync",
    scheduledAt: new Date(scheduledAt),
    durationMin: Number(durationMin || 60),
    location: location || "",
    platform: selectedPlatform,
    meetingLink: resolvedLink,
    roomId,
    targetAudience: aud,
    targetRoles: Array.isArray(targetRoles) ? targetRoles : [],
    targetAll: aud === "all_sellers",
    organizer: req.user._id,
    invitees,
    notes: notes || "",
    status: "scheduled",
    messages: [
      {
        sender: req.user._id,
        senderName: req.user.name || "Organizer",
        senderRole: normalizeRole(req.user.role, req.user),
        text: `📅 Meeting created. Room ID: ${roomId}. Welcome to the meeting!`,
        createdAt: new Date(),
      }
    ],
  });

  await meeting.populate("organizer", "name email role profileImage");
  await meeting.populate("invitees.user", "name email role profileImage staffInfo.businessName");

  // Send notifications to invitees
  const dateStr = new Date(scheduledAt).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  meeting.invitees.forEach(i => {
    if (i.user?._id) {
      createNotification(
        i.user._id,
        `Staff Meeting: ${meeting.title}`,
        `You've been invited to a staff video meeting on ${dateStr}. Click to view room & details.`,
        "system",
        `/admin/meetings?room=${roomId}`,
        "📹"
      );
    }
  });

  res.status(201).json({ success: true, message: "Staff meeting scheduled successfully", meeting });
});

// ── GET all meetings (all staff / admin) ─────────────────────────────
export const getMeetings = asyncHandler(async (req, res) => {
  const { status, upcoming, room } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (upcoming === "true") filter.scheduledAt = { $gte: new Date() };
  if (room) filter.roomId = room;

  const meetings = await Meeting.find(filter)
    .populate("organizer", "name email role profileImage")
    .populate("invitees.user", "name email role profileImage staffInfo.businessName")
    .sort({ scheduledAt: -1 });

  res.json({ success: true, meetings });
});

// ── GET single meeting by ID or roomId ──────────────────────────────
export const getMeeting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let meeting;
  if (id.startsWith("stf-") || id.includes("-")) {
    meeting = await Meeting.findOne({ roomId: id });
  } else {
    meeting = await Meeting.findById(id);
  }

  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  await meeting.populate("organizer", "name email role profileImage");
  await meeting.populate("invitees.user", "name email role profileImage staffInfo.businessName");
  await meeting.populate("messages.sender", "name email role profileImage");

  res.json({ success: true, meeting });
});

// ── UPDATE meeting (Owner Only) ──────────────────────────────────
export const updateMeeting = asyncHandler(async (req, res) => {
  if (!isShelema(req.user)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only the Owner (Shelema) has permission to update staff meetings.",
    });
  }

  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  const updatable = [
    "title", "description", "type", "scheduledAt", "durationMin",
    "location", "platform", "meetingLink", "status", "cancelReason", "notes",
    "targetAudience", "targetRoles"
  ];

  updatable.forEach(f => {
    if (req.body[f] !== undefined) meeting[f] = req.body[f];
  });

  await meeting.save();
  await meeting.populate("organizer", "name email role profileImage");
  await meeting.populate("invitees.user", "name email role profileImage staffInfo.businessName");

  res.json({ success: true, message: "Meeting updated", meeting });
});

// ── CANCEL meeting (Owner Only) ──────────────────────────────────
export const cancelMeeting = asyncHandler(async (req, res) => {
  if (!isShelema(req.user)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Only the Owner (Shelema) has permission to cancel staff meetings.",
    });
  }

  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  meeting.status       = "cancelled";
  meeting.cancelReason = req.body.reason || "Cancelled by meeting host";
  await meeting.save();

  res.json({ success: true, message: "Meeting cancelled" });
});

// ── JOIN video meeting & record attendance ──────────────────────────
export const joinMeeting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meeting = (id.startsWith("stf-") || id.includes("-"))
    ? await Meeting.findOne({ roomId: id })
    : await Meeting.findById(id);

  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  const isHost = String(meeting.organizer) === String(req.user._id);
  if (meeting.status === "scheduled" && isHost) {
    meeting.status = "ongoing";
  }

  // Update or insert into invitees list
  const existing = meeting.invitees.find(i => String(i.user) === String(req.user._id));
  if (existing) {
    existing.status   = "attended";
    existing.joinedAt = new Date();
  } else if (!isHost) {
    meeting.invitees.push({
      user: req.user._id,
      status: "attended",
      joinedAt: new Date(),
    });
  }

  // Add system notice in meeting chat
  meeting.messages.push({
    sender: req.user._id,
    senderName: req.user.name,
    senderRole: normalizeRole(req.user.role, req.user),
    text: `🟢 ${req.user.name} joined the meeting.`,
    createdAt: new Date(),
  });

  await meeting.save();
  await meeting.populate("organizer", "name email role profileImage");
  await meeting.populate("invitees.user", "name email role profileImage staffInfo.businessName");

  res.json({ success: true, message: "Joined video meeting", meeting });
});

// ── SEND in-meeting live text chat message ──────────────────────────
export const sendMeetingMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: "Message text is required" });
  }

  const meeting = (id.startsWith("stf-") || id.includes("-"))
    ? await Meeting.findOne({ roomId: id })
    : await Meeting.findById(id);

  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  const newMsg = {
    sender: req.user._id,
    senderName: req.user.name,
    senderRole: normalizeRole(req.user.role, req.user),
    text: text.trim(),
    createdAt: new Date(),
  };

  meeting.messages.push(newMsg);
  await meeting.save();

  res.json({ success: true, messages: meeting.messages });
});

// ── GET in-meeting chat messages ────────────────────────────────────
export const getMeetingMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meeting = (id.startsWith("stf-") || id.includes("-"))
    ? await Meeting.findOne({ roomId: id }, "messages")
    : await Meeting.findById(id, "messages");

  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  res.json({ success: true, messages: meeting.messages || [] });
});

// ── GET my meetings (Staff member view) ─────────────────────────────
export const getMyMeetings = asyncHandler(async (req, res) => {
  const userRoleNorm = normalizeRole(req.user.role, req.user);

  const meetings = await Meeting.find({
    $or: [
      { organizer: req.user._id },
      { targetAudience: "all_staff" },
      { targetAudience: "all_sellers", $expr: { $eq: [req.user.role, "seller"] } },
      { targetRoles: userRoleNorm },
      { "invitees.user": req.user._id },
    ],
    status: { $ne: "cancelled" },
  })
    .populate("organizer", "name email role profileImage")
    .sort({ scheduledAt: -1 });

  const result = meetings.map(m => {
    const invite = m.invitees.find(i => String(i.user?._id || i.user) === String(req.user._id));
    return {
      ...m.toObject(),
      myStatus: invite ? invite.status : "pending",
      isHost: String(m.organizer?._id || m.organizer) === String(req.user._id),
    };
  });

  res.json({ success: true, meetings: result });
});

// ── RESPOND to invitation (RSVP) ───────────────────────────────────
export const respondToMeeting = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be accepted or declined" });
  }

  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  const existing = meeting.invitees.find(i => String(i.user) === String(req.user._id));
  if (existing) {
    existing.status = status;
    existing.note   = note || "";
  } else {
    meeting.invitees.push({ user: req.user._id, status, note: note || "" });
  }

  await meeting.save();
  res.json({ success: true, message: `RSVP recorded: ${status}` });
});


// ── ADD individual invitee ──────────────────────────────────────────
export const addInvitee = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

  const already = meeting.invitees.find(i => String(i.user) === String(userId));
  if (already) return res.status(409).json({ success: false, message: "Already invited" });

  meeting.invitees.push({ user: userId, status: "pending" });
  await meeting.save();
  await meeting.populate("invitees.user", "name email role profileImage staffInfo.businessName");
  res.json({ success: true, message: "Invitee added", meeting });
});
