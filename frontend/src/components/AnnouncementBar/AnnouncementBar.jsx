/**
 * AnnouncementBar — rotating promotional messages at the top of the storefront.
 * Messages are loaded from localStorage (set by admin) or fall back to defaults.
 * Rotates every 4 seconds.
 */
import { useState, useEffect, useCallback } from "react";
import "./AnnouncementBar.css";

const DEFAULT_PROMOS = [
  { id: 1, text: "🚚 <strong>Free Shipping</strong> on all orders over ETB 5,000!" },
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
  const [visible,  setVisible]  = useState(true);
  const [promos,   setPromos]   = useState(loadPromos);
  const [current,  setCurrent]  = useState(0);
  const [animating,setAnimating]= useState(false);

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

  // Auto-rotate every 4s
  useEffect(() => {
    if (!visible || promos.length <= 1) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [visible, promos.length, next]);

  // Listen for promo updates from admin panel
  useEffect(() => {
    const handler = () => setPromos(loadPromos());
    window.addEventListener("promosUpdated", handler);
    return () => window.removeEventListener("promosUpdated", handler);
  }, []);

  if (!visible || promos.length === 0) return null;

  const promo = promos[current];

  return (
    <div className="announcement-bar">
      {/* Prev arrow */}
      {promos.length > 1 && (
        <button className="ann-arrow ann-arrow-left" onClick={prev} aria-label="Previous">‹</button>
      )}

      {/* Text */}
      <span
        className={`ann-text ${animating ? "ann-fade-out" : "ann-fade-in"}`}
        dangerouslySetInnerHTML={{ __html: promo.text }}
      />

      {/* Dots */}
      {promos.length > 1 && (
        <div className="ann-dots">
          {promos.map((_, i) => (
            <button
              key={i}
              className={`ann-dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Next arrow */}
      {promos.length > 1 && (
        <button className="ann-arrow ann-arrow-right" onClick={next} aria-label="Next">›</button>
      )}

      {/* Close */}
      <button className="ann-close" onClick={() => setVisible(false)} aria-label="Close">✕</button>
    </div>
  );
}
