import express from "express";

import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {
    getAdminReports
} from "../controllers/adminReportController.js";


const router = express.Router();



router.get(
    "/",
    protect,
    admin,
    getAdminReports
);



export default router;