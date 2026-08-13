import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/users", authConfig);

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else if (Array.isArray(response.data.users)) {
        setCustomers(response.data.users);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.log("CUSTOMER ERROR:", error.response?.data || error.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, role) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role }, authConfig);
      fetchCustomers();
    } catch (error) {
      console.log("ROLE UPDATE ERROR:", error.response?.data || error.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/users/${id}/status`, { isActive: status }, authConfig);
      fetchCustomers();
    } catch (error) {
      console.log("STATUS UPDATE ERROR:", error.response?.data || error.message);
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`, authConfig);
      fetchCustomers();
    } catch (error) {
      console.log("DELETE ERROR:", error.response?.data || error.message);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCustomers = customers.filter((c) => c.role === "customer").length;
  const totalAdmins = customers.filter((c) => c.role === "admin").length;
  const activeUsers = customers.filter((c) => c.isActive).length;

  const getInitials = (name) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  return (
    <AdminLayout>
      <div className="customers-page">

        {/* Header */}
        <div className="customers-header">
          <div>
            <h1>Customers</h1>
            <p>Manage all registered users and their roles</p>
          </div>
        </div>

        {/* Stats */}
        <div className="customers-stats">
          <div className="cstat-card">
            <span className="cstat-number">{customers.length}</span>
            <span className="cstat-label">Total Users</span>
          </div>
          <div className="cstat-card">
            <span className="cstat-number">{totalCustomers}</span>
            <span className="cstat-label">Customers</span>
          </div>
          <div className="cstat-card">
            <span className="cstat-number">{totalAdmins}</span>
            <span className="cstat-label">Admins</span>
          </div>
          <div className="cstat-card">
            <span className="cstat-number">{activeUsers}</span>
            <span className="cstat-label">Active</span>
          </div>
        </div>

        {/* Search */}
        <div className="customers-toolbar">
          <input
            type="text"
            className="customers-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="customers-count">{filtered.length} users</span>
        </div>

        {/* Table */}
        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="customers-empty">
                    <div className="customers-loading">Loading customers...</div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="customers-empty">
                    No customers found
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <div className="customer-user-cell">
                        <div className="customer-avatar">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <div className="customer-name">{customer.name}</div>
                          <div className="customer-address">
                            {customer.address || "No address"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="customer-email">{customer.email}</td>

                    <td className="customer-phone">
                      {customer.phone || "—"}
                    </td>

                    <td>
                      <select
                        className={`role-select ${customer.role}`}
                        value={customer.role}
                        onChange={(e) => updateRole(customer._id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className={`status-btn ${customer.isActive ? "active" : "inactive"}`}
                        onClick={() => updateStatus(customer._id, !customer.isActive)}
                      >
                        <span className="status-dot" />
                        {customer.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteCustomer(customer._id)}
                      >
                        Delete
                      </button>
                    </td>
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

export default Customers;
