import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCog, FaChevronDown, FaSignOutAlt, FaUser, FaGlobe } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import { usePreference, LANGUAGES } from "../../context/PreferenceContext";
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
  "/admin/settings":          "System Settings",
  "/admin/profile":           "My Profile",
  "/admin/contacts":          "Messages",
  "/admin/staff":             "Staff Management",
  "/admin/seller-verify":     "Seller Verification",
  "/admin/product-approval":  "Product Approval",
  "/admin/my-products":       "My Products",
  "/admin/coupons":           "Coupons",
  "/admin/seller-plans":      "Seller Plans",
  "/admin/meetings":          "Meetings",
  "/admin/my-plan":           "My Plan",
  "/admin/notifications":     "Notifications",
};

const ROLE_COLOR = {
  owner:             "#7c3aed",
  super_admin:       "#7c3aed",
  SuperAdmin:        "#7c3aed",
  admin:             "#2563eb",
  inventory_manager: "#2563eb",
  InventoryManager:  "#2563eb",
  cashier_finance:   "#0891b2",
  CashierFinance:    "#0891b2",
  delivery:          "#ea580c",
  Delivery:          "#ea580c",
  seller:            "#16a34a",
  cashier:           "#f59e0b",
  finance:           "#0891b2",
};

const ROLE_LABEL = {
  owner:             "Owner / CEO",
  super_admin:       "Owner / CEO",
  SuperAdmin:        "Owner / CEO",
  admin:             "Admin",
  inventory_manager: "Admin",
  InventoryManager:  "Admin",
  cashier_finance:   "Cashier / Finance",
  CashierFinance:    "Cashier / Finance",
  delivery:          "Delivery",
  Delivery:          "Delivery",
  cashier:           "Cashier",
  finance:           "Finance",
  seller:            "Seller",
  customer:          "Customer",
};

function Topbar({ collapsed, onToggle }) {
  const [adminUser, setAdminUser] = useState(null);
  const [dropOpen, setDropOpen]   = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const dropRef  = useRef(null);
  const langRef  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const { language, setLanguage } = usePreference();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = adminUser?.role || currentUser?.role || "admin";

  const getTitle = () => {
    const exact = pageMap[location.pathname];
    if (exact) return exact;
    for (const [prefix, label] of Object.entries(pageMap)) {
      if (location.pathname.startsWith(prefix + "/")) return label;
    }
    return t("admin.adminPanel", "Staff Dashboard");
  };

  useEffect(() => {
    API.get("/users/admin/profile")
      .then(res => setAdminUser(res.data.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
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
  const roleColor = ROLE_COLOR[role] || "#2563eb";

  return (
    <div className="admin-topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onToggle} aria-label="Toggle sidebar">☰</button>
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">{t("admin.adminPanel", "Staff Panel")}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-page">{getTitle()}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Prominent Back to Customer Store button for all staff */}
        <Link to="/" className="topbar-store-btn" title={t("nav.backToStore", "Back to Store")}>
          <span className="topbar-store-icon">🏪</span>
          <span className="topbar-store-text">{t("nav.backToStore", "Back to Store")}</span>
        </Link>

        {/* Collapsed Language Selector Dropdown */}
        <div className="topbar-lang-wrap" ref={langRef}>
          <button
            type="button"
            className={`topbar-lang-btn ${langOpen ? "open" : ""}`}
            onClick={() => setLangOpen(o => !o)}
            title="Switch Language"
            aria-expanded={langOpen}
          >
            <FaGlobe style={{ color: "#3b82f6", fontSize: 13 }} />
            <span>{language?.label || "EN"}</span>
            <FaChevronDown style={{ fontSize: 9, opacity: 0.7 }} />
          </button>

          {langOpen && (
            <div className="topbar-lang-menu">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  className={`topbar-lang-item ${language?.code === l.code ? "active" : ""}`}
                  onClick={() => { setLanguage(l); setLangOpen(false); }}
                >
                  <span>{l.nativeName}</span>
                  <span className="topbar-lang-code">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <div className="topbar-notif-wrap">
          <Link to="/admin/notifications" className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
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
              <span className="topbar-name">{adminUser?.name || "Staff Member"}</span>
              <span className="topbar-role" style={{ color: roleColor }}>
                {ROLE_LABEL[role] || role.replace(/_/g, " ")}
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
                  <div className="drop-name">{adminUser?.name || "Staff Member"}</div>
                  <div className="drop-email">{adminUser?.email || ""}</div>
                  <span className="drop-role-badge" style={{ background: roleColor }}>
                    {role.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className="drop-divider" />
              {/* Back to store inside dropdown */}
              <Link to="/" className="drop-item drop-store-item" onClick={() => setDropOpen(false)}>
                <span className="drop-item-icon">🏪</span>
                {t("nav.backToStore", "Back to Store")}
              </Link>
              <Link to="/admin/profile" className={`drop-item ${location.pathname === "/admin/profile" ? "active" : ""}`} onClick={() => setDropOpen(false)}>
                <span className="drop-item-icon"><FaUser /></span>
                {t("account.myProfile", "My Profile")}
              </Link>
              <Link to="/admin/settings" className={`drop-item ${location.pathname === "/admin/settings" ? "active" : ""}`} onClick={() => setDropOpen(false)}>
                <span className="drop-item-icon"><FaCog /></span>
                {t("account.settings", "Settings")}
              </Link>
              <div className="drop-divider" />
              <button className="drop-logout" onClick={logout}>
                <span className="drop-item-icon"><FaSignOutAlt /></span>
                {t("admin.signOut", "Sign Out")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
