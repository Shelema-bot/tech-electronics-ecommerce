import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./About.css";

const VALUES = [
  { icon: "💻", title: "Latest Technology",   desc: "We carry the newest products with cutting-edge features and top performance, updated every season." },
  { icon: "🚚", title: "Fast Delivery",       desc: "Reliable delivery across Ethiopia. Addis Ababa orders arrive within 1–3 days; nationwide 3–7 days." },
  { icon: "🔒", title: "Secure Payments",     desc: "Multiple verified payment options — Chapa, Telebirr, CBE Birr, BOA, Awash Bank and Cash on Delivery." },
  { icon: "💬", title: "24/7 Support",        desc: "Our team is available around the clock to answer questions, resolve issues, and ensure satisfaction." },
  { icon: "🔄", title: "Easy Returns",        desc: "Not satisfied? Return within 30 days. We make the process simple and hassle-free." },
  { icon: "🛡️", title: "Genuine Products",   desc: "Every item we sell is sourced directly from verified manufacturers and authorized distributors." },
];

const STATS = [
  { number: "500+",   label: "Products in Catalogue" },
  { number: "1,200+", label: "Happy Customers"        },
  { number: "12",     label: "Product Categories"     },
  { number: "24/7",   label: "Customer Support"       },
];

const TEAM_PREVIEW = [
  { name: "Shelema Ageri",   role: "Founder & CEO",     emoji: "👨‍💼" },
  { name: "Tech Team",       role: "Product & Dev",      emoji: "👨‍💻" },
  { name: "Support Team",    role: "Customer Success",   emoji: "🎧" },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="about-page">

      {/* ── Hero section ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-hero-tag">EST. 2024 · ADDIS ABABA</span>
          <h1 className="about-hero-title">
            Ethiopia's Leading <br/>
            <span className="about-hero-highlight">Tech &amp; Electronics</span> Store
          </h1>
          <p className="about-hero-sub">
            We make advanced technology accessible to everyone — bringing
            the world's best gadgets, laptops, smartphones, and accessories
            directly to your doorstep.
          </p>
          <div className="about-hero-btns">
            <Link to="/products" className="about-btn-primary">Browse Products</Link>
            <Link to="/team"     className="about-btn-outline">Meet the Team</Link>
          </div>
        </div>

        {/* Floating tech icons */}
        <div className="about-hero-icons" aria-hidden="true">
          {["💻","📱","🎮","🎧","📷","⌚","🚁","🏠"].map((icon, i) => (
            <span key={i} className="about-float-icon" style={{ animationDelay: `${i * 0.4}s` }}>{icon}</span>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="about-stats-strip">
        <div className="about-stats-inner">
          {STATS.map(s => (
            <div key={s.label} className="about-stat">
              <div className="about-stat-number">{s.number}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission section ── */}
      <section className="about-section about-mission">
        <div className="about-section-inner">
          <div className="about-mission-text">
            <span className="about-section-tag">Our Mission</span>
            <h2>Technology for Everyone</h2>
            <p>
              At Tech &amp; Electronic, we believe that everyone deserves access to the
              latest technology. Our mission is to bridge the gap between cutting-edge
              products and everyday consumers in Ethiopia by offering a seamless,
              trustworthy, and affordable online shopping experience.
            </p>
            <p>
              We partner with verified manufacturers and authorized distributors
              to guarantee authenticity on every single product. Whether you're a
              student buying your first laptop, a business upgrading its network,
              or a tech enthusiast hunting the latest gadget — we've got you covered.
            </p>
          </div>
          <div className="about-mission-image">
            <img
              src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80"
              alt="Tech products"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── Values grid ── */}
      <section className="about-section about-values">
        <div className="about-section-inner about-section-center">
          <span className="about-section-tag">Why Choose Us</span>
          <h2>What Sets Us Apart</h2>
          <p className="about-section-sub">
            We combine technology with exceptional service to build a store our customers can trust.
          </p>
          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="about-value-card">
                <div className="about-value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team preview ── */}
      <section className="about-section about-team">
        <div className="about-section-inner about-section-center">
          <span className="about-section-tag">Our People</span>
          <h2>The Team Behind the Store</h2>
          <p className="about-section-sub">
            A passionate group of tech lovers dedicated to delivering the best shopping experience.
          </p>
          <div className="about-team-grid">
            {TEAM_PREVIEW.map((m, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar">{m.emoji}</div>
                <div className="about-team-name">{m.name}</div>
                <div className="about-team-role">{m.role}</div>
              </div>
            ))}
          </div>
          <Link to="/team" className="about-btn-primary" style={{ marginTop:32, display:"inline-block" }}>
            Meet the Full Team →
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <h2>Ready to Start Shopping?</h2>
          <p>Explore 500+ tech products with free delivery on orders over ETB 5,000.</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginTop:24 }}>
            <Link to="/products" className="about-btn-white">Browse Products</Link>
            <Link to="/contact"  className="about-btn-outline-white">Contact Us</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
