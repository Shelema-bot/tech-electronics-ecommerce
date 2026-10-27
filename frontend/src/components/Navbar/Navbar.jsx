import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaShoppingCart, FaUserCircle, FaSearch, FaHeart,
  FaBars, FaTimes, FaCamera,
} from "react-icons/fa";
import {
  FiUser, FiShoppingBag, FiCreditCard, FiHeart,
  FiMessageSquare, FiBell, FiLogOut,
  FiInfo, FiUsers, FiMail, FiHelpCircle,
} from "react-icons/fi";
import logo from "../../assets/tech-logo.png";
import { useCart }       from "../../context/CartContext";
import { useWishlist }   from "../../context/WishlistContext";
import { getImageUrl }   from "../../utils/imageUrl";
import { useNotifications } from "../../context/NotificationContext";
import AnnouncementBar   from "../AnnouncementBar/AnnouncementBar";
import { usePreference, LANGUAGES } from "../../context/PreferenceContext";
import { CAT_IMAGE_MAP } from "../CategoryCard/CategoryCard";
import API from "../../api/axios";

const ImageSearch = lazy(() => import("../ImageSearch/ImageSearch"));

/* ── Category icons ─────────────────────────────────────────── */
const CAT_ICONS = {
  Laptops:              "💻",
  Smartphones:          "📱",
  Gaming:               "🎮",
  Network:              "🌐",
  "Smart Accessories":  "🔌",
  "Smart Watch":        "⌚",
  "Headphones & Audio": "🎧",
  Tablets:              "📟",
  Drones:               "🚁",
  "Printers & Scanners":"🖨️",
  "Smart Home":         "🏠",
  Cameras:              "📷",
};
const catIcon = n => CAT_ICONS[n] || "📦";

/* ── Static nav sub-menus ───────────────────────────────────── */
const ABOUT_LINKS = [
  { href:"/about",   icon:<FiInfo />,      label:"About Us",       sub:"Our story & mission"       },
  { href:"/team",    icon:<FiUsers />,     label:"Our Team",       sub:"Meet the people behind us" },
];
const HELP_LINKS = [
  { href:"/help",          icon:<FiHelpCircle />, label:"Help Center",        sub:"FAQs & guides"          },
  { href:"/contact",       icon:<FiMail />,       label:"Contact Us",         sub:"Get in touch"           },
  { href:"/shipping-info", icon:"🚚",             label:"Shipping Info",      sub:"Delivery details"       },
  { href:"/returns",       icon:"↩️",             label:"Returns & Refunds",  sub:"Return policy"          },
  { href:"/faq",           icon:"❓",             label:"FAQ",                sub:"Common questions"       },
];

/* ── Reusable hover dropdown panel ─────────────────────────── */
function HoverPanel({ children }) {
  return (
    <div className="nav-hover-panel">
      {children}
    </div>
  );
}

const Navbar = () => {
  const { t } = useTranslation();
  const [user, setUser]                   = useState(null);
  const [search, setSearch]               = useState("");
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [acctOpen, setAcctOpen]           = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [imgSearchOpen, setImgSearchOpen] = useState(false);
  const [categories, setCategories]       = useState([]);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen]   = useState(false);
  const [langOpen, setLangOpen]               = useState(false);
  const [mobileLangOpen, setMobileLangOpen]   = useState(false);

  const acctRef  = useRef(null);
  const notifRef = useRef(null);
  const langRef  = useRef(null);
  const navigate = useNavigate();

  const { cartCount }   = useCart();
  const { wishlist }    = useWishlist();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { language, setLanguage } = usePreference();

  useEffect(() => {
    const load = () => {
      const s = localStorage.getItem("user");
      setUser(s ? JSON.parse(s) : null);
    };
    load();
    window.addEventListener("loginStatusChanged", load);
    return () => window.removeEventListener("loginStatusChanged", load);
  }, []);

  useEffect(() => {
    API.get("/categories")
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const handler = e => {
      if (acctRef.current  && !acctRef.current.contains(e.target))  setAcctOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (langRef.current  && !langRef.current.contains(e.target))  setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    setUser(null);
    setAcctOpen(false);
    setMobileOpen(false);
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const searchProduct = () => {
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  const closeAll = () => {
    setMobileOpen(false);
    setAcctOpen(false);
    setNotifOpen(false);
    setLangOpen(false);
    setMobileCatOpen(false);
    setMobileAboutOpen(false);
    setMobileHelpOpen(false);
    setMobileLangOpen(false);
  };

  const acctMenu = [
    { path:"/profile",         label:t("account.myProfile"),      icon:<FiUser />         },
    { path:"/my-orders",       label:t("account.myOrders"),       icon:<FiShoppingBag />  },
    { path:"/payment-history", label:t("account.paymentHistory"), icon:<FiCreditCard />   },
    { path:"/wishlist",        label:t("account.wishlist"),       icon:<FiHeart />        },
    { path:"/my-messages",     label:t("account.messages"),       icon:<FiMessageSquare />},
    { path:"/notifications",   label:t("account.notifications"),  icon:<FiBell />         },
  ];

  const recentNotifs = notifications.slice(0, 5);

  const isStaff = user && [
    "owner", "super_admin", "admin", "superadmin",
    "cashier_finance", "cashierfinance", "finance", "cashier",
    "inventory_manager", "inventorymanager", "manager",
    "delivery",
    "seller"
  ].includes(String(user.role || "").toLowerCase().replace(/[\s_-]/g, ""));

  const formatStaffRole = (role) => {
    const r = String(role || "").toLowerCase().replace(/[\s_-]/g, "");
    if (["superadmin", "owner"].includes(r)) return "Owner / CEO";
    if (["admin", "inventorymanager", "manager"].includes(r)) return "Admin";
    if (["cashier", "finance", "cashierfinance"].includes(r)) return "Cashier / Finance";
    if (["delivery"].includes(r)) return "Delivery";
    if (["seller"].includes(r)) return "Seller";
    return role || "Staff";
  };

  return (
    <header className="store-header">
      {/* Top Announcement & Utility Bar */}
      <AnnouncementBar />

      {/* Main Navigation Container */}
      <nav className="navbar">
        <div className="navbar-inner">

          {/* ══ ROW 1: Logo | Desktop Search | Actions & Hamburger ══ */}
          <div className="nav-row nav-row-top">

            {/* Main Brand Logo — links to Home */}
            <Link to="/" className="nav-logo" onClick={closeAll} aria-label="Tech E-Commerce Home">
              <img src={logo} alt="Tech E-Commerce" className="nav-logo-circle" />
              <span className="nav-logo-text">Tech <b>E-Commerce</b></span>
            </Link>

            {/* Desktop Search Bar (Hidden on mobile) */}
            <div className="nav-desktop-search">
              <div className="nav-search-bar">
                <input
                  type="text"
                  placeholder={t("nav.searchPlaceholder") || "Search laptops, phones, gaming, accessories..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchProduct()}
                  aria-label="Search products"
                />
                <div className="nav-img-search-wrap">
                  <button
                    type="button"
                    className="nav-img-search-btn"
                    onClick={() => setImgSearchOpen(true)}
                    title="Search by image"
                    aria-label="Search by image"
                  >
                    <FaCamera />
                  </button>
                </div>
                <button className="nav-search-submit" onClick={searchProduct} aria-label="Search">
                  <FaSearch />
                  <span>{t("nav.search") || "Search"}</span>
                </button>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="nav-top-icons">

              {/* Wishlist */}
              <Link to="/wishlist" className="nav-top-icon" onClick={closeAll} aria-label="Wishlist">
                <span className="nav-icon-wrap">
                  <FaHeart />
                  {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
                </span>
                <span className="nav-icon-label">{t("nav.wishlist")}</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="nav-top-icon" onClick={closeAll} aria-label="Shopping Cart">
                <span className="nav-icon-wrap">
                  <FaShoppingCart />
                  {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                </span>
                <span className="nav-icon-label">{t("nav.cart")}</span>
              </Link>

              {/* Notifications (Logged in users) */}
              {user && (
                <div className="nav-account-wrap" ref={notifRef}>
                  <button className="nav-top-icon nav-notif-btn" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
                    <span className="nav-icon-wrap">
                      <FiBell style={{ fontSize: 20 }} />
                      {unreadCount > 0 && <span className="nav-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                    </span>
                    <span className="nav-icon-label">{t("nav.alerts")}</span>
                  </button>
                  {notifOpen && (
                    <div className="nav-notif-dropdown">
                      <div className="nav-notif-header">
                        <span>{t("account.notifications")} {unreadCount > 0 && `(${unreadCount})`}</span>
                        {unreadCount > 0 && <button onClick={markAllRead} className="nav-notif-mark-all">Mark all read</button>}
                      </div>
                      {recentNotifs.length === 0 ? (
                        <div className="nav-notif-empty">No notifications yet</div>
                      ) : recentNotifs.map(n => (
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
                      ))}
                      <Link to="/notifications" className="nav-notif-all" onClick={() => setNotifOpen(false)}>
                        View all notifications →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Account Dropdown or Login Link (Dashboard accessible under Account) */}
              {user ? (
                <div className="nav-account-wrap" ref={acctRef}>
                  <button className="nav-acct-btn" onClick={() => setAcctOpen(o => !o)} aria-expanded={acctOpen} aria-label="User Account">
                    <span className="nav-icon-wrap">
                      {user.profileImage
                        ? <img src={getImageUrl(user.profileImage)} className="nav-avatar-img" alt="profile" />
                        : <span className="nav-avatar-initial">{user.name?.charAt(0).toUpperCase() || "U"}</span>}
                    </span>
                    <span className="nav-icon-label">{t("nav.account")}</span>
                  </button>
                  {acctOpen && (
                    <div className="nav-acct-dropdown">
                      <div className="nav-acct-header">
                        <div className="nav-acct-avatar">
                          {user.profileImage
                            ? <img src={getImageUrl(user.profileImage)} alt="profile" />
                            : <span>{user.name?.charAt(0).toUpperCase() || "U"}</span>}
                        </div>
                        <div>
                          <div className="nav-acct-fullname">{user.name}</div>
                          <div className="nav-acct-email">{user.email}</div>
                        </div>
                      </div>

                      {/* Staff link inside account dropdown */}
                      {isStaff && (
                        <>
                          <div className="nav-acct-divider" />
                          <Link to="/admin" className="nav-acct-item nav-staff-item" onClick={closeAll}>
                            <span className="nav-acct-item-icon">⚡</span>
                            <div>
                              <div style={{ fontWeight: 800, color: "#2563eb" }}>{t("nav.staffDashboard", "Staff Dashboard")}</div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>{formatStaffRole(user.role)}</div>
                            </div>
                          </Link>
                        </>
                      )}

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
                        {t("account.logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="nav-top-icon" onClick={closeAll} aria-label="Sign In">
                  <span className="nav-icon-wrap"><FaUserCircle style={{ fontSize: 20 }} /></span>
                  <span className="nav-icon-label">{t("nav.login")}</span>
                </Link>
              )}

              {/* Mobile Hamburger Button */}
              <button
                className="nav-hamburger"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Toggle navigation drawer"
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* ══ ROW 2 (Mobile Dedicated Search Bar) ══ */}
          <div className="nav-mobile-search">
            <div className="nav-search-bar">
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder") || "Search laptops, phones, gaming..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchProduct()}
                aria-label="Search products"
              />
              <div className="nav-img-search-wrap">
                <button
                  type="button"
                  className="nav-img-search-btn"
                  onClick={() => setImgSearchOpen(true)}
                  title="Search by image"
                  aria-label="Search by image"
                >
                  <FaCamera />
                </button>
              </div>
              <button className="nav-search-submit" onClick={searchProduct} aria-label="Search">
                <FaSearch />
              </button>
            </div>
          </div>

          {/* ══ ROW 3: Secondary Desktop Nav Bar (Categories & Links) ══ */}
          <div className="nav-row nav-row-links">

            {/* Left: Categories Mega Menu Trigger */}
            <div className="nav-cat-item">
              <div className="nav-cat-trigger">
                <FaBars className="nav-cat-trigger-icon" />
                <span>{t("nav.categories")}</span>
              </div>

              {/* Mega Dropdown Panel */}
              <div className="cat-mega-dropdown">
                <div className="cat-mega-inner">
                  <button className="cat-mega-all" onClick={() => { navigate("/products"); closeAll(); }}>
                    🛍️ {t("product.allProducts")}
                  </button>
                  <div className="cat-mega-divider" />
                  <div className="cat-mega-grid">
                    {categories.length === 0 ? (
                      <span className="cat-mega-empty">No categories yet</span>
                    ) : (
                      categories.map(cat => {
                        const img = CAT_IMAGE_MAP[cat.name];
                        return (
                          <button
                            key={cat._id}
                            className="cat-mega-item"
                            onClick={() => { navigate(`/products?category=${encodeURIComponent(cat.name)}`); closeAll(); }}
                          >
                            {img ? (
                              <img src={img} alt="" className="cat-mega-thumb" />
                            ) : (
                              <span className="cat-mega-icon">{catIcon(cat.name)}</span>
                            )}
                            <span className="cat-mega-label">{cat.name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Nav links */}
            <ul className="nav-links">
              {/* Home */}
              <li className="nav-link-item">
                <Link to="/" className="nav-link" onClick={closeAll}>{t("nav.home")}</Link>
              </li>

              {/* All Products — hover shows quick category panel */}
              <li className="nav-link-item nav-has-panel">
                <Link to="/products" className="nav-link" onClick={closeAll}>
                  {t("nav.allProducts")}
                </Link>
                <HoverPanel>
                  <div className="nhp-title">{t("nav.browseByCategory", "Browse by Category")}</div>
                  <div className="nhp-grid nhp-grid-2">
                    {[
                      { img: CAT_IMAGE_MAP["Laptops"],            label: t("cat.Laptops", "Laptops"),                         href:"/products?category=Laptops" },
                      { img: CAT_IMAGE_MAP["Smartphones"],        label: t("cat.Smartphones", "Smartphones"),                 href:"/products?category=Smartphones" },
                      { img: CAT_IMAGE_MAP["Gaming"],             label: t("cat.Gaming", "Gaming"),                           href:"/products?category=Gaming" },
                      { img: CAT_IMAGE_MAP["Headphones & Audio"], label: t("cat.Headphones & Audio", "Headphones & Audio"),   href:"/products?category=Headphones+%26+Audio" },
                      { img: CAT_IMAGE_MAP["Cameras"],            label: t("cat.Cameras", "Cameras"),                         href:"/products?category=Cameras" },
                      { img: CAT_IMAGE_MAP["Smart Watch"],        label: t("cat.Smart Watch", "Smart Watch"),                 href:"/products?category=Smart+Watch" },
                    ].map(item => (
                      <Link key={item.href} to={item.href} className="nhp-item" onClick={closeAll}>
                        {item.img && <img src={item.img} alt="" className="cat-mega-thumb" />}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="nhp-footer">
                    <Link to="/products" className="nhp-view-all" onClick={closeAll}>
                      {t("nav.viewAllProducts", "View all products →")}
                    </Link>
                  </div>
                </HoverPanel>
              </li>

              {/* About — hover shows About Us + Team */}
              <li className="nav-link-item nav-has-panel">
                <span className="nav-link nav-cat-trigger-text">
                  {t("nav.about")}
                </span>
                <div className="nav-hover-panel nhp-narrow">
                  {ABOUT_LINKS.map(item => (
                    <Link key={item.href} to={item.href} className="nhp-menu-item" onClick={closeAll}>
                      <span className="nhp-menu-icon">{item.icon}</span>
                      <div>
                        <div className="nhp-menu-label">{item.label}</div>
                        <div className="nhp-menu-sub">{item.sub}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>

              {/* Contact */}
              <li className="nav-link-item">
                <Link to="/contact" className="nav-link" onClick={closeAll}>{t("nav.contact")}</Link>
              </li>

              {/* Help & Support */}
              <li className="nav-link-item nav-has-panel">
                <span className="nav-link nav-cat-trigger-text">
                  {t("nav.help")}
                </span>
                <div className="nav-hover-panel nhp-narrow">
                  {HELP_LINKS.map(item => (
                    <Link key={item.href} to={item.href} className="nhp-menu-item" onClick={closeAll}>
                      <span className="nhp-menu-icon">{item.icon}</span>
                      <div>
                        <div className="nhp-menu-label">{item.label}</div>
                        <div className="nhp-menu-sub">{item.sub}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>
            </ul>

            {/* Right: Seller link */}
            <div className="nav-right-promo">
              <Link to="/become-seller" className="nav-seller-link">
                ✨ {t("nav.becomeSeller", "Become a Seller")}
              </Link>
            </div>

          </div>

        </div>
      </nav>

      {/* ══ MOBILE SLIDE-OUT DRAWER ══ */}
      {/* Backdrop */}
      <div
        className={`nav-drawer-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={closeAll}
        aria-hidden={!mobileOpen}
      />

      {/* Drawer Panel */}
      <aside className={`nav-drawer ${mobileOpen ? "open" : ""}`} aria-label="Mobile Navigation">
        {/* Drawer Header */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-user">
            {user ? (
              <div className="nav-drawer-user-info">
                <div className="nav-drawer-avatar">
                  {user.profileImage
                    ? <img src={getImageUrl(user.profileImage)} alt="profile" />
                    : <span>{user.name?.charAt(0).toUpperCase() || "U"}</span>}
                </div>
                <div>
                  <div className="nav-drawer-name">{user.name}</div>
                  <div className="nav-drawer-email">{user.email}</div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="nav-drawer-signin-btn" onClick={closeAll}>
                <FaUserCircle className="nav-drawer-signin-icon" />
                <span>{t("nav.signInRegister", "Sign In / Register")}</span>
              </Link>
            )}
          </div>
          <button className="nav-drawer-close" onClick={closeAll} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="nav-drawer-body">
          {/* Main Links */}
          <div className="nav-drawer-section-title">{t("nav.navigation", "Navigation")}</div>
          <ul className="nav-drawer-nav">
            <li>
              <Link to="/profile" className="nav-drawer-item nav-drawer-profile-item" onClick={closeAll}>
                <img src={logo} alt="Profile" className="nav-drawer-profile-img" />
                <span>{t("account.myProfile") || "My Profile"}</span>
              </Link>
            </li>
            <li>
              <Link to="/" className="nav-drawer-item" onClick={closeAll}>
                <span className="nav-drawer-item-icon">🏠</span>
                <span>{t("nav.home")}</span>
              </Link>
            </li>
            <li>
              <Link to="/products" className="nav-drawer-item" onClick={closeAll}>
                <span className="nav-drawer-item-icon">🛍️</span>
                <span>{t("nav.allProducts")}</span>
              </Link>
            </li>

            {/* Categories Accordion */}
            <li className="nav-drawer-accordion-wrap">
              <button
                className="nav-drawer-accordion-btn"
                onClick={() => setMobileCatOpen(o => !o)}
                aria-expanded={mobileCatOpen}
              >
                <div className="nav-drawer-accordion-title">
                  <span className="nav-drawer-item-icon">📦</span>
                  <span>{t("nav.categories")}</span>
                </div>
              </button>
              {mobileCatOpen && (
                <div className="nav-drawer-sub-menu">
                  <button
                    className="nav-drawer-sub-all"
                    onClick={() => { navigate("/products"); closeAll(); }}
                  >
                    {t("nav.allCategories", "All Categories →")}
                  </button>
                  {categories.map(cat => {
                    const img = CAT_IMAGE_MAP[cat.name];
                    return (
                      <button
                        key={cat._id}
                        className="nav-drawer-sub-item"
                        onClick={() => { navigate(`/products?category=${encodeURIComponent(cat.name)}`); closeAll(); }}
                      >
                        {img ? (
                          <img src={img} alt="" className="cat-mega-thumb" />
                        ) : (
                          <span>{catIcon(cat.name)}</span>
                        )}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </li>

            {/* About Accordion */}
            <li className="nav-drawer-accordion-wrap">
              <button
                className="nav-drawer-accordion-btn"
                onClick={() => setMobileAboutOpen(o => !o)}
                aria-expanded={mobileAboutOpen}
              >
                <div className="nav-drawer-accordion-title">
                  <span className="nav-drawer-item-icon">ℹ️</span>
                  <span>{t("nav.about")}</span>
                </div>
              </button>
              {mobileAboutOpen && (
                <div className="nav-drawer-sub-menu">
                  {ABOUT_LINKS.map(item => (
                    <Link key={item.href} to={item.href} className="nav-drawer-sub-item" onClick={closeAll}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* Contact */}
            <li>
              <Link to="/contact" className="nav-drawer-item" onClick={closeAll}>
                <span className="nav-drawer-item-icon">✉️</span>
                <span>{t("nav.contact")}</span>
              </Link>
            </li>

            {/* Help Accordion */}
            <li className="nav-drawer-accordion-wrap">
              <button
                className="nav-drawer-accordion-btn"
                onClick={() => setMobileHelpOpen(o => !o)}
                aria-expanded={mobileHelpOpen}
              >
                <div className="nav-drawer-accordion-title">
                  <span className="nav-drawer-item-icon">❓</span>
                  <span>{t("nav.help")}</span>
                </div>
              </button>
              {mobileHelpOpen && (
                <div className="nav-drawer-sub-menu">
                  {HELP_LINKS.map(item => (
                    <Link key={item.href} to={item.href} className="nav-drawer-sub-item" onClick={closeAll}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* Become a Seller */}
            <li>
              <Link to="/become-seller" className="nav-drawer-item nav-drawer-highlight" onClick={closeAll}>
                <span className="nav-drawer-item-icon">✨</span>
                <span>{t("nav.becomeSeller", "Become a Seller")}</span>
              </Link>
            </li>
          </ul>

          {/* Account shortcuts (Logged in) */}
          {user && (
            <>
              <div className="nav-drawer-divider" />
              <div className="nav-drawer-section-title">{t("nav.account", "My Account")}</div>
              {isStaff && (
                <Link to="/admin" className="nav-drawer-sub-item nav-drawer-staff-card" onClick={closeAll}>
                  <span className="nav-drawer-item-icon">⚡</span>
                  <div>
                    <strong style={{ color: "#2563eb", display: "block" }}>{t("nav.staffDashboard", "Staff Dashboard")}</strong>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{formatStaffRole(user.role)}</span>
                  </div>
                </Link>
              )}
              <div className="nav-drawer-acct-list">
                {acctMenu.map(item => (
                  <Link key={item.path} to={item.path} className="nav-drawer-sub-item" onClick={closeAll}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button className="nav-drawer-logout-btn" onClick={logout}>
                  <FiLogOut /> <span>{t("account.logout")}</span>
                </button>
              </div>
            </>
          )}

          {/* Active Language Switcher for Mobile Drawer (Collapsed Accordion) */}
          <div className="nav-drawer-divider" />
          <div className="nav-drawer-accordion-wrap">
            <button
              type="button"
              className="nav-drawer-accordion-btn"
              onClick={() => setMobileLangOpen(o => !o)}
              aria-expanded={mobileLangOpen}
            >
              <div className="nav-drawer-accordion-title">
                <span className="nav-drawer-item-icon">🌐</span>
                <span>Language: <strong>{language?.nativeName || "English"}</strong></span>
              </div>
            </button>
            {mobileLangOpen && (
              <div className="nav-drawer-sub-menu">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    type="button"
                    className={`nav-drawer-sub-item ${language?.code === l.code ? "active-lang-item" : ""}`}
                    onClick={() => { setLanguage(l); closeAll(); }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: language?.code === l.code ? "rgba(37,99,235,0.08)" : "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "8px"
                    }}
                  >
                    <span style={{ fontWeight: language?.code === l.code ? "700" : "500", color: language?.code === l.code ? "#2563eb" : "#1e293b" }}>
                      {l.nativeName} ({l.label})
                    </span>
                    {language?.code === l.code && <span style={{ color: "#2563eb", fontWeight: "bold" }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* Visual Image Search Modal */}
      {imgSearchOpen && (
        <Suspense fallback={null}>
          <ImageSearch onClose={() => setImgSearchOpen(false)} />
        </Suspense>
      )}
    </header>
  );
};

export default Navbar;
