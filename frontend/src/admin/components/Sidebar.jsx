import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaBox, FaList, FaShoppingCart,
  FaUsers, FaCreditCard, FaChartBar,
  FaSignOutAlt, FaEnvelope
} from "react-icons/fa";
import "./Sidebar.css";

const menuItems = [
  { path: "/admin",            name: "Dashboard",  icon: <FaHome /> },
  { path: "/admin/products",   name: "Products",   icon: <FaBox /> },
  { path: "/admin/categories", name: "Categories", icon: <FaList /> },
  { path: "/admin/orders",     name: "Orders",     icon: <FaShoppingCart /> },
  { path: "/admin/customers",  name: "Customers",  icon: <FaUsers /> },
  { path: "/admin/payments",   name: "Payments",   icon: <FaCreditCard /> },
  { path: "/admin/reports",    name: "Reports",    icon: <FaChartBar /> },
  { path: "/admin/contacts",   name: "Messages",   icon: <FaEnvelope /> },
];

function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* Logo */}
      <div className="logo">⚡ Tech Admin</div>

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
