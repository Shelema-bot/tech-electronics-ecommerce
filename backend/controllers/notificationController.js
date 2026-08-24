import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── GET MY NOTIFICATIONS ──────────────────────────────────────
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, notifications, unreadCount });
});

// ── MARK ONE AS READ ──────────────────────────────────────────
export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) return res.status(404).json({ success: false, message: "Notification not found" });
  n.isRead = true;
  await n.save();
  res.json({ success: true, notification: n });
});

// ── MARK ALL AS READ ──────────────────────────────────────────
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read" });
});

// ── DELETE ONE ────────────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: "Notification deleted" });
});

// ── ADMIN: SEND TO ALL / SPECIFIC USER ───────────────────────
export const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, link, icon } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: "title and message required" });
  }
  const notification = await Notification.create({
    user: userId || req.user._id,
    title, message, type: type || "system",
    link: link || "", icon: icon || "🔔",
  });
  res.status(201).json({ success: true, notification });
});

// ── UTILITY: Create notification (called internally) ─────────
export const createNotification = async (userId, title, message, type = "system", link = "", icon = "🔔") => {
  try {
    await Notification.create({ user: userId, title, message, type, link, icon });
  } catch (err) {
    console.log("Notification error:", err.message);
  }
};
