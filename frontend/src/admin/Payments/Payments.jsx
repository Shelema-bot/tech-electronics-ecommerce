import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./Payments.css";

// ── helpers ──────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  "Paid":                 { bg:"#dcfce7", color:"#16a34a" },
  "Pending":              { bg:"#fef9c3", color:"#a16207" },
  "Awaiting Payment":     { bg:"#dbeafe", color:"#1d4ed8" },
  "Pending Verification": { bg:"#fff7ed", color:"#c2410c" },
  "Failed":               { bg:"#fee2e2", color:"#dc2626" },
  "Rejected":             { bg:"#fee2e2", color:"#dc2626" },
  "Refunded":             { bg:"#f5f3ff", color:"#7c3aed" },
  "Cancelled":            { bg:"#f1f5f9", color:"#475569" },
};

const METHOD_ICON = {
  chapa:            "💳",
  cash_on_delivery: "💵",
  manual:           "📱",
};

const inp = {
  padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8,
  fontSize:14, outline:"none", width:"100%", boxSizing:"border-box",
  transition:"border-color 0.2s",
};
const lbl = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="pay-stat-card" style={{ borderTop:`3px solid ${color}` }}>
      <div className="pay-stat-top">
        <span className="pay-stat-icon" style={{ background:`${color}18`, color }}>{icon}</span>
        <div className="pay-stat-vals">
          <div className="pay-stat-value">{value}</div>
          {sub && <div className="pay-stat-sub">{sub}</div>}
        </div>
      </div>
      <div className="pay-stat-label">{label}</div>
    </div>
  );
}

// ── detail modal ──────────────────────────────────────────────────────────────
function PaymentDetailModal({ payment, onClose }) {
  if (!payment) return null;
  const cfg = STATUS_BADGE[payment.status] || { bg:"#f1f5f9", color:"#475569" };
  return (
    <div className="pay-overlay" onClick={onClose}>
      <div className="pay-modal" onClick={e => e.stopPropagation()}>
        <div className="pay-modal-header">
          <div>
            <h3>Payment Detail</h3>
            <span style={{ fontFamily:"monospace", fontSize:12, color:"#94a3b8" }}>#{payment._id?.slice(-8)}</span>
          </div>
          <button className="pay-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="pay-modal-body">
          {/* Status + amount */}
          <div className="pay-detail-hero">
            <div style={{ fontSize:32, fontWeight:800, color:"#0f172a" }}>
              {Number(payment.amount).toLocaleString()} ETB
            </div>
            <span style={{ background:cfg.bg, color:cfg.color, padding:"5px 14px", borderRadius:20, fontSize:13, fontWeight:700 }}>
              {payment.status}
            </span>
          </div>

          {/* Info grid */}
          <div className="pay-detail-grid">
            <div className="pay-detail-item"><span>Customer</span><strong>{payment.user?.name || "—"}</strong></div>
            <div className="pay-detail-item"><span>Email</span><strong>{payment.user?.email || "—"}</strong></div>
            <div className="pay-detail-item"><span>Method</span><strong>{payment.methodName || payment.methodCode}</strong></div>
            <div className="pay-detail-item"><span>Type</span><strong>{payment.methodType?.replace(/_/g," ") || "—"}</strong></div>
            <div className="pay-detail-item"><span>Reference</span><strong style={{ fontFamily:"monospace" }}>{payment.transactionReference || payment.tx_ref || "—"}</strong></div>
            <div className="pay-detail-item"><span>Date</span><strong>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "—"}</strong></div>
            {payment.paidAt && <div className="pay-detail-item"><span>Paid At</span><strong>{new Date(payment.paidAt).toLocaleString()}</strong></div>}
            {payment.verifiedBy && <div className="pay-detail-item"><span>Verified By</span><strong>{payment.verifiedBy?.name || "Admin"}</strong></div>}
            {payment.rejectionReason && <div className="pay-detail-item" style={{ gridColumn:"1/-1" }}><span>Rejection Reason</span><strong style={{ color:"#dc2626" }}>{payment.rejectionReason}</strong></div>}
            {payment.adminNote && <div className="pay-detail-item" style={{ gridColumn:"1/-1" }}><span>Admin Note</span><strong>{payment.adminNote}</strong></div>}
            {payment.customerNote && <div className="pay-detail-item" style={{ gridColumn:"1/-1" }}><span>Customer Note</span><strong>{payment.customerNote}</strong></div>}
          </div>

          {/* Proof */}
          {payment.paymentProof && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:8 }}>Payment Proof</div>
              <img src={payment.paymentProof} alt="Payment proof"
                style={{ width:"100%", maxHeight:320, objectFit:"contain", borderRadius:8, border:"1px solid #e2e8f0", background:"#f8fafc" }} />
            </div>
          )}

          {/* Audit log */}
          {payment.auditLog?.length > 0 && (
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:10 }}>Audit Log</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...payment.auditLog].reverse().map((log, i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:12, color:"#64748b" }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"#2563eb", marginTop:5, flexShrink:0 }} />
                    <div>
                      <span style={{ fontWeight:600, color:"#0f172a" }}>{log.action?.replace(/_/g," ")}</span>
                      {log.fromStatus && log.toStatus && (
                        <span style={{ marginLeft:6 }}>
                          <span style={{ color:"#94a3b8" }}>{log.fromStatus}</span>
                          <span style={{ margin:"0 4px" }}>→</span>
                          <span style={{ color:"#16a34a", fontWeight:600 }}>{log.toStatus}</span>
                        </span>
                      )}
                      {log.note && <span style={{ marginLeft:6, color:"#64748b", fontStyle:"italic" }}>"{log.note}"</span>}
                      <div style={{ color:"#94a3b8", marginTop:2 }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── payment methods tab ───────────────────────────────────────────────────────
function PaymentMethodsTab() {
  const toast = useToast();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    name:"", code:"", type:"manual", description:"",
    accountName:"", accountNumber:"", phoneNumber:"",
    bankName:"", branch:"", instructions:"",
    requiresScreenshot:true, requiresReference:true,
    requiresAdminVerification:true, enabled:true, displayOrder:0,
  });

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/payments/methods");
      setMethods(res.data.methods || []);
    } catch { toast.error("Failed to load payment methods"); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => {
    setForm({ name:"", code:"", type:"manual", description:"", accountName:"", accountNumber:"",
      phoneNumber:"", bankName:"", branch:"", instructions:"",
      requiresScreenshot:true, requiresReference:true, requiresAdminVerification:true,
      enabled:true, displayOrder:0 });
    setEditing(null); setShowForm(true);
  };

  const openEdit = (m) => { setForm({ ...m }); setEditing(m._id); setShowForm(true); };

  const saveMethod = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.type) { toast.warning("Name, code, and type are required"); return; }
    try {
      setSaving(true);
      if (editing) await API.patch(`/admin/payments/methods/${editing}`, form);
      else          await API.post("/admin/payments/methods", form);
      toast.success(editing ? "Payment method updated" : "Payment method created");
      setShowForm(false); fetchMethods();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const toggle = async (id) => {
    try { await API.patch(`/admin/payments/methods/${id}/toggle`); fetchMethods(); }
    catch { toast.error("Failed to toggle"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this payment method?")) return;
    try { await API.delete(`/admin/payments/methods/${id}`); toast.success("Deleted"); fetchMethods(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
  };

  return (
    <div>
      <div className="pm-methods-header">
        <div>
          <h2 className="pm-methods-title">Payment Methods</h2>
          <p className="pm-methods-sub">Configure all payment methods shown to customers at checkout</p>
        </div>
        <button onClick={openCreate} className="pm-add-btn">+ Add Method</button>
      </div>

      {showForm && (
        <div className="pm-form-card">
          <h3 style={{ margin:"0 0 18px", fontSize:16, fontWeight:700, color:"#0f172a" }}>
            {editing ? "✏️ Edit Payment Method" : "➕ Add Payment Method"}
          </h3>
          <form onSubmit={saveMethod}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div><label style={lbl}>Method Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Telebirr" style={inp} required /></div>
              <div>
                <label style={lbl}>Code * (unique lowercase)</label>
                <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. telebirr" style={inp} required disabled={!!editing} />
              </div>
              <div>
                <label style={lbl}>Type *</label>
                <select name="type" value={form.type} onChange={handleChange} style={inp}>
                  <option value="chapa">Chapa (Auto)</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="manual">Manual Transfer</option>
                </select>
              </div>
              <div><label style={lbl}>Display Order</label><input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} style={inp} min="0" /></div>
              <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Description</label><input name="description" value={form.description} onChange={handleChange} placeholder="Brief description for customers" style={inp} /></div>
              <div><label style={lbl}>Account / Merchant Name</label><input name="accountName" value={form.accountName} onChange={handleChange} placeholder="Business name" style={inp} /></div>
              <div><label style={lbl}>Account Number</label><input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Bank account number" style={inp} /></div>
              <div><label style={lbl}>Phone / Merchant Number</label><input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="09XXXXXXXX" style={inp} /></div>
              <div><label style={lbl}>Bank Name</label><input name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. CBE, BOA" style={inp} /></div>
              <div><label style={lbl}>Branch</label><input name="branch" value={form.branch} onChange={handleChange} placeholder="Branch name (optional)" style={inp} /></div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Payment Instructions (shown to customers)</label>
                <textarea name="instructions" value={form.instructions} onChange={handleChange} rows="4" placeholder="Step-by-step instructions..." style={{ ...inp, resize:"vertical" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:20, marginTop:14, flexWrap:"wrap" }}>
              {[
                { name:"requiresScreenshot",        label:"Requires Screenshot" },
                { name:"requiresReference",         label:"Requires Reference No." },
                { name:"requiresAdminVerification", label:"Requires Admin Verification" },
                { name:"enabled",                   label:"Enabled (visible to customers)" },
              ].map(cb => (
                <label key={cb.name} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, fontWeight:600, cursor:"pointer", color:"#374151" }}>
                  <input type="checkbox" name={cb.name} checked={!!form[cb.name]} onChange={handleChange} />
                  {cb.label}
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button type="submit" disabled={saving} className="pm-save-btn">
                {saving ? "Saving…" : editing ? "Update Method" : "Create Method"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="pm-cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="pay-empty-state">Loading payment methods…</div>
      ) : (
        <div className="pm-grid">
          {methods.map(m => {
            const icon = METHOD_ICON[m.type] || "💳";
            return (
              <div key={m._id} className="pm-card">
                <div className="pm-card-top">
                  <span className="pm-card-icon">{icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="pm-card-name">{m.name}</div>
                    <div className="pm-card-code">{m.code}</div>
                  </div>
                  <span className={`pm-card-status ${m.enabled ? "on" : "off"}`}>
                    {m.enabled ? "Active" : "Off"}
                  </span>
                </div>
                <div className="pm-card-tags">
                  <span className="pm-tag blue">{m.type.replace(/_/g," ")}</span>
                  {m.requiresScreenshot && <span className="pm-tag grey">📎 Screenshot</span>}
                  {m.requiresReference  && <span className="pm-tag grey">🔢 Reference</span>}
                  {m.requiresAdminVerification && <span className="pm-tag yellow">✅ Verify</span>}
                </div>
                {m.accountName   && <div className="pm-card-info">👤 {m.accountName}</div>}
                {m.accountNumber && <div className="pm-card-info">🔢 {m.accountNumber}</div>}
                {m.phoneNumber   && <div className="pm-card-info">📞 {m.phoneNumber}</div>}
                <div className="pm-card-actions">
                  <button onClick={() => openEdit(m)} className="pm-action-btn edit">Edit</button>
                  <button onClick={() => toggle(m._id)} className={`pm-action-btn ${m.enabled ? "disable" : "enable"}`}>
                    {m.enabled ? "Disable" : "Enable"}
                  </button>
                  {!["chapa","cod"].includes(m.code) && (
                    <button onClick={() => remove(m._id)} className="pm-action-btn del">🗑</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── main payments page ────────────────────────────────────────────────────────
function Payments() {
  const toast = useToast();
  const [tab, setTab]                   = useState("transactions");
  const [payments, setPayments]         = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewProof, setViewProof]       = useState(null);
  const [detailPayment, setDetailPayment] = useState(null);
  const [approving, setApproving]       = useState(null);
  const [rejecting, setRejecting]       = useState(false);

  const LIMIT = 15;
  const currentUser  = JSON.parse(localStorage.getItem("user") || "{}");
  const canManageMethods = ["owner","super_admin","admin"].includes(currentUser.role);

  const fetchPayments = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await API.get(`/admin/payments?${params}`);
      setPayments(Array.isArray(res.data) ? res.data : res.data.payments || []);
      setTotal(res.data.total || 0);
    } catch { toast.error("Failed to load payments"); setPayments([]); }
    finally { setLoading(false); }
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/payments/stats");
      setStats(res.data);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    if (tab === "transactions") { fetchPayments(1); setPage(1); }
  }, [tab, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Search is client-side within the current page
  const filtered = payments.filter(p => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      p.user?.name?.toLowerCase().includes(s) ||
      p.user?.email?.toLowerCase().includes(s) ||
      p.transactionReference?.toLowerCase().includes(s) ||
      p.tx_ref?.toLowerCase().includes(s) ||
      p.methodName?.toLowerCase().includes(s)
    );
  });

  const approve = async (id) => {
    setApproving(id);
    try {
      await API.patch(`/admin/payments/${id}/verify`, {});
      toast.success("Payment approved ✓");
      fetchPayments(page);
      fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to approve"); }
    finally { setApproving(null); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { toast.warning("Rejection reason is required"); return; }
    setRejecting(true);
    try {
      await API.patch(`/admin/payments/${rejectModal}/reject`, { reason: rejectReason });
      toast.success("Payment rejected");
      setRejectModal(null); setRejectReason(""); fetchPayments(page); fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to reject"); }
    finally { setRejecting(false); }
  };

  const collectCod = async (id) => {
    try {
      await API.patch(`/admin/payments/${id}/collect`);
      toast.success("Cash collected ✓");
      fetchPayments(page); fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await API.delete(`/admin/payments/${id}`);
      toast.success("Payment deleted");
      fetchPayments(page); fetchStats();
    } catch { toast.error("Failed to delete"); }
  };

  const openDetail = async (payment) => {
    // Fetch full detail with audit log
    try {
      const res = await API.get(`/admin/payments/${payment._id}`);
      setDetailPayment(res.data.payment || payment);
    } catch { setDetailPayment(payment); }
  };

  // Stats derivation
  const paid     = stats?.byStatus?.find(s => s._id === "Paid");
  const pending  = stats?.byStatus?.find(s => s._id === "Pending Verification");
  const failed   = stats?.byStatus?.find(s => s._id === "Failed");
  const overall  = stats?.overall || {};
  const pendingCount = payments.filter(p => p.status === "Pending Verification").length;
  const totalPages = Math.ceil(total / LIMIT);

  const STATUS_FILTERS = ["all","Pending Verification","Awaiting Payment","Paid","Rejected","Failed","Refunded"];

  return (
    <AdminLayout>
      <div className="payments-page">

        {/* Header */}
        <div className="pay-page-header">
          <div>
            <h1 className="pay-page-title">Payments</h1>
            <p className="pay-page-sub">Manage transactions and payment method configuration</p>
          </div>
          {pendingCount > 0 && tab === "transactions" && (
            <div className="pay-alert-badge">
              🟡 {pendingCount} Pending Verification
            </div>
          )}
        </div>

        {/* Stats cards */}
        {tab === "transactions" && (
          <div className="pay-stats-grid">
            <StatCard icon="💰" label="Total Revenue" color="#16a34a"
              value={`${Number(overall.total || 0).toLocaleString()} ETB`}
              sub={`${overall.count || 0} transactions`} />
            <StatCard icon="✅" label="Paid" color="#0891b2"
              value={paid?.count || 0}
              sub={`${Number(paid?.amount || 0).toLocaleString()} ETB`} />
            <StatCard icon="⏳" label="Pending Verification" color="#f59e0b"
              value={pending?.count || 0}
              sub="Awaiting review" />
            <StatCard icon="❌" label="Failed / Rejected" color="#dc2626"
              value={(failed?.count || 0) + (stats?.byStatus?.find(s=>s._id==="Rejected")?.count || 0)}
              sub="Requires attention" />
          </div>
        )}

        {/* Tabs */}
        <div className="pay-tabs">
          <button className={`pay-tab ${tab === "transactions" ? "active" : ""}`} onClick={() => setTab("transactions")}>
            💳 Transactions
          </button>
          {canManageMethods && (
            <button className={`pay-tab ${tab === "methods" ? "active" : ""}`} onClick={() => setTab("methods")}>
              ⚙️ Payment Methods
            </button>
          )}
        </div>

        <div className="pay-content-card">

          {/* ── Transactions tab ── */}
          {tab === "transactions" && (
            <>
              {/* Toolbar */}
              <div className="pay-toolbar">
                <input
                  className="pay-search"
                  type="text"
                  placeholder="🔍  Search customer, email, reference…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="pay-filter-pills">
                  {STATUS_FILTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setPage(1); }}
                      className={`pay-pill ${statusFilter === s ? "active" : ""}`}
                    >
                      {s === "all" ? "All" : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="pay-table-wrap">
                <table className="pay-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th>Status</th>
                      <th>Proof</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" className="pay-td-center">
                        <div className="pay-loading-row">
                          <div className="pay-spinner" />
                          Loading payments…
                        </div>
                      </td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan="8" className="pay-td-center">
                        <div className="pay-empty-state">
                          <div style={{ fontSize:40, marginBottom:8 }}>💳</div>
                          No payments found
                        </div>
                      </td></tr>
                    ) : filtered.map(p => {
                      const cfg = STATUS_BADGE[p.status] || { bg:"#f1f5f9", color:"#475569" };
                      return (
                        <tr key={p._id} className="pay-row" onClick={() => openDetail(p)} title="Click to view details">
                          <td>
                            <div className="pay-customer-cell">
                              <div className="pay-customer-avatar">
                                {p.user?.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div>
                                <div className="pay-customer-name">{p.user?.name || "—"}</div>
                                <div className="pay-customer-email">{p.user?.email || ""}</div>
                              </div>
                            </div>
                          </td>
                          <td className="pay-amount">{Number(p.amount).toLocaleString()} ETB</td>
                          <td>
                            <span className="pay-method-badge">
                              {METHOD_ICON[p.methodType] || "💳"} {p.methodName || p.methodCode || "—"}
                            </span>
                          </td>
                          <td className="pay-ref">{p.transactionReference || p.tx_ref || "—"}</td>
                          <td>
                            <span className="pay-status-badge" style={{ background:cfg.bg, color:cfg.color }}>
                              {p.status}
                            </span>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            {p.paymentProof
                              ? <button className="pay-proof-btn" onClick={() => setViewProof(p.paymentProof)}>📎 View</button>
                              : <span style={{ color:"#94a3b8", fontSize:12 }}>—</span>}
                          </td>
                          <td className="pay-date">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }) : "—"}
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div className="pay-action-btns">
                              {["Pending Verification","Pending"].includes(p.status) && (
                                <button
                                  className="pay-act-btn approve"
                                  disabled={approving === p._id}
                                  onClick={() => approve(p._id)}
                                >
                                  {approving === p._id ? "…" : "✓"}
                                </button>
                              )}
                              {["Pending Verification","Pending","Awaiting Payment"].includes(p.status) && (
                                <button className="pay-act-btn reject" onClick={() => { setRejectModal(p._id); setRejectReason(""); }}>✗</button>
                              )}
                              {p.methodType === "cash_on_delivery" && p.status !== "Paid" && (
                                <button className="pay-act-btn cod" onClick={() => collectCod(p._id)}>💵</button>
                              )}
                              <button className="pay-act-btn del" onClick={() => deletePayment(p._id)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pay-pagination">
                  <button className="pay-page-btn" disabled={page <= 1} onClick={() => { setPage(p => p-1); fetchPayments(page-1); }}>
                    ← Prev
                  </button>
                  <span className="pay-page-info">Page {page} of {totalPages}</span>
                  <button className="pay-page-btn" disabled={page >= totalPages} onClick={() => { setPage(p => p+1); fetchPayments(page+1); }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── Payment Methods tab ── */}
          {tab === "methods" && canManageMethods && <PaymentMethodsTab />}
        </div>
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="pay-overlay" onClick={() => setRejectModal(null)}>
          <div className="pay-modal pay-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-header">
              <h3 style={{ color:"#e11d48" }}>Reject Payment</h3>
              <button className="pay-modal-close" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <div className="pay-modal-body">
              <p style={{ fontSize:14, color:"#64748b", marginBottom:12 }}>Customer will see this reason. Be specific and polite.</p>
              <textarea
                rows="3"
                style={{ ...inp, resize:"none" }}
                placeholder="e.g. Screenshot is unclear, please resubmit…"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <button
                  onClick={reject}
                  disabled={rejecting}
                  style={{ flex:1, padding:11, background:"#e11d48", color:"white", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}
                >
                  {rejecting ? "Rejecting…" : "Reject Payment"}
                </button>
                <button
                  onClick={() => setRejectModal(null)}
                  style={{ flex:1, padding:11, background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof viewer */}
      {viewProof && (
        <div className="pay-overlay" onClick={() => setViewProof(null)}>
          <div style={{ position:"relative", maxWidth:640, width:"90%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewProof(null)} className="pay-proof-close">✕</button>
            <img src={viewProof} alt="Payment Proof" style={{ width:"100%", borderRadius:12, display:"block", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }} />
          </div>
        </div>
      )}

      {/* Detail modal */}
      <PaymentDetailModal payment={detailPayment} onClose={() => setDetailPayment(null)} />
    </AdminLayout>
  );
}

export default Payments;
