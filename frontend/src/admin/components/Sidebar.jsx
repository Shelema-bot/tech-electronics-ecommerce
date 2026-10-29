import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaHome, FaBox, FaShoppingCart, FaUsers,
  FaCog, FaUserCheck, FaClipboardCheck, FaTag, FaEnvelope, FaVideo,
} from "react-icons/fa";
import { normalizeRole, isShelema } from "../AdminRoute";
import "./Sidebar.css";

const ALL_MENU = [
  {
    path: "/admin?tab=overview",
    key: "admin.overview",
    name: "Overview",
    icon: <FaHome />,
    roles: ["SuperAdmin", "CashierFinance", "Admin", "InventoryManager", "Delivery", "Seller"],
  },
  {
    path: "/admin?tab=orders",
    key: "admin.ordersAndPayments",
    name: "Orders & Deliveries",
    icon: <FaShoppingCart />,
    roles: ["SuperAdmin", "CashierFinance", "Delivery"],
  },
  {
    path: "/admin?tab=products",
    key: "admin.productsAndStock",
    name: "Products & Stock",
    icon: <FaBox />,
    roles: ["SuperAdmin", "Admin", "InventoryManager", "Seller"],
  },
  {
    path: "/admin?tab=product-approval",
    key: "admin.productApprovals",
    name: "Product Approvals",
    icon: <FaClipboardCheck />,
    roles: ["SuperAdmin", "Admin", "InventoryManager"],
  },
  {
    path: "/admin?tab=seller-approval",
    key: "admin.sellerApprovals",
    name: "Seller Approvals",
    icon: <FaUserCheck />,
    roles: ["SuperAdmin", "CashierFinance", "Admin", "InventoryManager"],
  },
  {
    path: "/admin?tab=users",
    key: "admin.usersAndRoles",
    name: "Users & Roles",
    icon: <FaUsers />,
    roles: ["SuperAdmin"],
  },
  {
    path: "/admin/settings",
    key: "admin.systemSettings",
    name: "System Settings",
    icon: <FaCog />,
    roles: ["SuperAdmin"],
  },
  {
    path: "/admin/my-products",
    key: "admin.myProducts",
    name: "My Products",
    icon: <FaBox />,
    roles: ["Seller"],
  },
];

const ROLE_BADGE = {
  SuperAdmin:       { bg: "#7c3aed", label: "Owner / CEO" },
  Admin:            { bg: "#2563eb", label: "Admin" },
  InventoryManager: { bg: "#2563eb", label: "Admin" },
  CashierFinance:   { bg: "#0891b2", label: "Cashier / Finance" },
  Delivery:         { bg: "#ea580c", label: "Delivery" },
  Seller:           { bg: "#16a34a", label: "Seller" },
  WebAppManager:    { bg: "#0d9488", label: "Web Apps Manager" },
  Customer:         { bg: "#64748b", label: "Customer" },
};

function Sidebar({ collapsed }) {
  const location    = useLocation();
  const { t }       = useTranslation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const normalized  = normalizeRole(currentUser.role, currentUser);

  const menuItems = ALL_MENU.filter(item => item.roles.includes(normalized));
  const badge     = ROLE_BADGE[normalized] || { bg: "#2563eb", label: currentUser.role || "Staff" };

  const currentTab = new URLSearchParams(location.search).get("tab") || "overview";

  const isItemActive = (item) => {
    if (item.path.includes("?tab=")) {
      const itemTab = item.path.split("?tab=")[1];
      return location.pathname === "/admin" && currentTab === itemTab;
    }
    return location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
  };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
      {/* Brand & Actor Tag */}
      <div className="logo">
        ⚡ {t("admin.adminPanel", "Tech Admin")}
        {!collapsed && (
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 10,
                textTransform: "uppercase",
                background: badge.bg,
                color: "white",
                display: "inline-block",
                letterSpacing: "0.04em",
              }}
            >
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
              className={isItemActive(item) ? "active" : ""}
            >
              {item.icon}
              <span>{t(item.key, item.name)}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Back to Customer Storefront for all Staff */}
      <div className="sidebar-store-bottom">
        <Link to="/" className="sidebar-store-btn" title={t("nav.backToStore", "Back to Store")}>
          <span className="sidebar-store-icon">🏪</span>
          {!collapsed && <span>{t("nav.backToStore", "Back to Store")}</span>}
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
