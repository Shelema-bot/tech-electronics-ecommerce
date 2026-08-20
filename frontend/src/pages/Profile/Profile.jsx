import { useEffect, useState } from "react";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import { useToast } from "../../context/ToastContext";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./Profile.css";

function Profile() {
  const toast = useToast();
  const [user, setUser]       = useState(null);
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: "", phone: "", address: "" });

  useEffect(() => { getProfile(); }, []);

  const getProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      setUser(res.data.user);
      setForm({
        name:    res.data.user.name    || "",
        phone:   res.data.user.phone   || "",
        address: res.data.user.address || "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      if (image) fd.append("profileImage", image);

      const res = await API.put("/users/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      setImage(null);
      setPreview("");
      toast.success("Profile updated successfully!");

      // Update stored user
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...parsed, ...res.data.user }));
        window.dispatchEvent(new Event("loginStatusChanged"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const avatarSrc = preview
    ? preview
    : user.profileImage
    ? getImageUrl(user.profileImage)
    : null;

  return (
    <AccountLayout>
      <div className="profile">
        <h1>My Profile</h1>

      {/* Avatar */}
      <div className="profile-avatar-section">
        <div className="profile-img-wrap">
          {avatarSrc ? (
            <img src={avatarSrc} className="profile-image" alt="profile" />
          ) : (
            <div className="no-image">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <label className="avatar-upload-btn" title="Change photo">
            📷
            <input type="file" accept="image/*" onChange={handleImage} hidden />
          </label>
        </div>
        <div>
          <h2>{user.name}</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>{user.email}</p>
          <span className="profile-role-badge">{user.role}</span>
        </div>
      </div>

      {/* Form */}
      <div className="profile-form-card">
        <form onSubmit={updateProfile}>
          <label>Full Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />

          <label>Email Address</label>
          <input type="email" value={user.email} disabled style={{ background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" }} />

          <label>Phone Number</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0912345678" />

          <label>Delivery Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} placeholder="Your delivery address" />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
    </AccountLayout>
  );
}

export default Profile;
