import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOrSuper } from "../middleware/roleMiddleware.js";
import {
  getMyNotifications, markRead, markAllRead,
  deleteNotification, sendNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/",              protect, getMyNotifications);
router.patch("/:id/read",    protect, markRead);
router.patch("/read-all",    protect, markAllRead);
router.delete("/:id",        protect, deleteNotification);
router.post("/send",         protect, adminOrSuper, sendNotification);

export default router;
