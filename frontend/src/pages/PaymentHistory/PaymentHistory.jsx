import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { usePreference } from "../../context/PreferenceContext";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./PaymentHistory.css";

const STATUS_CONFIG = {
  "Paid":                  { bg: "#dcfce7", color: "#16a34a", icon: "✅" },
  "Pending":               { bg: "#fef9c3", color: "#a16207", icon: "⏳" },
  "Awaiting Payment":      { bg: "#dbeafe", color: "#1d4ed8", icon: "💳" },
  "Pending Verification":  { bg: "#fef9c3", color: "#a16207", icon: "🟡" },
  "Failed":                { bg: "#fee2e2", color: "#dc2626", icon: "❌" },
  "Rejected":              { bg: "#fee2e2", color: "#dc2626", icon: "🔴" },
  "Refunded":              { bg: "#f1f5f9", color: "#475569", icon: "↩️" },
  "Cancelled":             { bg: "#f1f5f9", color: "#475569", icon: "🚫" },
};

const METHOD_ICONS = {
  chapa:            "💳",
  cod:              "💵",
  cash_on_delivery: "💵",
  telebirr:         "📱",
  cbe:              "🏦",
  boa:              "🏛️",
};

function PaymentHistory() {
  const { fmt } = usePreference();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    API.get("/payments/my")
      .then(res => setPayments(res.data.payments || []))
      .catch(() => API.get("/payments/my-payments")
        .then(res => setPayments(res.data.payments || []))
        .catch(err => console.log("PAYMENT HISTORY ERROR:", err.message))
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? payments
    : payments.filter(p => p.status?.toLowerCase().replace(/ /g, "_") === filter);

  return (
    <AccountLayout>
      <div className="ph-page">

        <div className="ph-header">
          <h1>Payment History</h1>
          <p>All your payment transactions</p>
        </div>

        {/* Filter tabs */}
        <div className="ph-filters">
          {["all","Paid","Pending Verification","Rejected","Awaiting Payment"].map(s => (
            <button
              key={s}
              className={`ph-filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ph-loading">
            <div className="ph-spinner" />
            <span>Loading payment history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ph-empty">
            <div className="ph-empty-icon">💳</div>
            <h3>{filter === "all" ? "No payments yet" : `No ${filter} payments`}</h3>
            <p>{filter === "all" ? "Your payment transactions will appear here." : "Try a different filter."}</p>
            {filter === "all" && <Link to="/products" className="ph-shop-btn">Start Shopping</Link>}
          </div>
        ) : (
          <div className="ph-list">
            {filtered.map(payment => {
              const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG["Pending"];
              const methodIcon = METHOD_ICONS[payment.methodCode] || "💳";
              return (
                <div className="ph-card" key={payment._id}>

                  <div className="ph-card-top">
                    <div className="ph-left">
                      <span className="ph-method-icon">{methodIcon}</span>
                      <div>
                        <div className="ph-method-name">{payment.methodName || payment.methodCode || "Payment"}</div>
                        <div className="ph-amount">{fmt(payment.amount)}</div>
                      </div>
                    </div>
                    <span className="ph-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon} {payment.status || "Pending"}
                    </span>
                  </div>

                  <div className="ph-card-details">
                    {payment.transactionReference && (
                      <div className="ph-detail-row">
                        <span className="ph-label">Transaction Ref</span>
                        <span className="ph-value ph-txref">{payment.transactionReference}</span>
                      </div>
                    )}
                    {payment.tx_ref && !payment.transactionReference && (
                      <div className="ph-detail-row">
                        <span className="ph-label">Chapa Ref</span>
                        <span className="ph-value ph-txref">{payment.tx_ref}</span>
                      </div>
                    )}
                    <div className="ph-detail-row">
                      <span className="ph-label">Order</span>
                      <span className="ph-value">{payment.order?._id || payment.order || "—"}</span>
                    </div>
                    <div className="ph-detail-row">
                      <span className="ph-label">Date</span>
                      <span className="ph-value">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-US", {
                          year:"numeric", month:"short", day:"numeric",
                        }) : "—"}
                      </span>
                    </div>
                    {payment.paidAt && (
                      <div className="ph-detail-row">
                        <span className="ph-label">Paid At</span>
                        <span className="ph-value">
                          {new Date(payment.paidAt).toLocaleString("en-US", {
                            year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    {payment.rejectionReason && (
                      <div className="ph-detail-row ph-rejection">
                        <span className="ph-label">Rejection Reason</span>
                        <span className="ph-value" style={{ color:"#dc2626" }}>{payment.rejectionReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ph-card-actions">
                    {/* Allow re-submission if rejected */}
                    {payment.status === "Rejected" && payment.methodType === "manual" && (
                      <Link
                        to={`/payment-history`}
                        className="ph-resubmit-btn"
                        style={{ textDecoration:"none", padding:"8px 16px", background:"#2563eb", color:"white", borderRadius:"8px", fontSize:"13px", fontWeight:"700" }}
                      >
                        📤 Resubmit Proof
                      </Link>
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
