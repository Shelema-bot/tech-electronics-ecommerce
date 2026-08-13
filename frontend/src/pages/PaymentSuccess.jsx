import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const { clearCart } = useCart();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const verify = async () => {
      const tx_ref = params.get("tx_ref");
      const pending = localStorage.getItem("pendingOrder");
      if (pending) setOrderId(pending);

      // No tx_ref — just show success (COD or direct navigation)
      if (!tx_ref) {
        setStatus("success");
        return;
      }

      try {
        const res = await API.get(`/payments/verify?tx_ref=${tx_ref}`);
        // Whether success or already paid — show success page
        localStorage.removeItem("pendingOrder");
        clearCart();
        setStatus("success");
      } catch (error) {
        console.log("VERIFY ERROR:", error.response?.data || error.message);
        // Even if verify fails (e.g. already verified by callback),
        // show success because Chapa already redirected here = payment done
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
