import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./PaymentHistory.css";

const STATUS_STYLE = {
  Paid:    { bg: "#dcfce7", color: "#16a34a" },
  Pending: { bg: "#fef9c3", color: "#a16207" },
  Failed:  { bg: "#fee2e2", color: "#dc2626" },
};

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get("/payments/my-payments")
      .then(res => setPayments(res.data.payments || []))
      .catch(err => console.log("PAYMENT HISTORY ERROR:", err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountLayout>
      <div className="ph-page">

        <div className="ph-header">
          <h1>Payment History</h1>
          <p>Your past payment transactions</p>
        </div>

        {loading ? (
          <div className="ph-loading">
            <div className="ph-spinner" />
            <span>Loading payment history...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="ph-empty">
            <div className="ph-empty-icon">💳</div>
            <h3>No payments yet</h3>
            <p>Your payment transactions will appear here after you make a purchase.</p>
            <Link to="/products" className="ph-shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="ph-list">
            {payments.map(payment => {
              const style = STATUS_STYLE[payment.status] || STATUS_STYLE["Pending"];
              return (
                <div className="ph-card" key={payment._id}>

                  <div className="ph-card-top">
                    <div className="ph-amount">
                      {Number(payment.amount).toLocaleString()} ETB
                    </div>
                    <span
                      className="ph-status-badge"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {payment.status || "Pending"}
                    </span>
                  </div>

                  <div className="ph-card-details">
                    <div className="ph-detail-row">
                      <span className="ph-label">Transaction Ref</span>
                      <span className="ph-value ph-txref">{payment.tx_ref || "—"}</span>
                    </div>
                    <div className="ph-detail-row">
                      <span className="ph-label">Order ID</span>
                      <span className="ph-value">{payment.order?._id || payment.order || "—"}</span>
                    </div>
                    <div className="ph-detail-row">
                      <span className="ph-label">Order Total</span>
                      <span className="ph-value">
                        {payment.order?.totalPrice
                          ? `${Number(payment.order.totalPrice).toLocaleString()} ETB`
                          : "—"}
                      </span>
                    </div>
                    <div className="ph-detail-row">
                      <span className="ph-label">Date</span>
                      <span className="ph-value">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                    {payment.paidAt && (
                      <div className="ph-detail-row">
                        <span className="ph-label">Paid At</span>
                        <span className="ph-value">
                          {new Date(payment.paidAt).toLocaleString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </AccountLayout>
  );
}

export default PaymentHistory;
