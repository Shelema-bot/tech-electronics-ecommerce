import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword, getProfile } from "../controllers/authController.js";
import { validateLogin, validateRegister } from "../middleware/validation.middleware.js";

const router = express.Router();

// Rate limiting is applied at server.js level for all /api/auth routes

router.post("/register",        validateRegister, registerUser);
router.post("/login",           validateLogin,    loginUser);
router.post("/forgot-password",                   forgotPassword);
router.post("/reset-password",                    resetPassword);

export default router;
