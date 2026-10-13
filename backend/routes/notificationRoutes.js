import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOrSuper } from "../middleware/roleMiddleware.js";
import {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
  getAllNotificationsAdmin,
  sendNotification,
  broadcastNotification,
  getNotificationStats,
} from "../controllers/notificationController.js";

const router = express.Router();

// ── IMPORTANT: specific paths before /:id ──────────────────────
// Customer routes
router.get("/",              protect, getMyNotifications);
router.patch("/read-all",    protect, markAllRead);
router.delete("/clear-all",  protect, deleteAllNotifications);
router.patch("/:id/read",    protect, markRead);
router.delete("/:id",        protect, deleteNotification);

// Admin routes
router.get("/admin/all",     protect, adminOrSuper, getAllNotificationsAdmin);
router.get("/admin/stats",   protect, adminOrSuper, getNotificationStats);
router.post("/send",         protect, adminOrSuper, sendNotification);
router.post("/broadcast",    protect, adminOrSuper, broadcastNotification);

export default router;
