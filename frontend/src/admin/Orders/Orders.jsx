import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import "./Orders.css";

function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get("/admin/orders");
      setOrders(response.data.orders || response.data);
    } catch (error) {
      console.log("ORDER ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.log("UPDATE STATUS ERROR:", error.response?.data || error.message);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await API.delete(`/admin/orders/${id}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const filtered = orders.filter((o) =>
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s) => {
    const map = { pending: "badge-yellow", processing: "badge-blue", delivered: "badge-green", cancelled: "badge-red", shipped: "badge-purple" };
    return map[s?.toLowerCase()] || "badge-yellow";
  };

  return (
    <AdminLayout>
      <div className="admin-orders">

        {/* Header */}
        <div className="orders-header">
          <div>
            <h1>Orders Management</h1>
            <p>Track and manage all customer orders</p>
          </div>
          <div className="orders-stats">
            <span className="ostat">{orders.length} Total</span>
            <span className="ostat green">{orders.filter(o => o.isPaid).length} Paid</span>
            <span className="ostat yellow">{orders.filter(o => !o.isPaid).length} Pending</span>
          </div>
        </div>

        {/* Search */}
        <div className="orders-toolbar">
          <input
            type="text"
            className="orders-search"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="orders-count">{filtered.length} orders</span>
        </div>

        {/* Table */}
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Update</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="orders-empty">Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="orders-empty">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="order-customer">
                        <div className="order-avatar">
                          {order.user?.name?.charAt(0).toUpperCase() || "G"}
                        </div>
                        <div>
                          <div className="order-customer-name">{order.user?.name || "Guest"}</div>
                          <div className="order-customer-email">{order.user?.email || "—"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="order-items-cell">
                      {order.orderItems?.map((item, i) => (
                        <div key={i} className="order-item-line">
                          {item.name} <span>×{item.quantity}</span>
                        </div>
                      ))}
                    </td>

                    <td className="order-total">{order.totalPrice} ETB</td>

                    <td>
                      <span className={`order-pay-badge ${order.isPaid ? "paid" : "unpaid"}`}>
                        {order.isPaid ? "✓ Paid" : "Pending"}
                      </span>
                    </td>

                    <td>
                      <span className={`order-status-badge ${statusColor(order.status)}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      <select
                        className="order-status-select"
                        value={order.status || "Pending"}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <button className="order-delete-btn" onClick={() => deleteOrder(order._id)}>
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

export default Orders;
