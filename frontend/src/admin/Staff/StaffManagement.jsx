import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./StaffManagement.css";

const ROLES = ["customer", "cashier", "seller", "admin", "super_admin"];

function StaffManagement() {
  const toast = useToast();
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = currentUser.role === "super_admin";

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await API.get("/staff/all");
      setStaff(res.data.staff || []);
    } catch (err) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.put(`/staff/${id}/role`, { role });
      toast.success("Role updated");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await API.put(`/staff/${id}/toggle-status`);
      toast.success("Status updated");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = staff.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="staff-page">

        <div className="staff-header">
          <div>
            <h1>Staff Management</h1>
            <p>Manage roles and permissions for all staff members</p>
          </div>
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", width: "220px" }}
          />
        </div>

        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Current Role</th>
                {isSuperAdmin && <th>Change Role</th>}
                <th>Status</th>
                {isSuperAdmin && <th>Toggle</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="staff-empty">Loading staff...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="staff-empty">No staff found</td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="user-name">{u.name}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    {isSuperAdmin && (
                      <td>
                        {u.role === "super_admin" && u._id === currentUser._id ? (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>You</span>
                        ) : (
                          <select
                            className="role-select-admin"
                            value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    )}
                    <td>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: "20px",
                        fontSize: "12px", fontWeight: "600",
                        background: u.isActive ? "#dcfce7" : "#fee2e2",
                        color: u.isActive ? "#16a34a" : "#dc2626",
                      }}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td>
                        {u.role !== "super_admin" && (
                          <button
                            className={`toggle-btn ${u.isActive ? "active" : "inactive"}`}
                            onClick={() => toggleStatus(u._id)}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}

export default StaffManagement;
