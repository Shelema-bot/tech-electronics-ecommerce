/**
 * Role hierarchy (highest to lowest):
 * owner > super_admin > admin > finance > cashier > seller > customer
 *
 * owner    — business owner, full access, cannot be demoted by anyone else
 * super_admin — full platform control
 * admin    — operational management (treated same as super_admin in most cases)
 * finance  — read-only financial reports, payment oversight
 * cashier  — orders, COD payments, basic dashboard
 * seller   — own products, submissions
 * customer — shopping only
 */

// Role hierarchy levels for comparison
const ROLE_LEVEL = {
  owner:      100,
  super_admin: 90,
  admin:       80,
  finance:     60,
  cashier:     40,
  seller:      30,
  customer:     0,
};

export const ADMIN_ROLES = ["owner", "super_admin", "admin", "finance", "cashier", "seller"];

// ── Generic role factory ─────────────────────────
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  if (!roles.includes(req.user.role)) {
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
  const userLevel = ROLE_LEVEL[req.user.role] ?? 0;
  const minLevel  = ROLE_LEVEL[minRole] ?? 0;
  if (userLevel < minLevel) {
    return res.status(403).json({ success: false, message: `Access denied. Requires ${minRole} or higher.` });
  }
  next();
};

// ── Pre-built shorthand middleware ───────────────
export const superAdmin    = requireMinLevel("super_admin");  // admin, super_admin, owner
export const adminOrSuper  = requireMinLevel("admin");        // admin, super_admin, owner
export const financeAccess = requireMinLevel("finance");      // finance, admin, super_admin, owner
export const cashierAccess = requireMinLevel("cashier");      // cashier and above
export const sellerOrAdmin = requireRole("seller","admin","super_admin","owner","finance","cashier");
export const anyStaff      = (req, res, next) => {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Staff access required" });
  }
  next();
};
