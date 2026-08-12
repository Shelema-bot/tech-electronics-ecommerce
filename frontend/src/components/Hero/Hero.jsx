import React from "react";
import "./Hero.css";
import heroImg from "../../assets/hero.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">

        <div className="hero-left">
          <span className="hero-tag">WELCOME TO</span>

          <h1>
            Tech and Electronic
            <br />
            E-Commerce
          </h1>

          <p>
            Shop the latest laptops, smartphones, accessories,
            gaming devices, networking equipment, and many more
            electronic products at affordable prices.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="shop-btn">
              Shop Now
            </Link>

            <Link to="/about" className="learn-btn">
              Learn More
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <img src={heroImg} alt="Electronics" />
        </div>

      </div>
    </section>
  );
};

export default Hero;