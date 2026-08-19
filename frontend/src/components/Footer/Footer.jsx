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
            Your trusted online store for laptops, smartphones, accessories,
            gaming devices, networking equipment, and the latest technology
            products.
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

        {/* Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/team">Our Team</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
          </ul>
        </div>

        {/* Categories — live from API */}
        <div className="footer-col">
          <h3>Categories</h3>
          <ul>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help & Legal */}
        <div className="footer-col">
          <h3>Help &amp; Legal</h3>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>

          <h3 style={{ marginTop: "24px" }}>Contact Info</h3>
          <div className="footer-contact-item">
            <span className="footer-contact-label">📍 Address</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-label">📞 Phone</span>
            <span>+251 974 007 772</span>
          </div>
          <div className="footer-contact-item">
            <span className="footer-contact-label">✉️ Email</span>
            <span>shelemaagari@gmail.com</span>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Tech &amp; Electronic E-Commerce. All Rights Reserved.</span>
        <span className="footer-bottom-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/help">Help</Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
