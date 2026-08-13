import React, { useEffect, useState, useRef } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaUserCircle,
  FaSearch,
  FaHeart,
  FaChevronDown,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import logo from "../../assets/LOGO.jpg";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getImageUrl } from "../../utils/imageUrl";

const CATEGORIES = [
  { name: "Laptops",           path: "/products?category=Laptops" },
  { name: "Smartphones",       path: "/products?category=Smartphones" },
  { name: "Gaming",            path: "/products?category=Gaming" },
  { name: "Network",           path: "/products?category=Network" },
  { name: "Smart Accessories", path: "/products?category=Smart Accessories" },
  { name: "Smart Watch",       path: "/products?category=Smart Watch" },
];

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const catRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

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

  // Close category dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login");
  };

  const searchProduct = () => {
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setMenuOpen(false);
    }
  };

  const handleCatClick = (path) => {
    setCatOpen(false);
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="nav-logo">
          <img src={logo} alt="logo" />
          <span>Tech <b>&</b> Electronic</span>
        </Link>

        {/* SEARCH */}
        <div className="nav-search">
          <input
            type="text"
            placeholder="Search electronics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchProduct()}
          />
          <button onClick={searchProduct} aria-label="Search">
            <FaSearch />
          </button>
        </div>

        {/* HAMBURGER */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* LINKS + ICONS */}
        <div className={`nav-right ${menuOpen ? "open" : ""}`}>

          <ul className="nav-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link></li>

            {/* CATEGORIES DROPDOWN */}
            <li className="nav-cat-item" ref={catRef}>
              <button
                className="nav-cat-btn"
                onClick={() => setCatOpen(!catOpen)}
              >
                Categories <FaChevronDown className={`cat-arrow ${catOpen ? "open" : ""}`} />
              </button>

              {catOpen && (
                <div className="cat-dropdown">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      className="cat-dropdown-item"
                      onClick={() => handleCatClick(cat.path)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </li>

            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/team" onClick={() => setMenuOpen(false)}>Team</Link></li>
            <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
            <li><Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link></li>
          </ul>

          {/* ICONS */}
          <div className="nav-icons">

            {/* CART */}
            <Link to="/cart" className="nav-icon cart-icon" onClick={() => setMenuOpen(false)}>
              <FaShoppingCart />
              {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
              <span>Cart</span>
            </Link>

            {/* WISHLIST */}
            <Link to="/wishlist" className="nav-icon wishlist-icon" onClick={() => setMenuOpen(false)}>
              <FaHeart />
              {wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
              <span>Wishlist</span>
            </Link>

            {/* ACCOUNT */}
            {user ? (
              <div className="account-area">
                <Link to="/profile" className="nav-icon" onClick={() => setMenuOpen(false)}>
                  {user.profileImage ? (
                    <img src={getImageUrl(user.profileImage)} className="nav-avatar" alt="profile" />
                  ) : (
                    <FaUserCircle />
                  )}
                  <span>Account</span>
                </Link>
                <button className="logout-btn" onClick={logout}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="nav-icon" onClick={() => setMenuOpen(false)}>
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
