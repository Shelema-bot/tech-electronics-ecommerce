// ── Admin middleware (legacy — backward compat) ──
// Allows: admin, super_admin
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  const allowed = ["admin", "super_admin"];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};
export default admin;
