import { useSearchParams, Link } from "react-router-dom";
import "./PaymentResult.css";

/**
 * PaymentResult — shows the correct result screen for each payment type.
 * ?type=chapa    — Chapa verified payment
 * ?type=cod      — Cash on Delivery order placed
 * ?type=manual   — Manual payment proof submitted, pending verification
 */
function PaymentResult() {
  const [params] = useSearchParams();
  const type      = params.get("type")      || "chapa";
  const orderId   = params.get("orderId")   || "";
  const paymentId = params.get("paymentId") || "";

  // ── Chapa / auto verified ────────────────────────────────────
  if (type === "chapa") {
    return (
      <div className="pr-page">
        <div className="pr-card">
          <div className="pr-icon">🎉</div>
          <h1 className="pr-title pr-success">Payment Verified!</h1>
          <p className="pr-subtitle">Your Chapa payment has been verified and your order is confirmed.</p>
          {orderId && (
            <div className="pr-info-box">
              <div className="pr-info-row"><span>Order ID</span><strong>{orderId}</strong></div>
            </div>
          )}
          <p className="pr-note">A confirmation email has been sent to your email address.</p>
          <div className="pr-actions">
            <Link to="/my-orders" className="pr-btn primary">📦 View My Orders</Link>
            <Link to="/products"  className="pr-btn secondary">🛍️ Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Cash on Delivery ──────────────────────────────────────────
  if (type === "cod") {
    return (
      <div className="pr-page">
        <div className="pr-card">
          <div className="pr-icon">🚚</div>
          <h1 className="pr-title pr-cod">Order Placed!</h1>
          <p className="pr-subtitle">Your order has been placed successfully.</p>
          <div className="pr-status-banner cod">
            💵 Cash on Delivery — Payment due upon delivery
          </div>
          {orderId && (
            <div className="pr-info-box">
              <div className="pr-info-row"><span>Order ID</span><strong>{orderId}</strong></div>
              <div className="pr-info-row"><span>Payment</span><strong>Collect on Delivery</strong></div>
            </div>
          )}
          <p className="pr-note">Please have the exact amount ready when your order arrives.</p>
          <div className="pr-actions">
            <Link to="/my-orders" className="pr-btn primary">📦 View My Orders</Link>
            <Link to="/products"  className="pr-btn secondary">🛍️ Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Manual payment (Telebirr, CBE, BOA, etc.) ─────────────────
  return (
    <div className="pr-page">
      <div className="pr-card">
        <div className="pr-icon">📋</div>
        <h1 className="pr-title pr-pending">Payment Proof Submitted</h1>
        <p className="pr-subtitle">Your payment proof has been received and is being reviewed.</p>
        <div className="pr-status-banner pending">
          🟡 Status: Pending Verification
        </div>
        {paymentId && (
          <div className="pr-info-box">
            <div className="pr-info-row"><span>Payment ID</span><strong>{paymentId}</strong></div>
          </div>
        )}
        <div className="pr-steps">
          <div className="pr-step done">✅ Order Created</div>
          <div className="pr-step done">✅ Payment Proof Submitted</div>
          <div className="pr-step current">🟡 Admin Verification</div>
          <div className="pr-step">⏳ Order Confirmation</div>
        </div>
        <p className="pr-note">
          Our team will verify your payment and notify you when it is approved.
          <br />Do <strong>not</strong> submit multiple times.
        </p>
        <div className="pr-actions">
          <Link to="/payment-history" className="pr-btn primary">💳 View Payment Status</Link>
          <Link to="/my-orders"       className="pr-btn secondary">📦 My Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentResult;
