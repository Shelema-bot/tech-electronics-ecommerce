import React, { useEffect, useState } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTelegramPlane,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import API from "../../api/axios";

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get("/categories")
      .then((res) => setCategories(res.data.slice(0, 6)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <h2>Tech &amp; Electronic</h2>
          <p>
            Your trusted destination for the latest technology and electronics.
            Quality products, best prices, exceptional service.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon facebook"><FaFacebookF /></a>
            <a href="https://t.me/ijoolleeortodoksii" target="_blank" rel="noreferrer" className="social-icon telegram"><FaTelegramPlane /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon linkedin"><FaLinkedinIn /></a>
            <a href="https://www.tiktok.com/@shelema.lyrics/video/7663773376976014612" target="_blank" rel="noreferrer" className="social-icon tiktok"><FaTiktok /></a>
            <a href="https://youtube.com/shorts/8MWuHQ-F8p8" target="_blank" rel="noreferrer" className="social-icon youtube"><FaYoutube /></a>
          </div>
        </div>

        {/* Shop */}
        <div className="footer-col">
          <h3>Shop</h3>
          <ul>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products">New Arrivals</Link></li>
            <li><Link to="/products">Best Sellers</Link></li>
            <li><Link to="/products">Deals &amp; Offers</Link></li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-col">
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/shipping-info">Shipping Information</Link></li>
            <li><Link to="/returns">Returns &amp; Refunds</Link></li>
            <li><Link to="/my-orders">Track My Order</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/help">Help Center</Link></li>
          </ul>
        </div>

        {/* My Account + Contact */}
        <div className="footer-col">
          <h3>My Account</h3>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/profile">Account Settings</Link></li>
          </ul>

          <h3 style={{ marginTop: "24px" }}>Connect With Us</h3>
          <div className="footer-contact-item">
            <span className="footer-contact-label">📍</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-label">📞</span>
            <span>+251 974 007 772</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-label">✉️</span>
            <span>shelemaagari@gmail.com</span>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Tech &amp; Electronic E-Commerce. All Rights Reserved.</span>
        <span className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/returns">Return Policy</Link>
          <Link to="/shipping-info">Shipping Policy</Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
