import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const { clearCart } = useCart();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [orderId, setOrderId] = useState("");
  const [txRef, setTxRef] = useState("");
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    const verify = async () => {
      const tx = params.get("tx_ref");
      const pending = localStorage.getItem("pendingOrder");

      if (pending) setOrderId(pending);
      if (tx) setTxRef(tx);

      if (!tx) {
        setStatus("success");
        return;
      }

      try {
        await API.get(`/payments/verify?tx_ref=${tx}`);
      } catch (e) {
        console.log("verify:", e.message);
      } finally {
        localStorage.removeItem("pendingOrder");
        clearCart();
        setStatus("success");
      }
    };

    verify();
  }, []); // empty deps — run once only

  if (status === "loading") {
    return (
      <div className="payment-success">
        <div className="ps-spinner" />
        <p>Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="ps-icon success-bounce">🎉</div>
      <h1 className="ps-title">Payment Successful!</h1>
      <p className="ps-subtitle">Your order has been confirmed and is being processed.</p>

      {txRef && (
        <div className="ps-detail-box">
          <div className="ps-detail-row">
            <span>Transaction Ref</span>
            <strong>{txRef}</strong>
          </div>
          {orderId && (
            <div className="ps-detail-row">
              <span>Order ID</span>
              <strong>{orderId}</strong>
            </div>
          )}
        </div>
      )}

      <p className="ps-thanks">Thank you for shopping with <b>Tech &amp; Electronic</b>.</p>

      <div className="ps-actions">
        <Link to="/my-orders" className="ps-btn primary">📦 View My Orders</Link>
        <Link to="/products" className="ps-btn secondary">🛍️ Continue Shopping</Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;
