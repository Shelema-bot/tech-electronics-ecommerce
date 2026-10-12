import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./SellerPlans.css";

const BLANK_PLAN = {
  name: "", description: "", color: "#2563eb", icon: "🏪",
  monthlyFee: "", billingCycle: "monthly", trialDays: "0",
  productLimit: "10", minProductPrice: "0", maxProductPrice: "0",
  commissionRate: "5", features: "", isActive: true, displayOrder: "0",
};

const SUB_COLORS = {
  active:    { bg: "#dcfce7", color: "#16a34a" },
  trial:     { bg: "#dbeafe", color: "#1d4ed8" },
  overdue:   { bg: "#fff7ed", color: "#c2410c" },
  suspended: { bg: "#fee2e2", color: "#dc2626" },
  none:      { bg: "#f1f5f9", color: "#64748b" },
};

const inp = { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box", transition:"border-color 0.2s" };
const lbl = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };

export default function SellerPlans() {
  const toast = useToast();
  const [tab, setTab]           = useState("plans");       // "plans" | "sellers"
  const [plans, setPlans]       = useState([]);
  const [sellers, setSellers]   = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingS, setLoadingS] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(BLANK_PLAN);
  const [saving, setSaving]     = useState(false);
  const [assignModal, setAssignModal] = useState(null); // seller object
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignStatus, setAssignStatus] = useState("active");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { fetchPlans(); fetchSellers(); }, []);

  const fetchPlans = async () => {
    try {
      setLoadingP(true);
      const res = await API.get("/seller-plans/admin");
      setPlans(res.data.plans || []);
    } catch { toast.error("Failed to load plans"); }
    finally { setLoadingP(false); }
  };

  const fetchSellers = async () => {
    try {
      setLoadingS(true);
      const res = await API.get("/seller-plans/sellers");
      setSellers(res.data.sellers || []);
    } catch { toast.error("Failed to load sellers"); }
    finally { setLoadingS(false); }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => { setForm(BLANK_PLAN); setEditing(null); setShowForm(true); };
  const openEdit   = p => {
    setForm({ ...p, features: Array.isArray(p.features) ? p.features.join("\n") : "" });
    setEditing(p._id); setShowForm(true);
  };

  const savePlan = async e => {
    e.preventDefault();
    if (!form.name || form.monthlyFee === "") { toast.warning("Name and monthly fee are required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: form.features ? form.features.split("\n").map(f => f.trim()).filter(Boolean) : [],
      };
      if (editing) await API.put(`/seller-plans/${editing}`, payload);
      else         await API.post("/seller-plans", payload);
      toast.success(editing ? "Plan updated" : "Plan created");
      setShowForm(false); fetchPlans();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const deletePlan = async id => {
    if (!window.confirm("Delete this plan?")) return;
    try { await API.delete(`/seller-plans/${id}`); toast.success("Plan deleted"); fetchPlans(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
  };

  const doAssign = async () => {
    if (!assignPlanId) { toast.warning("Select a plan"); return; }
    setAssigning(true);
    try {
      await API.post(`/seller-plans/assign/${assignModal._id}`, { planId: assignPlanId, subscriptionStatus: assignStatus });
      toast.success(`Plan assigned to ${assignModal.name}`);
      setAssignModal(null); fetchSellers();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to assign"); }
    finally { setAssigning(false); }
  };

  const tabStyle = t => ({
    padding:"10px 20px", border:"none", background:"transparent",
    fontWeight:700, fontSize:14, cursor:"pointer",
    color: tab===t ? "#2563eb" : "#64748b",
    borderBottom: tab===t ? "2px solid #2563eb" : "2px solid transparent",
    marginBottom:-2, borderRadius:"8px 8px 0 0",
    transition:"color 0.15s, border-color 0.15s",
  });

  return (
    <AdminLayout>
      <div className="sp-page">

        {/* Header */}
        <div className="sp-header">
          <div>
            <h1 className="sp-title">Seller Plans</h1>
            <p className="sp-sub">Manage subscription tiers, product limits, and seller assignments</p>
          </div>
          {tab === "plans" && (
            <button className="sp-create-btn" onClick={openCreate}>+ Create Plan</button>
          )}
        </div>

        {/* Stats row */}
        <div className="sp-stats">
          {[
            { label:"Total Plans",     value: plans.length,                                           color:"#2563eb", icon:"📋" },
            { label:"Active Plans",    value: plans.filter(p=>p.isActive).length,                     color:"#16a34a", icon:"✅" },
            { label:"Total Sellers",   value: sellers.length,                                         color:"#0891b2", icon:"🏪" },
            { label:"Active Subs",     value: sellers.filter(s=>s.staffInfo?.subscriptionStatus==="active").length, color:"#7c3aed", icon:"💳" },
            { label:"Overdue",         value: sellers.filter(s=>s.staffInfo?.subscriptionStatus==="overdue").length,  color:"#dc2626", icon:"⚠️" },
          ].map(s => (
            <div key={s.label} className="sp-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
              <div className="sp-stat-row">
                <span className="sp-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</span>
                <span className="sp-stat-value" style={{ color:s.color }}>{s.value}</span>
              </div>
              <div className="sp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:2, borderBottom:"2px solid #e2e8f0", marginBottom:0 }}>
          <button style={tabStyle("plans")}   onClick={() => setTab("plans")}>📋 Plans</button>
          <button style={tabStyle("sellers")} onClick={() => setTab("sellers")}>🏪 Sellers ({sellers.length})</button>
        </div>

        <div className="sp-content">

          {/* ── Plans tab ── */}
          {tab === "plans" && (
            <>
              {/* Create / Edit form */}
              {showForm && (
                <div className="sp-form-card">
                  <h3 style={{ margin:"0 0 20px", fontSize:17, fontWeight:800, color:"#0f172a" }}>
                    {editing ? "✏️ Edit Plan" : "➕ Create Plan"}
                  </h3>
                  <form onSubmit={savePlan}>
                    <div className="sp-form-grid">
                      <div><label style={lbl}>Plan Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Starter" style={inp} required /></div>
                      <div>
                        <label style={lbl}>Icon (emoji)</label>
                        <input name="icon" value={form.icon} onChange={handleChange} placeholder="🏪" style={{ ...inp, width:80 }} />
                      </div>
                      <div><label style={lbl}>Badge Color</label><input type="color" name="color" value={form.color} onChange={handleChange} style={{ height:40, width:60, border:"none", cursor:"pointer" }} /></div>
                      <div>
                        <label style={lbl}>Monthly Fee (ETB) *</label>
                        <input type="number" name="monthlyFee" value={form.monthlyFee} onChange={handleChange} placeholder="0 = Free" min="0" style={inp} required />
                      </div>
                      <div>
                        <label style={lbl}>Billing Cycle</label>
                        <select name="billingCycle" value={form.billingCycle} onChange={handleChange} style={inp}>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly (3 months)</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <div><label style={lbl}>Trial Days (0 = none)</label><input type="number" name="trialDays" value={form.trialDays} onChange={handleChange} min="0" style={inp} /></div>
                      <div><label style={lbl}>Monthly Product Limit</label><input type="number" name="productLimit" value={form.productLimit} onChange={handleChange} min="1" style={inp} /></div>
                      <div><label style={lbl}>Min Listing Price (ETB, 0=none)</label><input type="number" name="minProductPrice" value={form.minProductPrice} onChange={handleChange} min="0" style={inp} /></div>
                      <div><label style={lbl}>Max Listing Price (ETB, 0=none)</label><input type="number" name="maxProductPrice" value={form.maxProductPrice} onChange={handleChange} min="0" style={inp} /></div>
                      <div><label style={lbl}>Commission Rate (%)</label><input type="number" name="commissionRate" value={form.commissionRate} onChange={handleChange} min="0" max="100" step="0.5" style={inp} /></div>
                      <div><label style={lbl}>Display Order</label><input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} min="0" style={inp} /></div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label style={lbl}>Description</label>
                        <input name="description" value={form.description} onChange={handleChange} placeholder="Brief description for sellers" style={inp} />
                      </div>
                      <div style={{ gridColumn:"1/-1" }}>
                        <label style={lbl}>Features (one per line — displayed as bullet points)</label>
                        <textarea name="features" value={form.features} onChange={handleChange} rows="4"
                          placeholder={"List up to 10 products per month\n5% commission on sales\nBasic seller dashboard"}
                          style={{ ...inp, resize:"vertical" }} />
                      </div>
                    </div>
                    <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600, cursor:"pointer", marginTop:14, color:"#374151" }}>
                      <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} />
                      Active (visible to sellers)
                    </label>
                    <div style={{ display:"flex", gap:10, marginTop:20 }}>
                      <button type="submit" disabled={saving} className="sp-save-btn">
                        {saving ? "Saving…" : editing ? "Update Plan" : "Create Plan"}
                      </button>
                      <button type="button" onClick={() => setShowForm(false)} className="sp-cancel-btn">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Plans grid */}
              {loadingP ? (
                <div className="sp-loading"><div className="sp-spinner" /> Loading plans…</div>
              ) : plans.length === 0 ? (
                <div className="sp-empty">
                  <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
                  <p>No plans yet. Create your first plan.</p>
                </div>
              ) : (
                <div className="sp-plans-grid">
                  {plans.map(p => (
                    <div key={p._id} className={`sp-plan-card ${!p.isActive ? "inactive" : ""}`} style={{ borderTop:`4px solid ${p.color || "#2563eb"}` }}>
                      <div className="sp-plan-top">
                        <span className="sp-plan-icon">{p.icon}</span>
                        <div style={{ flex:1 }}>
                          <div className="sp-plan-name">{p.name}</div>
                          <div className="sp-plan-cycle">{p.billingCycle}</div>
                        </div>
                        <span className={`sp-plan-status ${p.isActive ? "on" : "off"}`}>{p.isActive ? "Active" : "Off"}</span>
                      </div>
                      <div className="sp-plan-price" style={{ color: p.color || "#2563eb" }}>
                        {p.monthlyFee === 0 ? "Free" : `${Number(p.monthlyFee).toLocaleString()} ETB`}
                        <span style={{ fontSize:12, color:"#94a3b8", fontWeight:400, marginLeft:4 }}>/{p.billingCycle.replace("ly","")}</span>
                      </div>
                      {p.description && <div className="sp-plan-desc">{p.description}</div>}
                      <div className="sp-plan-meta">
                        <div className="sp-plan-meta-item">📦 {p.productLimit} products/month</div>
                        <div className="sp-plan-meta-item">💹 {p.commissionRate}% commission</div>
                        {p.trialDays > 0 && <div className="sp-plan-meta-item">🎁 {p.trialDays}-day trial</div>}
                        {p.minProductPrice > 0 && <div className="sp-plan-meta-item">💰 Min: {p.minProductPrice.toLocaleString()} ETB</div>}
                        {p.maxProductPrice > 0 && <div className="sp-plan-meta-item">💰 Max: {p.maxProductPrice.toLocaleString()} ETB</div>}
                      </div>
                      {p.features?.length > 0 && (
                        <ul className="sp-plan-features">
                          {p.features.map((f,i) => <li key={i}>✓ {f}</li>)}
                        </ul>
                      )}
                      <div className="sp-plan-actions">
                        <button className="sp-act-btn edit" onClick={() => openEdit(p)}>Edit</button>
                        <button className="sp-act-btn del"  onClick={() => deletePlan(p._id)}>🗑</button>
                      </div>
                      <div className="sp-plan-usage">
                        {sellers.filter(s => s.staffInfo?.plan?._id === p._id).length} seller(s) on this plan
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Sellers tab ── */}
          {tab === "sellers" && (
            <div className="sp-sellers-table-wrap">
              {loadingS ? (
                <div className="sp-loading"><div className="sp-spinner" /> Loading sellers…</div>
              ) : sellers.length === 0 ? (
                <div className="sp-empty"><p>No sellers found.</p></div>
              ) : (
                <table className="sp-table">
                  <thead>
                    <tr>
                      <th>Seller</th>
                      <th>Business</th>
                      <th>Current Plan</th>
                      <th>Subscription</th>
                      <th>Expires</th>
                      <th>Listings This Month</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map(s => {
                      const sub = s.staffInfo?.subscriptionStatus || "none";
                      const sc  = SUB_COLORS[sub] || SUB_COLORS.none;
                      const plan = s.staffInfo?.plan;
                      return (
                        <tr key={s._id} className="sp-table-row">
                          <td>
                            <div style={{ fontWeight:700, color:"#0f172a" }}>{s.name}</div>
                            <div style={{ fontSize:11, color:"#94a3b8" }}>{s.email}</div>
                          </td>
                          <td style={{ fontSize:13, color:"#475569" }}>{s.staffInfo?.businessName || "—"}</td>
                          <td>
                            {plan
                              ? <span className="sp-plan-badge" style={{ background:`${plan.color}18`, color:plan.color, border:`1px solid ${plan.color}40` }}>{plan.icon} {plan.name}</span>
                              : <span style={{ fontSize:12, color:"#94a3b8" }}>No plan</span>}
                          </td>
                          <td>
                            <span style={{ background:sc.bg, color:sc.color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, textTransform:"capitalize" }}>
                              {sub}
                            </span>
                          </td>
                          <td style={{ fontSize:12, color:"#64748b" }}>
                            {s.staffInfo?.planExpiresAt
                              ? new Date(s.staffInfo.planExpiresAt).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })
                              : "—"}
                          </td>
                          <td style={{ fontWeight:600, color:"#0f172a", textAlign:"center" }}>
                            {s.staffInfo?.productListingsThisMonth || 0}
                            {plan && <span style={{ color:"#94a3b8", fontSize:11 }}> / {plan.productLimit}</span>}
                          </td>
                          <td>
                            <button className="sp-assign-btn" onClick={() => { setAssignModal(s); setAssignPlanId(s.staffInfo?.plan?._id || ""); setAssignStatus(sub === "none" ? "active" : sub); }}>
                              Assign Plan
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Assign plan modal */}
      {assignModal && (
        <div className="sp-overlay" onClick={() => setAssignModal(null)}>
          <div className="sp-modal" onClick={e => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h3>Assign Plan to {assignModal.name}</h3>
              <button className="sp-modal-close" onClick={() => setAssignModal(null)}>✕</button>
            </div>
            <div className="sp-modal-body">
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Select Plan</label>
                <select value={assignPlanId} onChange={e => setAssignPlanId(e.target.value)} style={inp}>
                  <option value="">— Choose a plan —</option>
                  {plans.filter(p => p.isActive).map(p => (
                    <option key={p._id} value={p._id}>{p.icon} {p.name} — {p.monthlyFee === 0 ? "Free" : `${p.monthlyFee.toLocaleString()} ETB/${p.billingCycle.replace("ly","")}`}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={lbl}>Subscription Status</label>
                <select value={assignStatus} onChange={e => setAssignStatus(e.target.value)} style={inp}>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={doAssign} disabled={assigning} className="sp-save-btn" style={{ flex:1 }}>
                  {assigning ? "Assigning…" : "Assign Plan"}
                </button>
                <button onClick={() => setAssignModal(null)} className="sp-cancel-btn" style={{ flex:1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
