import express from "express";

import {
    sendContactMessage,
    getContactMessages,
    updateContactStatus,
    deleteContactMessage,
    replyContactMessage,
    getMyContactMessages
} from "../controllers/contactController.js";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Customer — supports optional screenshot upload
router.post(
    "/",
    upload.single("screenshot"),
    sendContactMessage
);

// Admin
router.get("/admin",         protect, admin, getContactMessages);
router.put("/admin/:id",     protect, admin, updateContactStatus);
router.put("/admin/reply/:id", protect, admin, replyContactMessage);
router.delete("/admin/:id",  protect, admin, deleteContactMessage);

// Customer - my messages
router.get("/my-messages",   protect, getMyContactMessages);

export default router;