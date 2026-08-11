import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";


import {
    getUserProfile,
    updateUserProfile,
    getAdminProfile,
    updateAdminProfile
} from "../controllers/userController.js";


const router = express.Router();


router.get(
    "/profile",
    protect,
    getUserProfile
);


router.put(
    "/profile",
    protect,
    upload.single("profileImage"),
    updateUserProfile
);



router.get(
    "/admin/profile",
    protect,
    admin,
    getAdminProfile
);



router.put(
    "/admin/profile",
    protect,
    admin,
    upload.single("profileImage"),
    updateAdminProfile
);



export default router;