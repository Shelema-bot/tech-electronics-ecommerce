/**
 * Role-Based Access Control (RBAC)
 * Strictly Enforced Rules:
 * 1. Shelema is the ONLY Super Admin / Owner with UNRESTRICTED full system access.
 * 2. Only Shelema can approve new sellers and manage staff roles.
 * 3. Cashier/Finance: Dedicated to payment verification, transaction approvals, and financial logs.
 * 4. Inventory Manager: Dedicated to product catalogs, stock counts, and categories.
 * 5. Customer: Standard shopping, cart, personal checkout, and profile.
 */

// Helper to verify if an account belongs to Shelema (The Super Admin)
export const isShelema = (user) => {
  if (!user) return false;
  const email = String(user.email || "").toLowerCase().trim();
  const name  = String(user.name || "").toLowerCase().trim();
  return email.includes("shelema") || name.includes("shelema");
};

// Normalized role helper with strict SuperAdmin mapping
export const normalizeRole = (role, user = null) => {
  if (!role) return "Customer";
  const r = String(role).toLowerCase().replace(/[\s_-]/g, "");

  // Owner / CEO (SuperAdmin) is EXCLUSIVELY Shelema
  if (["superadmin", "owner"].includes(r)) {
    return "SuperAdmin";
  }

  // Admin (formerly Inventory Manager)
  if (["admin", "inventorymanager", "manager"].includes(r)) {
    if (isShelema(user)) return "SuperAdmin";
    return "Admin";
  }

  if (["cashier", "finance", "cashierfinance"].includes(r)) return "CashierFinance";
  if (["delivery"].includes(r)) return "Delivery";
  if (["seller"].includes(r)) return "Seller";
  return "Customer";
};

// Helper to strictly verify if user is the Owner / Sole Super Admin (Shelema)
export const isOwnerSuperAdmin = (user) => {
  if (!user) return false;
  const roleNorm = normalizeRole(user.role, user);
  const isSuper = (
    roleNorm === "SuperAdmin" ||
    user.role === "SuperAdmin" ||
    user.role === "super_admin" ||
    user.role === "owner"
  );
  return isSuper && isShelema(user);
};

// Role hierarchy levels for comparison
const ROLE_LEVEL = {
  owner:             100,
  super_admin:        90,
  SuperAdmin:         90,
  admin:              80,
  Admin:              80,
  cashier_finance:    60,
  CashierFinance:     60,
  finance:            60,
  cashier:            60,
  inventory_manager:  50,
  InventoryManager:   50,
  delivery:           40,
  Delivery:           40,
  seller:             30,
  Seller:             30,
  customer:            0,
  Customer:            0,
};

export const ADMIN_ROLES = [
  "owner", "super_admin", "admin", "SuperAdmin",
  "cashier_finance", "CashierFinance", "finance", "cashier",
  "inventory_manager", "InventoryManager",
  "delivery", "Delivery",
  "seller"
];

/**
 * Flexible & strict checkRole middleware factory
 * - Shelema is NEVER restricted: has full SuperAdmin access across all routes
 * - Only Shelema can manage users and roles
 * - Other admins are confined to their specific duties
 */
export const checkRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  // 1. Shelema is the Super Admin with completely UNRESTRICTED privileges
  if (isShelema(req.user)) {
    return next();
  }

  const allowedNorm = allowedRoles.map(r => normalizeRole(r));

  // 2. User Management routes are exclusive to Shelema
  if (allowedNorm.includes("SuperAdmin") && allowedNorm.length === 1) {
    return res.status(403).json({
      success: false,
      message: "Access restricted: Only Shelema (Super Admin) can manage users and permissions.",
    });
  }

  // 3. For other roles, verify they have permission for this route
  const userNorm = normalizeRole(req.user.role, req.user);
  if (!allowedNorm.includes(userNorm)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Authorized roles: ${allowedRoles.join(", ")} (Your role: ${req.user.role})`,
    });
  }
  next();
};

// ── Strict Owner-Only Seller Approval Middleware ───────────
export const ownerOnlySellerApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (!isOwnerSuperAdmin(req.user)) {
    return res.status(403).json({
      success: false,
      message: "403 Forbidden: Restricted: Only the Owner / CEO (Shelema) has permission to approve new sellers.",
    });
  }
  next();
};

// ── Generic role factory (legacy support) ─────────
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  if (isShelema(req.user)) return next();

  const userNorm = normalizeRole(req.user.role, req.user);
  const rolesNorm = roles.map(r => normalizeRole(r));

  if (!roles.includes(req.user.role) && !rolesNorm.includes(userNorm)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required: ${roles.join(" or ")}`,
    });
  }
  next();
};

// ── Minimum level check ──────────────────────────
export const requireMinLevel = (minRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });
  if (isShelema(req.user)) return next();

  const userLevel = ROLE_LEVEL[req.user.role] ?? 0;
  const minLevel  = ROLE_LEVEL[minRole] ?? 0;
  if (userLevel < minLevel) {
    return res.status(403).json({ success: false, message: `Access denied. Requires ${minRole} or higher.` });
  }
  next();
};

// ── Strict Pre-built Middleware ───────────────
export const superAdminOnly          = checkRole(["SuperAdmin"]);
export const cashierFinanceOnly      = checkRole(["SuperAdmin", "CashierFinance"]);
export const inventoryManagerOnly    = checkRole(["SuperAdmin", "InventoryManager", "Admin"]);
export const sellerOrAdmin           = checkRole(["SuperAdmin", "Seller", "InventoryManager", "Admin"]);
export const orderFulfillmentAccess  = checkRole(["SuperAdmin", "CashierFinance", "Delivery"]);
export const deliveryOnly            = checkRole(["SuperAdmin", "Delivery"]);
export const analyticsAccess         = checkRole(["SuperAdmin", "Admin", "InventoryManager", "CashierFinance", "Delivery"]);

// ── Legacy Aliases ────────────────────────────
export const superAdmin    = checkRole(["SuperAdmin"]);
export const adminOrSuper  = checkRole(["SuperAdmin"]);
export const financeAccess = checkRole(["SuperAdmin", "CashierFinance"]);
export const cashierAccess = checkRole(["SuperAdmin", "CashierFinance"]);

export const anyStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  if (isShelema(req.user)) return next();

  const userNorm = normalizeRole(req.user.role, req.user);
  if (!["SuperAdmin", "CashierFinance", "InventoryManager", "Seller"].includes(userNorm)) {
    return res.status(403).json({ success: false, message: "Staff access required" });
  }
  next();
};
