import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaBox, FaList, FaShoppingCart,
  FaUsers, FaCreditCard, FaUserCog,
  FaCheckCircle, FaClipboardCheck, FaEnvelope,
  FaChartBar, FaTag, FaMoneyBillWave,
} from "react-icons/fa";
import "./Sidebar.css";

const ALL_ADMIN = ["owner","super_admin","admin"];
const WITH_FINANCE = [...ALL_ADMIN, "finance"];
const WITH_CASHIER = [...WITH_FINANCE, "cashier"];
const ALL_STAFF    = [...WITH_CASHIER, "seller"];

const ALL_MENU = [
  // Core — everyone
  { path: "/admin",              name: "Dashboard",       icon: <FaHome />,           roles: ALL_STAFF },
  // Products
  { path: "/admin/products",     name: "Products",        icon: <FaBox />,            roles: [...ALL_ADMIN,"seller"] },
  { path: "/admin/categories",   name: "Categories",      icon: <FaList />,           roles: ALL_ADMIN },
  // Orders & Payments
  { path: "/admin/orders",       name: "Orders",          icon: <FaShoppingCart />,   roles: WITH_CASHIER },
  { path: "/admin/customers",    name: "Customers",       icon: <FaUsers />,          roles: ALL_ADMIN },
  { path: "/admin/payments",     name: "Payments",        icon: <FaCreditCard />,     roles: WITH_CASHIER },
  // Finance only
  { path: "/admin/reports",      name: "Reports",         icon: <FaChartBar />,       roles: WITH_FINANCE },
  { path: "/admin/coupons",      name: "Coupons",         icon: <FaTag />,            roles: ALL_ADMIN },
  // Communication
  { path: "/admin/contacts",     name: "Messages",        icon: <FaEnvelope />,       roles: ALL_ADMIN },
  // Staff management (owner/super_admin/admin)
  { path: "/admin/staff",        name: "Staff",           icon: <FaUserCog />,        roles: ALL_ADMIN },
  { path: "/admin/seller-verify",name: "Seller Verify",   icon: <FaCheckCircle />,    roles: ALL_ADMIN },
  { path: "/admin/product-approval", name: "Approvals",   icon: <FaClipboardCheck />, roles: ALL_ADMIN },
  // Seller only
  { path: "/admin/my-products",  name: "My Products",     icon: <FaBox />,            roles: ["seller"] },
];

const ROLE_BADGE = {
  owner:       { bg: "#0f172a",  label: "Owner" },
  super_admin: { bg: "#7c3aed",  label: "Super Admin" },
  admin:       { bg: "#2563eb",  label: "Admin" },
  finance:     { bg: "#0891b2",  label: "Finance" },
  cashier:     { bg: "#f59e0b",  label: "Cashier" },
  seller:      { bg: "#16a34a",  label: "Seller" },
};

function Sidebar({ collapsed }) {
  const location   = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = currentUser.role || "admin";
  const menuItems = ALL_MENU.filter(item => item.roles.includes(role));

  const badge = ROLE_BADGE[role] || { bg:"#2563eb", label: role };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* Logo */}
      <div className="logo">
        ⚡ Tech Admin
        {!collapsed && (
          <div style={{ textAlign:"center", marginTop:4 }}>
            <span style={{
              fontSize:10, fontWeight:700, padding:"2px 8px",
              borderRadius:10, textTransform:"uppercase",
              background: badge.bg, color:"white",
              display:"inline-block",
            }}>
              {badge.label}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <ul>
        {menuItems.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={
                location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path))
                  ? "active" : ""
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default Sidebar;
