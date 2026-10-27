import User from "../models/User.js";
import Product from "../models/Product.js";
import { createNotification, notifyAdmins } from "./notificationController.js";
import { isShelema, isOwnerSuperAdmin } from "../middleware/roleMiddleware.js";

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
    const allowed = ["customer", "admin", "super_admin", "seller", "cashier", "finance", "cashier_finance", "inventory_manager"];
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

// ── VERIFY OR REJECT SELLER (STRICTLY OWNER / SOLE SUPER ADMIN ONLY) ─
export const verifySeller = async (req, res) => {
  try {
    // RBAC: Restricted exclusively to the owner (Super Admin Shelema)
    if (!isOwnerSuperAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "403 Forbidden: Restricted: Only the owner (sole Super Admin Shelema) has permission to approve new sellers.",
      });
    }

    const { status, note } = req.body;
    // Map status: accept "approved", "verified", "rejected"
    const isApproval = status === "approved" || status === "verified";
    const isRejection = status === "rejected";

    if (!isApproval && !isRejection) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved', 'verified', or 'rejected'."
      });
    }

    const finalStatus = isApproval ? "verified" : "rejected";

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Seller user not found" });

    user.staffInfo = user.staffInfo || {};
    user.staffInfo.verificationStatus = finalStatus;
    user.staffInfo.verificationNote   = note || "";

    // If verified, ensure role is seller; if rejected, revert to customer role
    if (finalStatus === "verified") {
      user.role = "seller";
      createNotification(
        user._id,
        "🎉 Seller Application Approved!",
        "Congratulations! Your seller application has been approved by the store owner. You can now submit products for sale.",
        "verification", "/admin/my-products", "✅"
      );
    } else {
      user.role = "customer";
      createNotification(
        user._id,
        "Seller Application Rejected",
        `Your seller application was not approved. Reason: ${note || "No reason provided."}`,
        "verification", "/become-seller", "❌"
      );
    }

    await user.save();

    res.json({
      success: true,
      message: `Seller successfully ${finalStatus === "verified" ? "approved" : "rejected"}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        staffInfo: user.staffInfo,
      }
    });
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
    user.staffInfo = user.staffInfo || {};
    user.staffInfo.businessName     = businessName;
    user.staffInfo.nationalIdNumber = nationalIdNumber;
    user.staffInfo.appliedAt        = new Date();
    user.staffInfo.verificationStatus = "pending";

    if (req.file) {
      user.staffInfo.nationalIdImage = req.file.path;
    }

    await user.save();

    // Notify admins about new seller application
    notifyAdmins(
      "New Seller Application",
      `${user.name} has submitted a seller application. Please review and verify.`,
      "verification", "/admin/seller-verify", "🏪"
    );

    res.json({ success: true, message: "Seller application submitted. Awaiting verification.", user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SELLER: SUBMIT PRODUCT FOR APPROVAL ──────────
export const sellerSubmitProduct = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id).populate("staffInfo.plan");
    if (!seller || seller.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access only" });
    }
    if (seller.staffInfo?.verificationStatus !== "verified") {
      return res.status(403).json({ success: false, message: "Your seller account is not yet verified. Please wait for approval." });
    }

    // ── Plan-based checks ──────────────────────────────────────────
    const plan = seller.staffInfo?.plan;
    if (plan) {
      // Check subscription is active
      const subStatus = seller.staffInfo.subscriptionStatus;
      if (subStatus === "suspended") {
        return res.status(403).json({ success: false, message: "Your seller subscription is suspended. Please contact admin." });
      }
      if (subStatus === "overdue") {
        return res.status(403).json({ success: false, message: "Your subscription payment is overdue. Please settle your balance to submit products." });
      }

      // Check plan expiry
      if (seller.staffInfo.planExpiresAt && new Date() > seller.staffInfo.planExpiresAt) {
        return res.status(403).json({ success: false, message: "Your subscription plan has expired. Please contact admin to renew." });
      }

      // Check monthly product limit
      const currentMonthYear = new Date().toISOString().slice(0, 7); // "2026-10"
      let listingsThisMonth = seller.staffInfo.productListingsThisMonth || 0;

      // Reset counter if new month
      if (seller.staffInfo.listingMonthYear !== currentMonthYear) {
        listingsThisMonth = 0;
        seller.staffInfo.listingMonthYear         = currentMonthYear;
        seller.staffInfo.productListingsThisMonth = 0;
      }

      if (listingsThisMonth >= plan.productLimit) {
        return res.status(403).json({
          success: false,
          message: `You've reached your monthly product limit of ${plan.productLimit} on the ${plan.name} plan. Upgrade your plan or wait until next month.`,
          limit: plan.productLimit,
          used:  listingsThisMonth,
        });
      }

      // Check price range if set
      const price = Number(req.body.price);
      if (!isNaN(price)) {
        if (plan.minProductPrice > 0 && price < plan.minProductPrice) {
          return res.status(400).json({
            success: false,
            message: `Your plan requires a minimum listing price of ${plan.minProductPrice.toLocaleString()} ETB.`,
          });
        }
        if (plan.maxProductPrice > 0 && price > plan.maxProductPrice) {
          return res.status(400).json({
            success: false,
            message: `Your plan allows a maximum listing price of ${plan.maxProductPrice.toLocaleString()} ETB.`,
          });
        }
      }
    }
    // ── End plan checks ────────────────────────────────────────────

    const { name, description, price, originalPrice, discountPrice, category, brand, stock } = req.body;
    const finalPrice = Number(discountPrice || price);

    if (!name || isNaN(finalPrice) || !category) {
      return res.status(400).json({ success: false, message: "Name, price and category are required" });
    }

    const imagePaths = req.files ? req.files.map(f => f.path) : [];

    const product = await Product.create({
      name,
      description,
      price: finalPrice,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      discountPrice: discountPrice ? Number(discountPrice) : finalPrice,
      category,
      brand,
      stock: Number(stock) || 0,
      images: imagePaths,
      isPublic: false,
      approvalStatus: "pending",
      submittedBy: req.user._id,
    });

    // Increment monthly listing counter
    if (plan) {
      const currentMonthYear = new Date().toISOString().slice(0, 7);
      seller.staffInfo.listingMonthYear         = currentMonthYear;
      seller.staffInfo.productListingsThisMonth = (seller.staffInfo.productListingsThisMonth || 0) + 1;
      await seller.save();
    }

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

// ── GET PENDING PRODUCTS (super_admin / inventory_manager) ────────────
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

// ── ASSIGN ROLE BY EMAIL (super_admin) ────────────────────────
export const assignRoleByEmail = async (req, res) => {
  try {
    const { email, role } = req.body;
    const allowed = ["cashier_finance", "inventory_manager", "seller", "admin", "super_admin", "cashier", "finance"];
    if (!email || !role) {
      return res.status(400).json({ success: false, message: "email and role are required" });
    }
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${allowed.join(", ")}` });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email address" });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({ success: false, message: "Cannot change a super admin's role" });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, message: `Role assigned: ${role}`, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
