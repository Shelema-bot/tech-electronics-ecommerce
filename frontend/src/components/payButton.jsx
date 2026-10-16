import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { initializePayment } from "../services/paymentService";

const PayButton = ({ orderId, amount }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handlePayment = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const data = await initializePayment({ orderId, amount, methodCode: "chapa" });
      if (data.success && data.checkout_url) {
        localStorage.setItem("pendingOrder", orderId);
        window.location.href = data.checkout_url;
      } else {
        toast.error(data.message || "Payment initialization failed.");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(error.response?.data?.message || "Payment initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} className="pay-now-btn" disabled={loading}>
      {loading ? "Initializing..." : "Pay Now"}
    </button>
  );
};

export default PayButton;

