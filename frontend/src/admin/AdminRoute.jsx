import { Navigate } from "react-router-dom";
import ErrorBoundary from "../components/common/ErrorBoundary";

export const isShelema = (user) => {
  if (!user) return false;
  const email = String(user.email || "").toLowerCase().trim();
  const name  = String(user.name || "").toLowerCase().trim();
  return email.includes("shelema") || name.includes("shelema");
};

export const normalizeRole = (role, user = null) => {
  if (!role) return "Customer";
  const r = String(role).toLowerCase().replace(/[\s_-]/g, "");
  if (["superadmin", "owner"].includes(r)) {
    return "SuperAdmin";
  }
  if (["admin", "inventorymanager", "manager"].includes(r)) {
    if (isShelema(user)) return "SuperAdmin";
    return "Admin";
  }
  if (["cashier", "finance", "cashierfinance"].includes(r)) return "CashierFinance";
  if (["delivery"].includes(r)) return "Delivery";
  if (["seller"].includes(r)) return "Seller";
  if (["webappmanager", "web_app_manager"].includes(r)) return "WebAppManager";
  return "Customer";
};

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
  inventory_manager:  80,
  InventoryManager:   80,
  delivery:           45,
  Delivery:           45,
  seller:             30,
  Seller:             30,
  customer:            0,
  Customer:            0,
};

// All roles that can access the admin panel
const ADMIN_ROLES = [
  "owner", "super_admin", "admin", "SuperAdmin",
  "cashier_finance", "CashierFinance", "finance", "cashier",
  "inventory_manager", "InventoryManager",
  "delivery", "Delivery",
  "seller"
];

function AdminRoute({ children, requiredRole = null, requiredRoles = null }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" />;

  const userNorm = normalizeRole(user.role);

  // Block non-staff
  if (!ADMIN_ROLES.includes(user.role) && userNorm === "Customer") {
    return <Navigate to="/" />;
  }

  // If a specific role list is required
  if (requiredRoles && requiredRoles.length > 0) {
    const normList = requiredRoles.map(normalizeRole);
    if (!normList.includes(userNorm) && !requiredRoles.includes(user.role)) {
      return <Navigate to="/admin" />;
    }
  }

  // Legacy single role requirement
  if (requiredRole) {
    const userLevel = ROLE_LEVEL[user.role] ?? 0;
    const reqLevel  = ROLE_LEVEL[requiredRole] ?? 0;
    if (userLevel < reqLevel && userNorm !== normalizeRole(requiredRole)) {
      return <Navigate to="/admin" />;
    }
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default AdminRoute;
