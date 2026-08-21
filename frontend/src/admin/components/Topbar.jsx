import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCog, FaChevronDown, FaSignOutAlt,
  FaChartBar, FaEnvelope, FaUserCog,
  FaCheckCircle, FaClipboardCheck, FaBox,
  FaUser,
} from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import "./Topbar.css";

const pageMap = {
  "/admin":                   "Dashboard",
  "/admin/dashboard":         "Dashboard",
  "/admin/products":          "Products",
  "/admin/add-product":       "Add Product",
  "/admin/edit-product":      "Edit Product",
  "/admin/categories":        "Categories",
  "/admin/orders":            "Orders",
  "/admin/customers":         "Customers",
  "/admin/payments":          "Payments",
  "/admin/reports":           "Reports",
  "/admin/settings":          "Settings",
  "/admin/profile":           "My Profile",
  "/admin/contacts":          "Messages",
  "/admin/staff":             "Staff Management",
  "/admin/seller-verify":     "Seller Verification",
  "/admin/product-approval":  "Product Approval",
  "/admin/my-products":       "My Products",
};

// Items that appear in the topbar account dropdown
// (role-based — super_admin sees all, seller sees subset)
const getAccountMenuItems = (role) => {
  const isSuperAdmin = role === "super_admin" || role === "admin";
  const isSeller     = role === "seller";

  const items = [];

  if (isSuperAdmin) {
    items.push(
      { path: "/admin/reports",          label: "Reports",           icon: <FaChartBar /> },
      { path: "/admin/staff",            label: "Staff Management",  icon: <FaUserCog /> },
      { path: "/admin/seller-verify",    label: "Seller Verify",     icon: <FaCheckCircle /> },
      { path: "/admin/product-approval", label: "Product Approval",  icon: <FaClipboardCheck /> },
    );
  }

  if (isSeller) {
    items.push(
      { path: "/admin/my-products", label: "My Products", icon: <FaBox /> },
    );
  }

  // Common to all roles
  items.push(
    { path: "/admin/contacts", label: "Messages",  icon: <FaEnvelope /> },
    { path: "/admin/profile",  label: "My Profile", icon: <FaUser /> },
    { path: "/admin/settings", label: "Settings",   icon: <FaCog /> },
  );

  return items;
};

function Topbar({ collapsed, onToggle }) {
  const [adminUser, setAdminUser] = useState(null);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef   = useRef(null);
  const location  = useLocation();
  const navigate  = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = adminUser?.role || currentUser?.role || "admin";

  // Derive page title — handle dynamic paths like /admin/edit-product/:id
  const getTitle = () => {
    const exact = pageMap[location.pathname];
    if (exact) return exact;
    for (const [prefix, label] of Object.entries(pageMap)) {
      if (location.pathname.startsWith(prefix + "/") || location.pathname.startsWith(prefix)) {
        return label;
      }
    }
    return "Admin Panel";
  };

  useEffect(() => {
    API.get("/users/admin/profile")
      .then((res) => setAdminUser(res.data.user))
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const avatarSrc  = adminUser?.profileImage ? getImageUrl(adminUser.profileImage) : null;
  const initial    = adminUser?.name?.charAt(0).toUpperCase() || "A";
  const menuItems  = getAccountMenuItems(role);

  const ROLE_COLOR = {
    super_admin: "#7c3aed",
    admin:       "#2563eb",
    seller:      "#16a34a",
    cashier:     "#f59e0b",
  };

  return (
    <div className="admin-topbar">

      {/* ── Left: Hamburger + Breadcrumb ── */}
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onToggle} aria-label="Toggle sidebar">
          ☰
        </button>
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">Admin</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-page">{getTitle()}</span>
        </div>
      </div>

      {/* ── Right: Notification + Account dropdown ── */}
      <div className="topbar-right">

        {/* Notification bell */}
        <button className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
          <FiBell />
        </button>

        {/* Account dropdown */}
        <div className="topbar-acct-wrap" ref={dropRef}>
          <button
            className="topbar-acct-btn"
            onClick={() => setDropOpen(!dropOpen)}
            aria-haspopup="true"
            aria-expanded={dropOpen}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={adminUser?.name} className="topbar-avatar-img" />
            ) : (
              <div className="topbar-avatar">{initial}</div>
            )}
            <div className="topbar-profile-info">
              <span className="topbar-name">{adminUser?.name || "Admin"}</span>
              <span className="topbar-role" style={{ color: ROLE_COLOR[role] || "rgba(255,255,255,0.75)" }}>
                {role.replace("_", " ")}
              </span>
            </div>
            <FaChevronDown className={`topbar-chevron ${dropOpen ? "open" : ""}`} />
          </button>

          {dropOpen && (
            <div className="topbar-dropdown">

              {/* Header */}
              <div className="topbar-drop-header">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={adminUser?.name} className="drop-avatar-img" />
                ) : (
                  <div className="drop-avatar-placeholder">{initial}</div>
                )}
                <div>
                  <div className="drop-name">{adminUser?.name || "Admin"}</div>
                  <div className="drop-email">{adminUser?.email || ""}</div>
                  <span className="drop-role-badge" style={{ background: ROLE_COLOR[role] || "#2563eb" }}>
                    {role.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="drop-divider" />

              {/* Menu items */}
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`drop-item ${location.pathname === item.path ? "active" : ""}`}
                  onClick={() => setDropOpen(false)}
                >
                  <span className="drop-item-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              <div className="drop-divider" />

              {/* Logout */}
              <button className="drop-logout" onClick={logout}>
                <span className="drop-item-icon"><FaSignOutAlt /></span>
                Sign Out
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
