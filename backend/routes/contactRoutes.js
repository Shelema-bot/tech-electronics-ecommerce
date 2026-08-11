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


const router = express.Router();


// Customer

router.post(
    "/",
    sendContactMessage
);



// Admin

router.get(
    "/admin",
    protect,
    admin,
    getContactMessages
);



router.put(
    "/admin/:id",
    protect,
    admin,
    updateContactStatus
);



router.put(
    "/admin/reply/:id",
    protect,
    admin,
    replyContactMessage
);

router.get(
    "/my-messages",
    protect,
    getMyContactMessages
);

router.delete(
    "/admin/:id",
    protect,
    admin,
    deleteContactMessage
);



export default router;