import User from "../models/User.js";
import Product from "../models/Product.js";

// ── GET ALL STAFF (super_admin only) ─────────────
export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ["seller", "cashier", "admin", "super_admin"] },
    }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ASSIGN ROLE (super_admin only) ───────────────
export const assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["customer", "admin", "super_admin", "seller", "cashier"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Prevent changing another super_admin's role (protect yourself)
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (target.role === "super_admin" && req.user._id.toString() !== target._id.toString()) {
      return res.status(403).json({ success: false, message: "Cannot change another super admin's role" });
    }

    target.role = role;
    await target.save();
    res.json({ success: true, message: "Role updated", user: target });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── TOGGLE USER ACTIVE STATUS (super_admin/admin) ─
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "super_admin") {
      return res.status(403).json({ success: false, message: "Cannot deactivate a super admin" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET PENDING SELLER VERIFICATIONS (super_admin) ─
export const getPendingVerifications = async (req, res) => {
  try {
    const sellers = await User.find({
      role: "seller",
      "staffInfo.verificationStatus": "pending",
    }).select("-password").sort({ "staffInfo.appliedAt": -1 });
    res.json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── VERIFY OR REJECT SELLER (super_admin) ─────────
export const verifySeller = async (req, res) => {
  try {
    const { status, note } = req.body; // status: "verified" | "rejected"
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.staffInfo.verificationStatus = status;
    user.staffInfo.verificationNote   = note || "";

    // If rejected, revert to customer role
    if (status === "rejected") user.role = "customer";

    await user.save();
    res.json({ success: true, message: `Seller ${status}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── APPLY AS SELLER (any customer) ───────────────
export const applyAsSeller = async (req, res) => {
  try {
    const { businessName, nationalIdNumber } = req.body;
    if (!businessName || !nationalIdNumber) {
      return res.status(400).json({ success: false, message: "Business name and national ID number are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.role = "seller";
    user.staffInfo.businessName     = businessName;
    user.staffInfo.nationalIdNumber = nationalIdNumber;
    user.staffInfo.appliedAt        = new Date();
    user.staffInfo.verificationStatus = "pending";

    if (req.file) {
      user.staffInfo.nationalIdImage = req.file.path;
    }

    await user.save();
    res.json({ success: true, message: "Seller application submitted. Awaiting verification.", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SELLER: SUBMIT PRODUCT FOR APPROVAL ──────────
export const sellerSubmitProduct = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id);
    if (!seller || seller.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access only" });
    }
    if (seller.staffInfo.verificationStatus !== "verified") {
      return res.status(403).json({ success: false, message: "Your seller account is not yet verified. Please wait for approval." });
    }

    const { name, description, price, category, brand, stock } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: "Name, price and category are required" });
    }

    const imagePaths = req.files ? req.files.map(f => f.path) : [];

    const product = await Product.create({
      name, description, price, category, brand, stock,
      images: imagePaths,
      isPublic: false,
      approvalStatus: "pending",
      submittedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: "Product submitted for approval", product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SUPER_ADMIN: APPROVE OR REJECT PRODUCT ───────
export const approveProduct = async (req, res) => {
  try {
    const { status, note } = req.body; // "approved" | "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.approvalStatus = status;
    product.approvalNote   = note || "";
    product.approvedBy     = req.user._id;
    product.isPublic       = status === "approved";

    await product.save();
    res.json({ success: true, message: `Product ${status}`, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET PENDING PRODUCTS (super_admin) ────────────
export const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ approvalStatus: "pending" })
      .populate("submittedBy", "name email staffInfo.businessName")
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SELLER: GET OWN PRODUCTS ──────────────────────
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
