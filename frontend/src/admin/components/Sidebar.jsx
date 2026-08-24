import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaBox, FaList, FaShoppingCart,
  FaUsers, FaCreditCard, FaUserCog,
  FaCheckCircle, FaClipboardCheck, FaEnvelope,
  FaChartBar, FaTag,
} from "react-icons/fa";
import "./Sidebar.css";

const getMenuItems = (role) => {
  const isSuperAdmin = role === "super_admin" || role === "admin";
  const isSeller     = role === "seller";

  const core = [
    { path: "/admin",            name: "Dashboard",  icon: <FaHome />,         roles: ["admin","super_admin","cashier","seller"] },
    { path: "/admin/products",   name: "Products",   icon: <FaBox />,          roles: ["admin","super_admin","seller"] },
    { path: "/admin/categories", name: "Categories", icon: <FaList />,         roles: ["admin","super_admin"] },
    { path: "/admin/orders",     name: "Orders",     icon: <FaShoppingCart />, roles: ["admin","super_admin","cashier"] },
    { path: "/admin/customers",  name: "Customers",  icon: <FaUsers />,        roles: ["admin","super_admin"] },
    { path: "/admin/payments",   name: "Payments",   icon: <FaCreditCard />,   roles: ["admin","super_admin","cashier"] },
    { path: "/admin/reports",    name: "Reports",    icon: <FaChartBar />,     roles: ["admin","super_admin"] },
    { path: "/admin/contacts",   name: "Messages",   icon: <FaEnvelope />,     roles: ["admin","super_admin"] },
    { path: "/admin/coupons",    name: "Coupons",    icon: <FaTag />,          roles: ["admin","super_admin"] },
  ];

  const staffItems = isSuperAdmin ? [
    { path: "/admin/staff",             name: "Staff",           icon: <FaUserCog />,       roles: ["admin","super_admin"] },
    { path: "/admin/seller-verify",     name: "Seller Verify",   icon: <FaCheckCircle />,   roles: ["admin","super_admin"] },
    { path: "/admin/product-approval",  name: "Approvals",       icon: <FaClipboardCheck />,roles: ["admin","super_admin"] },
  ] : [];

  const sellerItems = isSeller ? [
    { path: "/admin/my-products", name: "My Products", icon: <FaBox />, roles: ["seller"] },
  ] : [];

  return [...core, ...staffItems, ...sellerItems].filter(item => item.roles.includes(role));
};

function Sidebar({ collapsed }) {
  const location  = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = currentUser.role || "admin";
  const menuItems = getMenuItems(role);

  const roleBadgeStyle = {
    fontSize: "10px", fontWeight: "700", padding: "2px 8px",
    borderRadius: "10px", textTransform: "uppercase",
    background: role === "super_admin" ? "#7c3aed" : role === "seller" ? "#16a34a" : role === "cashier" ? "#f59e0b" : "#2563eb",
    color: "white", display: "inline-block", marginTop: "4px",
  };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* Logo */}
      <div className="logo">
        ⚡ Tech Admin
        {!collapsed && (
          <div style={{ textAlign: "center", marginTop: "4px" }}>
            <span style={roleBadgeStyle}>{role.replace("_", " ")}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <ul>
        {menuItems.map((item) => (
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
