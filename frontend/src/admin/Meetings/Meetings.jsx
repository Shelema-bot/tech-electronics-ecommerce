import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/common/Pagination";
import VideoMeetingRoom from "./VideoMeetingRoom";
import { isShelema } from "../AdminRoute";
import "./Meetings.css";

const MEETING_TYPES = [
  { value: "staff_sync",       label: "Staff Sync & Standup",     icon: "💼" },
  { value: "department_sync",  label: "Department Sync",          icon: "👥" },
  { value: "emergency",        label: "Emergency & Critical",     icon: "🚨" },
  { value: "general",          label: "General Discussion",       icon: "💬" },
  { value: "training",         label: "Training & Onboarding",    icon: "📚" },
  { value: "plan_review",      label: "Performance & Review",     icon: "📋" },
  { value: "all_sellers",      label: "All Sellers Townhall",     icon: "🏪" },
];

const PLATFORMS = [
  { value: "in_app_video", label: "In-App Video Room (HD WebRTC)", icon: "📹" },
  { value: "jitsi",        label: "Multi-Peer Cloud Grid",         icon: "🌐" },
  { value: "zoom",         label: "Zoom",                          icon: "🎥" },
  { value: "google_meet",  label: "Google Meet",                   icon: "🤝" },
  { value: "teams",        label: "Microsoft Teams",               icon: "💼" },
  { value: "in_person",    label: "In Person (Office)",            icon: "📍" },
  { value: "other",        label: "Other External Link",           icon: "🔗" },
];

const AUDIENCE_OPTIONS = [
  { value: "all_staff",            label: "🏢 All Staff Members",           desc: "Entire organization & staff roles" },
  { value: "roles",                label: "👥 Specific Department Roles",   desc: "Target Cashier, Delivery, Inventory, etc." },
  { value: "selected_individuals", label: "👤 Select Individual Staff",     desc: "Pick specific colleagues from directory" },
  { value: "all_sellers",          label: "🏪 All Verified Sellers",       desc: "Verified merchant partners" },
];

const AVAILABLE_STAFF_ROLES = [
  { value: "CashierFinance",   label: "Cashier & Finance",         icon: "💳" },
  { value: "Delivery",         label: "Delivery & Logistics",      icon: "🚚" },
  { value: "InventoryManager", label: "Inventory Manager / Admin", icon: "📦" },
  { value: "Seller",           label: "Sellers",                   icon: "🏪" },
  { value: "WebAppManager",    label: "Web Apps Manager",          icon: "🌐" },
];

const STATUS_META = {
  scheduled: { bg: "#dbeafe", color: "#1d4ed8", icon: "📅", label: "Scheduled" },
  ongoing:   { bg: "#dcfce7", color: "#16a34a", icon: "🔴", label: "Live Now" },
  completed: { bg: "#f1f5f9", color: "#475569", icon: "✅", label: "Completed" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", icon: "✕", label: "Cancelled" },
};

const toLocalInput = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
    dt.getDate()
  )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const BLANK = {
  title: "",
  description: "",
  type: "staff_sync",
  scheduledAt: "",
  durationMin: "60",
  location: "",
  platform: "in_app_video",
  meetingLink: "",
  targetAudience: "all_staff",
  notes: "",
};

const inp = {
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const lbl = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  display: "block",
  marginBottom: 5,
};

export default function Meetings() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [meetings, setMeetings]         = useState([]);
  const [staffList, setStaffList]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState(BLANK);
  const [saving, setSaving]             = useState(false);
  const [filter, setFilter]             = useState("all");
  const [detail, setDetail]             = useState(null);
  const [cancelId, setCancelId]         = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [selectedInvitees, setSelectedInvitees] = useState([]);
  const [selectedRoles, setSelectedRoles]       = useState([]);

  // Active Live Video Room State
  const [activeVideoMeeting, setActiveVideoMeeting] = useState(null);

  // Pagination states
  const [meetingPage, setMeetingPage]         = useState(1);
  const [meetingsPerPage, setMeetingsPerPage] = useState(6);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = isShelema(currentUser);

  useEffect(() => {
    fetchMeetings();
    fetchStaffList();
  }, []);

  // Check URL ?room=... parameter for auto-joining
  useEffect(() => {
    const roomParam = searchParams.get("room");
    if (roomParam && meetings.length > 0) {
      const target = meetings.find(
        (m) => m.roomId === roomParam || m._id === roomParam
      );
      if (target) {
        setActiveVideoMeeting(target);
      }
    }
  }, [searchParams, meetings]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/meetings");
      setMeetings(res.data.meetings || []);
    } catch {
      toast.error("Failed to load staff meetings");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await API.get("/meetings/staff/members");
      setStaffList(res.data.staff || []);
    } catch (e) {
      console.log("Staff list err:", e.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleRole = (r) => {
    setSelectedRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const toggleInvitee = (id) => {
    setSelectedInvitees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openCreate = () => {
    if (!isOwner) {
      toast.warning("Restricted: Only the Owner (Shelema) can schedule staff meetings.");
      return;
    }
    setForm(BLANK);
    setEditing(null);
    setSelectedInvitees([]);
    setSelectedRoles([]);
    setShowForm(true);
  };

  const openEdit = (m) => {
    if (!isOwner) {
      toast.warning("Restricted: Only the Owner (Shelema) can edit staff meetings.");
      return;
    }
    setForm({
      ...m,
      scheduledAt: toLocalInput(m.scheduledAt),
      notes: m.notes || "",
    });
    setEditing(m._id);
    setSelectedInvitees(
      (m.invitees || []).map((i) => i.user?._id || i.user).filter(Boolean)
    );
    setSelectedRoles(m.targetRoles || []);
    setShowForm(true);
  };

  const saveMeeting = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      toast.error("Restricted: Only the Owner (Shelema) has permission to schedule meetings.");
      return;
    }
    if (!form.title || !form.scheduledAt) {
      toast.warning("Title and date/time are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        targetRoles: form.targetAudience === "roles" ? selectedRoles : [],
        inviteeIds:
          form.targetAudience === "selected_individuals"
            ? selectedInvitees
            : [],
      };
      if (editing) await API.put(`/meetings/${editing}`, payload);
      else await API.post("/meetings", payload);

      toast.success(
        editing
          ? "Meeting updated successfully"
          : "Staff meeting scheduled with video room! ✓"
      );
      setShowForm(false);
      fetchMeetings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save meeting");
    } finally {
      setSaving(false);
    }
  };

  const doCancel = async () => {
    try {
      await API.patch(`/meetings/${cancelId}/cancel`, { reason: cancelReason });
      toast.success("Meeting cancelled");
      setCancelId(null);
      setCancelReason("");
      fetchMeetings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const markStatus = async (id, status) => {
    try {
      await API.put(`/meetings/${id}`, { status });
      fetchMeetings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const handleJoinVideoRoom = (m) => {
    setActiveVideoMeeting(m);
  };

  // Filter meetings
  const filtered =
    filter === "all" ? meetings : meetings.filter((m) => m.status === filter);

  // Pagination for meetings
  const totalMeetings = filtered.length;
  const startIndex = (meetingPage - 1) * meetingsPerPage;
  const paginatedMeetings = filtered.slice(
    startIndex,
    startIndex + meetingsPerPage
  );

  const upcomingCount = meetings.filter(
    (m) => m.status === "scheduled" && new Date(m.scheduledAt) >= new Date()
  ).length;
  const liveCount = meetings.filter((m) => m.status === "ongoing").length;

  return (
    <AdminLayout>
      <div className="mt-page">
        {/* Active Fullscreen Video Meeting Room */}
        {activeVideoMeeting && (
          <VideoMeetingRoom
            meeting={activeVideoMeeting}
            onClose={() => {
              setActiveVideoMeeting(null);
              // Clean query param
              if (searchParams.get("room")) {
                searchParams.delete("room");
                setSearchParams(searchParams);
              }
              fetchMeetings();
            }}
            currentUser={currentUser}
          />
        )}

        {/* ── Top Header ── */}
        <div className="mt-header">
          <div>
            <h1 className="mt-title">📹 Staff Meetings &amp; Video Conferencing</h1>
            <p className="mt-sub">
              Schedule team syncs, launch instant in-browser HD video calls, share screens, and collaborate.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {isOwner ? (
              <button className="mt-create-btn" onClick={openCreate}>
                + Schedule Staff Meeting
              </button>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "8px 16px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
                🔒 Meeting Scheduling is Reserved for the Owner (Shelema)
              </span>
            )}
          </div>
        </div>

        {/* ── Live Ongoing Banner if a meeting is active ── */}
        {liveCount > 0 && (
          <div className="mt-live-banner">
            <div className="mt-live-banner-left">
              <span className="mt-live-pulse-dot" />
              <div>
                <strong>🔴 Live Meeting In Progress!</strong>
                <span>Staff members are currently connected in a video room.</span>
              </div>
            </div>
            {meetings.find((m) => m.status === "ongoing") && (
              <button
                className="mt-join-live-btn"
                onClick={() =>
                  handleJoinVideoRoom(
                    meetings.find((m) => m.status === "ongoing")
                  )
                }
              >
                📹 Join Live Video Room Now
              </button>
            )}
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="mt-stats">
          {[
            { label: "Total Meetings", value: meetings.length, icon: "📅", color: "#2563eb" },
            { label: "Live Now",       value: liveCount,       icon: "🔴", color: "#16a34a" },
            { label: "Upcoming",       value: upcomingCount,   icon: "⏰", color: "#0891b2" },
            { label: "Completed",      value: meetings.filter((m) => m.status === "completed").length, icon: "✅", color: "#64748b" },
            { label: "Staff Members",  value: staffList.length, icon: "👥", color: "#7c3aed" },
          ].map((s) => (
            <div
              key={s.label}
              className="mt-stat-card"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <div className="mt-stat-row">
                <span
                  className="mt-stat-icon"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  {s.icon}
                </span>
                <span className="mt-stat-value" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
              <div className="mt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Create / Edit Form Drawer ── */}
        {showForm && (
          <div className="mt-form-card">
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              {editing ? "✏️ Edit Staff Meeting" : "📅 Schedule Staff Video Meeting"}
            </h3>
            <form onSubmit={saveMeeting}>
              <div className="mt-form-grid">
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={lbl}>Meeting Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Weekly Operations Sync & Product Review"
                    style={inp}
                    required
                  />
                </div>

                <div>
                  <label style={lbl}>Meeting Category</label>
                  <select name="type" value={form.type} onChange={handleChange} style={inp}>
                    {MEETING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={lbl}>Video Platform &amp; Support</label>
                  <select name="platform" value={form.platform} onChange={handleChange} style={inp}>
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={lbl}>Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={form.scheduledAt}
                    onChange={handleChange}
                    style={inp}
                    required
                  />
                </div>

                <div>
                  <label style={lbl}>Estimated Duration (minutes)</label>
                  <input
                    type="number"
                    name="durationMin"
                    value={form.durationMin}
                    onChange={handleChange}
                    min="15"
                    max="480"
                    style={inp}
                  />
                </div>

                <div>
                  <label style={lbl}>Location / Room Info (Optional)</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Virtual Video Room / Main Office Addis"
                    style={inp}
                  />
                </div>

                <div>
                  <label style={lbl}>Custom External Link (Optional)</label>
                  <input
                    name="meetingLink"
                    value={form.meetingLink}
                    onChange={handleChange}
                    placeholder="Automatic in-app room generated if left blank"
                    style={inp}
                  />
                </div>

                <div style={{ gridColumn: "1/-1" }}>
                  <label style={lbl}>Agenda &amp; Discussion Points</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Meeting objectives, delivery metrics, stock inventory updates..."
                    style={{ ...inp, resize: "vertical" }}
                  />
                </div>
              </div>

              {/* Audience Targeting */}
              <div className="mt-audience-section">
                <label style={lbl}>Target Audience &amp; Invitees *</label>
                <div className="mt-audience-grid">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`mt-audience-card ${
                        form.targetAudience === opt.value ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetAudience"
                        value={opt.value}
                        checked={form.targetAudience === opt.value}
                        onChange={handleChange}
                        hidden
                      />
                      <div className="mt-aud-label">{opt.label}</div>
                      <div className="mt-aud-desc">{opt.desc}</div>
                    </label>
                  ))}
                </div>

                {/* Specific Roles Checkboxes */}
                {form.targetAudience === "roles" && (
                  <div style={{ marginTop: 14 }}>
                    <label style={{ ...lbl, fontSize: 12 }}>
                      Select Department Roles to Invite:
                    </label>
                    <div className="mt-roles-checkbox-grid">
                      {AVAILABLE_STAFF_ROLES.map((r) => (
                        <label
                          key={r.value}
                          className={`mt-role-chip ${
                            selectedRoles.includes(r.value) ? "active" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(r.value)}
                            onChange={() => toggleRole(r.value)}
                            hidden
                          />
                          <span>{r.icon}</span>
                          <span>{r.label}</span>
                          {selectedRoles.includes(r.value) && <span>✓</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Staff Selection */}
                {form.targetAudience === "selected_individuals" && (
                  <div style={{ marginTop: 14 }}>
                    <label style={{ ...lbl, fontSize: 12 }}>
                      Select Staff Colleagues ({selectedInvitees.length} selected):
                    </label>
                    <div className="mt-seller-grid">
                      {staffList.length === 0 ? (
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>
                          No staff found
                        </span>
                      ) : (
                        staffList.map((s) => (
                          <label
                            key={s._id}
                            className={`mt-seller-chip ${
                              selectedInvitees.includes(s._id) ? "selected" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedInvitees.includes(s._id)}
                              onChange={() => toggleInvitee(s._id)}
                              hidden
                            />
                            <span className="mt-chip-avatar">
                              {s.name?.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div className="mt-chip-name">{s.name}</div>
                              <div className="mt-chip-biz">
                                {s.role} &bull; {s.email}
                              </div>
                            </div>
                            {selectedInvitees.includes(s._id) && (
                              <span className="mt-chip-check">✓</span>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button type="submit" disabled={saving} className="mt-save-btn">
                  {saving
                    ? "Saving…"
                    : editing
                    ? "Update Meeting"
                    : "📹 Schedule & Create Video Room"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="mt-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Status Filter Pills ── */}
        <div className="mt-filter-row">
          {["all", "ongoing", "scheduled", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              className={`mt-pill ${filter === s ? "active" : ""}`}
              onClick={() => {
                setFilter(s);
                setMeetingPage(1);
              }}
            >
              {s === "all" ? "All Meetings" : STATUS_META[s]?.icon + " " + (STATUS_META[s]?.label || s)}
            </button>
          ))}
          <span className="mt-count">{filtered.length} meetings</span>
        </div>

        {/* ── Meeting Cards List ── */}
        {loading ? (
          <div className="mt-loading">
            <div className="mt-spinner" /> Loading meetings &amp; video rooms…
          </div>
        ) : paginatedMeetings.length === 0 ? (
          <div className="mt-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📹</div>
            <p>No meetings found in this view. Schedule your first staff sync!</p>
          </div>
        ) : (
          <div className="mt-list">
            {paginatedMeetings.map((m) => {
              const sm = STATUS_META[m.status] || STATUS_META.scheduled;
              const type =
                MEETING_TYPES.find((t) => t.value === m.type) || MEETING_TYPES[0];
              const platform =
                PLATFORMS.find((p) => p.value === m.platform) || PLATFORMS[0];
              const isHost = isOwner;

              return (
                <div
                  key={m._id}
                  className={`mt-card ${m.status === "cancelled" ? "cancelled" : ""} ${
                    m.status === "ongoing" ? "ongoing-card" : ""
                  }`}
                >
                  <div className="mt-card-left">
                    <div className="mt-type-icon">{type.icon}</div>
                  </div>

                  <div className="mt-card-body">
                    <div className="mt-card-top">
                      <div>
                        <div className="mt-card-title">{m.title}</div>
                        <div className="mt-card-meta">
                          {platform.icon} {platform.label}
                          {m.roomId && (
                            <>
                              {" "}
                              &bull; Room ID:{" "}
                              <code className="mt-room-code">{m.roomId}</code>
                            </>
                          )}
                          {m.location && <> &bull; 📍 {m.location}</>}
                        </div>
                      </div>
                      <span
                        className="mt-status-badge"
                        style={{ background: sm.bg, color: sm.color }}
                      >
                        {sm.icon} {sm.label}
                      </span>
                    </div>

                    <div className="mt-card-time">
                      <span>
                        📅{" "}
                        {new Date(m.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>
                        🕐{" "}
                        {new Date(m.scheduledAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>⏱ {m.durationMin} min</span>
                      <span className="mt-organizer-tag">
                        Host: {m.organizer?.name || "Organizer"}
                      </span>
                    </div>

                    {m.description && (
                      <p className="mt-card-desc">{m.description}</p>
                    )}

                    {/* Audience badge */}
                    <div className="mt-aud-summary">
                      <span className="mt-aud-tag">
                        {m.targetAudience === "all_staff"
                          ? "🏢 All Staff Invited"
                          : m.targetAudience === "roles"
                          ? `👥 Roles: ${(m.targetRoles || []).join(", ")}`
                          : m.targetAudience === "all_sellers"
                          ? "🏪 All Verified Sellers"
                          : `👤 ${m.invitees?.length || 0} Staff Invited`}
                      </span>
                      {m.messages?.length > 0 && (
                        <span className="mt-msg-count-tag">
                          💬 {m.messages.length} messages
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="mt-card-actions">
                    {/* VIDEO ROOM JOIN BUTTON */}
                    {(m.status === "scheduled" || m.status === "ongoing") && (
                      <button
                        className={`mt-act-btn start ${
                          m.status === "ongoing" ? "live-pulse" : ""
                        }`}
                        onClick={() => handleJoinVideoRoom(m)}
                        title="Enter Full In-Browser HD Video Room"
                      >
                        📹 {m.status === "ongoing" ? "Join Video Call" : "Launch Video Room"}
                      </button>
                    )}

                    {m.status === "scheduled" && isHost && (
                      <>
                        <button
                          className="mt-act-btn edit"
                          onClick={() => openEdit(m)}
                        >
                          Edit
                        </button>
                        <button
                          className="mt-act-btn cancel"
                          onClick={() => {
                            setCancelId(m._id);
                            setCancelReason("");
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {m.status === "ongoing" && isHost && (
                      <button
                        className="mt-act-btn complete"
                        onClick={() => markStatus(m._id, "completed")}
                      >
                        ✓ Mark Completed
                      </button>
                    )}

                    <button
                      className="mt-act-btn detail"
                      onClick={() => setDetail(m)}
                    >
                      👁 Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION CONTROLS ── */}
        <Pagination
          currentPage={meetingPage}
          totalItems={totalMeetings}
          pageSize={meetingsPerPage}
          onPageChange={setMeetingPage}
          onPageSizeChange={(sz) => {
            setMeetingsPerPage(sz);
            setMeetingPage(1);
          }}
          pageSizeOptions={[4, 6, 12, 20]}
          itemLabel="meetings"
        />

        {/* Cancel modal */}
        {cancelId && (
          <div className="mt-overlay" onClick={() => setCancelId(null)}>
            <div className="mt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="mt-modal-header">
                <h3 style={{ color: "#dc2626" }}>Cancel Meeting</h3>
                <button
                  className="mt-modal-close"
                  onClick={() => setCancelId(null)}
                >
                  ✕
                </button>
              </div>
              <div className="mt-modal-body">
                <p style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                  Provide a cancellation reason. Invited staff will be notified.
                </p>
                <textarea
                  rows="3"
                  style={{ ...inp, resize: "none" }}
                  placeholder="e.g. Rescheduling due to conflicting store inventory count…"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button
                    onClick={doCancel}
                    style={{
                      flex: 1,
                      padding: 11,
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel Meeting
                  </button>
                  <button
                    onClick={() => setCancelId(null)}
                    style={{
                      flex: 1,
                      padding: 11,
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail modal */}
        {detail && (
          <div className="mt-overlay" onClick={() => setDetail(null)}>
            <div className="mt-modal mt-modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="mt-modal-header">
                <div>
                  <h3>{detail.title}</h3>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {MEETING_TYPES.find((t) => t.value === detail.type)?.icon}{" "}
                    {detail.type}
                  </span>
                </div>
                <button className="mt-modal-close" onClick={() => setDetail(null)}>
                  ✕
                </button>
              </div>
              <div className="mt-modal-body">
                <div className="mt-detail-grid">
                  <div className="mt-detail-item">
                    <span>Date &amp; Time</span>
                    <strong>{new Date(detail.scheduledAt).toLocaleString()}</strong>
                  </div>
                  <div className="mt-detail-item">
                    <span>Duration</span>
                    <strong>{detail.durationMin} minutes</strong>
                  </div>
                  <div className="mt-detail-item">
                    <span>Platform</span>
                    <strong>
                      {PLATFORMS.find((p) => p.value === detail.platform)?.label}
                    </strong>
                  </div>
                  <div className="mt-detail-item">
                    <span>Room ID</span>
                    <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>
                      {detail.roomId || "—"}
                    </strong>
                  </div>
                  <div className="mt-detail-item">
                    <span>Status</span>
                    <strong style={{ color: STATUS_META[detail.status]?.color }}>
                      {detail.status}
                    </strong>
                  </div>
                  <div className="mt-detail-item">
                    <span>Audience</span>
                    <strong>{detail.targetAudience}</strong>
                  </div>
                  {detail.location && (
                    <div className="mt-detail-item">
                      <span>Location</span>
                      <strong>{detail.location}</strong>
                    </div>
                  )}
                  {detail.description && (
                    <div className="mt-detail-item" style={{ gridColumn: "1/-1" }}>
                      <span>Agenda &amp; Description</span>
                      <strong>{detail.description}</strong>
                    </div>
                  )}
                </div>

                {/* Direct Launch in Modal */}
                <div style={{ marginTop: 20 }}>
                  <button
                    className="mt-save-btn"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => {
                      const m = detail;
                      setDetail(null);
                      handleJoinVideoRoom(m);
                    }}
                  >
                    📹 Launch / Join HD Video Room Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
