import React, { useEffect, useState, useRef } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart, FaUserCircle, FaSearch, FaHeart,
  FaChevronDown, FaBars, FaTimes, FaCamera,
} from "react-icons/fa";
import {
  FiUser, FiShoppingBag, FiCreditCard, FiHeart,
  FiMessageSquare, FiBell, FiLogOut,
} from "react-icons/fi";
import logo from "../../assets/LOGO.jpg";
import { useCart }    from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../utils/imageUrl";
import { usePreference, COUNTRIES, LANGUAGES, CURRENCIES } from "../../context/PreferenceContext";
import { useNotifications } from "../../context/NotificationContext";
import API from "../../api/axios";

const Navbar = () => {
  const [user, setUser]             = useState(null);
  const [search, setSearch]         = useState("");
  const [catOpen, setCatOpen]       = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acctOpen, setAcctOpen]     = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [imgTooltip, setImgTooltip] = useState(false);
  const [categories, setCategories] = useState([]);

  const catRef   = useRef(null);
  const acctRef  = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const { cartCount }       = useCart();
  const { wishlist }        = useWishlist();
  const { country, setCountry, language, setLanguage, currency, setCurrency } = usePreference();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  // Load user
  useEffect(() => {
    const load = () => {
      const s = localStorage.getItem("user");
      setUser(s ? JSON.parse(s) : null);
    };
    load();
    window.addEventListener("loginStatusChanged", load);
    return () => window.removeEventListener("loginStatusChanged", load);
  }, []);

  // Fetch categories
  useEffect(() => {
    API.get("/categories")
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current   && !catRef.current.contains(e.target))   setCatOpen(false);
      if (acctRef.current  && !acctRef.current.contains(e.target))  setAcctOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    setUser(null);
    setAcctOpen(false);
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const searchProduct = () => {
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setMobileOpen(false);
    }
  };

  const closeAll = () => { setMobileOpen(false); setAcctOpen(false); setCatOpen(false); setNotifOpen(false); };

  const acctMenu = [
    { path: "/profile",         label: "My Profile",      icon: <FiUser /> },
    { path: "/my-orders",       label: "My Orders",       icon: <FiShoppingBag /> },
    { path: "/payment-history", label: "Payment History", icon: <FiCreditCard /> },
    { path: "/wishlist",        label: "Wishlist",        icon: <FiHeart /> },
    { path: "/my-messages",     label: "Messages",        icon: <FiMessageSquare /> },
    { path: "/notifications",   label: "Notifications",   icon: <FiBell /> },
  ];

  const recentNotifs = notifications.slice(0, 5);

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ══ ROW 1: Logo | Preferences | Icons ══ */}
        <div className="nav-row nav-row-top">

          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={closeAll}>
            <img src={logo} alt="Tech & Electronic" />
            <span className="nav-logo-text">Tech <b>&</b> Electronic</span>
          </Link>

          {/* Preferences */}
          <div className="nav-prefs">
            {/* Country */}
            <div className="nav-pref-select">
              <span className="nav-pref-flag">{country.flag}</span>
              <select
                value={country.code}
                onChange={e => setCountry(COUNTRIES.find(c => c.code === e.target.value))}
                aria-label="Select country"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            <span className="nav-pref-divider" />

            {/* Language */}
            <div className="nav-pref-select">
              <span className="nav-pref-icon">🌐</span>
              <select
                value={language.code}
                onChange={e => setLanguage(LANGUAGES.find(l => l.code === e.target.value))}
                aria-label="Select language"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.nativeName || l.name}</option>
                ))}
              </select>
            </div>

            <span className="nav-pref-divider" />

            {/* Currency */}
            <div className="nav-pref-select">
              <span className="nav-pref-icon">💱</span>
              <select
                value={currency.code}
                onChange={e => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
                aria-label="Select currency"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right icons */}
          <div className="nav-top-icons">

            {/* Wishlist */}
            <Link to="/wishlist" className="nav-top-icon" onClick={closeAll} aria-label="Wishlist">
              <span className="nav-icon-wrap">
                <FaHeart />
                {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              </span>
              <span className="nav-icon-label">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nav-top-icon" onClick={closeAll} aria-label="Cart">
              <span className="nav-icon-wrap">
                <FaShoppingCart />
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </span>
              <span className="nav-icon-label">Cart</span>
            </Link>

            {/* Notification Bell */}
            {user && (
              <div className="nav-account-wrap" ref={notifRef}>
                <button
                  className="nav-top-icon"
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  aria-label="Notifications"
                >
                  <span className="nav-icon-wrap">
                    <FiBell style={{ fontSize: 20 }} />
                    {unreadCount > 0 && <span className="nav-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                  </span>
                  <span className="nav-icon-label">Alerts</span>
                </button>

                {notifOpen && (
                  <div className="nav-notif-dropdown">
                    <div className="nav-notif-header">
                      <span>Notifications {unreadCount > 0 && `(${unreadCount} new)`}</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="nav-notif-mark-all">Mark all read</button>
                      )}
                    </div>
                    {recentNotifs.length === 0 ? (
                      <div className="nav-notif-empty">No notifications yet</div>
                    ) : (
                      recentNotifs.map(n => (
                        <div
                          key={n._id}
                          className={`nav-notif-item ${!n.isRead ? "unread" : ""}`}
                          onClick={() => { markRead(n._id); setNotifOpen(false); if (n.link) navigate(n.link); }}
                        >
                          <span className="nav-notif-icon">{n.icon || "🔔"}</span>
                          <div className="nav-notif-content">
                            <div className="nav-notif-title">{n.title}</div>
                            <div className="nav-notif-msg">{n.message}</div>
                          </div>
                          {!n.isRead && <span className="nav-notif-dot" />}
                        </div>
                      ))
                    )}
                    <Link to="/notifications" className="nav-notif-all" onClick={() => setNotifOpen(false)}>
                      View all notifications →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Account */}
            {user ? (
              <div className="nav-account-wrap" ref={acctRef}>
                <button
                  className="nav-acct-btn"
                  onClick={() => setAcctOpen(!acctOpen)}
                  aria-expanded={acctOpen}
                  aria-label="Account menu"
                >
                  <span className="nav-icon-wrap">
                    {user.profileImage ? (
                      <img src={getImageUrl(user.profileImage)} className="nav-avatar-img" alt="profile" />
                    ) : (
                      <span className="nav-avatar-initial">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                    )}
                  </span>
                  <span className="nav-icon-label">Account</span>
                  <FaChevronDown className={`nav-chevron ${acctOpen ? "open" : ""}`} />
                </button>

                {acctOpen && (
                  <div className="nav-acct-dropdown">
                    <div className="nav-acct-header">
                      <div className="nav-acct-avatar">
                        {user.profileImage ? (
                          <img src={getImageUrl(user.profileImage)} alt="profile" />
                        ) : (
                          <span>{user.name?.charAt(0).toUpperCase() || "U"}</span>
                        )}
                      </div>
                      <div>
                        <div className="nav-acct-fullname">{user.name}</div>
                        <div className="nav-acct-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="nav-acct-divider" />
                    {acctMenu.map(item => (
                      <Link key={item.path} to={item.path} className="nav-acct-item" onClick={closeAll}>
                        <span className="nav-acct-item-icon">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <div className="nav-acct-divider" />
                    <button className="nav-acct-logout" onClick={logout}>
                      <span className="nav-acct-item-icon"><FiLogOut /></span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-top-icon" onClick={closeAll} aria-label="Login">
                <span className="nav-icon-wrap"><FaUserCircle style={{ fontSize: 20 }} /></span>
                <span className="nav-icon-label">Login</span>
              </Link>
            )}

            {/* Hamburger */}
            <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* ══ ROW 2: Search ══ */}
        <div className="nav-row nav-row-search">
          <div className="nav-search-bar">
            <input
              type="text"
              placeholder="Search for laptops, phones, accessories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchProduct()}
              aria-label="Search products"
            />
            <div className="nav-img-search-wrap">
              <button
                type="button"
                className="nav-img-search-btn"
                onClick={() => setImgTooltip(!imgTooltip)}
                onBlur={() => setTimeout(() => setImgTooltip(false), 200)}
                aria-label="Search by image (coming soon)"
              >
                <FaCamera />
              </button>
              {imgTooltip && <div className="nav-img-tooltip">📷 Image search coming soon</div>}
            </div>
            <button className="nav-search-submit" onClick={searchProduct} aria-label="Search">
              <FaSearch />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* ══ ROW 3: Nav links ══ */}
        <div className={`nav-row nav-row-links ${mobileOpen ? "mobile-open" : ""}`}>
          <ul className="nav-links">
            <li><Link to="/" onClick={closeAll}>Home</Link></li>
            <li><Link to="/products" onClick={closeAll}>All Products</Link></li>

            <li className="nav-cat-item" ref={catRef}>
              <button className="nav-cat-btn" onClick={() => setCatOpen(!catOpen)}>
                Categories <FaChevronDown className={`cat-arrow ${catOpen ? "open" : ""}`} />
              </button>
              {catOpen && (
                <div className="cat-dropdown">
                  {categories.length === 0 ? (
                    <div className="cat-dropdown-item" style={{ color:"#94a3b8" }}>No categories</div>
                  ) : categories.map(cat => (
                    <button
                      key={cat._id}
                      className="cat-dropdown-item"
                      onClick={() => {
                        setCatOpen(false); setMobileOpen(false);
                        navigate(`/products?category=${encodeURIComponent(cat.name)}`);
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </li>

            <li><Link to="/about"   onClick={closeAll}>About</Link></li>
            <li><Link to="/team"    onClick={closeAll}>Team</Link></li>
            <li><Link to="/contact" onClick={closeAll}>Contact</Link></li>
            <li><Link to="/help"    onClick={closeAll}>Help</Link></li>
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
