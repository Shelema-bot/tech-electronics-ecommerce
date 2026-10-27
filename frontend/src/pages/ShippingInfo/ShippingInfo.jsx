import { useTranslation } from "react-i18next";
import "../Terms/Terms.css";

function ShippingInfo() {
  const { t } = useTranslation();

  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-hero">
          <h1>{t("policy.shippingTitle", "Shipping Information")}</h1>
          <p>{t("shippingPolicy.subtitle", "Everything you need to know about delivery.")}</p>
        </div>
        <div className="static-body">

          <section className="static-section">
            <h2>{t("shippingPolicy.areasTitle", "Delivery Areas")}</h2>
            <p>{t("shippingPolicy.areasDesc", "We currently deliver to all areas within Addis Ababa and selected regions across Ethiopia. During checkout, you will be asked to provide your delivery address — please ensure it is accurate to avoid delays.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("shippingPolicy.timesTitle", "Delivery Times")}</h2>
            <ul>
              <li><strong>{t("shippingPolicy.timesL1", "Addis Ababa: 1–3 business days after order confirmation.")}</strong></li>
              <li><strong>{t("shippingPolicy.timesL2", "Other regions: 3–7 business days depending on location.")}</strong></li>
              <li>{t("shippingPolicy.timesL3", "Orders placed on weekends or public holidays are processed the next business day.")}</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("shippingPolicy.feesTitle", "Shipping Fees")}</h2>
            <ul>
              <li><strong>{t("shippingPolicy.feesL1", "Free Shipping on all orders over ETB 5,000.")}</strong></li>
              <li>{t("shippingPolicy.feesL2", "Orders below ETB 5,000 incur a flat shipping fee calculated at checkout.")}</li>
              <li>{t("shippingPolicy.feesL3", "Remote areas may incur additional delivery charges.")}</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>{t("shippingPolicy.trackingTitle", "Order Tracking")}</h2>
            <p>{t("shippingPolicy.trackingDesc", "Once your order is shipped, you can track its status from My Orders page. Status updates include: Pending → Processing → Shipped → Delivered.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("shippingPolicy.damagedTitle", "Damaged or Lost Items")}</h2>
            <p>{t("shippingPolicy.damagedDesc", "If your order arrives damaged or is lost in transit, please contact us within 48 hours at shelemaagari@gmail.com with your order number and photos. We will arrange a replacement or refund promptly.")}</p>
          </section>

          <section className="static-section">
            <h2>{t("contact.title", "Contact Us")}</h2>
            <p>{t("shippingPolicy.contactDesc", "For shipping inquiries: shelemaagari@gmail.com or call +251 974 007 772.")}</p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default ShippingInfo;
