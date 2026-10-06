import { useEffect, useState, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./StaffManagement.css";

// ── Role metadata ─────────────────────────────────────────────────────────────
const ROLE_META = {
  owner:       { color:"#0f172a", bg:"#f1f5f9",  icon:"👑", label:"Owner",       level:100 },
  super_admin: { color:"#7c3aed", bg:"#ede9fe",  icon:"🛡️", label:"Super Admin",  level:90  },
  admin:       { color:"#1d4ed8", bg:"#dbeafe",  icon:"⚙️", label:"Admin",        level:80  },
  finance:     { color:"#0891b2", bg:"#e0f2fe",  icon:"💼", label:"Finance",      level:60  },
  cashier:     { color:"#a16207", bg:"#fef9c3",  icon:"💰", label:"Cashier",      level:40  },
  seller:      { color:"#16a34a", bg:"#dcfce7",  icon:"🏪", label:"Seller",       level:30  },
  customer:    { color:"#475569", bg:"#f1f5f9",  icon:"👤", label:"Customer",     level:0   },
};

// What each role can do (shown in the assign-role panel)
const ROLE_PERMISSIONS = {
  super_admin: {
    can:    ["Full platform control", "Manage all staff", "Approve/reject sellers", "Configure payment methods", "All reports & analytics", "Product approval"],
    cannot: [],
  },
  admin: {
    can:    ["Products & categories", "Orders management", "Customers", "Payments & verification", "Reports", "Contact messages", "Coupons"],
    cannot: ["Manage super admins", "Configure payment methods"],
  },
  finance: {
    can:    ["View all payments", "Financial reports", "Dashboard overview"],
    cannot: ["Edit products", "Manage users", "Process orders"],
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

const ASSIGNABLE_ROLES = ["cashier", "seller", "finance", "admin"];
const STAFF_ROLES      = ["owner","super_admin","admin","finance","cashier","seller"];

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

// ── Staff detail / edit modal ─────────────────────────────────────────────────
function StaffModal({ member, currentUser, onClose, onRefresh }) {
  const toast    = useToast();
  const [role, setRole]       = useState(member.role);
  const [saving, setSaving]   = useState(false);
  const [toggling, setToggling] = useState(false);

  const isSelf      = member._id === currentUser._id;
  const isSuperAdmin = currentUser.role === "super_admin" || currentUser.role === "owner";
  const canEdit     = isSuperAdmin && !isSelf && member.role !== "owner";
  const perms       = ROLE_PERMISSIONS[member.role] || ROLE_PERMISSIONS.customer;
  const rm          = ROLE_META[member.role] || ROLE_META.customer;

  const saveRole = async () => {
    if (role === member.role) { onClose(); return; }
    setSaving(true);
    try {
      await API.put(`/staff/${member._id}/role`, { role });
      toast.success(`Role updated to ${role}`);
      onRefresh(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally { setSaving(false); }
  };

  const toggleStatus = async () => {
    if (!window.confirm(`${member.isActive ? "Deactivate" : "Activate"} ${member.name}?`)) return;
    setToggling(true);
    try {
      await API.put(`/staff/${member._id}/toggle-status`);
      toast.success(`${member.name} ${member.isActive ? "deactivated" : "activated"}`);
      onRefresh(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally { setToggling(false); }
  };

  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-modal" onClick={e => e.stopPropagation()}>
        <div className="sm-modal-header">
          <h3>Staff Member</h3>
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
              <div style={{ marginTop:8 }}>
                <RoleBadge role={member.role} size="md" />
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
                  ? new Date(member.createdAt).toLocaleDateString("en-US",{ year:"numeric", month:"long", day:"numeric" })
                  : "—"}
              </strong>
            </div>
            {member.staffInfo?.businessName && (
              <div className="sm-info-item">
                <span>Business</span>
                <strong>{member.staffInfo.businessName}</strong>
              </div>
            )}
            {member.staffInfo?.verificationStatus && member.role === "seller" && (
              <div className="sm-info-item">
                <span>Verification</span>
                <strong style={{
                  color: member.staffInfo.verificationStatus === "verified" ? "#16a34a"
                       : member.staffInfo.verificationStatus === "rejected" ? "#dc2626" : "#a16207"
                }}>
                  {member.staffInfo.verificationStatus}
                </strong>
              </div>
            )}
            <div className="sm-info-item" style={{ gridColumn:"1/-1" }}>
              <span>User ID</span>
              <strong style={{ fontFamily:"monospace", fontSize:11 }}>{member._id}</strong>
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
                  {perms.can.map(p => <li key={p} className="sm-perm-item can">✓ {p}</li>)}
                </ul>
              </div>
              {perms.cannot.length > 0 && (
                <div>
                  <div className="sm-perms-label sm-perms-cannot">✗ Cannot</div>
                  <ul className="sm-perms-list">
                    {perms.cannot.map(p => <li key={p} className="sm-perm-item cannot">✗ {p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Change role (only super_admin can do this, not self, not owner) */}
          {canEdit && (
            <div className="sm-change-role-section">
              <label className="sm-change-role-label">Change Role</label>
              <div className="sm-change-role-row">
                <select
                  className="sm-role-select"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  {["customer","cashier","seller","finance","admin","super_admin"].map(r => (
                    <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>
                  ))}
                </select>
                <button className="sm-save-role-btn" onClick={saveRole} disabled={saving || role === member.role}>
                  {saving ? "Saving…" : "Save"}
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

  // Assign form
  const [inviteEmail, setInviteEmail]   = useState("");
  const [inviteRole,  setInviteRole]    = useState("cashier");
  const [assigning,   setAssigning]     = useState(false);

  const currentUser  = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = ["super_admin","owner"].includes(currentUser.role);

  useEffect(() => { fetchStaff(); }, []);

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

  const assignByEmail = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) { toast.warning("Email is required"); return; }
    setAssigning(true);
    try {
      await API.post("/staff/assign-by-email", { email: inviteEmail.trim(), role: inviteRole });
      toast.success(`${ROLE_META[inviteRole]?.label} role assigned to ${inviteEmail}`);
      setShowAssign(false); setInviteEmail(""); fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed — make sure the user has an account");
    } finally {
      setAssigning(false);
    }
  };

  // Filter staff
  const filtered = staff.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Stats per role
  const roleCounts = STAFF_ROLES.reduce((acc, r) => {
    acc[r] = staff.filter(u => u.role === r).length;
    return acc;
  }, {});

  // Group by role for the classified view
  const grouped = STAFF_ROLES.reduce((acc, r) => {
    const members = filtered.filter(u => u.role === r);
    if (members.length > 0) acc[r] = members;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="staff-page">

        {/* Header */}
        <div className="staff-header">
          <div>
            <h1>Staff Management</h1>
            <p>Manage roles, permissions, and staff accounts</p>
          </div>
          {isSuperAdmin && (
            <button
              className="staff-invite-btn"
              onClick={() => setShowAssign(!showAssign)}
            >
              {showAssign ? "✕ Cancel" : "+ Assign Staff Role"}
            </button>
          )}
        </div>

        {/* Role overview cards */}
        <div className="sm-role-overview">
          {[
            { key:"owner",       label:"Owner",       icon:"👑" },
            { key:"super_admin", label:"Super Admin", icon:"🛡️" },
            { key:"admin",       label:"Admin",       icon:"⚙️" },
            { key:"finance",     label:"Finance",     icon:"💼" },
            { key:"cashier",     label:"Cashier",     icon:"💰" },
            { key:"seller",      label:"Seller",      icon:"🏪" },
          ].map(r => {
            const m = ROLE_META[r.key];
            return (
              <div
                key={r.key}
                className={`sm-role-card ${roleFilter === r.key ? "active" : ""}`}
                style={{ borderTop:`3px solid ${m.color}`, cursor:"pointer" }}
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

        {/* Assign role form */}
        {showAssign && (
          <div className="sm-assign-card">
            <div className="sm-assign-header">
              <div>
                <h3>Assign Staff Role</h3>
                <p>The user must already have an account. Enter their registered email address.</p>
              </div>
            </div>
            <form onSubmit={assignByEmail} className="sm-assign-form">
              <div className="sm-assign-inputs">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  {ASSIGNABLE_ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_META[r]?.icon} {ROLE_META[r]?.label}</option>
                  ))}
                </select>
                <button type="submit" disabled={assigning}>
                  {assigning ? "Assigning…" : "Assign Role"}
                </button>
              </div>
            </form>

            {/* Role reference guide */}
            <div className="sm-role-guide">
              {ASSIGNABLE_ROLES.map(r => {
                const m   = ROLE_META[r];
                const rp  = ROLE_PERMISSIONS[r];
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
                      {rp.can.slice(0,4).map(p => <li key={p}>✓ {p}</li>)}
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
            placeholder="🔍  Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="staff-search"
          />
          <div className="staff-role-filters">
            <button
              className={`staff-role-filter-btn ${roleFilter === "all" ? "active" : ""}`}
              onClick={() => setRoleFilter("all")}
            >
              All Staff
            </button>
            {STAFF_ROLES.filter(r => r !== "owner").map(r => {
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
            <div style={{ fontSize:40, marginBottom:8 }}>👥</div>
            No staff found
          </div>
        ) : (
          /* ── Classified role sections ── */
          <div className="sm-sections">
            {Object.entries(grouped).map(([role, members]) => {
              const rm = ROLE_META[role] || ROLE_META.customer;
              return (
                <div key={role} className="sm-section">
                  <div className="sm-section-header" style={{ borderLeft:`4px solid ${rm.color}` }}>
                    <span className="sm-section-icon">{rm.icon}</span>
                    <span className="sm-section-title" style={{ color: rm.color }}>{rm.label}</span>
                    <span className="sm-section-count">{members.length}</span>
                    <span className="sm-section-desc">{ROLE_PERMISSIONS[role]?.can[0]}</span>
                  </div>

                  <div className="sm-member-grid">
                    {members.map(member => {
                      const isSelf = member._id === currentUser._id;
                      return (
                        <div
                          key={member._id}
                          className={`sm-member-card ${!member.isActive ? "inactive" : ""} ${isSelf ? "is-self" : ""}`}
                          onClick={() => setSelectedMember(member)}
                          title="Click to view details"
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
                              {member.phone && <div className="sm-member-phone">{member.phone}</div>}
                            </div>
                          </div>

                          <div className="sm-member-card-bottom">
                            <span
                              className="sm-status-dot-label"
                              style={{ color: member.isActive ? "#16a34a" : "#dc2626" }}
                            >
                              ● {member.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="sm-member-joined">
                              {member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString("en-US",{ month:"short", year:"numeric" })
                                : ""}
                            </span>
                          </div>

                          {/* Seller verification badge */}
                          {role === "seller" && member.staffInfo?.verificationStatus && (
                            <div className={`sm-verify-badge ${member.staffInfo.verificationStatus}`}>
                              {member.staffInfo.verificationStatus === "verified" ? "✓ Verified Seller"
                                : member.staffInfo.verificationStatus === "pending" ? "⏳ Pending Verification"
                                : "✗ Rejected"}
                            </div>
                          )}

                          <div className="sm-card-hover-hint">Click to manage →</div>
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
