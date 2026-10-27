import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./Orders.css";

const STATUS_META = {
  Pending:    { color: "#a16207", bg: "#fef9c3", icon: "🕐" },
  Processing: { color: "#1d4ed8", bg: "#dbeafe", icon: "⚙️" },
  Shipped:    { color: "#7c3aed", bg: "#ede9fe", icon: "🚚" },
  Delivered:  { color: "#16a34a", bg: "#dcfce7", icon: "✅" },
  Cancelled:  { color: "#dc2626", bg: "#fee2e2", icon: "✕" },
};
const STATUS_LIST = Object.keys(STATUS_META);

const avatarColor = (name) => {
  const colors = ["#2563eb","#7c3aed","#db2777","#dc2626","#059669","#0891b2"];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
};

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const sm = STATUS_META[order.status] || STATUS_META.Pending;
  return (
    <div className="ord-overlay" onClick={onClose}>
      <div className="ord-modal" onClick={e => e.stopPropagation()}>
        <div className="ord-modal-header">
          <div>
            <h3>Order Detail</h3>
            <span style={{ fontFamily:"monospace", fontSize:12, color:"#94a3b8" }}>#{order._id?.slice(-8)}</span>
          </div>
          <button className="ord-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ord-modal-body">
          {/* Customer + status */}
          <div className="ord-detail-hero">
            <div className="ord-detail-avatar" style={{ background: avatarColor(order.user?.name) }}>
              {order.user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 16 }}>{order.user?.name || "Guest"}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>{order.user?.email || "—"}</div>
            </div>
            <span className="ord-status-badge" style={{ background: sm.bg, color: sm.color }}>
              {sm.icon} {order.status}
            </span>
          </div>

          {/* Items */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Order Items</div>
            {order.orderItems?.map((item, i) => (
              <div key={i} className="ord-detail-item-row">
                <span className="ord-detail-item-name">{item.name}</span>
                <span className="ord-detail-item-qty">×{item.quantity}</span>
                <span className="ord-detail-item-price">{Number(item.price || 0).toLocaleString()} ETB</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="ord-detail-grid">
            <div className="ord-detail-cell"><span>Total</span><strong>{Number(order.totalPrice).toLocaleString()} ETB</strong></div>
            <div className="ord-detail-cell"><span>Payment</span>
              <strong style={{ color: order.isPaid ? "#16a34a" : "#a16207" }}>
                {order.isPaid ? "✓ Paid" : "⏳ Pending"}
              </strong>
            </div>
            <div className="ord-detail-cell"><span>Method</span><strong>{order.paymentMethod || "—"}</strong></div>
            <div className="ord-detail-cell"><span>Placed</span>
              <strong>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US",{ year:"numeric",month:"short",day:"numeric" }) : "—"}</strong>
            </div>
            {order.shippingAddress && (
              <div className="ord-detail-cell" style={{ gridColumn: "1/-1" }}>
                <span>Shipping Address</span>
                <strong>
                  {[order.shippingAddress.address, order.shippingAddress.city, order.shippingAddress.country]
                    .filter(Boolean).join(", ") || "—"}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const toast = useToast();
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payFilter, setPayFilter]       = useState("all");
  const [detailOrder, setDetailOrder]   = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/orders");
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Permanently delete this order?")) return;
    try {
      await API.delete(`/admin/orders/${id}`);
      toast.success("Order deleted");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      o.user?.name?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s) ||
      o._id?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchPay = payFilter === "all" ||
      (payFilter === "paid" ? o.isPaid : !o.isPaid);
    return matchSearch && matchStatus && matchPay;
  });

  // Stats
  const stats = {
    total:     orders.length,
    paid:      orders.filter(o => o.isPaid).length,
    pending:   orders.filter(o => o.status === "Pending").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    revenue:   orders.filter(o => o.isPaid).reduce((s, o) => s + (o.totalPrice || 0), 0),
  };

  return (
    <AdminLayout>
      <div className="admin-orders">

        {/* Header */}
        <div className="ord-header">
          <div>
            <h1 className="ord-title">Orders</h1>
            <p className="ord-sub">Track, update, and manage all customer orders</p>
          </div>
          <button className="ord-refresh-btn" onClick={fetchOrders}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div className="ord-stats-grid">
          {[
            { label: "Total Orders",   value: stats.total,     icon: "📦", color: "#2563eb" },
            { label: "Paid",           value: stats.paid,      icon: "✅", color: "#16a34a" },
            { label: "Pending",        value: stats.pending,   icon: "🕐", color: "#f59e0b" },
            { label: "Delivered",      value: stats.delivered, icon: "🚚", color: "#0891b2" },
          ].map(s => (
            <div key={s.label} className="ord-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="ord-stat-row">
                <span className="ord-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</span>
                <span className="ord-stat-value" style={{ color: s.color }}>{s.value}</span>
              </div>
              <div className="ord-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="ord-toolbar">
          <input
            className="ord-search"
            type="text"
            placeholder="🔍  Search by customer name, email, or order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="ord-filter-group">
            <div className="ord-pills">
              <button
                className={`ord-pill ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >All</button>
              {STATUS_LIST.map(s => {
                const m = STATUS_META[s];
                return (
                  <button
                    key={s}
                    className={`ord-pill ${statusFilter === s ? "active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                    style={statusFilter === s ? { background: m.bg, color: m.color, borderColor: m.color } : {}}
                  >
                    {m.icon} {s}
                  </button>
                );
              })}
            </div>
            <div className="ord-pills">
              {[
                { key: "all",     label: "All Payments" },
                { key: "paid",    label: "✓ Paid" },
                { key: "unpaid",  label: "⏳ Unpaid" },
              ].map(f => (
                <button
                  key={f.key}
                  className={`ord-pill sm ${payFilter === f.key ? "active" : ""}`}
                  onClick={() => setPayFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <span className="ord-count">{filtered.length} of {orders.length}</span>
        </div>

        {/* Table */}
        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="ord-td-center">
                  <div className="ord-loading"><div className="ord-spinner" /> Loading orders…</div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="ord-td-center">
                  <div className="ord-empty">
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
                    No orders found
                  </div>
                </td></tr>
              ) : filtered.map(order => {
                const sm = STATUS_META[order.status] || STATUS_META.Pending;
                return (
                  <tr key={order._id} className="ord-row">
                    <td>
                      <div className="ord-customer">
                        <div className="ord-avatar" style={{ background: avatarColor(order.user?.name) }}>
                          {order.user?.name?.charAt(0).toUpperCase() || "G"}
                        </div>
                        <div>
                          <div className="ord-cust-name">{order.user?.name || "Guest"}</div>
                          <div className="ord-cust-email">{order.user?.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ord-items-cell">
                      {order.orderItems?.slice(0, 2).map((item, i) => (
                        <div key={i} className="ord-item-line">
                          {item.name} <span>×{item.quantity}</span>
                        </div>
                      ))}
                      {order.orderItems?.length > 2 && (
                        <div className="ord-item-more">+{order.orderItems.length - 2} more</div>
                      )}
                    </td>
                    <td className="ord-total">{Number(order.totalPrice).toLocaleString()} ETB</td>
                    <td>
                      <span className={`ord-pay-badge ${order.isPaid ? "paid" : "unpaid"}`}>
                        {order.isPaid ? "✓ Paid" : "⏳ Pending"}
                      </span>
                    </td>
                    <td>
                      <span className="ord-status-badge" style={{ background: sm.bg, color: sm.color }}>
                        {sm.icon} {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="ord-date">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td>
                      <select
                        className="ord-status-select"
                        value={order.status || "Pending"}
                        onChange={e => updateStatus(order._id, e.target.value)}
                      >
                        {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="ord-detail-btn" onClick={() => setDetailOrder(order)} title="View details">👁</button>
                        <button className="ord-delete-btn" onClick={() => deleteOrder(order._id)} title="Delete order">🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
    </AdminLayout>
  );
}

export default Orders;
