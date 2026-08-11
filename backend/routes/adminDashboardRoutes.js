import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {
    getDashboardStats
} from "../controllers/adminDashboardController.js";


const router = express.Router();



router.get(
    "/stats",
    protect,
    admin,
    getDashboardStats
);



export default router;