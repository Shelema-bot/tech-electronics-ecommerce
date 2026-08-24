import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const BLANK = {
  code: "", description: "", discountType: "percentage",
  discountValue: "", minOrderAmount: "", maxDiscount: "",
  maxUses: "", allowMultiUse: false,
  validFrom: "", validUntil: "", isActive: true,
};

const statusBadge = (c) => c.isActive
  ? { bg:"#dcfce7", color:"#16a34a", label:"Active" }
  : { bg:"#fee2e2", color:"#dc2626", label:"Inactive" };

function Coupons() {
  const toast = useToast();
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await API.get("/coupons");
      setCoupons(res.data.coupons || []);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit   = (c)  => {
    setForm({
      ...c,
      validFrom:  c.validFrom  ? c.validFrom.slice(0,10)  : "",
      validUntil: c.validUntil ? c.validUntil.slice(0,10) : "",
    });
    setEditing(c._id);
    setShowForm(true);
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
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id) => {
    try {
      await API.patch(`/coupons/${id}/toggle`);
      toast.success("Coupon status updated");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to toggle coupon");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await API.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  const inputStyle = { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, width:"100%", boxSizing:"border-box", outline:"none" };
  const labelStyle = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };

  return (
    <AdminLayout>
      <div style={{ padding:"28px 32px", minHeight:"100vh", background:"#f8fafc" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:14 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>Coupon Management</h1>
            <p style={{ fontSize:14, color:"#64748b", margin:0 }}>Create and manage discount coupons</p>
          </div>
          <button onClick={openCreate} style={{ padding:"10px 20px", background:"linear-gradient(135deg,#15803d,#16a34a)", color:"white", border:"none", borderRadius:9, fontWeight:700, fontSize:14, cursor:"pointer" }}>
            + Create Coupon
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Total", value: coupons.length, icon:"🎟️", color:"#2563eb" },
            { label:"Active", value: coupons.filter(c=>c.isActive).length, icon:"✅", color:"#16a34a" },
            { label:"Inactive", value: coupons.filter(c=>!c.isActive).length, icon:"⏸️", color:"#94a3b8" },
            { label:"Total Uses", value: coupons.reduce((s,c)=>s+c.usedCount,0), icon:"📊", color:"#7c3aed" },
          ].map(s => (
            <div key={s.label} style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize:28 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:12, color:"#64748b" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit form */}
        {showForm && (
          <div style={{ background:"white", border:"1px solid #bfdbfe", borderRadius:14, padding:24, marginBottom:24 }}>
            <h2 style={{ margin:"0 0 20px", fontSize:17, fontWeight:700 }}>{editing ? "Edit Coupon" : "Create New Coupon"}</h2>
            <form onSubmit={submitForm}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={labelStyle}>Coupon Code *</label>
                  <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SAVE20" style={inputStyle} required
                    disabled={!!editing} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. 20% off on all orders" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Discount Type *</label>
                  <select name="discountType" value={form.discountType} onChange={handleChange} style={inputStyle}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (ETB)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Discount Value * {form.discountType === "percentage" ? "(%)" : "(ETB)"}</label>
                  <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange}
                    placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 500"}
                    min="0" max={form.discountType === "percentage" ? 100 : undefined}
                    style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Min Order Amount (ETB)</label>
                  <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} placeholder="0" min="0" style={inputStyle} />
                </div>
                {form.discountType === "percentage" && (
                  <div>
                    <label style={labelStyle}>Max Discount Cap (ETB)</label>
                    <input type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleChange} placeholder="Optional cap" min="0" style={inputStyle} />
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Max Total Uses</label>
                  <input type="number" name="maxUses" value={form.maxUses} onChange={handleChange} placeholder="Leave empty for unlimited" min="1" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Valid From</label>
                  <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Valid Until</label>
                  <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
              <div style={{ display:"flex", gap:20, marginTop:14 }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  <input type="checkbox" name="allowMultiUse" checked={form.allowMultiUse} onChange={handleChange} />
                  Allow same user to use multiple times
                </label>
                <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                  Active
                </label>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button type="submit" disabled={saving} style={{ padding:"10px 24px", background:"#16a34a", color:"white", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
                  {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding:"10px 20px", background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons table */}
        <div style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f1f5f9" }}>
                {["Code","Discount","Min Order","Uses","Valid Until","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", borderBottom:"1px solid #e2e8f0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign:"center", padding:"40px", color:"#94a3b8" }}>Loading coupons...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign:"center", padding:"60px", color:"#94a3b8" }}>No coupons yet. Create your first coupon.</td></tr>
              ) : coupons.map(c => {
                const s = statusBadge(c);
                return (
                  <tr key={c._id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ fontWeight:800, fontSize:15, fontFamily:"monospace", color:"#2563eb" }}>{c.code}</div>
                      {c.description && <div style={{ fontSize:12, color:"#64748b" }}>{c.description}</div>}
                    </td>
                    <td style={{ padding:"13px 16px", fontWeight:700, color:"#0f172a" }}>
                      {c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()} ETB`}
                      {c.maxDiscount && <div style={{ fontSize:11, color:"#94a3b8" }}>Max: {c.maxDiscount.toLocaleString()} ETB</div>}
                    </td>
                    <td style={{ padding:"13px 16px", fontSize:13, color:"#64748b" }}>
                      {c.minOrderAmount > 0 ? `${c.minOrderAmount.toLocaleString()} ETB` : "—"}
                    </td>
                    <td style={{ padding:"13px 16px", fontSize:13 }}>
                      <span style={{ fontWeight:700 }}>{c.usedCount}</span>
                      {c.maxUses && <span style={{ color:"#94a3b8" }}> / {c.maxUses}</span>}
                    </td>
                    <td style={{ padding:"13px 16px", fontSize:13, color:"#64748b" }}>
                      {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : "No expiry"}
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ background:s.bg, color:s.color, padding:"3px 10px", borderRadius:"20px", fontSize:12, fontWeight:700 }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => openEdit(c)} style={{ padding:"5px 12px", background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => toggle(c._id)} style={{ padding:"5px 12px", background:c.isActive?"#fef9c3":"#dcfce7", color:c.isActive?"#a16207":"#16a34a", border:"1px solid",  borderColor:c.isActive?"#fde68a":"#bbf7d0", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                          {c.isActive ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => remove(c._id)} style={{ padding:"5px 10px", background:"transparent", color:"#94a3b8", border:"1px solid #e2e8f0", borderRadius:6, fontSize:12, cursor:"pointer" }}>
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
    </AdminLayout>
  );
}

export default Coupons;
