import { useEffect, useState, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./StaffManagement.css";

// ── External Web Applications available for staff integration ────────────────
const AVAILABLE_WEB_APPS = [
  { id: "telegram_bot",        name: "Telegram Bot & Store Channel",       icon: "🤖", desc: "Auto-post deals, receive customer inquiries & Telegram store orders" },
  { id: "chapa_payments",      name: "Chapa Payment Gateway Web App",      icon: "💳", desc: "Digital cards & mobile banking API integration & webhook processing" },
  { id: "telebirr_cbe",        name: "Telebirr & CBE Portal Web App",      icon: "📱", desc: "Manual bank slip audit, transaction reference reconciliation" },
  { id: "zoom_teams",          name: "Zoom & Microsoft Teams Meeting App", icon: "🤝", desc: "Host seller onboarding webinars & staff collaboration meetings" },
  { id: "delivery_gps",        name: "Delivery Dispatch & GPS Route App",  icon: "🚚", desc: "Assign courier routes, dispatch orders & track shipments via GPS" },
  { id: "analytics_marketing", name: "Google Analytics & Meta Pixel App",  icon: "📊", desc: "Monitor traffic, conversion tracking & ad campaigns" },
  { id: "erp_inventory_sync",  name: "Multi-Channel Inventory / ERP App",  icon: "🔄", desc: "Sync stock & inventory catalog across external sales channels" },
];

// ── Role metadata ─────────────────────────────────────────────────────────────
const ROLE_META = {
  owner:            { color:"#0f172a", bg:"#f1f5f9",  icon:"👑", label:"Owner / CEO",                  level:100 },
  super_admin:      { color:"#7c3aed", bg:"#ede9fe",  icon:"🛡️", label:"Super Admin",                  level:90  },
  admin:            { color:"#1d4ed8", bg:"#dbeafe",  icon:"⚙️", label:"Admin",                        level:80  },
  web_app_manager:  { color:"#0284c7", bg:"#e0f2fe",  icon:"🌐", label:"Web Apps & Integrations",      level:70  },
  finance:          { color:"#0891b2", bg:"#e0f2fe",  icon:"💼", label:"Finance",                      level:60  },
  inventory_manager:{ color:"#6366f1", bg:"#eef2ff",  icon:"📦", label:"Inventory Manager",            level:55  },
  delivery:         { color:"#ea580c", bg:"#ffedd5",  icon:"🚚", label:"Delivery",                     level:45  },
  cashier:          { color:"#a16207", bg:"#fef9c3",  icon:"💰", label:"Cashier",                      level:40  },
  seller:           { color:"#16a34a", bg:"#dcfce7",  icon:"🏪", label:"Seller",                       level:30  },
  customer:         { color:"#475569", bg:"#f1f5f9",  icon:"👤", label:"Customer",                     level:0   },
};

// What each role can do (shown in the assign-role panel)
const ROLE_PERMISSIONS = {
  super_admin: {
    can:    ["Full platform control", "Manage all staff", "Approve/reject sellers", "Configure payment methods", "All reports & analytics", "Product approval", "Integrate external web applications"],
    cannot: [],
  },
  admin: {
    can:    ["Products & categories", "Orders management", "Customers", "Payments & verification", "Reports", "Contact messages", "Coupons"],
    cannot: ["Manage super admins", "Configure payment methods"],
  },
  web_app_manager: {
    can:    ["Manage external web application integrations", "Configure API bridges & webhooks", "Handle external app sync (Telegram, Chapa, Zoom, Teams)", "Monitor app event webhooks", "View integration logs"],
    cannot: ["Manage super admins", "Delete customer records"],
  },
  finance: {
    can:    ["View all payments", "Financial reports", "Dashboard overview"],
    cannot: ["Edit products", "Manage users", "Process orders"],
  },
  inventory_manager: {
    can:    ["Manage catalog & inventory", "Approve seller-submitted products", "Stock threshold alerts"],
    cannot: ["Manage payments", "Change staff roles"],
  },
  delivery: {
    can:    ["Update order shipping status", "View delivery route logistics", "Access delivery analytics"],
    cannot: ["Edit products", "Manage users", "Approve payments"],
  },
  cashier: {
    can:    ["View & update orders", "Mark COD as collected", "Payment overview", "Dashboard"],
    cannot: ["Edit products", "Manage users", "Delete records"],
  },
  seller: {
    can:    ["Submit products for approval", "View own product status", "Seller dashboard"],
    cannot: ["Access admin panels", "View customer data", "Process payments"],
  },
  customer: {
    can:    ["Shop on the storefront"],
    cannot: ["Any admin access"],
  },
};

const ASSIGNABLE_ROLES = ["web_app_manager", "cashier", "delivery", "inventory_manager", "finance", "admin", "seller"];
const STAFF_ROLES      = ["owner", "super_admin", "admin", "web_app_manager", "finance", "inventory_manager", "delivery", "cashier", "seller"];

const AVATAR_COLORS = ["#2563eb","#7c3aed","#db2777","#dc2626","#059669","#0891b2","#d97706"];
const avatarBg = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 65) % AVATAR_COLORS.length];
const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "?";

// ── Role badge component ──────────────────────────────────────────────────────
function RoleBadge({ role, size = "sm" }) {
  const m = ROLE_META[role] || ROLE_META.customer;
  return (
    <span
      className={`sm-role-badge sm-role-badge--${size}`}
      style={{ background: m.bg, color: m.color }}
    >
      {m.icon} {m.label}
    </span>
  );
}

// ── Staff detail / edit modal with External Web Application Deal Form ─────────
function StaffModal({ member, currentUser, onClose, onRefresh }) {
  const toast    = useToast();
  const [role, setRole]                         = useState(member.role);
  const [assignedWebApps, setAssignedWebApps]   = useState(member.staffInfo?.assignedWebApps || []);
  const [webAppAccessLevel, setWebAppAccessLevel] = useState(member.staffInfo?.webAppAccessLevel || "Operator");
  const [webAppNotes, setWebAppNotes]           = useState(member.staffInfo?.webAppNotes || "");
  const [saving, setSaving]                     = useState(false);
  const [toggling, setToggling]                 = useState(false);

  const isSelf      = member._id === currentUser._id;
  const isSuperAdmin = currentUser.role === "super_admin" || currentUser.role === "owner";
  const canEdit     = isSuperAdmin && !isSelf && member.role !== "owner";
  const perms       = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[member.role] || ROLE_PERMISSIONS.customer;
  const rm          = ROLE_META[role] || ROLE_META[member.role] || ROLE_META.customer;

  const toggleWebApp = (appId) => {
    if (!canEdit) return;
    setAssignedWebApps((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const saveRoleAndApps = async () => {
    setSaving(true);
    try {
      await API.put(`/staff/${member._id}/role`, {
        role,
        assignedWebApps,
        webAppAccessLevel,
        webAppNotes,
      });
      toast.success(`Updated role and web application deals for ${member.name}`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update staff settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!window.confirm(`${member.isActive ? "Deactivate" : "Activate"} ${member.name}?`)) return;
    setToggling(true);
    try {
      await API.put(`/staff/${member._id}/toggle-status`);
      toast.success(`${member.name} ${member.isActive ? "deactivated" : "activated"}`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sm-modal-header">
          <h3>Staff Member &amp; Integrations</h3>
          <button className="sm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sm-modal-body">
          {/* Profile section */}
          <div className="sm-modal-profile">
            <div className="sm-modal-avatar" style={{ background: avatarBg(member.name) }}>
              {initials(member.name)}
            </div>
            <div>
              <div className="sm-modal-name">
                {member.name}
                {isSelf && <span className="sm-you-tag">You</span>}
              </div>
              <div className="sm-modal-email">{member.email}</div>
              {member.phone && <div className="sm-modal-phone">📞 {member.phone}</div>}
              <div style={{ marginTop: 8 }}>
                <RoleBadge role={role} size="md" />
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="sm-modal-info-grid">
            <div className="sm-info-item">
              <span>Status</span>
              <strong style={{ color: member.isActive ? "#16a34a" : "#dc2626" }}>
                {member.isActive ? "● Active" : "● Inactive"}
              </strong>
            </div>
            <div className="sm-info-item">
              <span>Joined</span>
              <strong>
                {member.createdAt
                  ? new Date(member.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                  : "—"}
              </strong>
            </div>
            {member.staffInfo?.businessName && (
              <div className="sm-info-item">
                <span>Business</span>
                <strong>{member.staffInfo.businessName}</strong>
              </div>
            )}
            <div className="sm-info-item" style={{ gridColumn: "1/-1" }}>
              <span>User ID</span>
              <strong style={{ fontFamily: "monospace", fontSize: 11 }}>{member._id}</strong>
            </div>
          </div>

          {/* Role permissions */}
          <div className="sm-perms-section">
            <div className="sm-perms-title" style={{ color: rm.color }}>
              {rm.icon} What this role can do
            </div>
            <div className="sm-perms-grid">
              <div>
                <div className="sm-perms-label sm-perms-can">✓ Can</div>
                <ul className="sm-perms-list">
                  {perms.can.map((p) => (
                    <li key={p} className="sm-perm-item can">✓ {p}</li>
                  ))}
                </ul>
              </div>
              {perms.cannot && perms.cannot.length > 0 && (
                <div>
                  <div className="sm-perms-label sm-perms-cannot">✗ Cannot</div>
                  <ul className="sm-perms-list">
                    {perms.cannot.map((p) => (
                      <li key={p} className="sm-perm-item cannot">✗ {p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ── EXTERNAL WEB APPLICATIONS INTEGRATION DEAL FORM ── */}
          <div className="sm-webapp-section">
            <div className="sm-webapp-header">
              <span className="sm-webapp-icon">🌐</span>
              <div>
                <h4>Deal with Other Web Applications &amp; External Integrations</h4>
                <p>Select which external web applications, channels, or API tools this staff role operates.</p>
              </div>
            </div>

            <div className="sm-webapp-grid">
              {AVAILABLE_WEB_APPS.map((app) => {
                const isSelected = assignedWebApps.includes(app.id) || assignedWebApps.includes(app.name);
                return (
                  <div
                    key={app.id}
                    className={`sm-webapp-card ${isSelected ? "selected" : ""} ${!canEdit ? "disabled" : ""}`}
                    onClick={() => toggleWebApp(app.id)}
                  >
                    <div className="sm-webapp-card-top">
                      <span className="sm-webapp-card-icon">{app.icon}</span>
                      <strong className="sm-webapp-card-name">{app.name}</strong>
                      <span className="sm-webapp-card-check">{isSelected ? "✓ Active" : "+ Add"}</span>
                    </div>
                    <span className="sm-webapp-card-desc">{app.desc}</span>
                  </div>
                );
              })}
            </div>

            {canEdit && (
              <div className="sm-webapp-controls-row">
                <div className="sm-webapp-control-col">
                  <label>Integration Access Level</label>
                  <select
                    value={webAppAccessLevel}
                    onChange={(e) => setWebAppAccessLevel(e.target.value)}
                    className="sm-webapp-select"
                  >
                    <option value="Full Manager">Full Manager (API Keys &amp; Webhooks)</option>
                    <option value="Operator">Operator (Daily sync &amp; meetings)</option>
                    <option value="Auditor">Auditor (Read-only logs)</option>
                  </select>
                </div>
                <div className="sm-webapp-control-col" style={{ flex: 2 }}>
                  <label>External Application Deal Notes / Endpoints</label>
                  <input
                    type="text"
                    placeholder="e.g. Deals with Telegram bot orders &amp; Zoom webinars"
                    value={webAppNotes}
                    onChange={(e) => setWebAppNotes(e.target.value)}
                    className="sm-webapp-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Change role (only super_admin can do this, not self, not owner) */}
          {canEdit && (
            <div className="sm-change-role-section">
              <label className="sm-change-role-label">Primary Staff Role</label>
              <div className="sm-change-role-row">
                <select
                  className="sm-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {["customer", "cashier", "delivery", "inventory_manager", "seller", "finance", "web_app_manager", "admin", "super_admin"].map((r) => (
                    <option key={r} value={r}>
                      {ROLE_META[r]?.icon} {ROLE_META[r]?.label || r}
                    </option>
                  ))}
                </select>
                <button
                  className="sm-save-role-btn"
                  onClick={saveRoleAndApps}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Role & Integrations"}
                </button>
              </div>
            </div>
          )}

          {/* Toggle status */}
          {canEdit && member.role !== "super_admin" && (
            <div className="sm-modal-footer">
              <button
                className={`sm-toggle-btn ${member.isActive ? "deactivate" : "activate"}`}
                onClick={toggleStatus}
                disabled={toggling}
              >
                {toggling ? "…" : member.isActive ? "🚫 Deactivate Account" : "✓ Activate Account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function StaffManagement() {
  const toast = useToast();
  const [staff, setStaff]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("all");
  const [showAssign, setShowAssign]     = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Assign form state
  const [inviteEmail, setInviteEmail]   = useState("");
  const [inviteRole,  setInviteRole]    = useState("web_app_manager");
  const [inviteWebApps, setInviteWebApps] = useState(["telegram_bot", "chapa_payments"]);
  const [inviteAccessLevel, setInviteAccessLevel] = useState("Full Manager");
  const [inviteNotes, setInviteNotes]   = useState("");
  const [assigning, setAssigning]       = useState(false);

  const currentUser  = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = ["super_admin", "owner"].includes(currentUser.role);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await API.get("/staff/all");
      setStaff(res.data.staff || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const toggleInviteWebApp = (appId) => {
    setInviteWebApps((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const assignByEmail = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.warning("Email address is required");
      return;
    }
    setAssigning(true);
    try {
      await API.post("/staff/assign-by-email", {
        email: inviteEmail.trim(),
        role: inviteRole,
        assignedWebApps: inviteWebApps,
        webAppAccessLevel: inviteAccessLevel,
        webAppNotes: inviteNotes,
      });
      toast.success(`${ROLE_META[inviteRole]?.label} role & web app deals assigned to ${inviteEmail}`);
      setShowAssign(false);
      setInviteEmail("");
      setInviteNotes("");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed — ensure the user is registered");
    } finally {
      setAssigning(false);
    }
  };

  // Filter staff
  const filtered = staff.filter((u) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Stats per role
  const roleCounts = STAFF_ROLES.reduce((acc, r) => {
    acc[r] = staff.filter((u) => u.role === r).length;
    return acc;
  }, {});

  // Group by role for the classified view
  const grouped = STAFF_ROLES.reduce((acc, r) => {
    const members = filtered.filter((u) => u.role === r);
    if (members.length > 0) acc[r] = members;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="staff-page">
        {/* Header */}
        <div className="staff-header">
          <div>
            <h1>Staff &amp; Web Applications Management</h1>
            <p>Manage RBAC roles, assign external web application integrations, and audit staff accounts.</p>
          </div>
          {isSuperAdmin && (
            <button
              className="staff-invite-btn"
              onClick={() => setShowAssign(!showAssign)}
            >
              {showAssign ? "✕ Close Form" : "+ Assign Staff & Web App Role"}
            </button>
          )}
        </div>

        {/* Role overview cards */}
        <div className="sm-role-overview">
          {[
            { key: "owner",            label: "Owner",        icon: "👑" },
            { key: "super_admin",      label: "Super Admin",  icon: "🛡️" },
            { key: "web_app_manager",  label: "Web Apps",     icon: "🌐" },
            { key: "admin",            label: "Admin",        icon: "⚙️" },
            { key: "finance",          label: "Finance",      icon: "💼" },
            { key: "inventory_manager",label: "Inventory",    icon: "📦" },
            { key: "delivery",         label: "Delivery",     icon: "🚚" },
            { key: "cashier",          label: "Cashier",      icon: "💰" },
            { key: "seller",           label: "Seller",       icon: "🏪" },
          ].map((r) => {
            const m = ROLE_META[r.key] || ROLE_META.customer;
            return (
              <div
                key={r.key}
                className={`sm-role-card ${roleFilter === r.key ? "active" : ""}`}
                style={{ borderTop: `3px solid ${m.color}`, cursor: "pointer" }}
                onClick={() => setRoleFilter(roleFilter === r.key ? "all" : r.key)}
                title={`Filter by ${r.label}`}
              >
                <span className="sm-role-card-icon">{r.icon}</span>
                <div className="sm-role-card-count" style={{ color: m.color }}>
                  {roleCounts[r.key] || 0}
                </div>
                <div className="sm-role-card-label">{r.label}</div>
              </div>
            );
          })}
        </div>

        {/* Assign role form with External Web Applications section */}
        {showAssign && (
          <div className="sm-assign-card">
            <div className="sm-assign-header">
              <div>
                <h3>Assign Staff Role &amp; External Web Application Deal</h3>
                <p>Assign a registered account to handle operations, external APIs, Telegram, or meeting apps.</p>
              </div>
            </div>
            <form onSubmit={assignByEmail} className="sm-assign-form">
              <div className="sm-assign-inputs">
                <input
                  type="email"
                  placeholder="Registered account email (e.g. staff@techelectronic.et)"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_META[r]?.icon} {ROLE_META[r]?.label}
                    </option>
                  ))}
                </select>
                <button type="submit" disabled={assigning}>
                  {assigning ? "Assigning…" : "✓ Assign Role & Deals"}
                </button>
              </div>

              {/* Web applications checklist in the assign form */}
              <div className="sm-assign-webapp-box">
                <div className="sm-assign-webapp-title">
                  <span>🌐 Assigned External Web Applications (Deal with other web apps):</span>
                </div>
                <div className="sm-assign-webapp-chips">
                  {AVAILABLE_WEB_APPS.map((app) => {
                    const isSel = inviteWebApps.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        className={`sm-assign-webapp-chip ${isSel ? "active" : ""}`}
                        onClick={() => toggleInviteWebApp(app.id)}
                      >
                        {isSel ? "✓" : "+"} {app.icon} {app.name}
                      </button>
                    );
                  })}
                </div>

                <div className="sm-assign-webapp-row">
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                      Access Level:
                    </label>
                    <select
                      value={inviteAccessLevel}
                      onChange={(e) => setInviteAccessLevel(e.target.value)}
                      className="sm-webapp-select"
                    >
                      <option value="Full Manager">Full Manager (Manage API Keys, Sync &amp; Webhooks)</option>
                      <option value="Operator">Operator (Daily app sync &amp; interactions)</option>
                      <option value="Auditor">Auditor (Read-only logs)</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                      Integration Scope / Notes:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deals with Telegram bot store &amp; Zoom meeting schedules"
                      value={inviteNotes}
                      onChange={(e) => setInviteNotes(e.target.value)}
                      className="sm-webapp-input"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Role reference guide */}
            <div className="sm-role-guide">
              {ASSIGNABLE_ROLES.map((r) => {
                const m = ROLE_META[r];
                const rp = ROLE_PERMISSIONS[r];
                return (
                  <div
                    key={r}
                    className={`sm-guide-card ${inviteRole === r ? "selected" : ""}`}
                    style={{ borderLeft: `3px solid ${m.color}` }}
                    onClick={() => setInviteRole(r)}
                  >
                    <div className="sm-guide-card-title" style={{ color: m.color }}>
                      {m.icon} {m.label}
                    </div>
                    <ul className="sm-guide-list">
                      {rp.can.slice(0, 3).map((p) => (
                        <li key={p}>✓ {p}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + filter bar */}
        <div className="staff-filters">
          <input
            type="text"
            placeholder="🔍  Search by staff name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="staff-search"
          />
          <div className="staff-role-filters">
            <button
              className={`staff-role-filter-btn ${roleFilter === "all" ? "active" : ""}`}
              onClick={() => setRoleFilter("all")}
            >
              All Staff
            </button>
            {STAFF_ROLES.filter((r) => r !== "owner").map((r) => {
              const m = ROLE_META[r];
              return (
                <button
                  key={r}
                  className={`staff-role-filter-btn ${roleFilter === r ? "active" : ""}`}
                  onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
                  style={roleFilter === r ? { background: m.bg, color: m.color, borderColor: m.color } : {}}
                >
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>
          <span className="sm-count">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="sm-loading-state">
            <div className="sm-spinner" /> Loading staff…
          </div>
        ) : filtered.length === 0 ? (
          <div className="sm-empty-state">
            <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
            No staff found
          </div>
        ) : (
          /* ── Classified role sections ── */
          <div className="sm-sections">
            {Object.entries(grouped).map(([role, members]) => {
              const rm = ROLE_META[role] || ROLE_META.customer;
              return (
                <div key={role} className="sm-section">
                  <div className="sm-section-header" style={{ borderLeft: `4px solid ${rm.color}` }}>
                    <span className="sm-section-icon">{rm.icon}</span>
                    <span className="sm-section-title" style={{ color: rm.color }}>{rm.label}</span>
                    <span className="sm-section-count">{members.length}</span>
                    <span className="sm-section-desc">{ROLE_PERMISSIONS[role]?.can[0]}</span>
                  </div>

                  <div className="sm-member-grid">
                    {members.map((member) => {
                      const isSelf = member._id === currentUser._id;
                      const webApps = member.staffInfo?.assignedWebApps || [];
                      return (
                        <div
                          key={member._id}
                          className={`sm-member-card ${!member.isActive ? "inactive" : ""} ${isSelf ? "is-self" : ""}`}
                          onClick={() => setSelectedMember(member)}
                          title="Click to view details and manage external web apps"
                        >
                          <div className="sm-member-card-top">
                            <div className="sm-member-avatar" style={{ background: avatarBg(member.name) }}>
                              {initials(member.name)}
                              {!member.isActive && <span className="sm-inactive-dot" title="Inactive" />}
                            </div>
                            <div className="sm-member-info">
                              <div className="sm-member-name">
                                {member.name}
                                {isSelf && <span className="sm-you-tag">You</span>}
                              </div>
                              <div className="sm-member-email">{member.email}</div>
                              {member.phone && <div className="sm-member-phone">📞 {member.phone}</div>}
                            </div>
                          </div>

                          {/* Assigned Web Applications Badges */}
                          {webApps.length > 0 && (
                            <div className="sm-card-webapps-box">
                              <span className="sm-card-webapps-label">🌐 Deals with:</span>
                              <div className="sm-card-webapps-pills">
                                {webApps.map((appId) => {
                                  const appObj = AVAILABLE_WEB_APPS.find((a) => a.id === appId || a.name === appId);
                                  return (
                                    <span key={appId} className="sm-card-webapp-pill">
                                      {appObj ? `${appObj.icon} ${appObj.name.split(" ")[0]}` : appId}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="sm-member-card-bottom">
                            <span
                              className="sm-status-dot-label"
                              style={{ color: member.isActive ? "#16a34a" : "#dc2626" }}
                            >
                              ● {member.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="sm-member-joined">
                              {member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                : ""}
                            </span>
                          </div>

                          {/* Seller verification badge */}
                          {role === "seller" && member.staffInfo?.verificationStatus && (
                            <div className={`sm-verify-badge ${member.staffInfo.verificationStatus}`}>
                              {member.staffInfo.verificationStatus === "verified"
                                ? "✓ Verified Seller"
                                : member.staffInfo.verificationStatus === "pending"
                                ? "⏳ Pending Verification"
                                : "✗ Rejected"}
                            </div>
                          )}

                          <div className="sm-card-hover-hint">Click to manage web apps &amp; permissions →</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member detail/edit modal */}
      {selectedMember && (
        <StaffModal
          member={selectedMember}
          currentUser={currentUser}
          onClose={() => setSelectedMember(null)}
          onRefresh={fetchStaff}
        />
      )}
    </AdminLayout>
  );
}

export default StaffManagement;
