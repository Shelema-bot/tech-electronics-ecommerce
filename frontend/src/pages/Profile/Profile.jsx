import { useEffect, useState } from "react";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import { useToast } from "../../context/ToastContext";
import { useNotifications } from "../../context/NotificationContext";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./Profile.css";

const TABS = [
  { key: "info",     label: "Profile Info",     icon: "👤" },
  { key: "password", label: "Change Password",  icon: "🔒" },
  { key: "activity", label: "Account Activity", icon: "📊" },
];

function Profile() {
  const toast = useToast();
  const { unreadCount } = useNotifications();

  const [tab, setTab]         = useState("info");
  const [user, setUser]       = useState(null);
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: "", phone: "", address: "" });

  // Password tab
  const [pwForm, setPwForm]   = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]   = useState({ current: false, newPw: false, confirm: false });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      setUser(res.data.user);
      setForm({
        name:    res.data.user.name    || "",
        phone:   res.data.user.phone   || "",
        address: res.data.user.address || "",
      });
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",    form.name);
      fd.append("phone",   form.phone);
      fd.append("address", form.address);
      if (image) fd.append("profileImage", image);

      const res = await API.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      setImage(null);
      setPreview("");
      toast.success("Profile updated successfully!");
      const stored = localStorage.getItem("user");
      if (stored) {
        localStorage.setItem("user", JSON.stringify({ ...JSON.parse(stored), ...res.data.user }));
        window.dispatchEvent(new Event("loginStatusChanged"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) { toast.warning("Password must be at least 6 characters"); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.warning("Passwords do not match"); return; }
    setPwLoading(true);
    try {
      await API.put("/users/profile/password", {
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
      });
      toast.success("Password changed successfully");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const pwStrength = (p) => {
    if (!p) return null;
    if (p.length < 6)  return { label: "Weak",   color: "#dc2626", pct: "33%" };
    if (p.length < 10) return { label: "Medium",  color: "#f59e0b", pct: "66%" };
    return                    { label: "Strong",  color: "#16a34a", pct: "100%" };
  };
  const strength = pwStrength(pwForm.newPw);

  if (!user) {
    return (
      <AccountLayout>
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading profile…</p>
        </div>
      </AccountLayout>
    );
  }

  const avatarSrc = preview || (user.profileImage ? getImageUrl(user.profileImage) : null);
  const initial   = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <AccountLayout>
      <div className="profile-page">

        {/* ── Hero card ── */}
        <div className="profile-hero-card">
          <div className="profile-hero-left">
            <div className="profile-img-wrap">
              {avatarSrc ? (
                <img src={avatarSrc} className="profile-image" alt="avatar" />
              ) : (
                <div className="profile-initial">{initial}</div>
              )}
              <label className="avatar-upload-btn" title="Change photo">
                📷
                <input type="file" accept="image/*" onChange={handleImage} hidden />
              </label>
            </div>
            <div className="profile-hero-info">
              <h2 className="profile-hero-name">{user.name}</h2>
              <p className="profile-hero-email">{user.email}</p>
              <div className="profile-hero-badges">
                <span className="profile-role-badge">{user.role?.replace("_", " ")}</span>
                <span className={`profile-status-badge ${user.isActive !== false ? "active" : "inactive"}`}>
                  {user.isActive !== false ? "● Active" : "● Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="profile-hero-stats">
            <div className="profile-stat">
              <span className="profile-stat-icon">🔔</span>
              <div>
                <div className="profile-stat-value" style={{ color: unreadCount > 0 ? "#e11d48" : "#0f172a" }}>
                  {unreadCount}
                </div>
                <div className="profile-stat-label">Unread Alerts</div>
              </div>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-icon">📅</span>
              <div>
                <div className="profile-stat-value">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—"}
                </div>
                <div className="profile-stat-label">Member Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`profile-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Info tab ── */}
        {tab === "info" && (
          <div className="profile-card">
            <form onSubmit={updateProfile} className="profile-form">
              <div className="profile-fields-grid">
                <div className="profile-field">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                </div>
                <div className="profile-field">
                  <label>Email Address</label>
                  <input value={user.email} disabled />
                </div>
                <div className="profile-field">
                  <label>Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0912345678" />
                </div>
                <div className="profile-field" style={{ gridColumn: "1/-1" }}>
                  <label>Delivery Address</label>
                  <textarea name="address" value={form.address} onChange={handleChange} placeholder="Your delivery address" rows="3" />
                </div>
              </div>
              {preview && (
                <div className="profile-preview-row">
                  <img src={preview} alt="preview" className="profile-preview-img" />
                  <button type="button" className="profile-remove-preview" onClick={() => { setPreview(""); setImage(null); }}>
                    ✕ Remove
                  </button>
                </div>
              )}
              <button type="submit" className="profile-save-btn" disabled={loading}>
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Change Password tab ── */}
        {tab === "password" && (
          <div className="profile-card">
            <div className="profile-pw-info">
              <span>🔒</span>
              <div>
                <strong>Change your password</strong>
                <p>Use at least 6 characters with a mix of letters and numbers.</p>
              </div>
            </div>
            <form onSubmit={changePassword} className="profile-form">
              {[
                { key: "current", label: "Current Password",  ph: "Enter current password" },
                { key: "newPw",   label: "New Password",      ph: "At least 6 characters" },
                { key: "confirm", label: "Confirm Password",  ph: "Repeat new password" },
              ].map(f => (
                <div className="profile-field" key={f.key}>
                  <label>{f.label}</label>
                  <div className="profile-pw-wrap">
                    <input
                      type={showPw[f.key] ? "text" : "password"}
                      placeholder={f.ph}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                      required
                    />
                    <button type="button" className="profile-pw-eye"
                      onClick={() => setShowPw(s => ({ ...s, [f.key]: !s[f.key] }))}>
                      {showPw[f.key] ? "🙈" : "👁"}
                    </button>
                  </div>
                  {f.key === "newPw" && strength && (
                    <div className="profile-pw-strength">
                      <div className="profile-pw-bar">
                        <div style={{ width: strength.pct, background: strength.color, height: "100%", borderRadius: 4, transition: "width 0.3s" }} />
                      </div>
                      <span style={{ color: strength.color, fontSize: 11, fontWeight: 700 }}>{strength.label}</span>
                    </div>
                  )}
                  {f.key === "confirm" && pwForm.confirm && (
                    <div className="profile-pw-match" style={{ color: pwForm.newPw === pwForm.confirm ? "#16a34a" : "#dc2626" }}>
                      {pwForm.newPw === pwForm.confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                    </div>
                  )}
                </div>
              ))}
              <button type="submit" className="profile-save-btn" disabled={pwLoading}>
                {pwLoading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {/* ── Account Activity tab ── */}
        {tab === "activity" && (
          <div className="profile-card">
            <div className="profile-activity-grid">
              {[
                { icon:"👤", label:"Account ID",   value: user._id?.slice(-12), mono: true },
                { icon:"📅", label:"Member Since", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US",{ year:"numeric",month:"long",day:"numeric" }) : "—" },
                { icon:"🛡️", label:"Role",         value: user.role?.replace("_"," "), capitalize: true },
                { icon:"✅", label:"Status",       value: user.isActive !== false ? "Active" : "Inactive",
                  valueColor: user.isActive !== false ? "#16a34a" : "#dc2626" },
                { icon:"📞", label:"Phone",        value: user.phone || "Not set" },
                { icon:"📍", label:"Address",      value: user.address || "Not set" },
                { icon:"🔔", label:"Unread Notifications", value: unreadCount,
                  valueColor: unreadCount > 0 ? "#e11d48" : "#0f172a" },
              ].map(a => (
                <div className="profile-activity-item" key={a.label}>
                  <span className="profile-activity-icon">{a.icon}</span>
                  <div>
                    <div className="profile-activity-label">{a.label}</div>
                    <div
                      className="profile-activity-value"
                      style={{
                        fontFamily: a.mono ? "monospace" : "inherit",
                        color: a.valueColor || "#0f172a",
                        textTransform: a.capitalize ? "capitalize" : "none",
                      }}
                    >
                      {a.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AccountLayout>
  );
}

export default Profile;
