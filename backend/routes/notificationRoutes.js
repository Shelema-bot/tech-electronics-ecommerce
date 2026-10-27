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
  clearAdminNotifications,
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
router.put("/clear",                  protect, adminOrSuper, clearAdminNotifications);
router.delete("/clear",               protect, adminOrSuper, clearAdminNotifications);
router.put("/notifications/clear",    protect, adminOrSuper, clearAdminNotifications);
router.delete("/notifications/clear", protect, adminOrSuper, clearAdminNotifications);
router.get("/admin/all",              protect, adminOrSuper, getAllNotificationsAdmin);
router.get("/admin/stats",            protect, adminOrSuper, getNotificationStats);
router.post("/send",                  protect, adminOrSuper, sendNotification);
router.post("/broadcast",             protect, adminOrSuper, broadcastNotification);

export default router;
