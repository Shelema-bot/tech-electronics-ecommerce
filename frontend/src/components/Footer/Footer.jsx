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


const Footer = () => {

  return (

    <footer className="footer">


      <div className="footer-container">


        {/* Company Information */}

        <div className="footer-section company">

          <h2>
            Tech and Electronic E-Commerce
          </h2>


          <p>
            Your trusted online store for laptops, smartphones,
            accessories, gaming devices, networking equipment,
            and the latest technology products.
          </p>

        </div>





        {/* Quick Links */}

        <div className="footer-section">

          <h3>
            Quick Links
          </h3>


          <ul>

            <li>
              <Link to="/">
                Home
              </Link>
            </li>


            <li>
              <Link to="/products">
                Products
              </Link>
            </li>


            <li>
              <Link to="/products">
                Categories
              </Link>
            </li>


            <li>
              <Link to="/about">
                About
              </Link>
            </li>


            <li>
              <Link to="/contact">
                Contact
              </Link>
            </li>


          </ul>

        </div>






        {/* Categories */}

        <div className="footer-section">


          <h3>
            Categories
          </h3>


          <ul>


            <li>
              <Link to="/products?category=Laptops">
                Laptops
              </Link>
            </li>



            <li>
              <Link to="/products?category=Smartphones">
                Smartphones
              </Link>
            </li>



            <li>
              <Link to="/products?category=Smart Accessories">
                Smart Accessories
              </Link>
            </li>



            <li>
              <Link to="/products?category=Gaming">
                Gaming
              </Link>
            </li>



            <li>
              <Link to="/products?category=Network">
                Network
              </Link>
            </li>



            <li>
              <Link to="/products?category=Smart Watch">
                Smart Watch
              </Link>
            </li>


          </ul>


        </div>








       {/* Follow Us */}

<div className="footer-section">


  <h3>
    Follow Us
  </h3>


  <p>
    Stay connected with us for the latest technology products,
    updates, offers, and announcements.
  </p>




  {/* Social Media */}

  <div className="social-icons">


    <a
      href="https://facebook.com"
      target="_blank"
      rel="noreferrer"
      className="facebook"
    >

      <FaFacebookF />

    </a>





    <a
      href="https://t.me/ijoolleeortodoksii"
      target="_blank"
      rel="noreferrer"
      className="telegram"
    >

      <FaTelegramPlane />

    </a>





    <a
      href="https://instagram.com"
      target="_blank"
      rel="noreferrer"
      className="instagram"
    >

      <FaInstagram />

    </a>





    <a
      href="https://linkedin.com"
      target="_blank"
      rel="noreferrer"
      className="linkedin"
    >

      <FaLinkedinIn />

    </a>





    <a
      href="https://www.tiktok.com/@shelema.lyrics/video/7663773376976014612"
      target="_blank"
      rel="noreferrer"
      className="tiktok"
    >

      <FaTiktok />

    </a>





    <a
      href="https://youtube.com/shorts/8MWuHQ-F8p8"
      target="_blank"
      rel="noreferrer"
      className="youtube"
    >

      <FaYoutube />

    </a>



  </div>


</div>

      </div>







      {/* Footer Bottom */}

      <div className="footer-bottom">


        © {new Date().getFullYear()} Tech and Electronic E-Commerce.

        All Rights Reserved.


      </div>




    </footer>

  );

};


export default Footer;