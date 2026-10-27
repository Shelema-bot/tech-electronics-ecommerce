import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./About.css";

export default function About() {
  const { t } = useTranslation();

  const VALUES = [
    { icon: "💻", title: t("about.v1Title", "Latest Technology"),   desc: t("about.v1Desc", "We carry the newest products with cutting-edge features and top performance, updated every season.") },
    { icon: "🚚", title: t("about.v2Title", "Fast Delivery"),       desc: t("about.v2Desc", "Reliable delivery across Ethiopia. Addis Ababa orders arrive within 1–3 days; nationwide 3–7 days.") },
    { icon: "🔒", title: t("about.v3Title", "Secure Payments"),     desc: t("about.v3Desc", "Multiple verified payment options — Chapa, Telebirr, CBE Birr, BOA, Awash Bank and Cash on Delivery.") },
    { icon: "💬", title: t("about.v4Title", "24/7 Support"),        desc: t("about.v4Desc", "Our team is available around the clock to answer questions, resolve issues, and ensure satisfaction.") },
    { icon: "🔄", title: t("about.v5Title", "Easy Returns"),        desc: t("about.v5Desc", "Not satisfied? Return within 30 days. We make the process simple and hassle-free.") },
    { icon: "🛡️", title: t("about.v6Title", "Genuine Products"),   desc: t("about.v6Desc", "Every item we sell is sourced directly from verified manufacturers and authorized distributors.") },
  ];

  const STATS = [
    { number: "500+",   label: t("about.stat1", "Products in Catalogue") },
    { number: "1,200+", label: t("about.stat2", "Happy Customers")        },
    { number: "12",     label: t("about.stat3", "Product Categories")     },
    { number: "24/7",   label: t("about.stat4", "Customer Support")       },
  ];

  const TEAM_PREVIEW = [
    { name: "Shelema Ageri", role: "Founder & CEO",   emoji: "👨‍💼" },
    { name: "Tech Team",     role: "Product & Dev",    emoji: "👨‍💻" },
    { name: "Support Team",  role: "Customer Success", emoji: "🎧" },
  ];

  return (
    <div className="about-page">

      {/* ── Hero section ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-hero-tag">{t("about.est", "EST. 2024 · ADDIS ABABA")}</span>
          <h1 className="about-hero-title">
            {t("about.heroTitle", "Ethiopia's Leading Tech & Electronics Store")}
          </h1>
          <p className="about-hero-sub">
            {t("about.heroSub", "We make advanced technology accessible to everyone — bringing the world's best gadgets, laptops, smartphones, and accessories directly to your doorstep.")}
          </p>
          <div className="about-hero-btns">
            <Link to="/products" className="about-btn-primary">{t("product.browseProducts", "Browse Products")}</Link>
            <Link to="/team"     className="about-btn-outline">{t("nav.team", "Meet the Team")}</Link>
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
        <div className="about-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="about-stat-card">
              <span className="about-stat-num">{s.number}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission & Story ── */}
      <section className="about-story-section">
        <div className="about-section-container">
          <div className="about-story-grid">
            <div className="about-story-text">
              <span className="about-section-tag">{t("about.storyTitle", "Our Story")}</span>
              <h2>{t("about.heroTitle", "Ethiopia's Leading Tech & Electronics Store")}</h2>
              <p>{t("about.storyP1", "Founded in Addis Ababa, Tech & Electronic was created to bridge the gap between world-class technology and Ethiopian customers. We believe that access to high-quality electronics shouldn't be complicated or expensive.")}</p>
              <p>{t("about.storyP2", "From individual consumers shopping for their first laptop to tech enthusiasts and growing businesses needing reliable hardware, we provide carefully curated, 100% genuine products backed by local warranties and responsive customer support.")}</p>
            </div>
            <div className="about-story-cards">
              <div className="about-mission-card">
                <span className="about-card-badge">🎯 {t("about.missionTitle", "Our Mission")}</span>
                <p>{t("about.missionDesc", "To deliver genuine, premium electronics at fair prices with fast delivery, localized payment options, and exceptional service to every corner of Ethiopia.")}</p>
              </div>
              <div className="about-mission-card vision">
                <span className="about-card-badge">👁️ {t("about.visionTitle", "Our Vision")}</span>
                <p>{t("about.visionDesc", "To become Ethiopia's most trusted and customer-centric e-commerce destination for consumer electronics and digital technology.")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values Grid ── */}
      <section className="about-values-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <span className="about-section-tag">{t("trust.whyShopWithUs", "Why Choose Us")}</span>
            <h2>{t("trust.title", "Why Shop with Tech & Electronic?")}</h2>
            <p>{t("hero.subtitle", "Shop the latest smartphones, laptops, accessories, gaming devices and networking equipment at the best prices.")}</p>
          </div>
          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="about-val-card">
                <span className="about-val-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Preview ── */}
      <section className="about-team-preview">
        <div className="about-section-container">
          <div className="about-section-header">
            <span className="about-section-tag">{t("nav.team", "Our Team")}</span>
            <h2>{t("nav.team", "Meet the Leadership")}</h2>
            <p>{t("help.supportReply24h", "Our support team is here for you.")}</p>
          </div>
          <div className="about-team-grid">
            {TEAM_PREVIEW.map((m, i) => (
              <div key={i} className="about-member-card">
                <span className="about-member-emoji">{m.emoji}</span>
                <h3>{m.name}</h3>
                <p>{m.role}</p>
              </div>
            ))}
          </div>
          <div className="about-team-cta">
            <Link to="/team" className="about-btn-primary">{t("nav.team", "Meet the Full Team")} →</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
