import { Navigate } from "react-router-dom";

const ROLE_LEVEL = {
  owner:       100,
  super_admin:  90,
  admin:        80,
  finance:      60,
  cashier:      40,
  seller:       30,
  customer:      0,
};

// All roles that can access the admin panel
const ADMIN_ROLES = ["owner","super_admin","admin","finance","cashier","seller"];

// Role requirements for specific pages
const PAGE_REQUIREMENTS = {
  "/admin/staff":             ["owner","super_admin","admin"],
  "/admin/seller-verify":     ["owner","super_admin","admin"],
  "/admin/product-approval":  ["owner","super_admin","admin"],
  "/admin/customers":         ["owner","super_admin","admin"],
  "/admin/categories":        ["owner","super_admin","admin"],
  "/admin/reports":           ["owner","super_admin","admin","finance"],
  "/admin/coupons":           ["owner","super_admin","admin"],
  "/admin/contacts":          ["owner","super_admin","admin"],
};

function AdminRoute({ children, requiredRole = null, requiredRoles = null }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" />;

  // Block non-staff
  if (!ADMIN_ROLES.includes(user.role)) return <Navigate to="/" />;

  // If a specific role list is required
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" />;
  }

  // Legacy single role requirement — use level-based check
  if (requiredRole) {
    const userLevel = ROLE_LEVEL[user.role] ?? 0;
    const reqLevel  = ROLE_LEVEL[requiredRole] ?? 0;
    if (userLevel < reqLevel) return <Navigate to="/admin/dashboard" />;
  }

  return children;
}

export default AdminRoute;
