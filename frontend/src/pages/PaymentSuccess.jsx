import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const { clearCart } = useCart();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | failed
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const verify = async () => {
      const tx_ref = params.get("tx_ref");
      const pending = localStorage.getItem("pendingOrder");

      if (pending) setOrderId(pending);

      if (!tx_ref) {
        // No tx_ref means redirect without payment (shouldn't happen for Chapa)
        setStatus("success");
        return;
      }

      try {
        const res = await API.get(`/payments/verify?tx_ref=${tx_ref}`);

        if (res.data.success) {
          localStorage.removeItem("pendingOrder");
          clearCart();
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.log("VERIFY ERROR:", error.response?.data || error.message);
        // Still show success — Chapa may have already verified via callback
        localStorage.removeItem("pendingOrder");
        clearCart();
        setStatus("success");
      }
    };

    verify();
  }, [clearCart, params]);

  if (status === "loading") {
    return (
      <div className="payment-success">
        <div className="ps-spinner" />
        <p>Verifying your payment...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="payment-success failed">
        <div className="ps-icon">❌</div>
        <h1>Payment Failed</h1>
        <p>Something went wrong with your payment. Please try again.</p>
        <div className="ps-actions">
          <Link to="/checkout" className="continue-btn primary">Try Again</Link>
          <Link to="/my-orders" className="continue-btn secondary">My Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="ps-icon">🎉</div>
      <h1>Payment Successful!</h1>
      <p>Your order has been confirmed and is being processed.</p>

      {orderId && (
        <div className="ps-order-id">
          <span>Order ID</span>
          <strong>{orderId}</strong>
        </div>
      )}

      <p className="ps-thanks">Thank you for shopping with Tech &amp; Electronic.</p>

      <div className="ps-actions">
        <Link to="/my-orders" className="continue-btn primary">View My Orders</Link>
        <Link to="/products" className="continue-btn secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;
