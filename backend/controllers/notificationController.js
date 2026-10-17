import Notification from "../models/Notification.js";
import User         from "../models/User.js";
import asyncHandler  from "../utils/asyncHandler.js";

// ── GET MY NOTIFICATIONS ──────────────────────────────────────────
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { type, unread } = req.query;
  const filter = { user: req.user._id };
  if (type   && type   !== "all") filter.type  = type;
  if (unread === "true")          filter.isRead = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, notifications, unreadCount });
});

// ── MARK ONE AS READ ──────────────────────────────────────────────
export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) return res.status(404).json({ success: false, message: "Not found" });
  n.isRead = true;
  await n.save();
  res.json({ success: true, notification: n });
});

// ── MARK ALL AS READ ──────────────────────────────────────────────
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read" });
});

// ── DELETE ONE ────────────────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: "Deleted" });
});

// ── DELETE ALL (clear inbox) ──────────────────────────────────────
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ success: true, message: "All notifications cleared" });
});

// ── ADMIN: GET ALL NOTIFICATIONS (paginated) ──────────────────────
export const getAllNotificationsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, type, userId } = req.query;
  const filter = {};
  if (type)   filter.type = type;
  if (userId) filter.user = userId;

  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit)),
    Notification.countDocuments(filter),
  ]);
  res.json({ success: true, notifications, total, page: Number(page) });
});

// ── ADMIN: SEND TO SPECIFIC USER ─────────────────────────────────
export const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, link, icon } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: "title and message required" });
  }
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId required for targeted send" });
  }
  const notification = await Notification.create({
    user: userId, title, message,
    type: type || "system", link: link || "", icon: icon || "🔔",
  });
  res.status(201).json({ success: true, notification });
});

// ── ADMIN: BROADCAST TO ALL USERS / ROLE ─────────────────────────
export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, type, link, icon, role } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: "title and message required" });
  }

  const userFilter = { isActive: true };
  if (role && role !== "all") userFilter.role = role;

  const users = await User.find(userFilter).select("_id");
  if (users.length === 0) {
    return res.status(404).json({ success: false, message: "No matching users found" });
  }

  const docs = users.map(u => ({
    user:    u._id,
    title,
    message,
    type:    type  || "system",
    link:    link  || "",
    icon:    icon  || "📢",
    isRead:  false,
  }));

  await Notification.insertMany(docs);
  res.status(201).json({
    success: true,
    message: `Broadcast sent to ${docs.length} user${docs.length !== 1 ? "s" : ""}`,
    count:   docs.length,
  });
});

// ── ADMIN: GET NOTIFICATION STATS ────────────────────────────────
export const getNotificationStats = asyncHandler(async (req, res) => {
  const [total, unread, byType] = await Promise.all([
    Notification.countDocuments(),
    Notification.countDocuments({ isRead: false }),
    Notification.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
  ]);
  res.json({ success: true, total, unread, byType });
});

// ── ADMIN: CLEAR / MARK ALL NOTIFICATIONS AS READ ─────────────────
export const clearAdminNotifications = asyncHandler(async (req, res) => {
  try {
    if (req.query.action === "delete" || req.body?.action === "delete") {
      await Notification.deleteMany({});
    } else {
      await Notification.updateMany({}, { $set: { isRead: true, read: true } });
    }
    res.status(200).json({ success: true, message: "Notifications cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── INTERNAL UTILITY: create one notification ─────────────────────
// Called by other controllers — never exposed directly as a route
export const createNotification = async (
  userId, title, message,
  type = "system", link = "", icon = "🔔"
) => {
  try {
    await Notification.create({ user: userId, title, message, type, link, icon });
  } catch (err) {
    console.log("Notification error:", err.message);
  }
};

// ── INTERNAL UTILITY: broadcast to all admins ─────────────────────
export const notifyAdmins = async (title, message, type = "system", link = "", icon = "🔔") => {
  try {
    const admins = await User.find({
      role: { $in: ["owner", "super_admin", "admin"] },
      isActive: true,
    }).select("_id");
    if (admins.length === 0) return;
    const docs = admins.map(a => ({ user: a._id, title, message, type, link, icon }));
    await Notification.insertMany(docs);
  } catch (err) {
    console.log("notifyAdmins error:", err.message);
  }
};
