import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../Terms/Terms.css";
import "./FAQ.css";

function FAQ() {
  const [open, setOpen]           = useState(null);
  const [activeCat, setActiveCat] = useState("All");
  const { t }                     = useTranslation();

  const faqs = [
    { cat: "Orders",   catLabel: t("faq.orders", "Orders"),     q: t("faq.q1", "How do I place an order?"), a: t("faq.a1", "Browse products, add items to your cart, go to Checkout, fill in your delivery details, choose a payment method, and confirm your order. You will receive an email confirmation.") },
    { cat: "Orders",   catLabel: t("faq.orders", "Orders"),     q: t("faq.q2", "Can I cancel or modify my order?"), a: t("faq.a2", "Orders can be cancelled or modified while in Pending status. Go to My Orders and contact us immediately at shelemaagari@gmail.com or call +251 974 007 772.") },
    { cat: "Orders",   catLabel: t("faq.orders", "Orders"),     q: t("faq.q3", "How do I track my order?"), a: t("faq.a3", "Log in and go to My Orders. Each order shows its current status: Pending, Processing, Shipped, or Delivered.") },
    { cat: "Payment",  catLabel: t("faq.payment", "Payment"),   q: t("faq.q4", "What payment methods do you accept?"), a: t("faq.a4", "We accept Chapa, CBE Birr, Telebirr, Awash Bank, Bank of Abyssinia, and Cash on Delivery for eligible locations.") },
    { cat: "Payment",  catLabel: t("faq.payment", "Payment"),   q: t("faq.q5", "Is my payment secure?"), a: t("faq.a5", "Yes. All online payments are processed by Chapa over HTTPS with bank-level encryption. We never store your card details.") },
    { cat: "Payment",  catLabel: t("faq.payment", "Payment"),   q: t("faq.q6", "When will I be charged?"), a: t("faq.a6", "For online payments, you are charged immediately upon placing the order. For Cash on Delivery, payment is collected upon delivery.") },
    { cat: "Shipping", catLabel: t("faq.shipping", "Shipping"), q: t("faq.q7", "How long does delivery take?"), a: t("faq.a7", "Within Addis Ababa: 1–3 business days. Other regions: 3–7 business days.") },
    { cat: "Shipping", catLabel: t("faq.shipping", "Shipping"), q: t("faq.q8", "Do you offer free shipping?"), a: t("faq.a8", "Yes! Free shipping on all orders over ETB 5,000. Standard shipping fees apply to smaller orders.") },
    { cat: "Returns",  catLabel: t("faq.returns", "Returns"),   q: t("faq.q9", "What is your return policy?"), a: t("faq.a9", "You can return defective or incorrect items within 7 days of delivery. Contact us with your order number and photos of the item.") },
    { cat: "Returns",  catLabel: t("faq.returns", "Returns"),   q: t("faq.q10", "How long do refunds take?"), a: t("faq.a10", "Approved refunds are processed within 5–10 business days to the original payment method.") },
    { cat: "Account",  catLabel: t("faq.account", "Account"),   q: t("faq.q11", "How do I reset my password?"), a: t("faq.a11", "Click Login → 'Forgot Password?'. Enter your email and we'll send a reset link within minutes.") },
    { cat: "Account",  catLabel: t("faq.account", "Account"),   q: t("faq.q12", "How do I update my profile or address?"), a: t("faq.a12", "Go to Account → Profile from the navigation bar to update your name, phone, address, and profile photo.") },
  ];

  const catOptions = [
    { key: "All",      label: t("common.all", "All") },
    { key: "Orders",   label: t("faq.orders", "Orders") },
    { key: "Payment",  label: t("faq.payment", "Payment") },
    { key: "Shipping", label: t("faq.shipping", "Shipping") },
    { key: "Returns",  label: t("faq.returns", "Returns") },
    { key: "Account",  label: t("faq.account", "Account") },
  ];

  const filtered = activeCat === "All" ? faqs : faqs.filter((f) => f.cat === activeCat);

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-hero">
          <h1>{t("policy.faqTitle", "Frequently Asked Questions")}</h1>
          <p>{t("policy.faqSubtitle", "Quick answers to the most common questions.")}</p>
        </div>

        <div className="faq-page-body">
          {/* Category filter */}
          <div className="faq-cats">
            {catOptions.map((c) => (
              <button
                key={c.key}
                className={`faq-cat-btn ${activeCat === c.key ? "active" : ""}`}
                onClick={() => { setActiveCat(c.key); setOpen(null); }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="faq-list-standalone">
            {filtered.map((faq, i) => (
              <div className={`faq-item-s ${open === i ? "open" : ""}`} key={i}>
                <button className="faq-q-s" onClick={() => setOpen(open === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-arr">{open === i ? "▲" : "▼"}</span>
                </button>
                {open === i && <div className="faq-a-s">{faq.a}</div>}
              </div>
            ))}
          </div>

          <div className="faq-contact-note">
            <p>
              {t("policy.stillHaveQuestions", "Still have questions?")}{" "}
              <Link to="/contact">{t("policy.contactSupport", "Contact our support team")}</Link> {t("faq.respondWithin24h", "— we respond within 24 hours.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
