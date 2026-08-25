import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./Payments.css";

const STATUS_BADGE = {
  "Paid":                 { bg:"#dcfce7", color:"#16a34a" },
  "Pending":              { bg:"#fef9c3", color:"#a16207" },
  "Awaiting Payment":     { bg:"#dbeafe", color:"#1d4ed8" },
  "Pending Verification": { bg:"#fef9c3", color:"#a16207" },
  "Failed":               { bg:"#fee2e2", color:"#dc2626" },
  "Rejected":             { bg:"#fee2e2", color:"#dc2626" },
};

const METHOD_TYPE_BADGE = {
  chapa:            { bg:"#dbeafe", color:"#1d4ed8", icon:"💳" },
  cash_on_delivery: { bg:"#f0fdf4", color:"#16a34a", icon:"💵" },
  manual:           { bg:"#fef9c3", color:"#a16207", icon:"📱" },
};

const inp = { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" };
const lbl = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };

// ────────────────────────────────────────────────────────────────────────────
// PAYMENT METHODS TAB
// ────────────────────────────────────────────────────────────────────────────
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

  const openEdit = (m) => {
    setForm({ ...m });
    setEditing(m._id); setShowForm(true);
  };

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
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:700, color:"#0f172a" }}>Payment Methods</h2>
          <p style={{ margin:0, fontSize:13, color:"#64748b" }}>Configure all payment methods shown to customers at checkout</p>
        </div>
        <button onClick={openCreate} style={{ padding:"9px 18px", background:"#16a34a", color:"white", border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>
          + Add Method
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div style={{ background:"white", border:"1px solid #bfdbfe", borderRadius:14, padding:24, marginBottom:24 }}>
          <h3 style={{ margin:"0 0 18px", fontSize:16, fontWeight:700 }}>{editing ? "Edit Payment Method" : "Add Payment Method"}</h3>
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
                { name:"requiresScreenshot",         label:"Requires Screenshot" },
                { name:"requiresReference",          label:"Requires Reference No." },
                { name:"requiresAdminVerification",  label:"Requires Admin Verification" },
                { name:"enabled",                    label:"Enabled (visible to customers)" },
              ].map(cb => (
                <label key={cb.name} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  <input type="checkbox" name={cb.name} checked={!!form[cb.name]} onChange={handleChange} />
                  {cb.label}
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button type="submit" disabled={saving} style={{ padding:"10px 24px", background:"#2563eb", color:"white", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding:"10px 20px", background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Methods grid */}
      {loading ? (
        <div style={{ color:"#64748b", padding:"40px 0" }}>Loading payment methods...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
          {methods.map(m => {
            const tb = METHOD_TYPE_BADGE[m.type] || METHOD_TYPE_BADGE.manual;
            return (
              <div key={m._id} style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:14, padding:18, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <span style={{ fontSize:28 }}>{tb.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:"#0f172a", fontSize:15 }}>{m.name}</div>
                    <div style={{ fontSize:11, fontFamily:"monospace", color:"#94a3b8" }}>{m.code}</div>
                  </div>
                  <span style={{ background:m.enabled?"#dcfce7":"#fee2e2", color:m.enabled?"#16a34a":"#dc2626", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>
                    {m.enabled ? "Active" : "Off"}
                  </span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                  <span style={{ background:tb.bg, color:tb.color, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600 }}>{m.type.replace(/_/g," ")}</span>
                  {m.requiresScreenshot && <span style={{ background:"#f1f5f9", color:"#475569", padding:"2px 9px", borderRadius:20, fontSize:11 }}>📎 Screenshot</span>}
                  {m.requiresReference  && <span style={{ background:"#f1f5f9", color:"#475569", padding:"2px 9px", borderRadius:20, fontSize:11 }}>🔢 Reference</span>}
                  {m.requiresAdminVerification && <span style={{ background:"#fef9c3", color:"#a16207", padding:"2px 9px", borderRadius:20, fontSize:11 }}>✅ Verify</span>}
                </div>
                {m.accountName   && <div style={{ fontSize:12, color:"#64748b" }}>👤 {m.accountName}</div>}
                {m.accountNumber && <div style={{ fontSize:12, color:"#64748b" }}>🔢 {m.accountNumber}</div>}
                {m.phoneNumber   && <div style={{ fontSize:12, color:"#64748b" }}>📞 {m.phoneNumber}</div>}
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  <button onClick={() => openEdit(m)} style={{ flex:1, padding:"6px 10px", background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer" }}>Edit</button>
                  <button onClick={() => toggle(m._id)} style={{ flex:1, padding:"6px 10px", background:m.enabled?"#fef9c3":"#dcfce7", color:m.enabled?"#a16207":"#16a34a", border:"1px solid", borderColor:m.enabled?"#fde68a":"#bbf7d0", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    {m.enabled ? "Disable" : "Enable"}
                  </button>
                  {!["chapa","cod"].includes(m.code) && (
                    <button onClick={() => remove(m._id)} style={{ padding:"6px 10px", background:"transparent", color:"#94a3b8", border:"1px solid #e2e8f0", borderRadius:7, fontSize:12, cursor:"pointer" }}>🗑</button>
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

// ────────────────────────────────────────────────────────────────────────────
// MAIN PAYMENTS PAGE — Tabs: Transactions | Payment Methods
// ────────────────────────────────────────────────────────────────────────────
function Payments() {
  const toast = useToast();
  const [tab, setTab]                 = useState("transactions");
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewProof, setViewProof]     = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canManageMethods = ["owner","super_admin","admin"].includes(currentUser.role);

  useEffect(() => { if (tab === "transactions") getPayments(); }, [tab]);

  const getPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/payments");
      setPayments(Array.isArray(res.data) ? res.data : res.data.payments || []);
    } catch { toast.error("Failed to load payments"); setPayments([]); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try { await API.patch(`/admin/payments/${id}/verify`, {}); toast.success("Payment approved"); getPayments(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to approve"); }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { toast.warning("Rejection reason is required"); return; }
    try {
      await API.patch(`/admin/payments/${rejectModal}/reject`, { reason: rejectReason });
      toast.success("Payment rejected"); setRejectModal(null); setRejectReason(""); getPayments();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to reject"); }
  };

  const collectCod = async (id) => {
    try { await API.patch(`/admin/payments/${id}/collect`); toast.success("Cash collected"); getPayments(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;
    try { await API.delete(`/admin/payments/${id}`); toast.success("Deleted"); getPayments(); }
    catch { toast.error("Failed to delete"); }
  };

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);
  const pendingCount = payments.filter(p => p.status === "Pending Verification").length;

  const tabStyle = (t) => ({
    padding:"10px 20px", border:"none", borderRadius:"8px 8px 0 0",
    fontWeight:700, fontSize:14, cursor:"pointer",
    background: tab === t ? "white" : "transparent",
    color:       tab === t ? "#0f172a" : "#64748b",
    borderBottom: tab === t ? "2px solid #2563eb" : "2px solid transparent",
  });

  return (
    <AdminLayout>
      <div className="payments-page">

        {/* Page header */}
        <div className="payments-page-header">
          <div>
            <h1>Payments</h1>
            <p>Manage transactions and payment method configuration</p>
          </div>
          {pendingCount > 0 && tab === "transactions" && (
            <div style={{ background:"#fef9c3", color:"#a16207", padding:"8px 16px", borderRadius:"20px", fontWeight:700, fontSize:"13px" }}>
              🟡 {pendingCount} Pending Verification
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:2, marginBottom:0, borderBottom:"2px solid #e2e8f0" }}>
          <button style={tabStyle("transactions")} onClick={() => setTab("transactions")}>
            💳 Transactions
          </button>
          {canManageMethods && (
            <button style={tabStyle("methods")} onClick={() => setTab("methods")}>
              ⚙️ Payment Methods
            </button>
          )}
        </div>

        <div style={{ background:"white", border:"1px solid #e2e8f0", borderTop:"none", borderRadius:"0 0 14px 14px", padding:24 }}>

          {/* ── Transactions tab ── */}
          {tab === "transactions" && (
            <>
              {/* Filter tabs */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                {["all","Pending Verification","Awaiting Payment","Paid","Rejected","Failed"].map(s => (
                  <button key={s} onClick={() => setFilter(s)} style={{
                    padding:"7px 14px", borderRadius:"20px", border:"1px solid #e2e8f0",
                    background: filter === s ? "#2563eb" : "white",
                    color: filter === s ? "white" : "#475569",
                    fontSize:13, fontWeight:600, cursor:"pointer",
                  }}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>

              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Customer","Amount","Method","Ref","Status","Proof","Date","Actions"].map(h => (
                        <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", borderBottom:"1px solid #e2e8f0", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" style={{ textAlign:"center", padding:"40px", color:"#64748b" }}>Loading...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign:"center", padding:"40px", color:"#94a3b8" }}>No payments found</td></tr>
                    ) : filtered.map(p => {
                      const cfg = STATUS_BADGE[p.status] || { bg:"#f1f5f9", color:"#475569" };
                      return (
                        <tr key={p._id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ fontWeight:600, color:"#0f172a" }}>{p.user?.name || "—"}</div>
                            <div style={{ fontSize:11, color:"#94a3b8" }}>{p.user?.email || ""}</div>
                          </td>
                          <td style={{ padding:"12px 14px", fontWeight:700, whiteSpace:"nowrap" }}>{Number(p.amount).toLocaleString()} ETB</td>
                          <td style={{ padding:"12px 14px", fontSize:13 }}>{p.methodName || p.methodCode || "—"}</td>
                          <td style={{ padding:"12px 14px", fontFamily:"monospace", fontSize:11, color:"#64748b", maxWidth:140, wordBreak:"break-all" }}>{p.transactionReference || p.tx_ref || "—"}</td>
                          <td style={{ padding:"12px 14px" }}>
                            <span style={{ background:cfg.bg, color:cfg.color, padding:"4px 10px", borderRadius:"20px", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>{p.status}</span>
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            {p.paymentProof
                              ? <button onClick={() => setViewProof(p.paymentProof)} style={{ background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:600, cursor:"pointer" }}>📎 View</button>
                              : "—"}
                          </td>
                          <td style={{ padding:"12px 14px", fontSize:12, color:"#64748b", whiteSpace:"nowrap" }}>
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                              {["Pending Verification","Pending"].includes(p.status) && (
                                <button onClick={() => approve(p._id)} style={{ background:"#dcfce7", color:"#16a34a", border:"1px solid #bbf7d0", borderRadius:6, padding:"5px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>✓ Approve</button>
                              )}
                              {["Pending Verification","Pending","Awaiting Payment"].includes(p.status) && (
                                <button onClick={() => { setRejectModal(p._id); setRejectReason(""); }} style={{ background:"#fff1f2", color:"#e11d48", border:"1px solid #fecdd3", borderRadius:6, padding:"5px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>✗ Reject</button>
                              )}
                              {p.methodType === "cash_on_delivery" && p.status !== "Paid" && (
                                <button onClick={() => collectCod(p._id)} style={{ background:"#dbeafe", color:"#1d4ed8", border:"1px solid #bfdbfe", borderRadius:6, padding:"5px 9px", fontSize:11, fontWeight:700, cursor:"pointer" }}>💵 Collected</button>
                              )}
                              <button onClick={() => deletePayment(p._id)} style={{ background:"transparent", color:"#94a3b8", border:"1px solid #e2e8f0", borderRadius:6, padding:"5px 9px", fontSize:11, cursor:"pointer" }}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Payment Methods tab ── */}
          {tab === "methods" && canManageMethods && <PaymentMethodsTab />}
        </div>

      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"white", borderRadius:16, padding:28, maxWidth:460, width:"100%", boxShadow:"0 12px 36px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin:"0 0 12px", color:"#0f172a" }}>Reject Payment</h3>
            <p style={{ fontSize:14, color:"#64748b", marginBottom:12 }}>Customer will see this reason.</p>
            <textarea rows="3" style={{ ...inp, resize:"none" }} placeholder="e.g. Screenshot is unclear..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <button onClick={reject} style={{ flex:1, padding:"11px", background:"#e11d48", color:"white", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>Reject</button>
              <button onClick={() => setRejectModal(null)} style={{ flex:1, padding:"11px", background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Proof viewer */}
      {viewProof && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setViewProof(null)}>
          <div style={{ position:"relative", maxWidth:600, width:"100%" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewProof(null)} style={{ position:"absolute", top:-12, right:-12, width:32, height:32, borderRadius:"50%", background:"#e11d48", color:"white", border:"none", cursor:"pointer", fontSize:16, zIndex:10 }}>✕</button>
            <img src={viewProof} alt="Payment Proof" style={{ width:"100%", borderRadius:12, display:"block" }} />
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

export default Payments;
