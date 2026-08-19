import "./Privacy.css";

function Privacy() {
  return (
    <div className="static-page">
      <div className="static-container">

        <div className="static-hero">
          <h1>Privacy Policy</h1>
          <p>Last updated: July 2026</p>
        </div>

        <div className="static-body">

          <section className="static-section">
            <h2>1. Introduction</h2>
            <p>
              Tech &amp; Electronic ("we", "us", "our") respects your privacy and is
              committed to protecting your personal data. This Privacy Policy explains
              how we collect, use, and safeguard your information when you use our
              website.
            </p>
          </section>

          <section className="static-section">
            <h2>2. Information We Collect</h2>
            <p>We may collect the following information:</p>
            <ul>
              <li><strong>Account data:</strong> Name, email address, password (hashed).</li>
              <li><strong>Order data:</strong> Shipping address, phone number, order history.</li>
              <li><strong>Payment data:</strong> Transaction reference numbers (we do not store full card details).</li>
              <li><strong>Usage data:</strong> Pages visited, search queries, browser type, IP address.</li>
              <li><strong>Communications:</strong> Messages you send through our Contact form.</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To process and fulfill your orders.</li>
              <li>To send order confirmations and shipping updates.</li>
              <li>To respond to your inquiries and support requests.</li>
              <li>To improve our website, products, and services.</li>
              <li>To detect and prevent fraudulent transactions.</li>
              <li>To send occasional promotional emails (you may opt out at any time).</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>4. Data Sharing</h2>
            <p>
              We do not sell or rent your personal data. We may share data with:
            </p>
            <ul>
              <li><strong>Payment processors</strong> (Chapa) to handle transactions securely.</li>
              <li><strong>Delivery partners</strong> to fulfill shipments.</li>
              <li><strong>Cloud service providers</strong> (e.g., Cloudinary for image hosting) under strict data agreements.</li>
              <li><strong>Authorities</strong> when required by law.</li>
            </ul>
          </section>

          <section className="static-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as
              needed to provide services. You may request deletion of your account and
              associated data at any time by contacting us.
            </p>
          </section>

          <section className="static-section">
            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar technologies to keep you logged in, remember
              your preferences, and analyze site traffic. You can control cookie settings
              in your browser, but disabling cookies may affect site functionality.
            </p>
          </section>

          <section className="static-section">
            <h2>7. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS, password
              hashing (bcrypt), and JWT-based authentication. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="static-section">
            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:shelemaagari@gmail.com">shelemaagari@gmail.com</a>.
            </p>
          </section>

          <section className="static-section">
            <h2>9. Third-Party Links</h2>
            <p>
              Our Site may contain links to third-party websites. We are not responsible
              for the privacy practices or content of those sites. We encourage you to
              review their privacy policies.
            </p>
          </section>

          <section className="static-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you
              of significant changes by posting the new policy on this page with an
              updated date.
            </p>
          </section>

          <section className="static-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, contact us at{" "}
              <a href="mailto:shelemaagari@gmail.com">shelemaagari@gmail.com</a> or
              call <strong>+251 974 007 772</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Privacy;
