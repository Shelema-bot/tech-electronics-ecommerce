import React from "react";
import "./Hero.css";
import heroImg from "../../assets/hero.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">

        <div className="hero-left">
          <div className="hero-badge">UP TO <span>20% OFF</span></div>
          <span className="hero-tag">NEW ERA OF TECHNOLOGY</span>

          <h1>
            Discover the Latest
            <br />
            Tech &amp; Electronics
          </h1>

          <p>
            Shop the latest smartphones, laptops, accessories,
            gaming devices and networking equipment at the best prices.
            Quality products, fast delivery, secure payment.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="shop-btn">
              Shop Now
            </Link>
            <Link to="/about" className="learn-btn">
              Learn More
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>500+</strong>
              <span>Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>1,200+</strong>
              <span>Happy Customers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Support</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <img src={heroImg} alt="Latest Technology Products" />
        </div>

      </div>
    </section>
  );
};

export default Hero;
