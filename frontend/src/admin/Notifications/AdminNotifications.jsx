import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AdminNotifications.css";

const TYPE_META = {
  order:        { icon: "📦", label: "Order",        color: "#2563eb", bg: "#dbeafe" },
  payment:      { icon: "💳", label: "Payment",      color: "#16a34a", bg: "#dcfce7" },
  promotion:    { icon: "🎁", label: "Promotion",    color: "#7c3aed", bg: "#ede9fe" },
  system:       { icon: "⚙️", label: "System",       color: "#475569", bg: "#f1f5f9" },
  delivery:     { icon: "🚚", label: "Delivery",     color: "#0891b2", bg: "#e0f2fe" },
  verification: { icon: "✅", label: "Verification", color: "#16a34a", bg: "#dcfce7" },
};

const ROLES = [
  { value: "all",        label: "All Users"     },
  { value: "customer",   label: "Customers"     },
  { value: "seller",     label: "Sellers"       },
  { value: "cashier",    label: "Cashiers"      },
  { value: "admin",      label: "Admins"        },
  { value: "super_admin",label: "Super Admins"  },
];

const TYPE_OPTIONS = ["system","order","payment","delivery","promotion","verification"];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

export default function AdminNotifications() {
  const toast = useToast();
  const [tab,    setTab]    = useState("broadcast");  // broadcast | history
  const [stats,  setStats]  = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingH, setLoadingH] = useState(true);
  const [sending, setSending]   = useState(false);

  // Broadcast form
  const [bForm, setBForm] = useState({
    title: "", message: "", type: "system", icon: "📢",
    role: "all", link: "",
  });

  // Single user form
  const [sForm, setSForm] = useState({
    userId: "", email: "", title: "", message: "", type: "system", icon: "🔔", link: "",
  });
  const [lookingUp, setLookingUp] = useState(false);
  const [foundUser,  setFoundUser] = useState(null);

  useEffect(() => { fetchStats(); fetchHistory(); }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/notifications/admin/stats");
      setStats(res.data);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      setLoadingH(true);
      const res = await API.get("/notifications/admin/all?limit=50");
      setHistory(res.data.notifications || []);
    } catch { toast.error("Failed to load notification history"); }
    finally { setLoadingH(false); }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!bForm.title || !bForm.message) { toast.warning("Title and message are required"); return; }
    setSending(true);
    try {
      const res = await API.post("/notifications/broadcast", bForm);
      toast.success(`✅ Broadcast sent to ${res.data.count} user(s)`);
      setBForm({ title:"", message:"", type:"system", icon:"📢", role:"all", link:"" });
      fetchStats(); fetchHistory();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to broadcast"); }
    finally { setSending(false); }
  };

  const lookupUser = async () => {
    if (!sForm.email.trim()) { toast.warning("Enter an email address"); return; }
    setLookingUp(true);
    try {
      // Use the admin users endpoint to find by email
      const res = await API.get(`/admin/users?search=${encodeURIComponent(sForm.email)}`);
      const users = Array.isArray(res.data) ? res.data : res.data.users || [];
      const match = users.find(u => u.email.toLowerCase() === sForm.email.toLowerCase().trim());
      if (match) {
        setFoundUser(match);
        setSForm(f => ({ ...f, userId: match._id }));
      } else {
        toast.warning("No user found with that email");
        setFoundUser(null);
      }
    } catch { toast.error("Lookup failed"); }
    finally { setLookingUp(false); }
  };

  const sendToUser = async (e) => {
    e.preventDefault();
    if (!sForm.userId || !sForm.title || !sForm.message) {
      toast.warning("Lookup a user and fill in title and message");
      return;
    }
    setSending(true);
    try {
      await API.post("/notifications/send", sForm);
      toast.success(`Notification sent to ${foundUser?.name || "user"}`);
      setSForm({ userId:"", email:"", title:"", message:"", type:"system", icon:"🔔", link:"" });
      setFoundUser(null);
      fetchStats(); fetchHistory();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to send"); }
    finally { setSending(false); }
  };

  const inp = { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box", transition:"border-color 0.2s" };
  const lbl = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };

  return (
    <AdminLayout>
      <div className="an-page">

        {/* Header */}
        <div className="an-header">
          <div>
            <h1 className="an-title">Notifications</h1>
            <p className="an-sub">Send notifications to users and monitor notification activity</p>
          </div>
        </div>

        {/* Stats */}
        <div className="an-stats-grid">
          {[
            { label:"Total Sent",   value: stats?.total   || 0, icon:"📨", color:"#2563eb" },
            { label:"Unread",       value: stats?.unread  || 0, icon:"🔵", color:"#e11d48" },
            ...(stats?.byType || []).slice(0,3).map(b => ({
              label: TYPE_META[b._id]?.label || b._id,
              value: b.count,
              icon:  TYPE_META[b._id]?.icon  || "🔔",
              color: TYPE_META[b._id]?.color || "#64748b",
            })),
          ].map((s, i) => (
            <div key={i} className="an-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
              <div className="an-stat-row">
                <span className="an-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</span>
                <span className="an-stat-value" style={{ color:s.color }}>{s.value}</span>
              </div>
              <div className="an-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="an-tabs">
          {[
            { key:"broadcast", label:"📢 Send Notification" },
            { key:"single",    label:"👤 Send to User"      },
            { key:"history",   label:"📋 History"           },
          ].map(t => (
            <button
              key={t.key}
              className={`an-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="an-content">

          {/* ── Broadcast tab ── */}
          {tab === "broadcast" && (
            <form onSubmit={sendBroadcast} className="an-form">
              <div className="an-form-intro">
                <span className="an-form-intro-icon">📢</span>
                <div>
                  <div style={{ fontWeight:700, color:"#0f172a", fontSize:15 }}>Broadcast Notification</div>
                  <div style={{ fontSize:13, color:"#64748b" }}>Send a notification to all users or a specific role group instantly.</div>
                </div>
              </div>

              <div className="an-form-grid">
                <div>
                  <label style={lbl}>Target Audience</label>
                  <select value={bForm.role} onChange={e => setBForm(f=>({...f, role:e.target.value}))} style={inp}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Type</label>
                  <select value={bForm.type} onChange={e => setBForm(f=>({...f, type:e.target.value}))} style={inp}>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_META[t]?.icon} {TYPE_META[t]?.label || t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Icon (emoji)</label>
                  <input value={bForm.icon} onChange={e => setBForm(f=>({...f, icon:e.target.value}))} placeholder="📢" style={{...inp, width:80}} />
                </div>
                <div>
                  <label style={lbl}>Link (optional)</label>
                  <input value={bForm.link} onChange={e => setBForm(f=>({...f, link:e.target.value}))} placeholder="/products" style={inp} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Title *</label>
                  <input value={bForm.title} onChange={e => setBForm(f=>({...f, title:e.target.value}))} placeholder="e.g. Flash Sale — 20% off everything!" style={inp} required />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Message *</label>
                  <textarea value={bForm.message} onChange={e => setBForm(f=>({...f, message:e.target.value}))} rows="4" placeholder="Write the full notification message…" style={{...inp, resize:"vertical"}} required />
                </div>
              </div>

              {/* Preview */}
              {(bForm.title || bForm.message) && (
                <div className="an-preview">
                  <div className="an-preview-label">Preview</div>
                  <div className="an-preview-item">
                    <div className="an-preview-icon" style={{ background: TYPE_META[bForm.type]?.bg, color: TYPE_META[bForm.type]?.color }}>
                      {bForm.icon || TYPE_META[bForm.type]?.icon}
                    </div>
                    <div>
                      <div className="an-preview-title">{bForm.title || "—"}</div>
                      <div className="an-preview-msg">{bForm.message || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="an-send-btn" disabled={sending}>
                {sending ? "Sending…" : `📢 Send to ${bForm.role === "all" ? "All Users" : ROLES.find(r=>r.value===bForm.role)?.label}`}
              </button>
            </form>
          )}

          {/* ── Single user tab ── */}
          {tab === "single" && (
            <form onSubmit={sendToUser} className="an-form">
              <div className="an-form-intro">
                <span className="an-form-intro-icon">👤</span>
                <div>
                  <div style={{ fontWeight:700, color:"#0f172a", fontSize:15 }}>Send to Specific User</div>
                  <div style={{ fontSize:13, color:"#64748b" }}>Look up a user by email then send them a targeted notification.</div>
                </div>
              </div>

              {/* Email lookup */}
              <div style={{ marginBottom:16 }}>
                <label style={lbl}>User Email</label>
                <div style={{ display:"flex", gap:8 }}>
                  <input
                    type="email"
                    value={sForm.email}
                    onChange={e => { setSForm(f=>({...f, email:e.target.value})); setFoundUser(null); }}
                    placeholder="customer@example.com"
                    style={{ ...inp, flex:1 }}
                  />
                  <button type="button" onClick={lookupUser} disabled={lookingUp} className="an-lookup-btn">
                    {lookingUp ? "…" : "Look up"}
                  </button>
                </div>
                {foundUser && (
                  <div className="an-found-user">
                    <div className="an-found-avatar">{foundUser.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{foundUser.name}</div>
                      <div style={{ fontSize:11, color:"#64748b" }}>{foundUser.email} · {foundUser.role}</div>
                    </div>
                    <span style={{ marginLeft:"auto", background:"#dcfce7", color:"#16a34a", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>✓ Found</span>
                  </div>
                )}
              </div>

              <div className="an-form-grid">
                <div>
                  <label style={lbl}>Type</label>
                  <select value={sForm.type} onChange={e => setSForm(f=>({...f, type:e.target.value}))} style={inp}>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_META[t]?.icon} {TYPE_META[t]?.label || t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Icon (emoji)</label>
                  <input value={sForm.icon} onChange={e => setSForm(f=>({...f, icon:e.target.value}))} placeholder="🔔" style={{...inp, width:80}} />
                </div>
                <div>
                  <label style={lbl}>Link (optional)</label>
                  <input value={sForm.link} onChange={e => setSForm(f=>({...f, link:e.target.value}))} placeholder="/my-orders" style={inp} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Title *</label>
                  <input value={sForm.title} onChange={e => setSForm(f=>({...f, title:e.target.value}))} placeholder="Notification title" style={inp} required />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Message *</label>
                  <textarea value={sForm.message} onChange={e => setSForm(f=>({...f, message:e.target.value}))} rows="3" placeholder="Write your message…" style={{...inp, resize:"vertical"}} required />
                </div>
              </div>

              <button type="submit" className="an-send-btn" disabled={sending || !foundUser}>
                {sending ? "Sending…" : "Send Notification"}
              </button>
            </form>
          )}

          {/* ── History tab ── */}
          {tab === "history" && (
            <div>
              {loadingH ? (
                <div className="an-loading"><div className="an-spinner" /> Loading history…</div>
              ) : history.length === 0 ? (
                <div className="an-empty">
                  <div style={{ fontSize:48, marginBottom:12 }}>📨</div>
                  <p>No notifications sent yet.</p>
                </div>
              ) : (
                <div className="an-history-list">
                  {history.map(n => {
                    const tm = TYPE_META[n.type] || TYPE_META.system;
                    return (
                      <div key={n._id} className={`an-history-item ${!n.isRead ? "unread" : ""}`}>
                        <div className="an-history-icon" style={{ background:tm.bg, color:tm.color }}>
                          {n.icon || tm.icon}
                        </div>
                        <div className="an-history-body">
                          <div className="an-history-title">{n.title}</div>
                          <div className="an-history-msg">{n.message}</div>
                          <div className="an-history-meta">
                            <span className="an-type-badge" style={{ background:tm.bg, color:tm.color }}>{tm.label}</span>
                            {n.user && <span className="an-history-user">→ {n.user.name || n.user.email}</span>}
                            <span className="an-history-time">{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                        {!n.isRead && <span className="an-unread-dot" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
