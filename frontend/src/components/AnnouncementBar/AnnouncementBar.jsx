/**
 * AnnouncementBar — rotating promotional messages at the top of the storefront.
 * Clean, lightweight top banner with integrated active language switcher.
 */
import { useState, useEffect, useCallback } from "react";
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
  const { language, setLanguage } = usePreference();

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

        {/* Verified Language Toggle (Clean, active languages only) */}
        <div className="ann-lang-wrap" title="Switch Language">
          <span className="ann-lang-icon" aria-hidden="true">🌐</span>
          {LANGUAGES.map((l, idx) => (
            <span key={l.code} className="ann-lang-unit">
              {idx > 0 && <span className="ann-lang-sep">|</span>}
              <button
                type="button"
                className={`ann-lang-btn ${language?.code === l.code ? "active" : ""}`}
                onClick={() => setLanguage(l)}
                title={`${l.name} (${l.nativeName})`}
                aria-label={`Switch language to ${l.name}`}
              >
                {l.label}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
