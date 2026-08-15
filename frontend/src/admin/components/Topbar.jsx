import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaUserCircle, FaCog } from "react-icons/fa";
import API from "../../api/axios";
import "./Topbar.css";

function Topbar({ collapsed, onToggle }) {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    API.get("/users/admin/profile")
      .then((res) => setAdmin(res.data.user))
      .catch(() => {});
  }, []);

  // Get current page title from URL
  const path = window.location.pathname;
  const pageMap = {
    "/admin": "Dashboard",
    "/admin/dashboard": "Dashboard",
    "/admin/products": "Products",
    "/admin/add-product": "Add Product",
    "/admin/categories": "Categories",
    "/admin/orders": "Orders",
    "/admin/customers": "Customers",
    "/admin/payments": "Payments",
    "/admin/reports": "Reports",
    "/admin/settings": "Settings",
    "/admin/profile": "Profile",
    "/admin/contacts": "Messages",
  };

  const title = pageMap[path] || "Admin Panel";

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
        <Link to="/admin/settings" className="topbar-icon-btn" title="Settings">
          <FaCog />
        </Link>

        <div className="topbar-profile">
          <div className="topbar-avatar">
            {admin?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="topbar-profile-info">
            <span className="topbar-name">{admin?.name || "Admin"}</span>
            <span className="topbar-role">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
