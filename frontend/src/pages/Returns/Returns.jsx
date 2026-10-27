import { useTranslation } from "react-i18next";
import "../Terms/Terms.css";

function Returns() {
  const { t } = useTranslation();

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-hero">
          <h1>{t("policy.returnsTitle", "Returns & Refunds")}</h1>
          <p>{t("returnsPolicy.subtitle", "Our hassle-free return and refund policy.")}</p>
        </div>
        <div className="static-body">

          <section className="static-section">
            <h2>{t("returnsPolicy.eligibilityTitle", "Return Eligibility")}</h2>
            <p>{t("returnsPolicy.eligibilityDesc", "Items may be returned within 7 days of delivery if they meet the following conditions:")}</p>
            <ul>
              <li>{t("returnsPolicy.eligibilityL1", "The item is defective, damaged, or significantly different from its description.")}</li>
              <li>{t("returnsPolicy.eligibilityL2", "The item is unused and in its original packaging.")}</li>
              <li>{t("returnsPolicy.eligibilityL3", "All original accessories, manuals, and tags are included.")}</li>
            </ul>
            <p>{t("returnsPolicy.eligibilityExcl", "Items that cannot be returned include: software, downloadable products, and items marked as final sale.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("returnsPolicy.howTitle", "How to Return an Item")}</h2>
            <ul>
              <li>{t("returnsPolicy.howL1", "Email shelemaagari@gmail.com with your order number and a brief description of the issue.")}</li>
              <li>{t("returnsPolicy.howL2", "Attach clear photos of the item showing the defect or damage.")}</li>
              <li>{t("returnsPolicy.howL3", "Our team will respond within 24 hours with return instructions.")}</li>
              <li>{t("returnsPolicy.howL4", "Once we receive and inspect the item, we will process your refund.")}</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("returnsPolicy.refundTitle", "Refund Policy")}</h2>
            <ul>
              <li>{t("returnsPolicy.refundL1", "Approved refunds are processed within 5–10 business days.")}</li>
              <li>{t("returnsPolicy.refundL2", "Refunds are issued to the original payment method.")}</li>
              <li>{t("returnsPolicy.refundL3", "Chapa payments are refunded to your Chapa wallet or card.")}</li>
              <li>{t("returnsPolicy.refundL4", "Cash on Delivery refunds are issued via bank transfer or mobile money.")}</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("returnsPolicy.exchangeTitle", "Exchange Policy")}</h2>
            <p>{t("returnsPolicy.exchangeDesc", "We offer exchanges for defective or incorrect items. If you prefer an exchange over a refund, let us know when you contact us and we will arrange it subject to stock availability.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("contact.title", "Contact Us")}</h2>
            <p>{t("returnsPolicy.contactDesc", "Return & refund inquiries: shelemaagari@gmail.com or +251 974 007 772.")}</p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Returns;
