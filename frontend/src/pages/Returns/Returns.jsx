import "../Terms/Terms.css";

function Returns() {
  return (
    <div className="static-page">
      <div className="static-container">
        <div className="static-hero">
          <h1>Returns &amp; Refunds</h1>
          <p>Our hassle-free return and refund policy.</p>
        </div>
        <div className="static-body">

          <section className="static-section">
            <h2>Return Eligibility</h2>
            <p>Items may be returned within <strong>7 days of delivery</strong> if they meet the following conditions:</p>
            <ul>
              <li>The item is defective, damaged, or significantly different from its description.</li>
              <li>The item is unused and in its original packaging.</li>
              <li>All original accessories, manuals, and tags are included.</li>
            </ul>
            <p>Items that cannot be returned include: software, downloadable products, and items marked as final sale.</p>
          </section>

          <section className="static-section">
            <h2>How to Return an Item</h2>
            <ul>
              <li>Email <a href="mailto:shelemaagari@gmail.com">shelemaagari@gmail.com</a> with your order number and a brief description of the issue.</li>
              <li>Attach clear photos of the item showing the defect or damage.</li>
              <li>Our team will respond within 24 hours with return instructions.</li>
              <li>Once we receive and inspect the item, we will process your refund.</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>Refund Policy</h2>
            <ul>
              <li>Approved refunds are processed within <strong>5–10 business days</strong>.</li>
              <li>Refunds are issued to the original payment method.</li>
              <li>Chapa payments are refunded to your Chapa wallet or card.</li>
              <li>Cash on Delivery refunds are issued via bank transfer or mobile money.</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>Exchange Policy</h2>
            <p>We offer exchanges for defective or incorrect items. If you prefer an exchange over a refund, let us know when you contact us and we will arrange it subject to stock availability.</p>
          </section>

          <section className="static-section">
            <h2>Contact Us</h2>
            <p>Return & refund inquiries: <a href="mailto:shelemaagari@gmail.com">shelemaagari@gmail.com</a> or <strong>+251 974 007 772</strong>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Returns;
