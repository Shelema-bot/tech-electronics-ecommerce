import express from "express";
import { getAllUsers, updateUserRole, updateUserStatus } from "../controllers/adminUserController.js";
import protect from "../middleware/authMiddleware.js";
import { superAdminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Super Admin exclusive rights over user accounts and roles
router.get("/",           protect, superAdminOnly, getAllUsers);
router.put("/:id/role",   protect, superAdminOnly, updateUserRole);
router.put("/:id/status", protect, superAdminOnly, updateUserStatus);

export default router;
