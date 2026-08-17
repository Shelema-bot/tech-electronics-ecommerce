import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import API from "../../api/axios";
import "./Topbar.css";

const pageMap = {
  "/admin":            "Dashboard",
  "/admin/dashboard":  "Dashboard",
  "/admin/products":   "Products",
  "/admin/add-product":"Add Product",
  "/admin/categories": "Categories",
  "/admin/orders":     "Orders",
  "/admin/customers":  "Customers",
  "/admin/payments":   "Payments",
  "/admin/reports":    "Reports",
  "/admin/settings":   "Settings",
  "/admin/profile":    "Profile",
  "/admin/contacts":   "Messages",
};

function Topbar({ collapsed, onToggle }) {
  const [admin, setAdmin] = useState(null);
  const location = useLocation();
  const title = pageMap[location.pathname] || "Admin Panel";

  useEffect(() => {
    API.get("/users/admin/profile")
      .then((res) => setAdmin(res.data.user))
      .catch(() => {});
  }, []);

  return (
    <div className="admin-topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onToggle} aria-label="Toggle sidebar">
          ☰
        </button>
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-root">Admin</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-page">{title}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Settings — only here, not in sidebar */}
        <Link to="/admin/settings" className="topbar-icon-btn" title="Settings">
          <FaCog />
        </Link>

        {/* Profile link — only here */}
        <Link to="/admin/profile" className="topbar-profile">
          <div className="topbar-avatar">
            {admin?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-name">{admin?.name || "Admin"}</span>
            <span className="topbar-role">Administrator</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Topbar;
