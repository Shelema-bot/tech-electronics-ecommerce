import { ADMIN_ROLES } from "./roleMiddleware.js";

/**
 * admin — allows any staff role: owner, super_admin, admin, finance, cashier, seller
 * Used as the base guard for all /api/admin routes.
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  if (!ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

export default admin;
