import React from "react";
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

const CATEGORIES = [
  { name: "Laptops",           path: "/products?category=Laptops" },
  { name: "Smartphones",       path: "/products?category=Smartphones" },
  { name: "Smart Accessories", path: "/products?category=Smart Accessories" },
  { name: "Gaming",            path: "/products?category=Gaming" },
  { name: "Network",           path: "/products?category=Network" },
  { name: "Smart Watch",       path: "/products?category=Smart Watch" },
];

const Footer = () => {
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

        {/* Categories */}
        <div className="footer-col">
          <h3>Categories</h3>
          <ul>
            {CATEGORIES.map((cat) => (
              <li key={cat.name}>
                <Link to={cat.path}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h3>Contact Info</h3>
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
      </div>
    </footer>
  );
};

export default Footer;
