import express from "express";

import {
    getAllUsers,
    updateUserRole,
    updateUserStatus
} from "../controllers/adminUserController.js";

import {protect,admin} from "../middleware/authMiddleware.js";


const router = express.Router();



router.get(
    "/",
    protect,
    admin,
    getAllUsers
);



router.put(
    "/:id/role",
    protect,
    admin,
    updateUserRole
);



router.put(
    "/:id/status",
    protect,
    admin,
    updateUserStatus
);



export default router;