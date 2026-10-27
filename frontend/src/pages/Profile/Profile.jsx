import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import { useToast } from "../../context/ToastContext";
import { useNotifications } from "../../context/NotificationContext";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./Profile.css";

function Profile() {
  const toast           = useToast();
  const { unreadCount } = useNotifications();
  const { t }           = useTranslation();

  const [tab, setTab]         = useState("info");
  const [user, setUser]       = useState(null);
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: "", phone: "", address: "" });

  // Password tab
  const [pwForm, setPwForm]       = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]       = useState({ current: false, newPw: false, confirm: false });

  const tabs = [
    { key: "info",     label: t("account.profileInfo", "Profile Info"),         icon: "👤" },
    { key: "password", label: t("account.changePassword", "Change Password"),   icon: "🔒" },
    { key: "activity", label: t("account.accountActivity", "Account Activity"), icon: "📊" },
  ];

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
      toast.error(t("account.profileLoadFailed", "Failed to load profile"));
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t("account.imageSizeError", "Image must be under 5 MB")); return; }
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
      toast.success(t("account.profileUpdated", "Profile updated successfully!"));
      const stored = localStorage.getItem("user");
      if (stored) {
        localStorage.setItem("user", JSON.stringify({ ...JSON.parse(stored), ...res.data.user }));
        window.dispatchEvent(new Event("loginStatusChanged"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t("account.updateFailed", "Profile update failed"));
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) { toast.warning(t("auth.passwordMinChars", "Password must be at least 6 characters")); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.warning(t("auth.passwordsDoNotMatch", "Passwords do not match")); return; }
    setPwLoading(true);
    try {
      await API.put("/users/profile/password", {
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
      });
      toast.success(t("account.passwordChanged", "Password changed successfully"));
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || t("account.passwordChangeFailed", "Failed to change password"));
    } finally {
      setPwLoading(false);
    }
  };

  const formatRole = (r) => {
    const norm = String(r || "").toLowerCase().replace(/[\s_-]/g, "");
    if (["superadmin", "owner"].includes(norm)) return "Owner / CEO";
    if (["admin", "inventorymanager", "manager"].includes(norm)) return "Admin";
    if (["cashier", "finance", "cashierfinance"].includes(norm)) return "Cashier / Finance";
    if (["delivery"].includes(norm)) return "Delivery";
    if (["seller"].includes(norm)) return "Seller";
    return r?.replace("_", " ") || "Customer";
  };

  const pwStrength = (p) => {
    if (!p) return null;
    if (p.length < 6)  return { label: t("account.weak", "Weak"),     color: "#dc2626", pct: "33%" };
    if (p.length < 10) return { label: t("account.medium", "Medium"), color: "#f59e0b", pct: "66%" };
    return                    { label: t("account.strong", "Strong"), color: "#16a34a", pct: "100%" };
  };
  const strength = pwStrength(pwForm.newPw);

  if (!user) {
    return (
      <AccountLayout>
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>{t("common.loading", "Loading profile…")}</p>
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
                <span className="profile-role-badge">{formatRole(user.role)}</span>
                <span className={`profile-status-badge ${user.isActive !== false ? "active" : "inactive"}`}>
                  {user.isActive !== false ? `● ${t("common.active", "Active")}` : `● ${t("common.inactive", "Inactive")}`}
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
                <div className="profile-stat-label">{t("account.unreadAlerts", "Unread Alerts")}</div>
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
                <div className="profile-stat-label">{t("account.memberSince", "Member Since")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs">
          {tabs.map(tItem => (
            <button
              key={tItem.key}
              className={`profile-tab ${tab === tItem.key ? "active" : ""}`}
              onClick={() => setTab(tItem.key)}
            >
              {tItem.icon} {tItem.label}
            </button>
          ))}
        </div>

        {/* ── Profile Info tab ── */}
        {tab === "info" && (
          <div className="profile-card">
            <form onSubmit={updateProfile} className="profile-form">
              <div className="profile-fields-grid">
                <div className="profile-field">
                  <label>{t("auth.fullName", "Full Name")}</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder={t("checkout.fullNamePlaceholder", "Your full name")} required />
                </div>
                <div className="profile-field">
                  <label>{t("auth.email", "Email Address")}</label>
                  <input value={user.email} disabled />
                </div>
                <div className="profile-field">
                  <label>{t("auth.phone", "Phone Number")}</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0912345678" />
                </div>
                <div className="profile-field" style={{ gridColumn: "1/-1" }}>
                  <label>{t("account.deliveryAddress", "Delivery Address")}</label>
                  <textarea name="address" value={form.address} onChange={handleChange} placeholder={t("account.deliveryAddress", "Your delivery address")} rows="3" />
                </div>
              </div>
              {preview && (
                <div className="profile-preview-row">
                  <img src={preview} alt="preview" className="profile-preview-img" />
                  <button type="button" className="profile-remove-preview" onClick={() => { setPreview(""); setImage(null); }}>
                    ✕ {t("common.remove", "Remove")}
                  </button>
                </div>
              )}
              <button type="submit" className="profile-save-btn" disabled={loading}>
                {loading ? t("account.saving", "Saving…") : t("account.saveChanges", "Save Changes")}
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
                <strong>{t("account.changePassword", "Change your password")}</strong>
                <p>Use at least 6 characters with a mix of letters and numbers.</p>
              </div>
            </div>
            <form onSubmit={changePassword} className="profile-form">
              {[
                { key: "current", label: t("account.currentPassword", "Current Password"), ph: "Enter current password" },
                { key: "newPw",   label: t("account.newPassword", "New Password"),         ph: "At least 6 characters" },
                { key: "confirm", label: t("auth.confirmPassword", "Confirm Password"),    ph: "Repeat new password" },
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
                      {pwForm.newPw === pwForm.confirm ? t("account.passwordsMatch", "✓ Passwords match") : t("account.passwordsDontMatch", "✗ Passwords don't match")}
                    </div>
                  )}
                </div>
              ))}
              <button type="submit" className="profile-save-btn" disabled={pwLoading}>
                {pwLoading ? t("account.updating", "Updating…") : t("account.updatePassword", "Update Password")}
              </button>
            </form>
          </div>
        )}

        {/* ── Account Activity tab ── */}
        {tab === "activity" && (
          <div className="profile-card">
            <div className="profile-activity-grid">
              {[
                { icon:"👤", label: t("account.accountId", "Account ID"),   value: user._id?.slice(-12), mono: true },
                { icon:"📅", label: t("account.memberSince", "Member Since"), value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US",{ year:"numeric",month:"long",day:"numeric" }) : "—" },
                { icon:"🛡️", label: t("account.role", "Role"),         value: user.role?.replace("_"," "), capitalize: true },
                { icon:"✅", label: t("common.status", "Status"),       value: user.isActive !== false ? t("common.active", "Active") : t("common.inactive", "Inactive"),
                  valueColor: user.isActive !== false ? "#16a34a" : "#dc2626" },
                { icon:"📞", label: t("account.phone", "Phone"),        value: user.phone || "Not set" },
                { icon:"📍", label: t("common.address", "Address"),      value: user.address || "Not set" },
                { icon:"🔔", label: t("account.unreadAlerts", "Unread Notifications"), value: unreadCount,
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
