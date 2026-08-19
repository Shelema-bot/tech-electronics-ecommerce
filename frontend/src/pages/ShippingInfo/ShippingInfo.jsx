import "../Terms/Terms.css";

function ShippingInfo() {
  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-hero">
          <h1>Shipping Information</h1>
          <p>Everything you need to know about delivery.</p>
        </div>
        <div className="static-body">

          <section className="static-section">
            <h2>Delivery Areas</h2>
            <p>We currently deliver to all areas within Addis Ababa and selected regions across Ethiopia. During checkout, you will be asked to provide your delivery address — please ensure it is accurate to avoid delays.</p>
          </section>

          <section className="static-section">
            <h2>Delivery Times</h2>
            <ul>
              <li><strong>Addis Ababa:</strong> 1–3 business days after order confirmation.</li>
              <li><strong>Other regions:</strong> 3–7 business days depending on location.</li>
              <li>Orders placed on weekends or public holidays are processed the next business day.</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>Shipping Fees</h2>
            <ul>
              <li><strong>Free Shipping</strong> on all orders over ETB 5,000.</li>
              <li>Orders below ETB 5,000 incur a flat shipping fee calculated at checkout.</li>
              <li>Remote areas may incur additional delivery charges.</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>Order Tracking</h2>
            <p>Once your order is shipped, you can track its status from <strong>My Orders</strong> page. Status updates include: Pending → Processing → Shipped → Delivered.</p>
          </section>

          <section className="static-section">
            <h2>Damaged or Lost Items</h2>
            <p>If your order arrives damaged or is lost in transit, please contact us within 48 hours at <a href="mailto:shelemaagari@gmail.com">shelemaagari@gmail.com</a> with your order number and photos. We will arrange a replacement or refund promptly.</p>
          </section>

          <section className="static-section">
            <h2>Contact Us</h2>
            <p>For shipping inquiries: <a href="mailto:shelemaagari@gmail.com">shelemaagari@gmail.com</a> or call <strong>+251 974 007 772</strong>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default ShippingInfo;
