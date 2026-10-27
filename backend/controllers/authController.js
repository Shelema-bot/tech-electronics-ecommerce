import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import logger from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── JWT helper ────────────────────────────────────────────────
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ==========================
// Register User
// ==========================
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  // Validation handled by validateRegister middleware — check duplicate here
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "An account with this email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword, phone, address, role: "customer" });
  const token = generateToken(user._id, user.role);

  logger.info(`New user registered: ${email}`);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    user: {
      id: user._id, name: user.name, email: user.email,
      phone: user.phone, address: user.address,
      profileImage: user.profileImage, role: user.role,
    },
    token,
  });
});

// ==========================
// Login User
// ==========================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Same message for not-found and wrong password — prevents user enumeration
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.isActive) {
    logger.warn(`Login attempt on deactivated account: ${email}`);
    return res.status(403).json({ success: false, message: "Your account has been deactivated. Contact support." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    logger.warn(`Failed login: ${email}`);
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = generateToken(user._id, user.role);
  logger.info(`User logged in: ${email} [${user.role}]`);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id, name: user.name, email: user.email,
      phone: user.phone, address: user.address,
      profileImage: user.profileImage, role: user.role,
      staffInfo: user.staffInfo,
    },
    token,
  });
});

// ==========================
// Forgot Password
// ==========================
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const user = await User.findOne({ email });

  // Always respond the same way — prevents email enumeration
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset token has been sent",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken  = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();

  logger.info(`Password reset requested: ${email}`);

  // In production, send this token via email — not in response
  // For now returning token to support existing frontend flow
  res.status(200).json({
    success: true,
    message: "Password reset token created",
    resetToken,
  });
});

// ==========================
// Reset Password
// ==========================
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: "Token and new password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  const user = await User.findOne({
    resetPasswordToken:  token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
  }

  user.password            = await bcrypt.hash(password, 12);
  user.resetPasswordToken  = "";
  user.resetPasswordExpire = null;
  await user.save();

  logger.info(`Password reset successful: ${user.email}`);

  res.status(200).json({ success: true, message: "Password updated successfully" });
});

// ==========================
// Get Current User Profile
// ==========================
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  return res.status(200).json({ success: true, user });
});
