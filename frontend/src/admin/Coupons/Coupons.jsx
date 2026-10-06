import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./Coupons.css";

const BLANK = {
  code:"", description:"", discountType:"percentage",
  discountValue:"", minOrderAmount:"", maxDiscount:"",
  maxUses:"", allowMultiUse:false,
  validFrom:"", validUntil:"", isActive:true,
};

const expiryStatus = (validUntil) => {
  if (!validUntil) return null;
  const diff = new Date(validUntil) - new Date();
  const days = Math.ceil(diff / 86400000);
  if (days < 0)  return { label:"Expired",       bg:"#fee2e2", color:"#dc2626" };
  if (days <= 7) return { label:`${days}d left`,  bg:"#fff7ed", color:"#c2410c" };
  return               { label:new Date(validUntil).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }), bg:"#f1f5f9", color:"#475569" };
};

function Coupons() {
  const toast = useToast();
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await API.get("/coupons");
      setCoupons(res.data.coupons || []);
    } catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit   = (c) => {
    setForm({ ...c, validFrom: c.validFrom?.slice(0,10) || "", validUntil: c.validUntil?.slice(0,10) || "" });
    setEditing(c._id); setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) { toast.warning("Code and discount value are required"); return; }
    try {
      setSaving(true);
      if (editing) {
        await API.patch(`/coupons/${editing}`, form);
        toast.success("Coupon updated");
      } else {
        await API.post("/coupons", form);
        toast.success("Coupon created");
      }
      setShowForm(false); fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save coupon"); }
    finally { setSaving(false); }
  };

  const toggle = async (id) => {
    try { await API.patch(`/coupons/${id}/toggle`); toast.success("Status updated"); fetchCoupons(); }
    catch { toast.error("Failed to toggle coupon"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try { await API.delete(`/coupons/${id}`); toast.success("Coupon deleted"); fetchCoupons(); }
    catch { toast.error("Failed to delete coupon"); }
  };

  const filtered = coupons.filter(c =>
    !search ||
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:   coupons.length,
    active:  coupons.filter(c => c.isActive).length,
    expired: coupons.filter(c => c.validUntil && new Date(c.validUntil) < new Date()).length,
    uses:    coupons.reduce((s, c) => s + (c.usedCount || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="coupons-page">

        {/* Header */}
        <div className="coup-header">
          <div>
            <h1 className="coup-title">Coupons</h1>
            <p className="coup-sub">Create and manage discount codes</p>
          </div>
          <button className="coup-create-btn" onClick={openCreate}>+ Create Coupon</button>
        </div>

        {/* Stats */}
        <div className="coup-stats-grid">
          {[
            { label:"Total",      value:stats.total,   icon:"🎟️", color:"#2563eb" },
            { label:"Active",     value:stats.active,  icon:"✅", color:"#16a34a" },
            { label:"Expired",    value:stats.expired, icon:"⏰", color:"#dc2626" },
            { label:"Total Uses", value:stats.uses,    icon:"📊", color:"#7c3aed" },
          ].map(s => (
            <div key={s.label} className="coup-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
              <div className="coup-stat-row">
                <span className="coup-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</span>
                <span className="coup-stat-value" style={{ color:s.color }}>{s.value}</span>
              </div>
              <div className="coup-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create / Edit form */}
        {showForm && (
          <div className="coup-form-card">
            <h2 className="coup-form-title">{editing ? "✏️ Edit Coupon" : "➕ Create New Coupon"}</h2>
            <form onSubmit={submitForm}>
              <div className="coup-form-grid">
                <div className="coup-field">
                  <label>Coupon Code *</label>
                  <input name="code" value={form.code} onChange={handleChange}
                    placeholder="e.g. SAVE20" required disabled={!!editing}
                    style={{ fontFamily:"monospace", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }} />
                </div>
                <div className="coup-field">
                  <label>Description</label>
                  <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. 20% off on all orders" />
                </div>
                <div className="coup-field">
                  <label>Discount Type *</label>
                  <select name="discountType" value={form.discountType} onChange={handleChange}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (ETB)</option>
                  </select>
                </div>
                <div className="coup-field">
                  <label>Discount Value * {form.discountType === "percentage" ? "(%)" : "(ETB)"}</label>
                  <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange}
                    placeholder={form.discountType === "percentage" ? "20" : "500"}
                    min="0" max={form.discountType === "percentage" ? 100 : undefined} required />
                </div>
                <div className="coup-field">
                  <label>Min Order Amount (ETB)</label>
                  <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} placeholder="0" min="0" />
                </div>
                {form.discountType === "percentage" && (
                  <div className="coup-field">
                    <label>Max Discount Cap (ETB)</label>
                    <input type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleChange} placeholder="Optional cap" min="0" />
                  </div>
                )}
                <div className="coup-field">
                  <label>Max Total Uses</label>
                  <input type="number" name="maxUses" value={form.maxUses} onChange={handleChange} placeholder="Unlimited" min="1" />
                </div>
                <div className="coup-field">
                  <label>Valid From</label>
                  <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} />
                </div>
                <div className="coup-field">
                  <label>Valid Until</label>
                  <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} />
                </div>
              </div>
              <div className="coup-checkboxes">
                <label className="coup-checkbox-label">
                  <input type="checkbox" name="allowMultiUse" checked={form.allowMultiUse} onChange={handleChange} />
                  Allow same user to use multiple times
                </label>
                <label className="coup-checkbox-label">
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                  Active (visible to customers)
                </label>
              </div>
              <div className="coup-form-actions">
                <button type="submit" className="coup-save-btn" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Update Coupon" : "Create Coupon"}
                </button>
                <button type="button" className="coup-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="coup-toolbar">
          <input
            className="coup-search"
            type="text"
            placeholder="🔍  Search coupons…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="coup-count">{filtered.length} of {coupons.length}</span>
        </div>

        {/* Table */}
        <div className="coup-table-wrap">
          <table className="coup-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="coup-td-center">
                  <div className="coup-loading"><div className="coup-spinner" /> Loading coupons…</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="coup-td-center">
                  <div className="coup-empty">
                    <div style={{ fontSize:40, marginBottom:8 }}>🎟️</div>
                    No coupons found. Create your first one.
                  </div>
                </td></tr>
              ) : filtered.map(c => {
                const isActive = c.isActive;
                const expiry = expiryStatus(c.validUntil);
                return (
                  <tr key={c._id} className={`coup-row ${!isActive ? "coup-row-inactive" : ""}`}>
                    <td>
                      <div className="coup-code">{c.code}</div>
                      {c.description && <div className="coup-desc">{c.description}</div>}
                    </td>
                    <td>
                      <div className="coup-discount">
                        {c.discountType === "percentage" ? `${c.discountValue}%` : `${Number(c.discountValue).toLocaleString()} ETB`}
                      </div>
                      {c.maxDiscount > 0 && (
                        <div className="coup-max">Max: {Number(c.maxDiscount).toLocaleString()} ETB</div>
                      )}
                    </td>
                    <td className="coup-min">
                      {c.minOrderAmount > 0 ? `${Number(c.minOrderAmount).toLocaleString()} ETB` : "—"}
                    </td>
                    <td>
                      <div className="coup-uses">
                        <span style={{ fontWeight:700 }}>{c.usedCount || 0}</span>
                        {c.maxUses > 0 && <span style={{ color:"#94a3b8" }}> / {c.maxUses}</span>}
                      </div>
                      {c.maxUses > 0 && (
                        <div className="coup-uses-bar">
                          <div style={{ width:`${Math.min(((c.usedCount||0)/c.maxUses)*100,100)}%`, background:"#2563eb", height:"100%", borderRadius:4 }} />
                        </div>
                      )}
                    </td>
                    <td>
                      {expiry ? (
                        <span className="coup-expiry-badge" style={{ background:expiry.bg, color:expiry.color }}>
                          {expiry.label}
                        </span>
                      ) : (
                        <span style={{ fontSize:12, color:"#94a3b8" }}>No expiry</span>
                      )}
                    </td>
                    <td>
                      <span className="coup-status-badge" style={{
                        background: isActive ? "#dcfce7" : "#fee2e2",
                        color:      isActive ? "#16a34a" : "#dc2626",
                      }}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="coup-actions">
                        <button className="coup-edit-btn" onClick={() => openEdit(c)}>Edit</button>
                        <button className={`coup-toggle-btn ${isActive ? "disable" : "enable"}`} onClick={() => toggle(c._id)}>
                          {isActive ? "Disable" : "Enable"}
                        </button>
                        <button className="coup-del-btn" onClick={() => remove(c._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Coupons;
