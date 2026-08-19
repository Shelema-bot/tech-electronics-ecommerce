import { useState } from "react";
import { Link } from "react-router-dom";
import "./Help.css";

const steps = [
  {
    number: "01",
    icon: "👤",
    title: "Create an Account",
    desc: "Click Register at the top of the page. Enter your name, email, and password. Verify your account and you're ready to shop.",
    details: [
      "Go to the top navigation and click Login → Register.",
      "Fill in your full name, email address, and a secure password.",
      "Click the Register button — you'll be logged in immediately.",
      "Visit My Profile to add your shipping address and phone number.",
    ],
  },
  {
    number: "02",
    icon: "🔍",
    title: "Browse & Find Products",
    desc: "Use the search bar or browse by category to find the electronics you need.",
    details: [
      "Use the search bar at the top to search by product name or keyword.",
      "Click Categories in the navbar to filter by product type.",
      "Click on any product card to see full details, images, and reviews.",
      "Check stock availability and product specifications on the detail page.",
    ],
  },
  {
    number: "03",
    icon: "🛒",
    title: "Add to Cart or Wishlist",
    desc: "Add items to your cart to buy now, or save them to your wishlist for later.",
    details: [
      "On a product page, choose your quantity and click Add to Cart.",
      "Click the heart icon to save a product to your Wishlist.",
      "Access your Cart or Wishlist from the navigation bar at any time.",
      "Adjust quantities or remove items directly from the Cart page.",
    ],
  },
  {
    number: "04",
    icon: "💳",
    title: "Checkout & Pay",
    desc: "Enter your delivery details and choose between online payment or cash on delivery.",
    details: [
      "Click Checkout from your Cart page.",
      "Enter your shipping address and phone number.",
      "Choose your payment method: Chapa (online) or Cash on Delivery.",
      "Click Place Order — you'll receive an email confirmation.",
    ],
  },
  {
    number: "05",
    icon: "📦",
    title: "Track Your Order",
    desc: "Monitor your order status in real time from your My Orders page.",
    details: [
      "Go to My Orders from the navigation bar.",
      "Each order shows its current status: Pending, Processing, Shipped, or Delivered.",
      "Your order ID is shown for reference if you need to contact support.",
      "Once delivered, you can leave a review on the product page.",
    ],
  },
  {
    number: "06",
    icon: "⭐",
    title: "Leave a Review",
    desc: "Share your experience by rating and reviewing products you've purchased.",
    details: [
      "Navigate to the product page of an item you purchased.",
      "Scroll down to the Reviews section.",
      "Choose a star rating (1–5) and write your feedback.",
      "Click Submit Review — your review helps other shoppers.",
    ],
  },
];

const faqs = [
  {
    q: "How do I reset my password?",
    a: 'Click Login → then "Forgot Password?". Enter your registered email and we\'ll send you a reset link within a few minutes.',
  },
  {
    q: "Can I cancel or change my order?",
    a: "Orders can be cancelled or modified while they are in Pending status. Contact us immediately via the Contact page or email shelemaagari@gmail.com.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Chapa (online card/mobile payment) and Cash on Delivery for eligible locations.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery within Addis Ababa takes 1–3 business days. Other regions may take 3–7 business days depending on location.",
  },
  {
    q: "What is your return policy?",
    a: "You can return defective or incorrect items within 7 days of delivery. Contact us with your order number and photos of the issue.",
  },
  {
    q: "How do I contact customer support?",
    a: "Use our Contact page, email shelemaagari@gmail.com, or call +251 974 007 772. We respond within 24 hours.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. All payments are processed by Chapa over HTTPS. We never store your card details on our servers.",
  },
  {
    q: "How do I update my profile or address?",
    a: "Go to Account → Profile from the navigation bar. You can update your name, phone, address, and profile photo.",
  },
];

function Help() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="help-page">

      {/* Hero */}
      <div className="help-hero">
        <h1>Help Center</h1>
        <p>Everything you need to know to shop with confidence at Tech &amp; Electronic.</p>
      </div>

      <div className="help-container">

        {/* Step-by-step guide */}
        <section className="help-section">
          <div className="help-section-header">
            <h2>How to Shop — Step by Step</h2>
            <p>Follow these steps to go from browsing to doorstep delivery.</p>
          </div>

          <div className="help-steps">
            {steps.map((step, i) => (
              <div className="help-step" key={i}>
                <div className="help-step-left">
                  <div className="help-step-number">{step.number}</div>
                  <div className="help-step-line" />
                </div>
                <div className="help-step-content">
                  <div className="help-step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p className="help-step-desc">{step.desc}</p>
                  <ul className="help-step-details">
                    {step.details.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="help-section">
          <div className="help-section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div
                className={`faq-item ${openFaq === i ? "open" : ""}`}
                key={i}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-arrow">{openFaq === i ? "▲" : "▼"}</span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Still need help */}
        <section className="help-cta">
          <div className="help-cta-card">
            <div className="help-cta-icon">💬</div>
            <h2>Still need help?</h2>
            <p>Our support team is here for you. Reach out and we'll get back to you within 24 hours.</p>
            <div className="help-cta-actions">
              <Link to="/contact" className="help-cta-btn primary">Contact Us</Link>
              <a href="mailto:shelemaagari@gmail.com" className="help-cta-btn secondary">Email Support</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Help;
