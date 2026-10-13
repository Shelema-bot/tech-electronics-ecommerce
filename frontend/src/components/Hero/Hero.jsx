import React from "react";
import "./Hero.css";
import heroImg from "../../assets/hero.jpg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="hero-container">

        <div className="hero-left">
          <div className="hero-badge">
            {t("hero.badge", "UP TO 20% OFF")}
          </div>
          <span className="hero-tag">{t("hero.tag", "NEW ERA OF TECHNOLOGY")}</span>

          <h1>{t("hero.title", "Discover the Latest Tech & Electronics")}</h1>

          <p>{t("hero.subtitle", "Shop the latest smartphones, laptops, accessories, gaming devices and networking equipment at the best prices. Quality products, fast delivery, secure payment.")}</p>

          <div className="hero-buttons">
            <Link to="/products" className="shop-btn">
              {t("hero.shopNow", "Shop Now")}
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

        <div className="hero-right">
          <img src={heroImg} alt={t("hero.title", "Latest Technology Products")} />
        </div>

      </div>
    </section>
  );
};

export default Hero;
