import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCog, FaChevronDown, FaSignOutAlt, FaUser } from "react-icons/fa";
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
  "/admin/coupons":           "Coupons",
};

const ROLE_COLOR = {
  owner:       "#0f172a",
  super_admin: "#7c3aed",
  admin:       "#2563eb",
  seller:      "#16a34a",
  cashier:     "#f59e0b",
  finance:     "#0891b2",
};

// Topbar dropdown: ONLY profile, settings, sign out — no duplicates of sidebar items
const getAccountMenuItems = () => [
  { path: "/admin/profile",  label: "My Profile", icon: <FaUser /> },
  { path: "/admin/settings", label: "Settings",   icon: <FaCog /> },
];

function Topbar({ collapsed, onToggle }) {
  const [adminUser, setAdminUser] = useState(null);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = adminUser?.role || currentUser?.role || "admin";

  const getTitle = () => {
    const exact = pageMap[location.pathname];
    if (exact) return exact;
    for (const [prefix, label] of Object.entries(pageMap)) {
      if (location.pathname.startsWith(prefix + "/")) return label;
    }
    return "Admin Panel";
  };

  useEffect(() => {
    API.get("/users/admin/profile")
      .then(res => setAdminUser(res.data.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const avatarSrc = adminUser?.profileImage ? getImageUrl(adminUser.profileImage) : null;
  const initial   = adminUser?.name?.charAt(0).toUpperCase() || "A";
  const menuItems = getAccountMenuItems();
  const roleColor = ROLE_COLOR[role] || "#2563eb";

  return (
    <div className="admin-topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onToggle} aria-label="Toggle sidebar">☰</button>
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">Admin</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-page">{getTitle()}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Notification bell */}
        <div className="topbar-notif-wrap">
          <Link to="/admin/contacts" className="topbar-icon-btn" title="Messages" aria-label="Messages">
            <FiBell />
          </Link>
        </div>

        {/* Account dropdown */}
        <div className="topbar-acct-wrap" ref={dropRef}>
          <button className="topbar-acct-btn" onClick={() => setDropOpen(!dropOpen)} aria-expanded={dropOpen}>
            {avatarSrc ? (
              <img src={avatarSrc} alt={adminUser?.name} className="topbar-avatar-img" />
            ) : (
              <div className="topbar-avatar">{initial}</div>
            )}
            <div className="topbar-profile-info">
              <span className="topbar-name">{adminUser?.name || "Admin"}</span>
              <span className="topbar-role" style={{ color: roleColor }}>
                {role.replace(/_/g, " ")}
              </span>
            </div>
            <FaChevronDown className={`topbar-chevron ${dropOpen ? "open" : ""}`} />
          </button>

          {dropOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-drop-header">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={adminUser?.name} className="drop-avatar-img" />
                ) : (
                  <div className="drop-avatar-placeholder">{initial}</div>
                )}
                <div>
                  <div className="drop-name">{adminUser?.name || "Admin"}</div>
                  <div className="drop-email">{adminUser?.email || ""}</div>
                  <span className="drop-role-badge" style={{ background: roleColor }}>
                    {role.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className="drop-divider" />
              {menuItems.map(item => (
                <Link key={item.path} to={item.path}
                  className={`drop-item ${location.pathname === item.path ? "active" : ""}`}
                  onClick={() => setDropOpen(false)}
                >
                  <span className="drop-item-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="drop-divider" />
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
