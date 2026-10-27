import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { usePreference } from "../context/PreferenceContext";
import { verifyPayment, getOrderById } from "../services/paymentService";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const { clearCart } = useCart();
  const toast = useToast();
  const { fmt } = usePreference();
  const { t } = useTranslation();
  const [params] = useSearchParams();

  const tx_ref = params.get("tx_ref") || params.get("trx_ref") || localStorage.getItem("pendingTxRef") || "";
  const queryOrderId = params.get("orderId") || params.get("id") || localStorage.getItem("pendingOrder") || "";
  const paymentType = params.get("type") || (tx_ref ? "chapa" : "cod");
  const isDemo = params.get("mode") === "demo" || (typeof tx_ref === "string" && tx_ref.includes("DEMO"));
  const isManual = paymentType === "manual" || (!tx_ref && Boolean(queryOrderId));

  const [loading, setLoading] = useState(Boolean(tx_ref));
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(paymentType === "cod" || isDemo || isManual);
  const verificationAttempted = useRef(false);

  const performVerification = async () => {
    if (!tx_ref) {
      if (queryOrderId) {
        try {
          const res = await getOrderById(queryOrderId);
          if (res.order) setOrder(res.order);
        } catch (e) {
          console.warn("Could not load order details:", e.message);
        }
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const verifyParam = isDemo ? `${encodeURIComponent(tx_ref)}?mode=demo` : encodeURIComponent(tx_ref);
      const res = await verifyPayment(verifyParam);

      if (res.success) {
        setVerifiedSuccess(true);
        if (res.order) setOrder(res.order);

        clearCart();
        localStorage.removeItem("cartItems");
        localStorage.removeItem("pendingOrder");
        localStorage.removeItem("pendingTxRef");

        toast.success(isDemo ? "Payment completed in Demo Mode! 🎉" : "Payment verified successfully! 🎉");
      } else {
        setError(res.message || t("checkout.paymentNotCompleted", "Payment has not been completed yet."));
        toast.warning(res.message || t("checkout.paymentPendingConfirmation", "Payment status pending confirmation."));
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
      if (isDemo && queryOrderId) {
        setVerifiedSuccess(true);
        clearCart();
        localStorage.removeItem("cartItems");
        localStorage.removeItem("pendingOrder");
        localStorage.removeItem("pendingTxRef");
        getOrderById(queryOrderId).then(r => { if (r.order) setOrder(r.order); }).catch(() => {});
      } else {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to verify payment with the gateway. Please retry or contact support.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    if (paymentType === "cod") {
      clearCart();
      localStorage.removeItem("cartItems");
      if (queryOrderId) {
        getOrderById(queryOrderId)
          .then((res) => { if (res.order) setOrder(res.order); })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      performVerification();
    }
  }, []);

  if (loading) {
    return (
      <div className="payment-success">
        <div className="ps-spinner" />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: "16px 0 8px" }}>
          {t("common.loading", "Verifying Payment...")}
        </h2>
        <p style={{ color: "#64748b", maxWidth: 400 }}>
          Please wait while we confirm your transaction. Do not close or refresh this page.
        </p>
      </div>
    );
  }

  if (error || !verifiedSuccess) {
    return (
      <div className="payment-success">
        <div className="ps-icon">⚠️</div>
        <h1 className="ps-title" style={{ color: "#dc2626" }}>Payment Not Confirmed</h1>
        <p className="ps-subtitle">
          We could not verify your payment at this moment. Your shopping cart has been preserved.
        </p>

        <div className="ps-error-box">
          <div className="ps-error-title">Status Notice</div>
          <div className="ps-error-desc">{error || "Payment transaction is pending or could not be verified."}</div>
          {tx_ref && (
            <div style={{ fontSize: 13, wordBreak: "break-all", fontFamily: "monospace", color: "#64748b" }}>
              Reference: <strong>{tx_ref}</strong>
            </div>
          )}
        </div>

        <div className="ps-actions">
          {tx_ref && (
            <button
              onClick={() => {
                verificationAttempted.current = false;
                performVerification();
              }}
              className="ps-btn primary"
              style={{ cursor: "pointer", border: "none" }}
            >
              🔄 Retry Verification
            </button>
          )}
          <Link to="/checkout" className="ps-btn secondary">
            ← Return to Checkout
          </Link>
          <Link to="/contact" className="ps-btn secondary" style={{ border: "1px solid #cbd5e1", color: "#475569" }}>
            {t("policy.contactSupport", "Contact Support")}
          </Link>
        </div>
      </div>
    );
  }

  const displayOrderId = order?._id || queryOrderId || "Confirmed";
  const displayTotal = order?.totalPrice ? fmt(order.totalPrice) : "—";
  const isCod = paymentType === "cod" || order?.paymentMethod?.toLowerCase().includes("delivery") || order?.paymentMethod === "COD";
  const isDemoOrder = isDemo || order?.paymentMethod?.toLowerCase().includes("demo");

  return (
    <div className="payment-success">
      <div className="ps-icon success-bounce">{isCod ? "🚚" : "🎉"}</div>
      <h1 className="ps-title">{isCod ? t("checkout.orderPlacedSuccess", "Order Placed Successfully!") : "Payment Verified!"}</h1>
      <p className="ps-subtitle">
        {isCod
          ? t("checkout.codNote", "Thank you for your order! Your items are being prepared and payment will be collected upon delivery.")
          : isDemoOrder
          ? "Your order has been placed and payment confirmed in Demo Mode. Your order is now in processing."
          : (order?.paymentStatus === "Pending" || order?.paymentStatus === "Pending Verification" || isManual)
          ? "Thank you for your order! Your payment transfer has been recorded and will be verified by our team shortly."
          : "Your payment has been successfully confirmed and your order is now in processing."}
      </p>

      {/* Receipt card */}
      <div className="ps-detail-box">
        <div className="ps-detail-row">
          <span>{t("account.payment", "Payment Status")}</span>
          <div>
            {isCod ? (
              <span className="status-badge cod">💵 Cash on Delivery</span>
            ) : isDemoOrder ? (
              <span className="status-badge paid" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                ✓ {t("account.paid", "Paid (Demo Mode)")}
              </span>
            ) : (order?.paymentStatus === "Pending" || order?.paymentStatus === "Pending Verification" || isManual) ? (
              <span className="status-badge cod" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                ⏳ {t("admin.pending", "Pending Verification")}
              </span>
            ) : (
              <span className="status-badge paid">✓ {t("account.paid", "Paid via Chapa")}</span>
            )}
          </div>
        </div>

        <div className="ps-detail-row">
          <span>{t("account.orderId", "Order ID")}</span>
          <strong>#{displayOrderId.toString().slice(-10)}</strong>
        </div>

        {(tx_ref || order?.transactionId || order?.transactionRef) && !isCod && (
          <div className="ps-detail-row">
            <span>Transaction Ref</span>
            <strong>{tx_ref || order?.transactionId || order?.transactionRef}</strong>
          </div>
        )}

        {order?.totalPrice && (
          <div className="ps-detail-row">
            <span>{t("common.total", "Total Amount")}</span>
            <strong style={{ fontSize: 16, color: "#15803d" }}>{displayTotal}</strong>
          </div>
        )}

        {order?.shippingAddress && (
          <div className="ps-detail-row">
            <span>{t("checkout.stepShipping", "Delivery To")}</span>
            <strong style={{ fontFamily: "inherit", fontWeight: 600 }}>
              {order.shippingAddress.fullName} — {order.shippingAddress.city}, {order.shippingAddress.address}
            </strong>
          </div>
        )}

        {/* Items summary */}
        {order?.orderItems && order.orderItems.length > 0 && (
          <div className="ps-items-list">
            <div className="ps-items-title">{t("product.products", "Ordered Items")} ({order.orderItems.length})</div>
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="ps-item-row">
                <span className="ps-item-name">{item.name} × {item.quantity}</span>
                <strong>{fmt(Number(item.price) * (item.quantity || 1))}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="ps-actions">
        <Link to="/my-orders" className="ps-btn primary">
          📦 {t("account.myOrders", "View My Orders")}
        </Link>
        <Link to="/products" className="ps-btn secondary">
          🛍️ {t("cart.continueShopping", "Continue Shopping")}
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;
