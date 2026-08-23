import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API from "../api/axios";
import "./PaymentSuccess.css";

/**
 * PaymentSuccess — Chapa return URL handler.
 * Verifies the payment with the backend, clears cart, then
 * redirects to the typed PaymentResult page.
 * 
 * DO NOT show "Payment Successful" here — only redirect after backend verification.
 */
function PaymentSuccess() {
  const { clearCart } = useCart();
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const verified  = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    const verify = async () => {
      const tx    = params.get("tx_ref");
      const order = localStorage.getItem("pendingOrder") || "";

      try {
        if (tx) {
          await API.get(`/payments/verify?tx_ref=${tx}`);
        }
      } catch (e) {
        console.log("Payment verification error:", e.message);
      } finally {
        localStorage.removeItem("pendingOrder");
        clearCart();
        // Redirect to typed result page
        navigate(`/payment-result?type=chapa&orderId=${order}`, { replace: true });
      }
    };

    verify();
  }, []);

  return (
    <div className="payment-success">
      <div className="ps-spinner" />
      <p style={{ color: "#64748b", marginTop: 12 }}>Verifying your payment...</p>
    </div>
  );
}

export default PaymentSuccess;
