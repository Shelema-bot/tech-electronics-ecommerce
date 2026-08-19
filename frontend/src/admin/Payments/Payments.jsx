import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./Payments.css";

function Payments() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { getPayments(); }, []);

  const getPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/payments");
      setPayments(Array.isArray(res.data) ? res.data : res.data.payments || []);
    } catch (err) {
      console.log("PAYMENT ERROR:", err.response?.data || err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/payments/${id}`, { status });
      toast.success("Payment status updated");
      getPayments();
    } catch (err) {
      console.log("UPDATE PAYMENT ERROR:", err.response?.data || err.message);
      toast.error("Failed to update payment");
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await API.delete(`/admin/payments/${id}`);
      toast.success("Payment deleted successfully");
      getPayments();
    } catch (err) {
      console.log("DELETE PAYMENT ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to delete payment");
    }
  };

  return (
    <AdminLayout>
      <div className="payments-page">

        <div className="payments-page-header">
          <div>
            <h1>Payments Management</h1>
            <p>Manage customer payments and transactions</p>
          </div>
        </div>

        <div className="payments-card">
          <div className="payments-table">

            <div className="payments-table-header">
              <div>Customer</div>
              <div>Amount</div>
              <div>Transaction</div>
              <div>Status</div>
              <div>Date</div>
              <div>Action</div>
            </div>

            {loading ? (
              <div className="payments-empty">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="payments-empty">No Payments Found</div>
            ) : (
              payments.map((payment) => (
                <div className="payments-table-row" key={payment._id}>

                  <div className="payment-customer">
                    <strong>{payment.user?.name || "Unknown"}</strong>
                    <small>{payment.user?.email || "—"}</small>
                  </div>

                  <div className="payment-amount">
                    {Number(payment.amount).toLocaleString()} ETB
                  </div>

                  <div className="payment-transaction">
                    {payment.tx_ref || "—"}
                  </div>

                  <div>
                    <span className={`payment-status ${payment.status?.toLowerCase() || "pending"}`}>
                      {payment.status || "Pending"}
                    </span>
                  </div>

                  <div className="payment-date">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}
                  </div>

                  <div className="payment-actions">
                    {payment.status !== "Paid" && (
                      <button className="paid-btn" onClick={() => updateStatus(payment._id, "Paid")}>
                        Mark Paid
                      </button>
                    )}
                    <button className="delete-payment-btn" onClick={() => deletePayment(payment._id)}>
                      Delete
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Payments;
