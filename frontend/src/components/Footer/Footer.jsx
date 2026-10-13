import React, { useEffect, useState } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF, FaTelegramPlane, FaInstagram,
  FaLinkedinIn, FaTiktok, FaYoutube,
} from "react-icons/fa";
import API from "../../api/axios";
import { usePreference, COUNTRIES, LANGUAGES, CURRENCIES } from "../../context/PreferenceContext";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();
  const { country, setCountry, language, setLanguage, currency, setCurrency } = usePreference();

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
          <p>{t("footer.tagline", "Your trusted destination for the latest technology and electronics. Quality products, best prices, exceptional service.")}</p>
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
          <h3>{t("footer.shop", "Shop")}</h3>
          <ul>
            <li><Link to="/products">{t("footer.allProducts","All Products")}</Link></li>
            <li><Link to="/products">{t("footer.newArrivals","New Arrivals")}</Link></li>
            <li><Link to="/products">{t("footer.bestSellers","Best Sellers")}</Link></li>
            <li><Link to="/products">{t("footer.deals","Deals & Offers")}</Link></li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-col">
          <h3>{t("footer.customerService","Customer Service")}</h3>
          <ul>
            <li><Link to="/contact">{t("footer.contactUs","Contact Us")}</Link></li>
            <li><Link to="/shipping-info">{t("footer.shipping","Shipping Information")}</Link></li>
            <li><Link to="/returns">{t("footer.returns","Returns & Refunds")}</Link></li>
            <li><Link to="/my-orders">{t("footer.trackOrder","Track My Order")}</Link></li>
            <li><Link to="/faq">{t("footer.faq","FAQ")}</Link></li>
            <li><Link to="/help">{t("footer.helpCenter","Help Center")}</Link></li>
          </ul>
        </div>

        {/* My Account + Contact */}
        <div className="footer-col">
          <h3>{t("footer.myAccount","My Account")}</h3>
          <ul>
            <li><Link to="/login">{t("footer.signIn","Sign In")}</Link></li>
            <li><Link to="/register">{t("footer.register","Register")}</Link></li>
            <li><Link to="/my-orders">{t("account.myOrders","My Orders")}</Link></li>
            <li><Link to="/wishlist">{t("account.wishlist","Wishlist")}</Link></li>
            <li><Link to="/profile">{t("footer.accountSettings","Account Settings")}</Link></li>
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
        <span>© {new Date().getFullYear()} Tech &amp; Electronic E-Commerce. {t("footer.rights","All Rights Reserved.").replace("© {{year}} Tech & Electronic E-Commerce. ","")}</span>
        <span className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/returns">Return Policy</Link>
          <Link to="/shipping-info">Shipping Policy</Link>
        </span>
      </div>

      {/* Locale bar */}
      <div className="footer-locale-bar">
        <div className="footer-locale-inner">
          <span className="footer-locale-label">{t("footer.yourPreferences","🌍 Your preferences:")}</span>

          {/* Country */}
          <div className="footer-locale-select">
            <span>{country.flag}</span>
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

          <span className="footer-locale-divider">|</span>

          {/* Language */}
          <div className="footer-locale-select">
            <span>🌐</span>
            <select
              value={language.code}
              onChange={e => setLanguage(LANGUAGES.find(l => l.code === e.target.value))}
              aria-label="Select language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.nativeName}</option>
              ))}
            </select>
          </div>

          <span className="footer-locale-divider">|</span>

          {/* Currency */}
          <div className="footer-locale-select">
            <span>💱</span>
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

          <span className="footer-locale-note">{t("footer.pricesApprox","Prices are approximate conversions from ETB.")}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
