import { useState } from "react";
import { Link } from "react-router-dom";
import "../Terms/Terms.css";
import "./FAQ.css";

const faqs = [
  { cat: "Orders", q: "How do I place an order?", a: "Browse products, add items to your cart, go to Checkout, fill in your delivery details, choose a payment method, and confirm your order. You will receive an email confirmation." },
  { cat: "Orders", q: "Can I cancel or modify my order?", a: "Orders can be cancelled or modified while in Pending status. Go to My Orders and contact us immediately at shelemaagari@gmail.com or call +251 974 007 772." },
  { cat: "Orders", q: "How do I track my order?", a: "Log in and go to My Orders. Each order shows its current status: Pending, Processing, Shipped, or Delivered." },
  { cat: "Payment", q: "What payment methods do you accept?", a: "We accept Chapa (online card/mobile payment) and Cash on Delivery for eligible locations." },
  { cat: "Payment", q: "Is my payment secure?", a: "Yes. All online payments are processed by Chapa over HTTPS with bank-level encryption. We never store your card details." },
  { cat: "Payment", q: "When will I be charged?", a: "For Chapa payments, you are charged immediately upon placing the order. For Cash on Delivery, payment is collected upon delivery." },
  { cat: "Shipping", q: "How long does delivery take?", a: "Within Addis Ababa: 1–3 business days. Other regions: 3–7 business days." },
  { cat: "Shipping", q: "Do you offer free shipping?", a: "Yes! Free shipping on all orders over ETB 5,000. Standard shipping fees apply to smaller orders." },
  { cat: "Returns", q: "What is your return policy?", a: "You can return defective or incorrect items within 7 days of delivery. Contact us with your order number and photos of the item." },
  { cat: "Returns", q: "How long do refunds take?", a: "Approved refunds are processed within 5–10 business days to the original payment method." },
  { cat: "Account", q: "How do I reset my password?", a: 'Click Login → "Forgot Password?". Enter your email and we\'ll send a reset link within minutes.' },
  { cat: "Account", q: "How do I update my profile or address?", a: "Go to Account → Profile from the navigation bar to update your name, phone, address, and profile photo." },
];

const cats = ["All", ...Array.from(new Set(faqs.map((f) => f.cat)))];

function FAQ() {
  const [open, setOpen] = useState(null);
  const [activeCat, setActiveCat] = useState("All");

  const filtered = activeCat === "All" ? faqs : faqs.filter((f) => f.cat === activeCat);

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-hero">
          <h1>Frequently Asked Questions</h1>
          <p>Quick answers to the most common questions.</p>
        </div>

        <div className="faq-page-body">
          {/* Category filter */}
          <div className="faq-cats">
            {cats.map((c) => (
              <button
                key={c}
                className={`faq-cat-btn ${activeCat === c ? "active" : ""}`}
                onClick={() => { setActiveCat(c); setOpen(null); }}
              >
                {c}
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
            <p>Still have questions? <Link to="/contact">Contact our support team</Link> — we respond within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
