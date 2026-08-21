// ── Role-based middleware factory ────────────────
// Usage: requireRole("super_admin")
//        requireRole("super_admin", "admin")
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(" or ")}`,
    });
  }
  next();
};

// Shorthand middleware exports
export const superAdmin     = requireRole("super_admin");
export const adminOrSuper   = requireRole("admin", "super_admin");
export const sellerOrAdmin  = requireRole("seller", "admin", "super_admin");
export const cashierOrAdmin = requireRole("cashier", "admin", "super_admin");
