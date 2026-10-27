import React, { useEffect, useState } from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF, FaTelegramPlane, FaInstagram,
  FaLinkedinIn, FaTiktok, FaYoutube,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
} from "react-icons/fa";
import API from "../../api/axios";
import logo from "../../assets/tech-logo.png";
import { usePreference, COUNTRIES, LANGUAGES, CURRENCIES } from "../../context/PreferenceContext";

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [paymentsCollapsed, setPaymentsCollapsed] = useState(true);
  const { t } = useTranslation();
  const { country, setCountry, language, setLanguage, currency, setCurrency } = usePreference();

  useEffect(() => {
    API.get("/categories")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.categories || [];
        setCategories(data.slice(0, 6));
      })
      .catch(() => setCategories([]));
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">

        {/* ── Column 1: Brand Info ── */}
        <div className="footer-col footer-brand-col">
          <Link to="/" className="footer-brand-logo-wrap" aria-label="Tech & Electronic Home">
            <img src={logo} alt="Tech & Electronic Logo" className="footer-logo-img" />
            <div className="footer-brand-text">
              <span className="footer-brand-title">Tech &amp; Electronic</span>
              <span className="footer-brand-motto">{t("footer.brandMotto", "Smart Tech • Better Life")}</span>
            </div>
          </Link>
          <p className="footer-brand-desc">
            {t(
              "footer.tagline",
              "Your trusted destination for the latest technology and electronics. Quality products, best prices, exceptional service."
            )}
          </p>

          <div className="footer-social" aria-label="Social Media Links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon facebook" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://t.me/ijoolleeortodoksii" target="_blank" rel="noreferrer" className="social-icon telegram" aria-label="Telegram"><FaTelegramPlane /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon instagram" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon linkedin" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="https://www.tiktok.com/@shelema.lyrics/video/7663773376976014612" target="_blank" rel="noreferrer" className="social-icon tiktok" aria-label="TikTok"><FaTiktok /></a>
            <a href="https://youtube.com/shorts/8MWuHQ-F8p8" target="_blank" rel="noreferrer" className="social-icon youtube" aria-label="YouTube"><FaYoutube /></a>
          </div>

          <div className="footer-brand-copy">
            &copy; {currentYear} Tech &amp; Electronic. {t("footer.allRightsReserved", "All Rights Reserved.")}
          </div>
        </div>

        {/* ── Column 2: Quick Links ── */}
        <div className="footer-col">
          <h3 className="footer-heading">{t("footer.quickLinks", "Quick Links")}</h3>
          <ul className="footer-links-list">
            <li><Link to="/">{t("nav.home", "Home")}</Link></li>
            <li><Link to="/products">{t("nav.allProducts", "All Products")}</Link></li>
            <li><Link to="/products#categories">{t("nav.categories", "Categories")}</Link></li>
            <li><Link to="/about">{t("nav.about", "About Us")}</Link></li>
            <li><Link to="/contact">{t("nav.contact", "Contact")}</Link></li>
            <li><Link to="/become-seller">{t("account.becomeSeller", "Become a Seller")}</Link></li>
          </ul>
        </div>

        {/* ── Column 3: Customer Service ── */}
        <div className="footer-col">
          <h3 className="footer-heading">{t("footer.customerService", "Customer Service")}</h3>
          <ul className="footer-links-list">
            <li><Link to="/faq">{t("footer.faq", "FAQs")}</Link></li>
            <li><Link to="/shipping-info">{t("footer.shippingPolicy", "Shipping Policy")}</Link></li>
            <li><Link to="/returns">{t("footer.returnPolicy", "Return Policy")}</Link></li>
            <li><Link to="/privacy">{t("footer.privacyPolicy", "Privacy Policy")}</Link></li>
            <li><Link to="/terms">{t("footer.termsAndConditions", "Terms & Conditions")}</Link></li>
            <li><Link to="/help">{t("footer.helpCenter", "Help Center")}</Link></li>
          </ul>
        </div>

        {/* ── Column 4: Contact & Supported Payments ── */}
        <div className="footer-col footer-contact-payment-col">
          <h3 className="footer-heading">{t("footer.contactAndPayments", "Contact & Payments")}</h3>

          {/* Contact Details */}
          <div className="footer-contact-list">
            <a href="tel:+251974007772" className="footer-contact-item">
              <span className="footer-contact-icon"><FaPhoneAlt /></span>
              <span>+251 974 007 772</span>
            </a>
            <a href="mailto:shelemaagari@gmail.com" className="footer-contact-item">
              <span className="footer-contact-icon"><FaEnvelope /></span>
              <span>shelemaagari@gmail.com</span>
            </a>
            <div className="footer-contact-item">
              <span className="footer-contact-icon"><FaMapMarkerAlt /></span>
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>

          {/* Collapsible Supported Payments */}
          <div className="footer-payments-wrap">
            <button
              type="button"
              className="footer-payments-toggle-btn"
              onClick={() => setPaymentsCollapsed((prev) => !prev)}
              aria-expanded={!paymentsCollapsed}
            >
              <span className="footer-subheading footer-toggle-title">
                💳 {t("footer.supportedPayments", "Accepted Payment Methods")}
              </span>
              <span className={`footer-toggle-chevron ${!paymentsCollapsed ? "open" : ""}`}>
                {!paymentsCollapsed ? "▲" : "▼"}
              </span>
            </button>

            {!paymentsCollapsed && (
              <div className="footer-payment-badges footer-payments-animated">
                <div className="pay-badge pay-cbe" title="Commercial Bank of Ethiopia - CBE Birr">
                  <span className="pay-badge-dot" />
                  <span className="pay-badge-name">CBE Birr</span>
                </div>
                <div className="pay-badge pay-telebirr" title="Ethio Telecom - Telebirr">
                  <span className="pay-badge-dot" />
                  <span className="pay-badge-name">Telebirr</span>
                </div>
                <div className="pay-badge pay-boa" title="Bank of Abyssinia">
                  <span className="pay-badge-dot" />
                  <span className="pay-badge-name">Abyssinia (BOA)</span>
                </div>
                <div className="pay-badge pay-awash" title="Awash Bank">
                  <span className="pay-badge-dot" />
                  <span className="pay-badge-name">Awash Bank</span>
                </div>
                <div className="pay-badge pay-chapa" title="Chapa Online Payment Gateway">
                  <span className="pay-badge-dot" />
                  <span className="pay-badge-name">Chapa / Cards</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom Bar: Copyright & Policies ── */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span className="footer-bottom-copy">
            &copy; {currentYear} Tech &amp; Electronic E-Commerce. {t("footer.allRightsReserved", "All Rights Reserved.")}
          </span>
          <div className="footer-bottom-links">
            <Link to="/privacy">{t("footer.privacyPolicy", "Privacy Policy")}</Link>
            <Link to="/terms">{t("footer.termsAndConditions", "Terms of Service")}</Link>
            <Link to="/returns">{t("footer.returnPolicy", "Return Policy")}</Link>
            <Link to="/shipping-info">{t("footer.shippingPolicy", "Shipping Policy")}</Link>
          </div>
        </div>
      </div>

      {/* ── Locale Preference Bar ── */}
      <div className="footer-locale-bar">
        <div className="footer-locale-inner">
          <span className="footer-locale-label">{t("footer.yourPreferences", "🌍 Your preferences:")}</span>

          {/* Country Selection */}
          <div className="footer-locale-select">
            <span>{country?.flag || "🇪🇹"}</span>
            <select
              value={country?.code || "ET"}
              onChange={(e) => setCountry(COUNTRIES.find((c) => c.code === e.target.value))}
              aria-label="Select country"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>

          <span className="footer-locale-divider">|</span>

          {/* 3-Language Selection */}
          <div className="footer-locale-select">
            <span>🌐</span>
            <select
              value={language?.code || "en"}
              onChange={(e) => setLanguage(LANGUAGES.find((l) => l.code === e.target.value))}
              aria-label="Select language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.nativeName} ({l.label})</option>
              ))}
            </select>
          </div>

          <span className="footer-locale-divider">|</span>

          {/* Currency Selection */}
          <div className="footer-locale-select">
            <span>💱</span>
            <select
              value={currency?.code || "ETB"}
              onChange={(e) => setCurrency(CURRENCIES.find((c) => c.code === e.target.value))}
              aria-label="Select currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
              ))}
            </select>
          </div>

          <span className="footer-locale-note">
            {t("footer.pricesApprox", "Prices are approximate conversions from ETB.")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
