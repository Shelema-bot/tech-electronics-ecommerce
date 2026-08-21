import { Navigate } from "react-router-dom";

// Allowed admin roles — all can access the admin panel
const ADMIN_ROLES = ["admin", "super_admin", "seller", "cashier"];

function AdminRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" />;

  // Block non-staff
  if (!ADMIN_ROLES.includes(user.role)) return <Navigate to="/" />;

  // If a specific role is required (e.g. super_admin only pages)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
}

export default AdminRoute;
