import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOrSuper } from "../middleware/roleMiddleware.js";
import {
  getMyNotifications, markRead, markAllRead,
  deleteNotification, sendNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// ── IMPORTANT: specific paths before /:id ──────────────────
router.get("/",               protect, getMyNotifications);
router.patch("/read-all",     protect, markAllRead);       // must be before /:id
router.patch("/:id/read",     protect, markRead);
router.delete("/:id",         protect, deleteNotification);
router.post("/send",          protect, adminOrSuper, sendNotification);

export default router;
