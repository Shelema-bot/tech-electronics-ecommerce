import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import {
  FaHome, FaBox, FaList, FaShoppingCart,
  FaUsers, FaCreditCard, FaChartBar, FaCog,
  FaSignOutAlt, FaEnvelope, FaUser
} from "react-icons/fa";
import "./Sidebar.css";

const menuItems = [
  { path: "/admin",            name: "Dashboard",        icon: <FaHome /> },
  { path: "/admin/products",   name: "Products",         icon: <FaBox /> },
  { path: "/admin/categories", name: "Categories",       icon: <FaList /> },
  { path: "/admin/orders",     name: "Orders",           icon: <FaShoppingCart /> },
  { path: "/admin/customers",  name: "Customers",        icon: <FaUsers /> },
  { path: "/admin/payments",   name: "Payments",         icon: <FaCreditCard /> },
  { path: "/admin/reports",    name: "Reports",          icon: <FaChartBar /> },
  { path: "/admin/contacts",   name: "Messages",         icon: <FaEnvelope /> },
  { path: "/admin/settings",   name: "Settings",         icon: <FaCog /> },
];

function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => { getAdminProfile(); }, []);

  const getAdminProfile = async () => {
    try {
      const res = await API.get("/users/admin/profile");
      setAdmin(res.data.user);
    } catch (error) {
      console.log("Admin Profile Error:", error.response?.data || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const avatarSrc = getImageUrl(admin?.profileImage);

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* Logo */}
      <div className="logo">⚡ Tech Admin</div>

      {/* Profile */}
      <Link to="/admin/profile" className="sidebar-profile">
        {avatarSrc ? (
          <img src={avatarSrc} alt="admin" />
        ) : (
          <div className="sidebar-no-image">
            {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
          </div>
        )}
        <span>{admin?.name || "Admin"}</span>
      </Link>

      {/* Nav */}
      <ul>
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={
                location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path))
                  ? "active"
                  : ""
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}

        {/* Logout */}
        <li className="logout">
          <button onClick={logout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </li>
      </ul>

    </div>
  );
}

export default Sidebar;
