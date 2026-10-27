import { useTranslation } from "react-i18next";
import "./Terms.css";

function Terms() {
  const { t } = useTranslation();

  return (
    <div className="static-page">
      <div className="static-container">

        <div className="static-hero">
          <h1>{t("policy.termsTitle", "Terms & Conditions")}</h1>
          <p>{t("termsPolicy.lastUpdated", "Last updated: July 2026")}</p>
        </div>

        <div className="static-body">

          <section className="static-section">
            <h2>{t("termsPolicy.s1Title", "1. Acceptance of Terms")}</h2>
            <p>{t("termsPolicy.s1Desc", "By accessing and using Tech & Electronic ('the Site'), you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the Site immediately.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s2Title", "2. Use of the Site")}</h2>
            <p>{t("termsPolicy.s2Desc", "You agree to use this Site only for lawful purposes. You must not:")}</p>
            <ul>
              <li>{t("termsPolicy.s2L1", "Use the Site in any way that violates applicable local, national, or international laws.")}</li>
              <li>{t("termsPolicy.s2L2", "Transmit any unsolicited or unauthorized advertising material.")}</li>
              <li>{t("termsPolicy.s2L3", "Attempt to gain unauthorized access to any part of the Site or its related systems.")}</li>
              <li>{t("termsPolicy.s2L4", "Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site.")}</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s3Title", "3. Account Registration")}</h2>
            <p>{t("termsPolicy.s3Desc", "To place orders, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately if you suspect unauthorized use.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s4Title", "4. Products & Pricing")}</h2>
            <p>{t("termsPolicy.s4Desc", "We make every effort to display products accurately. However, we do not warrant that product descriptions, images, or prices are error-free. All prices are listed in Ethiopian Birr (ETB) and are subject to change without notice. We reserve the right to cancel orders containing pricing errors.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s5Title", "5. Orders & Payment")}</h2>
            <p>{t("termsPolicy.s5Desc", "By placing an order you confirm you are legally capable of entering into binding contracts. We accept payment via Chapa, bank transfers, and Cash on Delivery. An order confirmation will be sent upon receipt of your order.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s6Title", "6. Intellectual Property")}</h2>
            <p>{t("termsPolicy.s6Desc", "All content on the Site — text, graphics, logos, images, and software — is the property of Tech & Electronic or its content suppliers and is protected by applicable copyright and trademark laws.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s7Title", "7. Limitation of Liability")}</h2>
            <p>{t("termsPolicy.s7Desc", "Tech & Electronic shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use this Site or products purchased through it.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s8Title", "8. Changes to Terms")}</h2>
            <p>{t("termsPolicy.s8Desc", "We reserve the right to modify these Terms at any time. Continued use of the Site after any changes constitutes acceptance of the new Terms.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("termsPolicy.s9Title", "9. Contact Us")}</h2>
            <p>{t("termsPolicy.s9Desc", "If you have any questions regarding these Terms, contact us at shelemaagari@gmail.com or call +251 974 007 772.")}</p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Terms;
