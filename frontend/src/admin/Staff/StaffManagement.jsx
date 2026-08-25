import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./StaffManagement.css";

const ROLES = ["customer", "cashier", "seller", "finance", "admin", "super_admin", "owner"];

const ROLE_COLOR = {
  owner:       { bg: "#f0fdf4", color: "#0f172a" },
  super_admin: { bg: "#ede9fe", color: "#7c3aed" },
  admin:       { bg: "#dbeafe", color: "#1d4ed8" },
  finance:     { bg: "#e0f2fe", color: "#0891b2" },
  seller:      { bg: "#dcfce7", color: "#16a34a" },
  cashier:     { bg: "#fef9c3", color: "#a16207" },
  customer:    { bg: "#f1f5f9", color: "#475569" },
};

const ROLE_PERMISSIONS = {
  super_admin: ["Full control","Manage staff","Approve sellers","Payment methods","All reports"],
  admin:       ["Products","Orders","Customers","Payments","Reports","Messages"],
  seller:      ["Submit products","View own orders","My products dashboard"],
  cashier:     ["View orders","Mark COD collected","Payment overview"],
  customer:    ["Shop only","No admin access"],
};

function StaffManagement() {
  const toast = useToast();
  const [staff, setStaff]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("cashier");
  const [inviting, setInviting]       = useState(false);

  const currentUser  = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = currentUser.role === "super_admin";

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await API.get("/staff/all");
      setStaff(res.data.staff || []);
    } catch {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.put(`/staff/${id}/role`, { role });
      toast.success("Role updated successfully");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const toggleStatus = async (id, name) => {
    if (!window.confirm(`Toggle active status for ${name}?`)) return;
    try {
      await API.put(`/staff/${id}/toggle-status`);
      toast.success("Status updated");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // Assign role to an existing user by email
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) { toast.warning("Email is required"); return; }
    try {
      setInviting(true);
      // Find user by email and assign role
      const res = await API.post("/staff/assign-by-email", { email: inviteEmail, role: inviteRole });
      toast.success(`${inviteRole} role assigned to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail("");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign role. Ensure the user has an account.");
    } finally {
      setInviting(false);
    }
  };

  const filtered = staff.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Stats
  const stats = ROLES.reduce((acc, r) => {
    acc[r] = staff.filter(u => u.role === r).length;
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
            <button className="staff-invite-btn" onClick={() => setShowInvite(!showInvite)}>
              {showInvite ? "Cancel" : "+ Assign Staff Role"}
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="staff-stats-row">
          {[
            { label: "Super Admins", key: "super_admin", icon: "👑" },
            { label: "Admins",       key: "admin",       icon: "🛡️" },
            { label: "Sellers",      key: "seller",      icon: "🏪" },
            { label: "Cashiers",     key: "cashier",     icon: "💰" },
          ].map(s => (
            <div className="staff-stat-card" key={s.key}>
              <span className="staff-stat-icon">{s.icon}</span>
              <div>
                <div className="staff-stat-num" style={{ color: ROLE_COLOR[s.key]?.color }}>{stats[s.key] || 0}</div>
                <div className="staff-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Assign role form */}
        {showInvite && (
          <div className="staff-invite-card">
            <h3>Assign Staff Role to Existing User</h3>
            <p>The user must already have an account. Enter their email and select a role.</p>
            <form onSubmit={handleInvite} className="staff-invite-form">
              <input
                type="email"
                placeholder="User email address"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                {["cashier","seller","admin"].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              <button type="submit" disabled={inviting}>
                {inviting ? "Assigning..." : "Assign Role"}
              </button>
            </form>

            {/* Role permissions reference */}
            <div className="staff-role-guide">
              {Object.entries(ROLE_PERMISSIONS).filter(([r]) => r !== "customer").map(([role, perms]) => (
                <div className="staff-role-info" key={role}>
                  <span className="role-badge" style={{ background: ROLE_COLOR[role]?.bg, color: ROLE_COLOR[role]?.color }}>
                    {role.replace("_"," ")}
                  </span>
                  <ul>{perms.map(p => <li key={p}>{p}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="staff-filters">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="staff-search"
          />
          <div className="staff-role-filters">
            {["all", ...ROLES.filter(r => r !== "customer")].map(r => (
              <button
                key={r}
                className={`staff-role-filter-btn ${roleFilter === r ? "active" : ""}`}
                onClick={() => setRoleFilter(r)}
                style={roleFilter === r && r !== "all" ? { background: ROLE_COLOR[r]?.bg, color: ROLE_COLOR[r]?.color, borderColor: ROLE_COLOR[r]?.color } : {}}
              >
                {r === "all" ? "All Staff" : r.replace("_"," ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                {isSuperAdmin && <th>Change Role</th>}
                {isSuperAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="staff-empty">Loading staff...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="staff-empty">No staff found</td></tr>
              ) : filtered.map(u => {
                const rc = ROLE_COLOR[u.role] || ROLE_COLOR.customer;
                const isMe = u._id === currentUser._id;
                return (
                  <tr key={u._id} style={isMe ? { background: "#f0fdf4" } : {}}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{ background: rc.color }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name">{u.name} {isMe && <span style={{ fontSize:11, color:"#16a34a", fontWeight:700 }}>(You)</span>}</div>
                          <div className="user-email">{u.email}</div>
                          {u.phone && <div className="user-email">{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge" style={{ background: rc.bg, color: rc.color }}>
                        {u.role.replace("_"," ")}
                      </span>
                    </td>
                    <td style={{ fontSize:13, color:"#64748b" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US",{ year:"numeric",month:"short",day:"numeric" }) : "—"}
                    </td>
                    <td>
                      <span style={{
                        display:"inline-block", padding:"3px 10px", borderRadius:"20px",
                        fontSize:12, fontWeight:600,
                        background: u.isActive ? "#dcfce7" : "#fee2e2",
                        color: u.isActive ? "#16a34a" : "#dc2626",
                      }}>
                        {u.isActive ? "● Active" : "● Inactive"}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td>
                        {isMe ? (
                          <span style={{ fontSize:12, color:"#94a3b8" }}>—</span>
                        ) : (
                          <select className="role-select-admin" value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}>
                            {ROLES.map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
                          </select>
                        )}
                      </td>
                    )}
                    {isSuperAdmin && (
                      <td>
                        {!isMe && u.role !== "super_admin" && (
                          <button
                            className={`toggle-btn ${u.isActive ? "active" : "inactive"}`}
                            onClick={() => toggleStatus(u._id, u.name)}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    )}
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

export default StaffManagement;
