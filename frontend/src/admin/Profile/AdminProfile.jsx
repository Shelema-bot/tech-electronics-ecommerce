import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { getImageUrl } from "../../utils/imageUrl";
import "./AdminProfile.css";

const ROLE_COLORS = {
  owner:       { bg:"#0f172a", color:"white" },
  super_admin: { bg:"#7c3aed", color:"white" },
  admin:       { bg:"#2563eb", color:"white" },
  finance:     { bg:"#0891b2", color:"white" },
  cashier:     { bg:"#f59e0b", color:"white" },
  seller:      { bg:"#16a34a", color:"white" },
  customer:    { bg:"#64748b", color:"white" },
};

const ROLE_ICONS = {
  owner:"👑", super_admin:"🛡️", admin:"⚙️",
  finance:"💼", cashier:"💰", seller:"🏪", customer:"👤",
};

export default function AdminProfile() {
  const [admin,   setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/users/admin/profile");
      setAdmin(res.data.user);
    } catch {
      setError("Failed to load profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="ap-loading">
          <div className="ap-spinner" /> Loading profile…
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="ap-loading">
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <p style={{ color:"#dc2626", fontWeight:600 }}>{error}</p>
            <button
              onClick={fetchProfile}
              style={{ marginTop:14, padding:"9px 20px", background:"#2563eb", color:"white", border:"none", borderRadius:8, fontWeight:600, cursor:"pointer" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const avatarSrc  = getImageUrl(admin.profileImage);
  const role       = admin.role || "admin";
  const roleStyle  = ROLE_COLORS[role] || ROLE_COLORS.admin;
  const roleIcon   = ROLE_ICONS[role]  || "⚙️";
  const roleLabel  = role.replace(/_/g, " ");
  const joinedDate = admin.createdAt
    ? new Date(admin.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })
    : "—";

  return (
    <AdminLayout>
      <div className="ap-page">

        <div className="ap-header">
          <h1>Admin Profile</h1>
          <p>Your account information</p>
        </div>

        <div className="ap-card">

          {/* Avatar + role badge */}
          <div className="ap-avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt={admin.name} className="ap-avatar-img" />
            ) : (
              <div className="ap-avatar-placeholder">
                {admin.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <span
              className="ap-role-badge"
              style={{ background: roleStyle.bg, color: roleStyle.color }}
            >
              {roleIcon} {roleLabel}
            </span>
          </div>

          {/* Info */}
          <div className="ap-info">
            <h2>{admin.name}</h2>

            <div className="ap-fields">
              {[
                { label:"Email",   value: admin.email },
                { label:"Phone",   value: admin.phone || "—" },
                { label:"Address", value: admin.address || "—" },
                { label:"Role",    value: roleLabel, capitalize: true },
                { label:"Joined",  value: joinedDate },
                { label:"Status",  value: admin.isActive !== false ? "Active" : "Inactive",
                  color: admin.isActive !== false ? "#16a34a" : "#dc2626" },
              ].map(f => (
                <div className="ap-field" key={f.label}>
                  <span className="ap-field-label">{f.label}</span>
                  <span
                    className={`ap-field-value ${f.capitalize ? "capitalize" : ""}`}
                    style={f.color ? { color: f.color, fontWeight: 700 } : {}}
                  >
                    {f.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <Link to="/admin/settings" className="ap-edit-btn">
                ✏️ Edit Profile
              </Link>
              <Link to="/admin/settings" className="ap-secondary-btn">
                🔒 Change Password
              </Link>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
