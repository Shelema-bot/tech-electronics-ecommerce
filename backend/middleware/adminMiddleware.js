import { ADMIN_ROLES, normalizeRole } from "./roleMiddleware.js";

/**
 * admin — allows staff roles (SuperAdmin, CashierFinance, InventoryManager, Seller)
 * Base guard for /api/admin routes.
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  const roleNorm = normalizeRole(req.user.role);
  if (!["SuperAdmin", "CashierFinance", "InventoryManager", "Seller"].includes(roleNorm)) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

export default admin;
