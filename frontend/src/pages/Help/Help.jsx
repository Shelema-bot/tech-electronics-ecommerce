import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Help.css";

function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      icon: "👤",
      title: t("help.step1Title", "Create an Account"),
      desc: t("help.step1Desc", "Click Register at the top of the page. Enter your name, email, and password. Verify your account and you're ready to shop."),
      details: [
        t("help.step1D1", "Go to the top navigation and click Login → Register."),
        t("help.step1D2", "Fill in your full name, email address, and a secure password."),
        t("help.step1D3", "Click the Register button — you'll be logged in immediately."),
        t("help.step1D4", "Visit My Profile to add your shipping address and phone number."),
      ],
    },
    {
      number: "02",
      icon: "🔍",
      title: t("help.step2Title", "Browse & Find Products"),
      desc: t("help.step2Desc", "Use the search bar or browse by category to find the electronics you need."),
      details: [
        t("help.step2D1", "Use the search bar at the top to search by product name or keyword."),
        t("help.step2D2", "Click Categories in the navbar to filter by product type."),
        t("help.step2D3", "Click on any product card to see full details, images, and reviews."),
        t("help.step2D4", "Check stock availability and product specifications on the detail page."),
      ],
    },
    {
      number: "03",
      icon: "🛒",
      title: t("help.step3Title", "Add to Cart or Wishlist"),
      desc: t("help.step3Desc", "Add items to your cart to buy now, or save them to your wishlist for later."),
      details: [
        t("help.step3D1", "On a product page, choose your quantity and click Add to Cart."),
        t("help.step3D2", "Click the heart icon to save a product to your Wishlist."),
        t("help.step3D3", "Access your Cart or Wishlist from the navigation bar at any time."),
        t("help.step3D4", "Adjust quantities or remove items directly from the Cart page."),
      ],
    },
    {
      number: "04",
      icon: "💳",
      title: t("help.step4Title", "Checkout & Pay"),
      desc: t("help.step4Desc", "Enter your delivery details and choose between online payment or cash on delivery."),
      details: [
        t("help.step4D1", "Click Checkout from your Cart page."),
        t("help.step4D2", "Enter your shipping address and phone number."),
        t("help.step4D3", "Choose your payment method: Chapa, CBE Birr, Telebirr, or Cash on Delivery."),
        t("help.step4D4", "Click Place Order — you'll receive an email confirmation."),
      ],
    },
    {
      number: "05",
      icon: "📦",
      title: t("help.step5Title", "Track Your Order"),
      desc: t("help.step5Desc", "Monitor your order status in real time from your My Orders page."),
      details: [
        t("help.step5D1", "Go to My Orders from the navigation bar."),
        t("help.step5D2", "Each order shows its current status: Pending, Processing, Shipped, or Delivered."),
        t("help.step5D3", "Your order ID is shown for reference if you need to contact support."),
        t("help.step5D4", "Once delivered, you can leave a review on the product page."),
      ],
    },
    {
      number: "06",
      icon: "⭐",
      title: t("help.step6Title", "Leave a Review"),
      desc: t("help.step6Desc", "Share your experience by rating and reviewing products you've purchased."),
      details: [
        t("help.step6D1", "Navigate to the product page of an item you purchased."),
        t("help.step6D2", "Scroll down to the Reviews section."),
        t("help.step6D3", "Choose a star rating (1–5) and write your feedback."),
        t("help.step6D4", "Click Submit Review — your review helps other shoppers."),
      ],
    },
  ];

  const faqs = [
    {
      q: t("faq.q11", "How do I reset my password?"),
      a: t("faq.a11", 'Click Login → then "Forgot Password?". Enter your registered email and we\'ll send you a reset link within a few minutes.'),
    },
    {
      q: t("faq.q2", "Can I cancel or change my order?"),
      a: t("faq.a2", "Orders can be cancelled or modified while they are in Pending status. Contact us immediately via the Contact page or email shelemaagari@gmail.com."),
    },
    {
      q: t("faq.q4", "What payment methods do you accept?"),
      a: t("faq.a4", "We accept Chapa, CBE Birr, Telebirr, Awash Bank, Bank of Abyssinia, and Cash on Delivery for eligible locations."),
    },
    {
      q: t("faq.q7", "How long does delivery take?"),
      a: t("faq.a7", "Standard delivery within Addis Ababa takes 1–3 business days. Other regions may take 3–7 business days depending on location."),
    },
    {
      q: t("faq.q9", "What is your return policy?"),
      a: t("faq.a9", "You can return defective or incorrect items within 7 days of delivery. Contact us with your order number and photos of the issue."),
    },
    {
      q: t("faq.q13", "How do I contact customer support?"),
      a: t("faq.a13", "Use our Contact page, email shelemaagari@gmail.com, or call +251 974 007 772. We respond within 24 hours."),
    },
    {
      q: t("faq.q5", "Is my payment secure?"),
      a: t("faq.a5", "Yes. All payments are processed by Chapa over HTTPS. We never store your card details on our servers."),
    },
    {
      q: t("faq.q12", "How do I update my profile or address?"),
      a: t("faq.a12", "Go to Account → Profile from the navigation bar. You can update your name, phone, address, and profile photo."),
    },
  ];

  return (
    <div className="help-page">

      {/* Hero */}
      <div className="help-hero">
        <h1>{t("policy.helpTitle", "Help Center")}</h1>
        <p>{t("help.heroSubtitle", "Everything you need to know to shop with confidence at Tech & Electronic.")}</p>
      </div>

      <div className="help-container">

        {/* Step-by-step guide */}
        <section className="help-section">
          <div className="help-section-header">
            <h2>{t("help.howToShop", "How to Shop — Step by Step")}</h2>
            <p>{t("help.howToShopSubtitle", "Follow these steps to go from browsing to doorstep delivery.")}</p>
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
            <h2>{t("policy.faqTitle", "Frequently Asked Questions")}</h2>
            <p>{t("policy.faqSubtitle", "Quick answers to common questions.")}</p>
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
            <h2>{t("policy.stillHaveQuestions", "Still need help?")}</h2>
            <p>{t("help.supportReply24h", "Our support team is here for you. Reach out and we'll get back to you within 24 hours.")}</p>
            <div className="help-cta-actions">
              <Link to="/contact" className="help-cta-btn primary">{t("contact.title", "Contact Us")}</Link>
              <a href="mailto:shelemaagari@gmail.com" className="help-cta-btn secondary">{t("help.emailSupport", "Email Support")}</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Help;
