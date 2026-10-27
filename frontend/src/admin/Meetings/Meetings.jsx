import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./Meetings.css";

const MEETING_TYPES = [
  { value:"general",      label:"General",         icon:"💬" },
  { value:"training",     label:"Training",         icon:"📚" },
  { value:"onboarding",   label:"Onboarding",       icon:"🚀" },
  { value:"plan_review",  label:"Plan Review",      icon:"📋" },
  { value:"support",      label:"Support",          icon:"🛟" },
  { value:"all_sellers",  label:"All Sellers",      icon:"🏪" },
];

const PLATFORMS = [
  { value:"zoom",         label:"Zoom",             icon:"🎥" },
  { value:"google_meet",  label:"Google Meet",      icon:"🤝" },
  { value:"teams",        label:"Microsoft Teams",  icon:"💼" },
  { value:"phone",        label:"Phone Call",       icon:"📞" },
  { value:"in_person",    label:"In Person",        icon:"📍" },
  { value:"other",        label:"Other",            icon:"🔗" },
];

const STATUS_META = {
  scheduled:  { bg:"#dbeafe", color:"#1d4ed8",  icon:"📅" },
  ongoing:    { bg:"#dcfce7", color:"#16a34a",  icon:"🔴" },
  completed:  { bg:"#f1f5f9", color:"#475569",  icon:"✅" },
  cancelled:  { bg:"#fee2e2", color:"#dc2626",  icon:"✕" },
};

const RSVP_META = {
  pending:   { bg:"#fef9c3", color:"#a16207" },
  accepted:  { bg:"#dcfce7", color:"#16a34a" },
  declined:  { bg:"#fee2e2", color:"#dc2626" },
  attended:  { bg:"#dbeafe", color:"#1d4ed8" },
};

const toLocalInput = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const pad = n => String(n).padStart(2,"0");
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const BLANK = {
  title:"", description:"", type:"general", scheduledAt:"",
  durationMin:"60", location:"", platform:"other", meetingLink:"",
  targetAll:false, notes:"",
};

const inp = { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" };
const lbl = { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 };

export default function Meetings() {
  const toast = useToast();
  const [meetings, setMeetings] = useState([]);
  const [sellers,  setSellers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [saving,   setSaving]   = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [detail,   setDetail]   = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { fetchMeetings(); fetchSellers(); }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/meetings");
      setMeetings(res.data.meetings || []);
    } catch { toast.error("Failed to load meetings"); }
    finally { setLoading(false); }
  };

  const fetchSellers = async () => {
    try {
      const res = await API.get("/seller-plans/sellers");
      setSellers((res.data.sellers || []).filter(s => s.staffInfo?.verificationStatus === "verified"));
    } catch {}
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => { setForm(BLANK); setEditing(null); setSelectedInvitees([]); setShowForm(true); };
  const openEdit   = m => {
    setForm({ ...m, scheduledAt: toLocalInput(m.scheduledAt), notes: m.notes || "" });
    setEditing(m._id);
    setSelectedInvitees(m.invitees.map(i => i.user?._id || i.user).filter(Boolean));
    setShowForm(true);
  };

  const toggleInvitee = id => {
    setSelectedInvitees(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const saveMeeting = async e => {
    e.preventDefault();
    if (!form.title || !form.scheduledAt) { toast.warning("Title and date/time are required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        inviteeIds: form.targetAll ? [] : selectedInvitees,
      };
      if (editing) await API.put(`/meetings/${editing}`, payload);
      else         await API.post("/meetings", payload);
      toast.success(editing ? "Meeting updated" : "Meeting scheduled ✓");
      setShowForm(false); fetchMeetings();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const doCancel = async () => {
    try {
      await API.patch(`/meetings/${cancelId}/cancel`, { reason: cancelReason });
      toast.success("Meeting cancelled");
      setCancelId(null); setCancelReason(""); fetchMeetings();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const markStatus = async (id, status) => {
    try { await API.put(`/meetings/${id}`, { status }); fetchMeetings(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const filtered = filter === "all" ? meetings
    : meetings.filter(m => m.status === filter);

  const upcoming  = meetings.filter(m => m.status === "scheduled" && new Date(m.scheduledAt) >= new Date()).length;
  const today     = meetings.filter(m => {
    const d = new Date(m.scheduledAt);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  }).length;

  return (
    <AdminLayout>
      <div className="mt-page">

        {/* Header */}
        <div className="mt-header">
          <div>
            <h1 className="mt-title">Meeting Scheduler</h1>
            <p className="mt-sub">Schedule and manage meetings with your sellers</p>
          </div>
          <button className="mt-create-btn" onClick={openCreate}>+ Schedule Meeting</button>
        </div>

        {/* Stats */}
        <div className="mt-stats">
          {[
            { label:"Total",       value: meetings.length,                                             icon:"📅", color:"#2563eb" },
            { label:"Upcoming",    value: upcoming,                                                    icon:"⏰", color:"#0891b2" },
            { label:"Today",       value: today,                                                       icon:"📍", color:"#f59e0b" },
            { label:"Completed",   value: meetings.filter(m=>m.status==="completed").length,           icon:"✅", color:"#16a34a" },
            { label:"Cancelled",   value: meetings.filter(m=>m.status==="cancelled").length,           icon:"✕",  color:"#dc2626" },
          ].map(s => (
            <div key={s.label} className="mt-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
              <div className="mt-stat-row">
                <span className="mt-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</span>
                <span className="mt-stat-value" style={{ color:s.color }}>{s.value}</span>
              </div>
              <div className="mt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create / Edit form */}
        {showForm && (
          <div className="mt-form-card">
            <h3 style={{ margin:"0 0 20px", fontSize:17, fontWeight:800, color:"#0f172a" }}>
              {editing ? "✏️ Edit Meeting" : "📅 Schedule New Meeting"}
            </h3>
            <form onSubmit={saveMeeting}>
              <div className="mt-form-grid">
                <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Meeting Title *</label><input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Monthly Seller Training" style={inp} required /></div>
                <div>
                  <label style={lbl}>Type</label>
                  <select name="type" value={form.type} onChange={handleChange} style={inp}>
                    {MEETING_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Platform</label>
                  <select name="platform" value={form.platform} onChange={handleChange} style={inp}>
                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Date & Time *</label>
                  <input type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} style={inp} required />
                </div>
                <div>
                  <label style={lbl}>Duration (minutes)</label>
                  <input type="number" name="durationMin" value={form.durationMin} onChange={handleChange} min="15" max="480" style={inp} />
                </div>
                <div><label style={lbl}>Location / Room</label><input name="location" value={form.location} onChange={handleChange} placeholder="Room 3, Addis Office" style={inp} /></div>
                <div><label style={lbl}>Meeting Link (if virtual)</label><input name="meetingLink" value={form.meetingLink} onChange={handleChange} placeholder="https://meet.google.com/..." style={inp} /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Meeting agenda and details..." style={{ ...inp, resize:"vertical" }} /></div>
              </div>

              {/* Invitees */}
              <div style={{ marginTop:18 }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700, cursor:"pointer", color:"#0f172a", marginBottom:12 }}>
                  <input type="checkbox" name="targetAll" checked={!!form.targetAll} onChange={handleChange} />
                  📢 Invite ALL verified sellers
                </label>
                {!form.targetAll && (
                  <div>
                    <label style={lbl}>Select Individual Sellers ({selectedInvitees.length} selected)</label>
                    <div className="mt-seller-grid">
                      {sellers.length === 0
                        ? <span style={{ fontSize:13, color:"#94a3b8" }}>No verified sellers found</span>
                        : sellers.map(s => (
                          <label key={s._id} className={`mt-seller-chip ${selectedInvitees.includes(s._id) ? "selected" : ""}`}>
                            <input type="checkbox" checked={selectedInvitees.includes(s._id)} onChange={() => toggleInvitee(s._id)} hidden />
                            <span className="mt-chip-avatar">{s.name?.charAt(0).toUpperCase()}</span>
                            <div>
                              <div className="mt-chip-name">{s.name}</div>
                              <div className="mt-chip-biz">{s.staffInfo?.businessName || s.email}</div>
                            </div>
                            {selectedInvitees.includes(s._id) && <span className="mt-chip-check">✓</span>}
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button type="submit" disabled={saving} className="mt-save-btn">
                  {saving ? "Saving…" : editing ? "Update Meeting" : "Schedule Meeting"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="mt-cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter pills */}
        <div className="mt-filter-row">
          {["all","scheduled","ongoing","completed","cancelled"].map(s => (
            <button key={s} className={`mt-pill ${filter===s?"active":""}`} onClick={() => setFilter(s)}>
              {s==="all" ? "All" : STATUS_META[s]?.icon+" "+s}
            </button>
          ))}
          <span className="mt-count">{filtered.length} meetings</span>
        </div>

        {/* Meetings list */}
        {loading ? (
          <div className="mt-loading"><div className="mt-spinner" /> Loading meetings…</div>
        ) : filtered.length === 0 ? (
          <div className="mt-empty">
            <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
            <p>No meetings found. Schedule your first one.</p>
          </div>
        ) : (
          <div className="mt-list">
            {filtered.map(m => {
              const sm = STATUS_META[m.status] || STATUS_META.scheduled;
              const type = MEETING_TYPES.find(t => t.value === m.type) || MEETING_TYPES[0];
              const platform = PLATFORMS.find(p => p.value === m.platform) || PLATFORMS[5];
              const isPast = new Date(m.scheduledAt) < new Date();
              const accepted  = m.invitees.filter(i => i.status === "accepted").length;
              const declined  = m.invitees.filter(i => i.status === "declined").length;
              const pending   = m.invitees.filter(i => i.status === "pending").length;
              return (
                <div key={m._id} className={`mt-card ${m.status === "cancelled" ? "cancelled" : ""}`}>
                  <div className="mt-card-left">
                    <div className="mt-type-icon">{type.icon}</div>
                  </div>
                  <div className="mt-card-body">
                    <div className="mt-card-top">
                      <div>
                        <div className="mt-card-title">{m.title}</div>
                        <div className="mt-card-meta">
                          {platform.icon} {platform.label}
                          {m.location && <> &nbsp;·&nbsp; 📍 {m.location}</>}
                          {m.meetingLink && <> &nbsp;·&nbsp; <a href={m.meetingLink} target="_blank" rel="noreferrer" className="mt-join-link">Join Link ↗</a></>}
                        </div>
                      </div>
                      <span className="mt-status-badge" style={{ background:sm.bg, color:sm.color }}>{sm.icon} {m.status}</span>
                    </div>

                    <div className="mt-card-time">
                      <span>📅 {new Date(m.scheduledAt).toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric", year:"numeric" })}</span>
                      <span>🕐 {new Date(m.scheduledAt).toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" })}</span>
                      <span>⏱ {m.durationMin} min</span>
                    </div>

                    {m.description && <p className="mt-card-desc">{m.description}</p>}

                    {/* RSVP summary */}
                    {m.invitees.length > 0 && (
                      <div className="mt-rsvp-row">
                        <span className="mt-rsvp-chip accepted">✓ {accepted} accepted</span>
                        <span className="mt-rsvp-chip declined">✗ {declined} declined</span>
                        <span className="mt-rsvp-chip pending">⏳ {pending} pending</span>
                        {m.targetAll && <span className="mt-all-sellers-tag">📢 All sellers</span>}
                      </div>
                    )}
                    {m.targetAll && m.invitees.length === 0 && (
                      <div className="mt-rsvp-row"><span className="mt-all-sellers-tag">📢 Invited all sellers</span></div>
                    )}
                  </div>

                  <div className="mt-card-actions">
                    {m.status === "scheduled" && (
                      <>
                        <button className="mt-act-btn edit" onClick={() => openEdit(m)}>Edit</button>
                        <button className="mt-act-btn start" onClick={() => markStatus(m._id,"ongoing")}>▶ Start</button>
                        <button className="mt-act-btn cancel" onClick={() => { setCancelId(m._id); setCancelReason(""); }}>Cancel</button>
                      </>
                    )}
                    {m.status === "ongoing" && (
                      <button className="mt-act-btn complete" onClick={() => markStatus(m._id,"completed")}>✓ Complete</button>
                    )}
                    <button className="mt-act-btn detail" onClick={() => setDetail(m)}>👁 Detail</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelId && (
        <div className="mt-overlay" onClick={() => setCancelId(null)}>
          <div className="mt-modal" onClick={e => e.stopPropagation()}>
            <div className="mt-modal-header"><h3 style={{ color:"#dc2626" }}>Cancel Meeting</h3><button className="mt-modal-close" onClick={() => setCancelId(null)}>✕</button></div>
            <div className="mt-modal-body">
              <p style={{ fontSize:14, color:"#64748b", marginBottom:12 }}>Provide a reason — sellers will be notified.</p>
              <textarea rows="3" style={{ ...inp, resize:"none" }} placeholder="e.g. Rescheduled to next week…" value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <button onClick={doCancel} style={{ flex:1, padding:11, background:"#dc2626", color:"white", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>Cancel Meeting</button>
                <button onClick={() => setCancelId(null)} style={{ flex:1, padding:11, background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>Go Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="mt-overlay" onClick={() => setDetail(null)}>
          <div className="mt-modal mt-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="mt-modal-header">
              <div><h3>{detail.title}</h3><span style={{ fontSize:12, color:"#94a3b8" }}>{MEETING_TYPES.find(t=>t.value===detail.type)?.icon} {detail.type}</span></div>
              <button className="mt-modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="mt-modal-body">
              <div className="mt-detail-grid">
                <div className="mt-detail-item"><span>Date & Time</span><strong>{new Date(detail.scheduledAt).toLocaleString()}</strong></div>
                <div className="mt-detail-item"><span>Duration</span><strong>{detail.durationMin} minutes</strong></div>
                <div className="mt-detail-item"><span>Platform</span><strong>{PLATFORMS.find(p=>p.value===detail.platform)?.label}</strong></div>
                <div className="mt-detail-item"><span>Status</span><strong style={{ color:STATUS_META[detail.status]?.color }}>{detail.status}</strong></div>
                {detail.location    && <div className="mt-detail-item"><span>Location</span><strong>{detail.location}</strong></div>}
                {detail.meetingLink && <div className="mt-detail-item"><span>Link</span><a href={detail.meetingLink} target="_blank" rel="noreferrer" style={{ color:"#2563eb", fontWeight:600 }}>Open Meeting ↗</a></div>}
                {detail.description && <div className="mt-detail-item" style={{ gridColumn:"1/-1" }}><span>Description</span><strong>{detail.description}</strong></div>}
                {detail.notes && <div className="mt-detail-item" style={{ gridColumn:"1/-1" }}><span>Notes</span><strong>{detail.notes}</strong></div>}
              </div>
              {/* Invitees */}
              {(detail.invitees.length > 0 || detail.targetAll) && (
                <div style={{ marginTop:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:10 }}>
                    Invitees {detail.targetAll && <span style={{ background:"#dbeafe", color:"#1d4ed8", padding:"2px 8px", borderRadius:20, fontSize:11, marginLeft:6 }}>All Sellers</span>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {detail.invitees.map(inv => {
                      const rc = RSVP_META[inv.status] || RSVP_META.pending;
                      return (
                        <div key={inv._id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#f8fafc", borderRadius:8 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:"#2563eb", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
                            {inv.user?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600, fontSize:13 }}>{inv.user?.name || "Unknown"}</div>
                            <div style={{ fontSize:11, color:"#94a3b8" }}>{inv.user?.email}</div>
                          </div>
                          <span style={{ background:rc.bg, color:rc.color, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, textTransform:"capitalize" }}>{inv.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
