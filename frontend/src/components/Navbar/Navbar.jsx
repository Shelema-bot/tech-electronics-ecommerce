import React, { useEffect, useState, useRef } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart, FaUserCircle, FaSearch, FaHeart,
  FaChevronDown, FaBars, FaTimes,
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

const Navbar = () => {
  const [user, setUser]           = useState(null);
  const [search, setSearch]       = useState("");
  const [catOpen, setCatOpen]     = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [acctOpen, setAcctOpen]   = useState(false);
  const [categories, setCategories] = useState([]);

  const catRef  = useRef(null);
  const acctRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlist }  = useWishlist();

  // Load user
  useEffect(() => {
    const loadUser = () => {
      const saved = localStorage.getItem("user");
      setUser(saved ? JSON.parse(saved) : null);
    };
    loadUser();
    window.addEventListener("loginStatusChanged", loadUser);
    return () => window.removeEventListener("loginStatusChanged", loadUser);
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
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target)) setAcctOpen(false);
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
      setMenuOpen(false);
    }
  };

  const handleCatClick = (name) => {
    setCatOpen(false);
    setMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(name)}`);
  };

  const closeAll = () => { setMenuOpen(false); setAcctOpen(false); setCatOpen(false); };

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
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="nav-logo" onClick={closeAll}>
          <img src={logo} alt="logo" />
          <span>Tech <b>&</b> Electronic</span>
        </Link>

        {/* SEARCH */}
        <div className="nav-search">
          <input
            type="text"
            placeholder="Search electronics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchProduct()}
          />
          <button onClick={searchProduct} aria-label="Search"><FaSearch /></button>
        </div>

        {/* HAMBURGER */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* LINKS + ICONS */}
        <div className={`nav-right ${menuOpen ? "open" : ""}`}>

          <ul className="nav-links">
            <li><Link to="/" onClick={closeAll}>Home</Link></li>
            <li><Link to="/products" onClick={closeAll}>Products</Link></li>

            {/* CATEGORIES */}
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
                      <button key={cat._id} className="cat-dropdown-item" onClick={() => handleCatClick(cat.name)}>
                        {cat.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </li>

            <li><Link to="/about" onClick={closeAll}>About</Link></li>
            <li><Link to="/contact" onClick={closeAll}>Contact</Link></li>
          </ul>

          {/* ICONS */}
          <div className="nav-icons">

            {/* CART */}
            <Link to="/cart" className="nav-icon cart-icon" onClick={closeAll}>
              <FaShoppingCart />
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              <span>Cart</span>
            </Link>

            {/* WISHLIST */}
            <Link to="/wishlist" className="nav-icon wishlist-icon" onClick={closeAll}>
              <FaHeart />
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              <span>Wishlist</span>
            </Link>

            {/* ACCOUNT */}
            {user ? (
              <div className="nav-account-wrap" ref={acctRef}>
                <button
                  className="nav-acct-btn"
                  onClick={() => setAcctOpen(!acctOpen)}
                  aria-haspopup="true"
                  aria-expanded={acctOpen}
                >
                  {user.profileImage ? (
                    <img src={getImageUrl(user.profileImage)} className="nav-avatar" alt="profile" />
                  ) : (
                    <span className="nav-avatar-initial">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                  <span className="nav-acct-name">{user.name?.split(" ")[0]}</span>
                  <FaChevronDown className={`cat-arrow ${acctOpen ? "open" : ""}`} style={{ fontSize: "10px" }} />
                </button>

                {acctOpen && (
                  <div className="nav-acct-dropdown">
                    {/* User info header */}
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

                    {/* Menu items */}
                    {acctMenu.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="nav-acct-item"
                        onClick={closeAll}
                      >
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
              <Link to="/login" className="nav-icon" onClick={closeAll}>
                <FaUserCircle />
                <span>Login</span>
              </Link>
            )}

          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
