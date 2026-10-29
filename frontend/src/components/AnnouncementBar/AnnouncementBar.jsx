/**
 * AnnouncementBar — rotating promotional messages at the top of the storefront.
 * Clean, lightweight top banner with single collapsed active language selector.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import "./AnnouncementBar.css";
import { usePreference, LANGUAGES } from "../../context/PreferenceContext";

const DEFAULT_PROMOS = [
  { id: 1, text: "🚚 <strong>Free Shipping</strong> on orders over ETB 5,000!" },
  { id: 2, text: "🔒 <strong>100% Secure</strong> Payment — Shop with confidence" },
  { id: 3, text: "📞 <strong>24/7 Support</strong> — Call us: <strong>+251 974 007 772</strong>" },
  { id: 4, text: "🎁 <strong>New Arrivals</strong> every week — Check out the latest tech!" },
  { id: 5, text: "💳 Pay with <strong>Telebirr, CBE Birr, BOA</strong> or Cash on Delivery" },
];

function loadPromos() {
  try {
    const saved = localStorage.getItem("store_promos");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_PROMOS;
}

export default function AnnouncementBar() {
  const [promos, setPromos]       = useState(loadPromos);
  const [current, setCurrent]     = useState(0);
  const [animating, setAnimating] = useState(false);
  const [langOpen, setLangOpen]   = useState(false);
  const [currOpen, setCurrOpen]   = useState(false);
  const langRef                   = useRef(null);
  const currRef                   = useRef(null);
  const { language, setLanguage, currency, setCurrency, currencies } = usePreference();

  const next = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % promos.length);
      setAnimating(false);
    }, 280);
  }, [promos.length]);

  const prev = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c - 1 + promos.length) % promos.length);
      setAnimating(false);
    }, 280);
  };

  // Auto-rotate every 4.5s
  useEffect(() => {
    if (promos.length <= 1) return;
    const interval = setInterval(next, 4500);
    return () => clearInterval(interval);
  }, [promos.length, next]);

  // Listen for promo updates from admin panel
  useEffect(() => {
    const handler = () => setPromos(loadPromos());
    window.addEventListener("promosUpdated", handler);
    return () => window.removeEventListener("promosUpdated", handler);
  }, []);

  // Close language and currency dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
      if (currRef.current && !currRef.current.contains(e.target)) {
        setCurrOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (promos.length === 0) return null;

  const promo = promos[current];

  return (
    <div className="announcement-bar">
      <div className="ann-container">
        {/* Promo message slider */}
        <div className="ann-promo-wrap">
          {promos.length > 1 && (
            <button className="ann-arrow ann-arrow-left" onClick={prev} aria-label="Previous promo">‹</button>
          )}

          <span
            className={`ann-text ${animating ? "ann-fade-out" : "ann-fade-in"}`}
            dangerouslySetInnerHTML={{ __html: promo.text }}
          />

          {promos.length > 1 && (
            <button className="ann-arrow ann-arrow-right" onClick={next} aria-label="Next promo">›</button>
          )}
        </div>

        {/* Right utility cluster: Language and Currency selectors */}
        <div className="ann-actions-cluster">
          {/* Single Collapsed Language Selector on Very Top Navbar (No arrow icon) */}
          <div className="ann-lang-collapsed-wrap" ref={langRef} title="Select Language">
            <button
              type="button"
              className={`ann-lang-trigger-btn ${langOpen ? "open" : ""}`}
              onClick={() => { setLangOpen(o => !o); setCurrOpen(false); }}
              aria-label="Select Language"
              aria-expanded={langOpen}
            >
              <span className="ann-lang-globe">🌐</span>
              <span className="ann-lang-current-label">{language?.label || "EN"}</span>
            </button>

            {langOpen && (
              <div className="ann-lang-dropdown">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    type="button"
                    className={`ann-lang-drop-item ${language?.code === l.code ? "selected" : ""}`}
                    onClick={() => {
                      setLanguage(l);
                      setLangOpen(false);
                    }}
                  >
                    <span className="ann-lang-item-native">{l.nativeName}</span>
                    <span className="ann-lang-item-code">{l.label}</span>
                    {language?.code === l.code && <span className="ann-lang-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Single Collapsed Currency Selector beyond Language */}
          <div className="ann-curr-collapsed-wrap" ref={currRef} title="Select Currency">
            <button
              type="button"
              className={`ann-curr-trigger-btn ${currOpen ? "open" : ""}`}
              onClick={() => { setCurrOpen(o => !o); setLangOpen(false); }}
              aria-label="Select Currency"
              aria-expanded={currOpen}
            >
              <span className="ann-curr-icon">{currency?.symbol || "ETB"}</span>
              <span className="ann-curr-current-label">{currency?.code || "ETB"}</span>
            </button>

            {currOpen && (
              <div className="ann-curr-dropdown">
                {(currencies || []).map(c => (
                  <button
                    key={c.code}
                    type="button"
                    className={`ann-curr-drop-item ${currency?.code === c.code ? "selected" : ""}`}
                    onClick={() => {
                      setCurrency(c);
                      setCurrOpen(false);
                    }}
                  >
                    <span className="ann-curr-item-symbol">{c.symbol}</span>
                    <div className="ann-curr-item-meta">
                      <span className="ann-curr-item-code">{c.code}</span>
                      <span className="ann-curr-item-name">{c.name}</span>
                    </div>
                    {currency?.code === c.code && <span className="ann-curr-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
