import User from "../models/User.js";
import { isShelema } from "../middleware/roleMiddleware.js";

const ALLOWED_ROLES = [
  "customer",
  "cashier_finance",
  "inventory_manager",
  "seller",
  "super_admin",
  "admin",
  "cashier",
  "finance",
  "delivery",
  "Delivery",
];

// GET ALL USERS (ADMIN)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER ROLE
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(", ")}`,
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // STRICT RULE: Only Shelema can be Owner / CEO (super_admin / owner)!
    if (["super_admin", "owner"].includes(role) && !isShelema(targetUser)) {
      return res.status(403).json({
        message: "Restricted: Shelema is the only Owner / CEO. Other staff members can be assigned Admin, Cashier/Finance, or Seller.",
      });
    }

    // Protect Shelema from being demoted by anyone else
    if (isShelema(targetUser) && !isShelema(req.user)) {
      return res.status(403).json({ message: "Cannot modify Shelema's Owner / CEO account" });
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      message: "Role updated successfully",
      user: targetUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACTIVATE / DEACTIVATE USER
export const updateUserStatus = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Never allow deactivating Shelema
    if (isShelema(targetUser)) {
      return res.status(403).json({ message: "Cannot deactivate Shelema's Super Admin account" });
    }

    targetUser.isActive = req.body.isActive;
    await targetUser.save();

    res.json({
      message: `User ${targetUser.isActive ? "activated" : "deactivated"}`,
      user: targetUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
