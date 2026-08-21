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
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../utils/imageUrl";
import API from "../../api/axios";

const COUNTRIES = [
  { code: "ET", flag: "🇪🇹", name: "Ethiopia" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "GB", flag: "🇬🇧", name: "UK" },
  { code: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "CN", flag: "🇨🇳", name: "China" },
];

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "am", label: "አማ", name: "Amharic" },
  { code: "ar", label: "AR", name: "Arabic" },
  { code: "fr", label: "FR", name: "French" },
];

const CURRENCIES = [
  { code: "ETB", symbol: "ETB", name: "Ethiopian Birr" },
  { code: "USD", symbol: "$",   name: "US Dollar" },
  { code: "EUR", symbol: "€",   name: "Euro" },
  { code: "GBP", symbol: "£",   name: "British Pound" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
];

const Navbar = () => {
  const [user, setUser]           = useState(null);
  const [search, setSearch]       = useState("");
  const [catOpen, setCatOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [acctOpen, setAcctOpen]   = useState(false);
  const [categories, setCategories] = useState([]);
  const [imgTooltip, setImgTooltip] = useState(false);

  // Preference state
  const [country,  setCountry]  = useState(() => JSON.parse(localStorage.getItem("pref_country")  || "null") || COUNTRIES[0]);
  const [language, setLanguage] = useState(() => JSON.parse(localStorage.getItem("pref_language") || "null") || LANGUAGES[0]);
  const [currency, setCurrency] = useState(() => JSON.parse(localStorage.getItem("pref_currency") || "null") || CURRENCIES[0]);

  const catRef  = useRef(null);
  const acctRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlist }  = useWishlist();

  useEffect(() => {
    const loadUser = () => {
      const saved = localStorage.getItem("user");
      setUser(saved ? JSON.parse(saved) : null);
    };
    loadUser();
    window.addEventListener("loginStatusChanged", loadUser);
    return () => window.removeEventListener("loginStatusChanged", loadUser);
  }, []);

  useEffect(() => {
    API.get("/categories")
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current  && !catRef.current.contains(e.target))  setCatOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target)) setAcctOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Persist preferences
  const changeCountry  = (c) => { setCountry(c);  localStorage.setItem("pref_country",  JSON.stringify(c)); };
  const changeLanguage = (l) => { setLanguage(l); localStorage.setItem("pref_language", JSON.stringify(l)); };
  const changeCurrency = (c) => { setCurrency(c); localStorage.setItem("pref_currency", JSON.stringify(c)); };

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

  const closeAll = () => { setMobileOpen(false); setAcctOpen(false); setCatOpen(false); };

  const acctMenu = [
    { path: "/profile",         label: "My Profile",      icon: <FiUser /> },
    { path: "/my-orders",       label: "My Orders",       icon: <FiShoppingBag /> },
    { path: "/payment-history", label: "Payment History", icon: <FiCreditCard /> },
    { path: "/wishlist",        label: "Wishlist",        icon: <FiHeart /> },
    { path: "/my-messages",     label: "Messages",        icon: <FiMessageSquare /> },
    { path: "/notifications",   label: "Notifications",   icon: <FiBell /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ══════════════════════════════
            ROW 1 — Logo | Preferences | Icons
        ══════════════════════════════ */}
        <div className="nav-row nav-row-top">

          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={closeAll}>
            <img src={logo} alt="Tech & Electronic logo" />
            <span className="nav-logo-text">Tech <b>&</b> Electronic</span>
          </Link>

          {/* ── Preferences (Country / Language / Currency) ── */}
          <div className="nav-prefs">

            {/* Country */}
            <div className="nav-pref-select">
              <span className="nav-pref-flag">{country.flag}</span>
              <select
                value={country.code}
                onChange={e => changeCountry(COUNTRIES.find(c => c.code === e.target.value))}
                aria-label="Select country"
                title="Select country"
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
                onChange={e => changeLanguage(LANGUAGES.find(l => l.code === e.target.value))}
                aria-label="Select language"
                title="Select language"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label} – {l.name}</option>
                ))}
              </select>
            </div>

            <span className="nav-pref-divider" />

            {/* Currency */}
            <div className="nav-pref-select">
              <span className="nav-pref-icon">💱</span>
              <select
                value={currency.code}
                onChange={e => changeCurrency(CURRENCIES.find(c => c.code === e.target.value))}
                aria-label="Select currency"
                title="Select currency"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} – {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Right icons: Wishlist | Cart | Account ── */}
          <div className="nav-top-icons">

            {/* Wishlist */}
            <Link to="/wishlist" className="nav-top-icon" aria-label="Wishlist" onClick={closeAll}>
              <span className="nav-icon-wrap">
                <FaHeart />
                {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              </span>
              <span className="nav-icon-label">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nav-top-icon" aria-label="Cart" onClick={closeAll}>
              <span className="nav-icon-wrap">
                <FaShoppingCart />
                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              </span>
              <span className="nav-icon-label">Cart</span>
            </Link>

            {/* Account */}
            {user ? (
              <div className="nav-account-wrap" ref={acctRef}>
                <button
                  className="nav-acct-btn"
                  onClick={() => setAcctOpen(!acctOpen)}
                  aria-haspopup="true"
                  aria-expanded={acctOpen}
                  aria-label="Account menu"
                >
                  <span className="nav-icon-wrap">
                    {user.profileImage ? (
                      <img src={getImageUrl(user.profileImage)} className="nav-avatar-img" alt="profile" />
                    ) : (
                      <span className="nav-avatar-initial">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
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
                <span className="nav-icon-wrap"><FaUserCircle /></span>
                <span className="nav-icon-label">Login</span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════
            ROW 2 — Search bar
        ══════════════════════════════ */}
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

            {/* Search by image — coming soon */}
            <div className="nav-img-search-wrap">
              <button
                className="nav-img-search-btn"
                type="button"
                onClick={() => setImgTooltip(!imgTooltip)}
                onBlur={() => setTimeout(() => setImgTooltip(false), 200)}
                aria-label="Search by image (coming soon)"
                title="Search by image"
              >
                <FaCamera />
              </button>
              {imgTooltip && (
                <div className="nav-img-tooltip">
                  📷 Image search coming soon
                </div>
              )}
            </div>

            <button
              className="nav-search-submit"
              onClick={searchProduct}
              aria-label="Submit search"
            >
              <FaSearch />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════
            ROW 3 — Navigation links
        ══════════════════════════════ */}
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
                    <div className="cat-dropdown-item" style={{ color: "#94a3b8" }}>No categories</div>
                  ) : (
                    categories.map(cat => (
                      <button key={cat._id} className="cat-dropdown-item"
                        onClick={() => { setCatOpen(false); setMobileOpen(false); navigate(`/products?category=${encodeURIComponent(cat.name)}`); }}>
                        {cat.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </li>

            <li><Link to="/about" onClick={closeAll}>About</Link></li>
            <li><Link to="/team" onClick={closeAll}>Team</Link></li>
            <li><Link to="/contact" onClick={closeAll}>Contact</Link></li>
            <li><Link to="/help" onClick={closeAll}>Help</Link></li>
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
