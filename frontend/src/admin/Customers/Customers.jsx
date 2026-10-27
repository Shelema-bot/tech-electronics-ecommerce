import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./Customers.css";

const ROLE_COLORS = {
  customer:    { bg: "#f1f5f9", color: "#475569" },
  admin:       { bg: "#dbeafe", color: "#1d4ed8" },
  super_admin: { bg: "#ede9fe", color: "#7c3aed" },
  seller:      { bg: "#dcfce7", color: "#16a34a" },
  cashier:     { bg: "#fef9c3", color: "#a16207" },
  finance:     { bg: "#e0f2fe", color: "#0891b2" },
};

const ALL_ROLES = ["all", "customer", "admin", "seller", "cashier", "finance", "super_admin"];

const getInitials = (name) =>
  name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

const AVATAR_COLORS = ["#2563eb","#7c3aed","#db2777","#dc2626","#059669","#0891b2","#d97706"];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

function Customers() {
  const toast = useToast();
  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [detailUser, setDetailUser] = useState(null);
  const [deleting, setDeleting]     = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      if (Array.isArray(res.data))             setCustomers(res.data);
      else if (Array.isArray(res.data.users))  setCustomers(res.data.users);
      else                                     setCustomers([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, role) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role });
      toast.success("Role updated");
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const updateStatus = async (id, isActive) => {
    try {
      await API.put(`/admin/users/${id}/status`, { isActive });
      toast.success(isActive ? "User activated" : "User deactivated");
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    setDeleting(id);
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = customers.filter(c => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || c.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Stats
  const total   = customers.length;
  const active  = customers.filter(c => c.isActive).length;
  const admins  = customers.filter(c => ["admin","super_admin","owner"].includes(c.role)).length;
  const newThis = customers.filter(c => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <AdminLayout>
      <div className="customers-page">

        {/* Header */}
        <div className="cust-header">
          <div>
            <h1 className="cust-title">Customers</h1>
            <p className="cust-sub">Manage all registered users, roles, and account status</p>
          </div>
          <button className="cust-refresh-btn" onClick={fetchCustomers}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div className="cust-stats-grid">
          {[
            { label: "Total Users",    value: total,   icon: "👥", color: "#2563eb" },
            { label: "Active",         value: active,  icon: "✅", color: "#16a34a" },
            { label: "Admin / Staff",  value: admins,  icon: "🛡️", color: "#7c3aed" },
            { label: "New This Month", value: newThis, icon: "🆕", color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="cust-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="cust-stat-row">
                <span className="cust-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</span>
                <span className="cust-stat-value" style={{ color: s.color }}>{s.value}</span>
              </div>
              <div className="cust-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="cust-toolbar">
          <input
            type="text"
            className="cust-search"
            placeholder="🔍  Search by name, email, or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="cust-role-pills">
            {ALL_ROLES.map(r => (
              <button
                key={r}
                className={`cust-pill ${roleFilter === r ? "active" : ""}`}
                onClick={() => setRoleFilter(r)}
                style={roleFilter === r && r !== "all"
                  ? { background: ROLE_COLORS[r]?.bg, color: ROLE_COLORS[r]?.color, borderColor: ROLE_COLORS[r]?.color }
                  : {}}
              >
                {r === "all" ? "All" : r.replace("_", " ")}
              </button>
            ))}
          </div>
          <span className="cust-count">{filtered.length} of {total}</span>
        </div>

        {/* Table */}
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="cust-td-center">
                  <div className="cust-loading"><div className="cust-spinner" /> Loading customers…</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="cust-td-center">
                  <div className="cust-empty">
                    <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
                    No customers found
                  </div>
                </td></tr>
              ) : filtered.map(c => {
                const rc = ROLE_COLORS[c.role] || ROLE_COLORS.customer;
                return (
                  <tr key={c._id} className="cust-row">
                    <td>
                      <div className="cust-user-cell">
                        <div className="cust-avatar" style={{ background: avatarColor(c.name) }}>
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div className="cust-name">{c.name}</div>
                          <div className="cust-address">{c.address || "No address"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cust-email">{c.email}</td>
                    <td className="cust-phone">{c.phone || "—"}</td>
                    <td>
                      <span className="cust-role-badge" style={{ background: rc.bg, color: rc.color }}>
                        {c.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="cust-date">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td>
                      <button
                        className={`cust-status-btn ${c.isActive ? "active" : "inactive"}`}
                        onClick={() => updateStatus(c._id, !c.isActive)}
                        title={c.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        <span className="cust-status-dot" />
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="cust-actions">
                        <select
                          className="cust-role-select"
                          value={c.role}
                          onChange={e => updateRole(c._id, e.target.value)}
                          title="Change role"
                        >
                          <option value="customer">Customer</option>
                          <option value="cashier">Cashier</option>
                          <option value="seller">Seller</option>
                          <option value="finance">Finance</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button
                          className="cust-detail-btn"
                          onClick={() => setDetailUser(c)}
                          title="View details"
                        >
                          👁
                        </button>
                        <button
                          className="cust-delete-btn"
                          disabled={deleting === c._id}
                          onClick={() => deleteCustomer(c._id)}
                          title="Delete user"
                        >
                          {deleting === c._id ? "…" : "🗑"}
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

      {/* Detail modal */}
      {detailUser && (
        <div className="cust-overlay" onClick={() => setDetailUser(null)}>
          <div className="cust-modal" onClick={e => e.stopPropagation()}>
            <div className="cust-modal-header">
              <h3>User Detail</h3>
              <button className="cust-modal-close" onClick={() => setDetailUser(null)}>✕</button>
            </div>
            <div className="cust-modal-body">
              <div className="cust-detail-hero">
                <div className="cust-detail-avatar" style={{ background: avatarColor(detailUser.name) }}>
                  {getInitials(detailUser.name)}
                </div>
                <div>
                  <div className="cust-detail-name">{detailUser.name}</div>
                  <div className="cust-detail-email">{detailUser.email}</div>
                  <span
                    className="cust-role-badge"
                    style={{ ...ROLE_COLORS[detailUser.role], marginTop: 6, display: "inline-block" }}
                  >
                    {detailUser.role?.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="cust-detail-grid">
                <div className="cust-detail-item"><span>Phone</span><strong>{detailUser.phone || "—"}</strong></div>
                <div className="cust-detail-item"><span>Address</span><strong>{detailUser.address || "—"}</strong></div>
                <div className="cust-detail-item"><span>Status</span>
                  <strong style={{ color: detailUser.isActive ? "#16a34a" : "#dc2626" }}>
                    {detailUser.isActive ? "● Active" : "● Inactive"}
                  </strong>
                </div>
                <div className="cust-detail-item"><span>Joined</span>
                  <strong>{detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) : "—"}</strong>
                </div>
                <div className="cust-detail-item" style={{ gridColumn:"1/-1" }}>
                  <span>User ID</span>
                  <strong style={{ fontFamily:"monospace", fontSize:12 }}>{detailUser._id}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Customers;
