import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import { usePreference, COUNTRIES, LANGUAGES, CURRENCIES } from "../../context/PreferenceContext";
import "./Settings.css";

const TABS = [
  { key: "profile",     label: "Profile",         icon: "👤" },
  { key: "password",    label: "Change Password",  icon: "🔒" },
  { key: "preferences", label: "Preferences",      icon: "🌍" },
  { key: "promos",      label: "Promo Banner",     icon: "📢" },
];

function Settings() {
  const toast = useToast();
  const [tab, setTab]         = useState("profile");
  const [user, setUser]       = useState({ name: "", email: "", phone: "", address: "", profileImage: "" });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving]   = useState(false);

  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw]     = useState({ current: false, new: false, confirm: false });

  const { country, setCountry, language, setLanguage, currency, setCurrency, fmt } = usePreference();

  // ── Promo banner state ───────────────────────────────────────
  const loadPromos = () => {
    try {
      const saved = localStorage.getItem("store_promos");
      if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length > 0) return p; }
    } catch {}
    return [
      { id:1, text:"🚚 <strong>Free Shipping</strong> on all orders over ETB 5,000!" },
      { id:2, text:"🔒 <strong>100% Secure</strong> Payment — Shop with confidence" },
      { id:3, text:"📞 <strong>24/7 Support</strong> — Call us: <strong>+251 974 007 772</strong>" },
      { id:4, text:"🎁 <strong>New Arrivals</strong> every week — Check out the latest tech!" },
      { id:5, text:"💳 Pay with <strong>Telebirr, CBE Birr, BOA</strong> or Cash on Delivery" },
    ];
  };
  const [promos,    setPromos]    = useState(loadPromos);
  const [promoText, setPromoText] = useState("");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/admin/profile");
      setUser(res.data.user);
    } catch {
      toast.error("Failed to load profile");
    }
  };

  const handleChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",    user.name);
      fd.append("phone",   user.phone);
      fd.append("address", user.address);
      if (image) fd.append("profileImage", image);
      await API.put("/users/admin/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Profile updated");
      setPreview(""); setImage(null);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) { toast.warning("Password must be at least 6 characters"); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.warning("Passwords do not match"); return; }
    setPwSaving(true);
    try {
      await API.put("/users/admin/password", {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const avatarSrc = preview || getImageUrl(user.profileImage);

  const pwStrength = (p) => {
    if (!p) return null;
    if (p.length < 6)  return { label: "Weak",   color: "#dc2626", w: "33%" };
    if (p.length < 10) return { label: "Medium",  color: "#f59e0b", w: "66%" };
    return                    { label: "Strong",  color: "#16a34a", w: "100%" };
  };
  const strength = pwStrength(pwForm.newPassword);

  return (
    <AdminLayout>
      <div className="settings-page">

        {/* ── Header ── */}
        <div className="set-header">
          <div>
            <h1 className="set-title">System Settings</h1>
            <p className="set-sub">Manage your admin account, preferences, and store configuration</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="set-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`set-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══ Profile tab ══ */}
        {tab === "profile" && (
          <div className="set-card">
            <form onSubmit={saveProfile}>
              <div className="set-avatar-row">
                <div className="set-avatar-wrap">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="set-avatar-img" />
                  ) : (
                    <div className="set-avatar-placeholder">
                      {user.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                  <label className="set-avatar-overlay" title="Change photo">
                    📷
                    <input type="file" accept="image/*" onChange={handleImage} hidden />
                  </label>
                </div>
                <div>
                  <div className="set-avatar-name">{user.name || "Admin"}</div>
                  <div className="set-avatar-email">{user.email}</div>
                  <div className="set-avatar-role">
                    {JSON.parse(localStorage.getItem("user") || "{}").role?.replace("_", " ") || "admin"}
                  </div>
                  <label className="set-change-photo-btn">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleImage} hidden />
                  </label>
                  {preview && (
                    <button
                      type="button"
                      className="set-remove-photo-btn"
                      onClick={() => { setPreview(""); setImage(null); }}
                    >
                      Remove preview
                    </button>
                  )}
                </div>
              </div>

              <div className="set-divider" />

              <div className="set-fields-grid">
                <div className="set-field">
                  <label>Full Name</label>
                  <input name="name" value={user.name || ""} onChange={handleChange} placeholder="Your full name" />
                </div>
                <div className="set-field">
                  <label>Email Address</label>
                  <input value={user.email || ""} disabled className="set-disabled" />
                </div>
                <div className="set-field">
                  <label>Phone Number</label>
                  <input name="phone" value={user.phone || ""} onChange={handleChange} placeholder="+251 9XX XXX XXX" />
                </div>
                <div className="set-field" style={{ gridColumn: "1/-1" }}>
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={user.address || ""}
                    onChange={handleChange}
                    placeholder="Your address"
                    rows="3"
                  />
                </div>
              </div>

              <div className="set-form-actions">
                <button type="submit" className="set-save-btn" disabled={saving}>
                  {saving ? "Saving…" : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══ Password tab ══ */}
        {tab === "password" && (
          <div className="set-card">
            <div className="set-pw-info">
              <span className="set-pw-info-icon">🔒</span>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>Change Password</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Use a strong password with at least 6 characters.</div>
              </div>
            </div>
            <form onSubmit={savePassword}>
              <div className="set-fields-grid" style={{ gridTemplateColumns: "1fr" }}>
                {[
                  { key: "currentPassword", label: "Current Password", placeholder: "Enter current password" },
                  { key: "newPassword",     label: "New Password",     placeholder: "Enter new password (min. 6 chars)" },
                  { key: "confirmPassword", label: "Confirm Password", placeholder: "Repeat new password" },
                ].map(f => (
                  <div className="set-field" key={f.key}>
                    <label>{f.label}</label>
                    <div className="set-pw-wrap">
                      <input
                        type={showPw[f.key.replace("Password", "")] ? "text" : "password"}
                        placeholder={f.placeholder}
                        value={pwForm[f.key]}
                        onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="set-pw-eye"
                        onClick={() => setShowPw(s => ({
                          ...s,
                          [f.key.replace("Password", "")]: !s[f.key.replace("Password", "")],
                        }))}
                      >
                        {showPw[f.key.replace("Password", "")] ? "🙈" : "👁"}
                      </button>
                    </div>
                    {f.key === "newPassword" && strength && (
                      <div className="set-pw-strength">
                        <div className="set-pw-bar">
                          <div style={{ width: strength.w, background: strength.color, height: "100%", borderRadius: 4, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ color: strength.color, fontSize: 11, fontWeight: 700 }}>{strength.label}</span>
                      </div>
                    )}
                    {f.key === "confirmPassword" && pwForm.confirmPassword && (
                      <div style={{
                        fontSize: 12, marginTop: 4, fontWeight: 600,
                        color: pwForm.newPassword === pwForm.confirmPassword ? "#16a34a" : "#dc2626",
                      }}>
                        {pwForm.newPassword === pwForm.confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="set-form-actions">
                <button type="submit" className="set-save-btn" disabled={pwSaving}>
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══ Preferences tab ══ */}
        {tab === "preferences" && (
          <div className="set-card">

            <div className="set-pref-intro">
              <span className="set-pref-intro-icon">🌍</span>
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>Store Preferences</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                  These settings control how prices, dates, and text are displayed across the entire storefront.
                </div>
              </div>
            </div>

            <div className="set-divider" />

            {/* Live preview */}
            <div className="set-pref-preview">
              <div className="set-pref-preview-label">Live Preview</div>
              <div className="set-pref-preview-row">
                <div className="set-pref-preview-card">
                  <div className="set-pref-preview-title">Currency</div>
                  <div className="set-pref-preview-value">{fmt(1500)}</div>
                  <div className="set-pref-preview-sub">1,500 ETB converted</div>
                </div>
                <div className="set-pref-preview-card">
                  <div className="set-pref-preview-title">Country</div>
                  <div className="set-pref-preview-value">{country.flag} {country.name}</div>
                  <div className="set-pref-preview-sub">{country.dialCode}</div>
                </div>
                <div className="set-pref-preview-card">
                  <div className="set-pref-preview-title">Language</div>
                  <div className="set-pref-preview-value">{language.nativeName}</div>
                  <div className="set-pref-preview-sub">Direction: {language.dir?.toUpperCase()}</div>
                </div>
              </div>
            </div>

            <div className="set-fields-grid" style={{ marginTop: 24 }}>

              {/* Country */}
              <div className="set-field">
                <label>🌍 Country / Region</label>
                <div className="set-pref-select-wrap">
                  <span className="set-pref-flag">{country.flag}</span>
                  <select
                    value={country.code}
                    onChange={e => setCountry(COUNTRIES.find(c => c.code === e.target.value))}
                    className="set-pref-native-select"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.dialCode})</option>
                    ))}
                  </select>
                </div>
                <span className="set-pref-hint">Affects phone dial codes and shipping zones.</span>
              </div>

              {/* Language */}
              <div className="set-field">
                <label>🌐 Language</label>
                <div className="set-pref-select-wrap">
                  <span className="set-pref-flag">🌐</span>
                  <select
                    value={language.code}
                    onChange={e => setLanguage(LANGUAGES.find(l => l.code === e.target.value))}
                    className="set-pref-native-select"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} — {l.name}{l.dir === "rtl" ? " (RTL)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="set-pref-hint">Arabic activates right-to-left layout automatically.</span>
              </div>

              {/* Currency */}
              <div className="set-field" style={{ gridColumn: "1/-1" }}>
                <label>💱 Display Currency</label>
                <div className="set-pref-currency-grid">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      className={`set-pref-cur-btn ${currency.code === c.code ? "active" : ""}`}
                      onClick={() => setCurrency(c)}
                      title={c.name}
                    >
                      <span className="set-pref-cur-symbol">{c.symbol}</span>
                      <span className="set-pref-cur-code">{c.code}</span>
                      <span className="set-pref-cur-name">{c.name}</span>
                      <span className="set-pref-cur-rate">{c.rate === 1 ? "Base" : `×${c.rate}`}</span>
                    </button>
                  ))}
                </div>
                <span className="set-pref-hint">
                  All prices are stored in ETB. Selecting a different currency converts display prices using the exchange rate above.{" "}
                  <strong>Rates are approximate and for display only.</strong>
                </span>
              </div>

            </div>

            <div className="set-pref-saved-note">
              ✓ Preferences are saved instantly to your browser and applied across the entire store.
            </div>

          </div>
        )}

        {/* ══ Promo Banner tab ══ */}
        {tab === "promos" && (
          <div className="set-card">
            <div className="set-pref-intro">
              <span className="set-pref-intro-icon">📢</span>
              <div>
                <div style={{ fontWeight:800, color:"#0f172a", fontSize:15 }}>Promo Banner Manager</div>
                <div style={{ fontSize:13, color:"#64748b", marginTop:3 }}>
                  These messages rotate in the announcement bar at the top of the storefront. Add, reorder, or remove them.
                </div>
              </div>
            </div>

            <div className="set-divider" />

            {/* Add new promo */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>
                Add New Promo Message (HTML supported for <strong>bold</strong>)
              </label>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  value={promoText}
                  onChange={e => setPromoText(e.target.value)}
                  placeholder='e.g. 🔥 <strong>Flash Sale</strong> — 30% off Laptops this weekend!'
                  style={{ flex:1, padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none" }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && promoText.trim()) {
                      const updated = [...promos, { id: Date.now(), text: promoText.trim() }];
                      setPromos(updated);
                      localStorage.setItem("store_promos", JSON.stringify(updated));
                      window.dispatchEvent(new Event("promosUpdated"));
                      setPromoText("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!promoText.trim()) return;
                    const updated = [...promos, { id: Date.now(), text: promoText.trim() }];
                    setPromos(updated);
                    localStorage.setItem("store_promos", JSON.stringify(updated));
                    window.dispatchEvent(new Event("promosUpdated"));
                    setPromoText("");
                  }}
                  style={{ padding:"9px 20px", background:"#16a34a", color:"white", border:"none", borderRadius:8, fontWeight:700, fontSize:14, cursor:"pointer", whiteSpace:"nowrap" }}
                >
                  + Add
                </button>
              </div>
              <span style={{ fontSize:11, color:"#94a3b8", display:"block", marginTop:4 }}>
                Press Enter or click Add. Changes apply to the storefront immediately.
              </span>
            </div>

            {/* Promo list */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {promos.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10 }}>
                  <span style={{ color:"#94a3b8", fontSize:13, fontWeight:700, minWidth:22 }}>{i+1}.</span>
                  <span style={{ flex:1, fontSize:13, color:"#334155" }} dangerouslySetInnerHTML={{ __html: p.text }} />
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const a = [...promos]; [a[i-1], a[i]] = [a[i], a[i-1]];
                          setPromos(a); localStorage.setItem("store_promos", JSON.stringify(a)); window.dispatchEvent(new Event("promosUpdated"));
                        }}
                        style={{ padding:"4px 8px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:6, cursor:"pointer", fontSize:12 }}
                      >↑</button>
                    )}
                    {i < promos.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const a = [...promos]; [a[i], a[i+1]] = [a[i+1], a[i]];
                          setPromos(a); localStorage.setItem("store_promos", JSON.stringify(a)); window.dispatchEvent(new Event("promosUpdated"));
                        }}
                        style={{ padding:"4px 8px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:6, cursor:"pointer", fontSize:12 }}
                      >↓</button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = promos.filter((_, j) => j !== i);
                        setPromos(updated); localStorage.setItem("store_promos", JSON.stringify(updated)); window.dispatchEvent(new Event("promosUpdated"));
                      }}
                      style={{ padding:"4px 8px", background:"transparent", color:"#dc2626", border:"1px solid #fecdd3", borderRadius:6, cursor:"pointer", fontSize:12 }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            {promos.length === 0 && (
              <div style={{ textAlign:"center", padding:"32px", color:"#94a3b8", background:"#f8fafc", borderRadius:10, border:"1px dashed #e2e8f0" }}>
                No promo messages yet. Add one above.
              </div>
            )}

            <div className="set-pref-saved-note" style={{ marginTop:16 }}>
              ✓ Changes are saved instantly and appear in the storefront banner immediately.
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default Settings;
