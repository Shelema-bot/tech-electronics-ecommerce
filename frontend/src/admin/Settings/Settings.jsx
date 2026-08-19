import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/imageUrl";
import "./Settings.css";

function Settings() {
  const toast = useToast();
  const [user, setUser] = useState({ name: "", email: "", phone: "", address: "", profileImage: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { getProfile(); }, []);

  const getProfile = async () => {
    try {
      const res = await API.get("/users/admin/profile");
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

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
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("phone", user.phone);
      formData.append("address", user.address);
      if (image) formData.append("profileImage", image);
      await API.put("/users/admin/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully");
      getProfile();
      setPreview("");
      setImage(null);
    } catch (error) {
      console.log(error);
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = preview || getImageUrl(user.profileImage);

  return (
    <AdminLayout>
      <div className="settings-page">

        <div className="settings-header">
          <h1>Settings</h1>
          <p>Update your admin profile information</p>
        </div>

        <div className="settings-card">
          <form onSubmit={updateProfile} className="settings-form">

            {/* Avatar */}
            <div className="settings-avatar-section">
              <div className="settings-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="admin" />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase() || "A"}</span>
                )}
              </div>
              <div className="settings-avatar-info">
                <h3>{user.name || "Admin"}</h3>
                <p>{user.email}</p>
                <label className="upload-photo-btn">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleImage} hidden />
                </label>
              </div>
            </div>

            <div className="settings-divider" />

            {/* Fields */}
            <div className="settings-fields">
              <div className="settings-field">
                <label>Full Name</label>
                <input name="name" value={user.name || ""} onChange={handleChange} placeholder="Enter your name" />
              </div>

              <div className="settings-field">
                <label>Email</label>
                <input value={user.email || ""} disabled className="disabled-input" />
              </div>

              <div className="settings-field">
                <label>Phone</label>
                <input name="phone" value={user.phone || ""} onChange={handleChange} placeholder="Enter phone number" />
              </div>

              <div className="settings-field">
                <label>Address</label>
                <textarea name="address" value={user.address || ""} onChange={handleChange} placeholder="Enter address" rows="3" />
              </div>
            </div>

            <div className="settings-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Settings;
