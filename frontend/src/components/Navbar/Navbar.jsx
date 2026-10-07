import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaShoppingCart, FaUserCircle, FaSearch, FaHeart,
  FaChevronDown, FaBars, FaTimes, FaCamera,
  FaLaptop, FaMobileAlt, FaGamepad, FaNetworkWired,
  FaHeadphones, FaTabletAlt, FaPrint, FaCamera as FaCamIcon,
} from "react-icons/fa";
import {
  FiUser, FiShoppingBag, FiCreditCard, FiHeart,
  FiMessageSquare, FiBell, FiLogOut,
  FiInfo, FiUsers, FiMail, FiHelpCircle,
} from "react-icons/fi";
import logo from "../../assets/LOGO.jpg";
import { useCart }       from "../../context/CartContext";
import { useWishlist }   from "../../context/WishlistContext";
import { getImageUrl }   from "../../utils/imageUrl";
import { usePreference, COUNTRIES, LANGUAGES, CURRENCIES } from "../../context/PreferenceContext";
import { useNotifications } from "../../context/NotificationContext";
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
  { href:"/about",   icon:<FiInfo />,      label:"About Us",       sub:"Our story & mission"      },
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

  const acctRef  = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const { cartCount }   = useCart();
  const { wishlist }    = useWishlist();
  const { country, setCountry, language, setLanguage, currency, setCurrency } = usePreference();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

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

  const closeAll = () => {
    setMobileOpen(false);
    setAcctOpen(false);
    setNotifOpen(false);
    setMobileCatOpen(false);
    setMobileAboutOpen(false);
    setMobileHelpOpen(false);
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

  return (
    <>
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ══ ROW 1: Logo | Preferences | Icons ══ */}
        <div className="nav-row nav-row-top">

          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={closeAll}>
            <img src={logo} alt="Tech & Electronic" />
            <span className="nav-logo-text">Tech <b>&amp;</b> Electronic</span>
          </Link>

          {/* Preferences */}
          <div className="nav-prefs">
            <div className="nav-pref-select">
              <span className="nav-pref-flag">{country.flag}</span>
              <select value={country.code} onChange={e => setCountry(COUNTRIES.find(c => c.code === e.target.value))} aria-label="Country">
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <span className="nav-pref-divider" />
            <div className="nav-pref-select">
              <span className="nav-pref-icon">🌐</span>
              <select value={language.code} onChange={e => setLanguage(LANGUAGES.find(l => l.code === e.target.value))} aria-label="Language">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.nativeName || l.name}</option>)}
              </select>
            </div>
            <span className="nav-pref-divider" />
            <div className="nav-pref-select">
              <span className="nav-pref-icon">💱</span>
              <select value={currency.code} onChange={e => setCurrency(CURRENCIES.find(c => c.code === e.target.value))} aria-label="Currency">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Right icons */}
          <div className="nav-top-icons">

            <Link to="/wishlist" className="nav-top-icon" onClick={closeAll}>
              <span className="nav-icon-wrap">
                <FaHeart />
                {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              </span>
              <span className="nav-icon-label">{t("nav.wishlist")}</span>
            </Link>

            <Link to="/cart" className="nav-top-icon" onClick={closeAll}>
              <span className="nav-icon-wrap">
                <FaShoppingCart />
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </span>
              <span className="nav-icon-label">{t("nav.cart")}</span>
            </Link>

            {user && (
              <div className="nav-account-wrap" ref={notifRef}>
                <button className="nav-top-icon nav-notif-btn" onClick={() => setNotifOpen(o => !o)}>
                  <span className="nav-icon-wrap">
                    <FiBell style={{ fontSize:20 }} />
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
                      <div key={n._id} className={`nav-notif-item ${!n.isRead ? "unread" : ""}`}
                        onClick={() => { markRead(n._id); setNotifOpen(false); if (n.link) navigate(n.link); }}>
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

            {user ? (
              <div className="nav-account-wrap" ref={acctRef}>
                <button className="nav-acct-btn" onClick={() => setAcctOpen(o => !o)} aria-expanded={acctOpen}>
                  <span className="nav-icon-wrap">
                    {user.profileImage
                      ? <img src={getImageUrl(user.profileImage)} className="nav-avatar-img" alt="profile" />
                      : <span className="nav-avatar-initial">{user.name?.charAt(0).toUpperCase() || "U"}</span>}
                  </span>
                  <span className="nav-icon-label">{t("nav.account")}</span>
                  <FaChevronDown className={`nav-chevron ${acctOpen ? "open" : ""}`} />
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
              <Link to="/login" className="nav-top-icon" onClick={closeAll}>
                <span className="nav-icon-wrap"><FaUserCircle style={{ fontSize:20 }} /></span>
                <span className="nav-icon-label">{t("nav.login")}</span>
              </Link>
            )}

            <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle navigation">
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* ══ ROW 2: Search ══ */}
        <div className="nav-row nav-row-search">
          <div className="nav-search-bar">
            <input
              type="text"
              placeholder={t("nav.searchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchProduct()}
            />
            <div className="nav-img-search-wrap">
              <button type="button" className="nav-img-search-btn" onClick={() => setImgSearchOpen(true)} title="Search by image">
                <FaCamera />
              </button>
            </div>
            <button className="nav-search-submit" onClick={searchProduct}>
              <FaSearch />
              <span>{t("nav.search")}</span>
            </button>
          </div>
        </div>

        {/* ══ ROW 3: Nav links with hover dropdowns ══ */}
        <div className={`nav-row nav-row-links ${mobileOpen ? "mobile-open" : ""}`}>
          <ul className="nav-links">

            {/* Home */}
            <li className="nav-link-item">
              <Link to="/" className="nav-link" onClick={closeAll}>{t("nav.home")}</Link>
            </li>

            {/* All Products — hover shows featured categories quick-links */}
            <li className="nav-link-item nav-has-panel">
              <Link to="/products" className="nav-link" onClick={closeAll}>
                {t("nav.allProducts")} <FaChevronDown className="nav-link-arrow" />
              </Link>
              <HoverPanel>
                <div className="nhp-title">Browse by Category</div>
                <div className="nhp-grid nhp-grid-2">
                  {[
                    { icon:"💻", label:"Laptops",             href:"/products?category=Laptops" },
                    { icon:"📱", label:"Smartphones",         href:"/products?category=Smartphones" },
                    { icon:"🎮", label:"Gaming",              href:"/products?category=Gaming" },
                    { icon:"🎧", label:"Headphones & Audio",  href:"/products?category=Headphones+%26+Audio" },
                    { icon:"📷", label:"Cameras",             href:"/products?category=Cameras" },
                    { icon:"⌚", label:"Smart Watch",         href:"/products?category=Smart+Watch" },
                  ].map(item => (
                    <Link key={item.href} to={item.href} className="nhp-item" onClick={closeAll}>
                      <span className="nhp-item-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="nhp-footer">
                  <Link to="/products" className="nhp-view-all" onClick={closeAll}>View all products →</Link>
                </div>
              </HoverPanel>
            </li>

            {/* Categories — full mega-dropdown */}
            <li className="nav-link-item nav-cat-item">
              <span className="nav-link nav-cat-trigger">
                {t("nav.categories")} <FaChevronDown className="nav-cat-arrow" />
              </span>
              {/* Mobile toggle */}
              <button className="nav-cat-mobile-btn" onClick={() => setMobileCatOpen(o => !o)} aria-expanded={mobileCatOpen}>
                {t("nav.categories")} <FaChevronDown className={`nav-cat-arrow ${mobileCatOpen ? "open" : ""}`} />
              </button>

              <div className={`cat-mega-dropdown ${mobileCatOpen ? "mobile-visible" : ""}`}>
                <div className="cat-mega-inner">
                  <button className="cat-mega-all" onClick={() => { navigate("/products"); closeAll(); }}>
                    🛍️ {t("product.allProducts")}
                  </button>
                  <div className="cat-mega-divider" />
                  <div className="cat-mega-grid">
                    {categories.length === 0
                      ? <span className="cat-mega-empty">No categories yet</span>
                      : categories.map(cat => (
                          <button key={cat._id} className="cat-mega-item"
                            onClick={() => { navigate(`/products?category=${encodeURIComponent(cat.name)}`); closeAll(); }}>
                            <span className="cat-mega-icon">{catIcon(cat.name)}</span>
                            <span className="cat-mega-label">{cat.name}</span>
                          </button>
                        ))}
                  </div>
                </div>
              </div>
            </li>

            {/* About — hover shows About Us + Team */}
            <li className="nav-link-item nav-has-panel">
              <span className="nav-link nav-cat-trigger">
                {t("nav.about")} <FaChevronDown className="nav-link-arrow" />
              </span>
              <button className="nav-cat-mobile-btn" onClick={() => setMobileAboutOpen(o => !o)} aria-expanded={mobileAboutOpen}>
                {t("nav.about")} <FaChevronDown className={`nav-cat-arrow ${mobileAboutOpen ? "open" : ""}`} />
              </button>
              <div className={`nav-hover-panel nhp-narrow ${mobileAboutOpen ? "mobile-visible" : ""}`}>
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

            {/* Contact — direct link */}
            <li className="nav-link-item">
              <Link to="/contact" className="nav-link" onClick={closeAll}>{t("nav.contact")}</Link>
            </li>

            {/* Help — hover shows Help Center, Contact, Shipping, Returns, FAQ */}
            <li className="nav-link-item nav-has-panel">
              <span className="nav-link nav-cat-trigger">
                {t("nav.help")} <FaChevronDown className="nav-link-arrow" />
              </span>
              <button className="nav-cat-mobile-btn" onClick={() => setMobileHelpOpen(o => !o)} aria-expanded={mobileHelpOpen}>
                {t("nav.help")} <FaChevronDown className={`nav-cat-arrow ${mobileHelpOpen ? "open" : ""}`} />
              </button>
              <div className={`nav-hover-panel nhp-narrow ${mobileHelpOpen ? "mobile-visible" : ""}`}>
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
        </div>

      </div>
    </nav>

    {imgSearchOpen && (
      <Suspense fallback={null}>
        <ImageSearch onClose={() => setImgSearchOpen(false)} />
      </Suspense>
    )}
    </>
  );
};

export default Navbar;
