import { useToast } from "../context/ToastContext";
import { initializePayment } from "../services/paymentService";

const PayButton = ({ orderId, amount }) => {
  const toast = useToast();

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await initializePayment({ orderId, amount }, token);
      if (data.success) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment initialization failed. Please try again.");
    }
  };

  return (
    <button onClick={handlePayment} className="pay-now-btn">
      Pay Now
    </button>
  );
};

export default PayButton;
