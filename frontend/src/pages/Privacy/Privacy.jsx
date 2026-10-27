import { useTranslation } from "react-i18next";
import "./Privacy.css";

function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="static-page">
      <div className="static-container">

        <div className="static-hero">
          <h1>{t("policy.privacyTitle", "Privacy Policy")}</h1>
          <p>{t("privacyPolicy.lastUpdated", "Last updated: July 2026")}</p>
        </div>

        <div className="static-body">

          <section className="static-section">
            <h2>{t("privacyPolicy.s1Title", "1. Introduction")}</h2>
            <p>{t("privacyPolicy.s1Desc", "Tech & Electronic ('we', 'us', 'our') respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("privacyPolicy.s2Title", "2. Information We Collect")}</h2>
            <p>{t("privacyPolicy.s2Desc", "We may collect the following information:")}</p>
            <ul>
              <li><strong>{t("privacyPolicy.s2L1", "Account data: Name, email address, password (hashed).")}</strong></li>
              <li><strong>{t("privacyPolicy.s2L2", "Order data: Shipping address, phone number, order history.")}</strong></li>
              <li><strong>{t("privacyPolicy.s2L3", "Payment data: Transaction reference numbers (we do not store full card details).")}</strong></li>
              <li><strong>{t("privacyPolicy.s2L4", "Usage data: Pages visited, search queries, browser type, IP address.")}</strong></li>
              <li><strong>{t("privacyPolicy.s2L5", "Communications: Messages you send through our Contact form.")}</strong></li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("privacyPolicy.s3Title", "3. How We Use Your Information")}</h2>
            <ul>
              <li>{t("privacyPolicy.s3L1", "To process and fulfill your orders.")}</li>
              <li>{t("privacyPolicy.s3L2", "To send order confirmations and shipping updates.")}</li>
              <li>{t("privacyPolicy.s3L3", "To respond to your inquiries and support requests.")}</li>
              <li>{t("privacyPolicy.s3L4", "To improve our website, products, and services.")}</li>
              <li>{t("privacyPolicy.s3L5", "To detect and prevent fraudulent transactions.")}</li>
              <li>{t("privacyPolicy.s3L6", "To send occasional promotional emails (you may opt out at any time).")}</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("privacyPolicy.s4Title", "4. Data Sharing")}</h2>
            <p>{t("privacyPolicy.s4Desc", "We do not sell or rent your personal data. We may share data with:")}</p>
            <ul>
              <li>{t("privacyPolicy.s4L1", "Payment processors (Chapa) to handle transactions securely.")}</li>
              <li>{t("privacyPolicy.s4L2", "Delivery partners to fulfill shipments.")}</li>
              <li>{t("privacyPolicy.s4L3", "Cloud service providers (e.g., Cloudinary for image hosting) under strict data agreements.")}</li>
              <li>{t("privacyPolicy.s4L4", "Authorities when required by law.")}</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("privacyPolicy.s5Title", "5. Data Security")}</h2>
            <p>{t("privacyPolicy.s5Desc", "We implement industry-standard technical measures, including HTTPS encryption and secure password hashing, to protect your personal data from unauthorized access, alteration, or disclosure.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("privacyPolicy.s6Title", "6. Your Rights")}</h2>
            <p>{t("privacyPolicy.s6Desc", "You have the right to access, update, or request deletion of your personal information at any time through your Profile page or by contacting us.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("privacyPolicy.s7Title", "7. Contact Us")}</h2>
            <p>{t("privacyPolicy.s7Desc", "If you have any questions about this Privacy Policy, please contact us at shelemaagari@gmail.com or call +251 974 007 772.")}</p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Privacy;
