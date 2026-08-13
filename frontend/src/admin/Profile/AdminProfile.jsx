import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { getImageUrl } from "../../utils/imageUrl";
import "./AdminProfile.css";

function AdminProfile() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => { getAdminProfile(); }, []);

  const getAdminProfile = async () => {
    try {
      const res = await API.get("/users/admin/profile");
      setAdmin(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  if (!admin) {
    return (
      <AdminLayout>
        <div className="ap-loading">Loading profile...</div>
      </AdminLayout>
    );
  }

  const avatarSrc = getImageUrl(admin.profileImage);

  return (
    <AdminLayout>
      <div className="ap-page">

        <div className="ap-header">
          <h1>Admin Profile</h1>
          <p>Your account information</p>
        </div>

        <div className="ap-card">

          {/* Avatar */}
          <div className="ap-avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt={admin.name} className="ap-avatar-img" />
            ) : (
              <div className="ap-avatar-placeholder">
                {admin.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <span className="ap-role-badge">ADMIN</span>
          </div>

          {/* Info */}
          <div className="ap-info">
            <h2>{admin.name}</h2>

            <div className="ap-fields">
              <div className="ap-field">
                <span className="ap-field-label">Email</span>
                <span className="ap-field-value">{admin.email}</span>
              </div>
              <div className="ap-field">
                <span className="ap-field-label">Phone</span>
                <span className="ap-field-value">{admin.phone || "—"}</span>
              </div>
              <div className="ap-field">
                <span className="ap-field-label">Address</span>
                <span className="ap-field-value">{admin.address || "—"}</span>
              </div>
              <div className="ap-field">
                <span className="ap-field-label">Role</span>
                <span className="ap-field-value capitalize">{admin.role}</span>
              </div>
            </div>

            <Link to="/admin/settings" className="ap-edit-btn">
              Edit Profile
            </Link>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
