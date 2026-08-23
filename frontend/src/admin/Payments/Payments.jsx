import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./Payments.css";

const STATUS_BADGE = {
  "Paid":                 { bg: "#dcfce7", color: "#16a34a" },
  "Pending":              { bg: "#fef9c3", color: "#a16207" },
  "Awaiting Payment":     { bg: "#dbeafe", color: "#1d4ed8" },
  "Pending Verification": { bg: "#fef9c3", color: "#a16207" },
  "Failed":               { bg: "#fee2e2", color: "#dc2626" },
  "Rejected":             { bg: "#fee2e2", color: "#dc2626" },
};

function Payments() {
  const toast = useToast();
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [rejectModal, setRejectModal] = useState(null); // payment._id
  const [rejectReason, setRejectReason] = useState("");
  const [viewProof, setViewProof]     = useState(null);

  useEffect(() => { getPayments(); }, []);

  const getPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/payments");
      setPayments(Array.isArray(res.data) ? res.data : res.data.payments || []);
    } catch (err) {
      toast.error("Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await API.patch(`/admin/payments/${id}/verify`, { note: "" });
      toast.success("Payment approved and marked as Paid");
      getPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { toast.warning("Rejection reason is required"); return; }
    try {
      await API.patch(`/admin/payments/${rejectModal}/reject`, { reason: rejectReason });
      toast.success("Payment rejected");
      setRejectModal(null);
      setRejectReason("");
      getPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    }
  };

  const collectCod = async (id) => {
    try {
      await API.patch(`/admin/payments/${id}/collect`);
      toast.success("Cash collected and marked as Paid");
      getPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark collected");
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await API.delete(`/admin/payments/${id}`);
      toast.success("Payment deleted");
      getPayments();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const filtered = filter === "all" ? payments
    : payments.filter(p => p.status === filter);

  const pendingCount = payments.filter(p => p.status === "Pending Verification").length;

  return (
    <AdminLayout>
      <div className="payments-page">

        <div className="payments-page-header">
          <div>
            <h1>Payments Management</h1>
            <p>Review and verify customer payments</p>
          </div>
          {pendingCount > 0 && (
            <div style={{ background:"#fef9c3", color:"#a16207", padding:"8px 16px", borderRadius:"20px", fontWeight:700, fontSize:"13px" }}>
              🟡 {pendingCount} Pending Verification
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          {["all","Pending Verification","Awaiting Payment","Paid","Rejected","Failed"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding:"7px 14px", borderRadius:"20px", border:"1px solid #e2e8f0",
                background: filter === s ? "#2563eb" : "white",
                color: filter === s ? "white" : "#475569",
                fontSize:"13px", fontWeight:600, cursor:"pointer",
              }}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="payments-card">
          <div className="payments-table" style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
              <thead>
                <tr style={{ background:"#f1f5f9" }}>
                  {["Customer","Amount","Method","Ref / Tx","Status","Proof","Date","Actions"].map(h => (
                    <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", borderBottom:"1px solid #e2e8f0", whiteSpace:"nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign:"center", padding:"40px", color:"#64748b" }}>Loading payments...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign:"center", padding:"40px", color:"#94a3b8" }}>No payments found</td></tr>
                ) : filtered.map(p => {
                  const cfg = STATUS_BADGE[p.status] || { bg:"#f1f5f9", color:"#475569" };
                  const ref = p.transactionReference || p.tx_ref || "—";
                  return (
                    <tr key={p._id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <td style={{ padding:"12px 14px", verticalAlign:"middle" }}>
                        <div style={{ fontWeight:600, color:"#0f172a" }}>{p.user?.name || "—"}</div>
                        <div style={{ fontSize:12, color:"#94a3b8" }}>{p.user?.email || ""}</div>
                      </td>
                      <td style={{ padding:"12px 14px", fontWeight:700, color:"#0f172a", whiteSpace:"nowrap" }}>
                        {Number(p.amount).toLocaleString()} ETB
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:13 }}>{p.methodName || p.methodCode || "—"}</td>
                      <td style={{ padding:"12px 14px", fontFamily:"monospace", fontSize:11, color:"#64748b", maxWidth:160, wordBreak:"break-all" }}>
                        {ref}
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ background:cfg.bg, color:cfg.color, padding:"4px 10px", borderRadius:"20px", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        {p.paymentProof ? (
                          <button
                            onClick={() => setViewProof(p.paymentProof)}
                            style={{ background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:600, cursor:"pointer" }}
                          >
                            📎 View
                          </button>
                        ) : "—"}
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#64748b", whiteSpace:"nowrap" }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {/* Approve manual/pending verification */}
                          {(p.status === "Pending Verification" || p.status === "Pending") && (
                            <button
                              onClick={() => approve(p._id)}
                              style={{ background:"#dcfce7", color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                            >
                              ✓ Approve
                            </button>
                          )}
                          {/* Reject */}
                          {["Pending Verification","Pending","Awaiting Payment"].includes(p.status) && (
                            <button
                              onClick={() => { setRejectModal(p._id); setRejectReason(""); }}
                              style={{ background:"#fff1f2", color:"#e11d48", border:"1px solid #fecdd3", borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                            >
                              ✗ Reject
                            </button>
                          )}
                          {/* COD collect */}
                          {p.methodType === "cash_on_delivery" && p.status !== "Paid" && (
                            <button
                              onClick={() => collectCod(p._id)}
                              style={{ background:"#dbeafe", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                            >
                              💵 Collected
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            onClick={() => deletePayment(p._id)}
                            style={{ background:"transparent", color:"#94a3b8", border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 10px", fontSize:12, cursor:"pointer" }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"white", borderRadius:16, padding:28, maxWidth:460, width:"100%", boxShadow:"0 12px 36px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 16px", color:"#0f172a" }}>Reject Payment</h3>
            <p style={{ fontSize:14, color:"#64748b", marginBottom:14 }}>Provide a reason for rejection. The customer will see this.</p>
            <textarea
              rows="3"
              style={{ width:"100%", boxSizing:"border-box", padding:"10px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, resize:"none", outline:"none", fontFamily:"inherit" }}
              placeholder="e.g. Screenshot is unclear. Please resubmit."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={reject} style={{ flex:1, padding:"11px", background:"#e11d48", color:"white", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
                Reject Payment
              </button>
              <button onClick={() => setRejectModal(null)} style={{ flex:1, padding:"11px", background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof viewer modal */}
      {viewProof && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => setViewProof(null)}>
          <div style={{ position:"relative", maxWidth:600, width:"100%" }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewProof(null)}
              style={{ position:"absolute", top:-12, right:-12, width:32, height:32, borderRadius:"50%", background:"#e11d48", color:"white", border:"none", cursor:"pointer", fontSize:16, zIndex:10 }}
            >✕</button>
            <img src={viewProof} alt="Payment Proof" style={{ width:"100%", borderRadius:12, display:"block" }} />
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default Payments;
