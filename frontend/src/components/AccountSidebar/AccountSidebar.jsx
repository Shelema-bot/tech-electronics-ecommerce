import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FiUser, FiShoppingBag, FiCreditCard, FiHeart,
  FiMessageSquare, FiBell, FiLogOut, FiShoppingCart,
} from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUrl";
import { useWishlist }      from "../../context/WishlistContext";
import { useNotifications } from "../../context/NotificationContext";
import "./AccountSidebar.css";

const menuItems = [
  { path: "/profile",         label: "My Profile",      icon: <FiUser /> },
  { path: "/my-orders",       label: "My Orders",       icon: <FiShoppingBag /> },
  { path: "/payment-history", label: "Payment History", icon: <FiCreditCard /> },
  { path: "/wishlist",        label: "Wishlist",        icon: <FiHeart />,         badge: "wishlist" },
  { path: "/my-messages",     label: "Message Center",  icon: <FiMessageSquare /> },
  { path: "/notifications",   label: "Notifications",   icon: <FiBell />,          badge: "notif" },
  { path: "/become-seller",   label: "Become a Seller", icon: <FiShoppingCart /> },
];

const AVATAR_COLORS = ["#2563eb","#7c3aed","#db2777","#dc2626","#059669","#0891b2","#d97706"];
const avatarBg = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 65) % AVATAR_COLORS.length];

function AccountSidebar({ user }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { wishlist }    = useWishlist();
  const { unreadCount } = useNotifications();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const avatarSrc = user?.profileImage ? getImageUrl(user.profileImage) : null;
  const initial   = user?.name?.charAt(0).toUpperCase() || "U";

  const getBadge = (item) => {
    if (item.badge === "wishlist") return wishlist.length || 0;
    if (item.badge === "notif")    return unreadCount || 0;
    return 0;
  };

  return (
    <aside className="account-sidebar">

      {/* ── Profile header ── */}
      <div className="asb-header">
        <div className="asb-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt={user?.name} />
          ) : (
            <span
              className="asb-avatar-initial"
              style={{ background: avatarBg(user?.name) }}
            >
              {initial}
            </span>
          )}
        </div>
        <div className="asb-user-info">
          <p className="asb-name">{user?.name || "User"}</p>
          <p className="asb-email">{user?.email || ""}</p>
          {user?.role && (
            <span className="asb-role-tag">{user.role.replace("_", " ")}</span>
          )}
        </div>
      </div>

      <div className="asb-divider" />

      {/* ── Menu ── */}
      <nav className="asb-menu" aria-label="Account navigation">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const badge    = getBadge(item);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`asb-menu-item ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="asb-menu-icon">{item.icon}</span>
              <span className="asb-menu-label">{item.label}</span>
              {badge > 0 && (
                <span className="asb-badge">{badge > 99 ? "99+" : badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
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
