import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiUser, FiShoppingBag, FiCreditCard, FiHeart, FiMessageSquare, FiBell, FiLogOut, FiShoppingCart } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";
import { useWishlist } from "../../context/WishlistContext";
import "./AccountSidebar.css";

const menuItems = [
  { path: "/profile",         label: "My Profile",       icon: <FiUser /> },
  { path: "/my-orders",       label: "My Orders",        icon: <FiShoppingBag /> },
  { path: "/payment-history", label: "Payment History",  icon: <FiCreditCard /> },
  { path: "/wishlist",        label: "Wishlist",         icon: <FiHeart />, badge: "wishlist" },
  { path: "/my-messages",     label: "Message Center",   icon: <FiMessageSquare /> },
  { path: "/notifications",   label: "Notifications",    icon: <FiBell /> },
  { path: "/become-seller",   label: "Become a Seller",  icon: <FiShoppingCart /> },
];

function AccountSidebar({ user }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { wishlist } = useWishlist();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const avatarSrc = user?.profileImage ? getImageUrl(user.profileImage) : null;
  const initial   = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <aside className="account-sidebar">

      {/* Profile header */}
      <div className="asb-header">
        <div className="asb-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt={user.name} />
          ) : (
            <span className="asb-avatar-initial">{initial}</span>
          )}
        </div>
        <div className="asb-user-info">
          <p className="asb-name">{user?.name || "User"}</p>
          <p className="asb-email">{user?.email || ""}</p>
        </div>
      </div>

      <div className="asb-divider" />

      {/* Menu items */}
      <nav className="asb-menu" aria-label="Account navigation">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const badge = item.badge === "wishlist" ? wishlist.length : 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`asb-menu-item ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="asb-menu-icon">{item.icon}</span>
              <span className="asb-menu-label">{item.label}</span>
              {badge > 0 && <span className="asb-badge">{badge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="asb-logout-wrap">
        <button className="asb-logout-btn" onClick={logout}>
          <span className="asb-menu-icon"><FiLogOut /></span>
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

export default AccountSidebar;
