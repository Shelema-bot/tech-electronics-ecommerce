import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Hero.css";
import heroImg from "../../assets/hero.jpg";
import laptopsImg from "../../assets/category/laptops.png";
import phoneImg from "../../assets/category/smart-phone.jpg";
import watchImg from "../../assets/category/smart-watch.jpg";
import gamingImg from "../../assets/category/gaming.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = ({ bannerImage, bannerTitle, bannerSubtitle, bannerBadge, bannerLink }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [customPromo, setCustomPromo] = useState(() => {
    return bannerImage || localStorage.getItem("store_promo_banner") || null;
  });
  const slideTimerRef = useRef(null);

  useEffect(() => {
    if (bannerImage) {
      setCustomPromo(bannerImage);
      return;
    }
    const handleUpdate = () => {
      const stored = localStorage.getItem("store_promo_banner");
      setCustomPromo(stored || null);
    };
    window.addEventListener("promoBannerUpdated", handleUpdate);
    return () => window.removeEventListener("promoBannerUpdated", handleUpdate);
  }, [bannerImage]);

  // Slides configuration with tech highlights
  const slides = [
    {
      id: "slide-1",
      image: customPromo || heroImg,
      badge: bannerBadge || t("hero.badge", "UP TO 20% OFF"),
      tag: t("hero.tag", "NEW ERA OF TECHNOLOGY"),
      title: bannerTitle || t("hero.title", "Discover the Latest Tech & Electronics"),
      subtitle: bannerSubtitle || t("hero.subtitle", "Shop the latest smartphones, laptops, accessories, gaming devices and networking equipment at the best prices. Quality products, fast delivery, secure payment."),
      link: bannerLink || "/products",
      pillTop: "⚡ " + t("trust.fastDeliveryTitle", "Fast Delivery Across Ethiopia"),
      pillBottom: "⭐ 4.9/5 " + t("trust.customerSatisfaction", "Verified Customer Rating"),
    },
    {
      id: "slide-2",
      image: laptopsImg,
      badge: "🔥 " + t("cat.laptops", "Laptops"),
      tag: "PRO PERFORMANCE",
      title: t("cat.laptops", "Laptops") + " & Ultra-Portable Workstations",
      subtitle: t("hero.subtitle", "High-performance processing, crystal-clear displays, and all-day battery life for work, creators, and students."),
      link: "/products?category=Laptops",
      pillTop: "💻 100% " + t("trust.authenticTitle", "Genuine & Warranty Included"),
      pillBottom: "🚀 " + t("trust.freeShippingOver", "Free Shipping Over ETB 5,000"),
    },
    {
      id: "slide-3",
      image: phoneImg,
      badge: "✨ " + t("cat.smartphones", "Smartphones"),
      tag: "FLAGSHIP MOBILE",
      title: "Next-Gen " + t("cat.smartphones", "Smartphones") + " & Gadgets",
      subtitle: t("hero.subtitle", "Discover the newest mobile flagships with ultra-fast charging, cinema-grade cameras, and stunning 120Hz AMOLED screens."),
      link: "/products?category=Smartphones",
      pillTop: "📱 " + t("trust.securePaymentTitle", "Secure Mobile & Bank Payments"),
      pillBottom: "🛡️ " + t("trust.easyReturnsTitle", "Hassle-Free Return Guarantee"),
    },
    {
      id: "slide-4",
      image: gamingImg,
      badge: "🎮 " + t("cat.gaming", "Gaming"),
      tag: "IMMERSIVE GEAR",
      title: "Ultimate " + t("cat.gaming", "Gaming") + " Rigs & Accessories",
      subtitle: t("hero.subtitle", "Low-latency wireless audio, mechanical keyboards, ergonomic gaming controllers, and high-performance gaming hardware."),
      link: "/products?category=Gaming",
      pillTop: "🎧 3D " + t("hero.tag", "Pro Sound & High Precision"),
      pillBottom: "⚡ " + t("hero.support", "24/7 Dedicated Customer Support"),
    },
  ];

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-slide banner motion set to 3-second interval
  useEffect(() => {
    if (isPaused) return;
    slideTimerRef.current = setInterval(nextSlide, 3000);
    return () => clearInterval(slideTimerRef.current);
  }, [isPaused, nextSlide]);

  const active = slides[currentSlide];

  return (
    <section
      className="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-container">

        <div className="hero-left">
          <div className="hero-badge animate-badge">
            <span className="hero-badge-spark">✨</span> {active.badge}
          </div>
          <span className="hero-tag">{active.tag}</span>

          <h1 key={`title-${currentSlide}`} className="hero-slide-heading">
            {active.title}
          </h1>

          <p key={`desc-${currentSlide}`} className="hero-slide-text">
            {active.subtitle}
          </p>

          <div className="hero-buttons">
            <Link to={active.link} className="shop-btn hero-motion-btn">
              {t("hero.shopNow", "Shop Now")} →
            </Link>
            <Link to="/about" className="learn-btn">
              {t("hero.learnMore", "Learn More")}
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>500+</strong>
              <span>{t("hero.products", "Products")}</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>1,200+</strong>
              <span>{t("hero.customers", "Happy Customers")}</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>24/7</strong>
              <span>{t("hero.support", "Support")}</span>
            </div>
          </div>
        </div>

        {/* ── Right side: Dynamic Banner Showcase with Motion Physics ── */}
        <div className="hero-right">
          <div className="hero-motion-stage">
            {/* Ambient Radial Glow Effect */}
            <div className="hero-glow-backlight" />

            {/* Floating Top Info Pill */}
            <div className="hero-floating-pill pill-top">
              <span>{active.pillTop}</span>
            </div>

            {/* Main Floating Product Image */}
            <div className="hero-img-floating-wrapper">
              <img
                key={`img-${currentSlide}`}
                src={active.image}
                alt={active.title}
                onError={(e) => { e.currentTarget.src = heroImg; }}
                className="hero-promo-img hero-motion-active"
              />
            </div>

            {/* Floating Bottom Info Pill */}
            <div className="hero-floating-pill pill-bottom">
              <span>{active.pillBottom}</span>
            </div>
          </div>

          {/* Slide Navigation & Progress Indicators */}
          <div className="hero-carousel-controls">
            <button
              type="button"
              className="hero-arrow-btn prev"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              ‹
            </button>
            <div className="hero-dots">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  className={`hero-dot ${idx === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="hero-arrow-btn next"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
