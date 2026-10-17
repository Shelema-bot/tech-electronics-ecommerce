import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import DashboardCard from "../components/DashboardCard";
import SalesChart from "../components/Charts/SalesChart";
import OrdersChart from "../components/Charts/OrdersChart";
import CategoryChart from "../components/Charts/CategoryChart";
import "../components/Charts/Charts.css";
import "./Dashboard.css";

/* ── Tech product showcase images (Unsplash CDN) ───────── */
const TECH_IMAGES = [
  { src: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=260&q=75", label: "MacBook" },
  { src: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=260&q=75", label: "Smartphones" },
  { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=260&q=75", label: "Headphones" },
  { src: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=260&q=75", label: "Tablets" },
  { src: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=260&q=75", label: "Drones" },
  { src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=260&q=75", label: "Cameras" },
  { src: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=260&q=75", label: "Smart Home" },
  { src: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=260&q=75", label: "Laptops" },
];

const STATUS_META = {
  Pending:    { color: "#a16207", bg: "#fef9c3" },
  Processing: { color: "#1d4ed8", bg: "#dbeafe" },
  Shipped:    { color: "#7c3aed", bg: "#ede9fe" },
  Delivered:  { color: "#16a34a", bg: "#dcfce7" },
  Cancelled:  { color: "#dc2626", bg: "#fee2e2" },
};

function Dashboard() {
  const [loading,  setLoading]  = useState(true);
  const [report,   setReport]   = useState({
    totalProducts:0, totalOrders:0, totalCustomers:0,
    totalRevenue:0, pendingPayments:0,
    productsByCategory:[], monthlySales:[], ordersByStatus:[],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifs]      = useState([]);
  const [imgIdx, setImgIdx]             = useState(0);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      API.get("/admin/reports", { headers }),
      API.get("/admin/orders", { headers }).then(r => r.data.orders || []).catch(() => []),
      API.get("/notifications", { headers }).then(r => r.data.notifications || []).catch(() => []),
    ]).then(([rep, orders, notifs]) => {
      setReport(rep.data);
      setRecentOrders(orders.slice(0, 6));
      setNotifs(notifs.slice(0, 5));
    }).catch(err => console.error("Dashboard Error:", err.message))
    .finally(() => setLoading(false));
  }, []);

  // Auto-scroll tech image strip
  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i + 1) % TECH_IMAGES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const fmtRevenue = (v) => {
    if (v >= 1_000_000) return `${(v/1_000_000).toFixed(1)}M ETB`;
    if (v >= 1_000)     return `${(v/1_000).toFixed(1)}K ETB`;
    return `${v} ETB`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dash-spinner" /> Loading dashboard…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-page">

        {/* ── Welcome banner ── */}
        <div className="dash-welcome">
          <div className="dash-welcome-left">
            <h2 className="dash-welcome-title">
              {greeting}, {currentUser.name?.split(" ")[0] || "Admin"} 👋
            </h2>
            <p className="dash-welcome-sub">
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="dash-welcome-badge"><span>⚡ Live Data</span></div>
        </div>

        {/* ── Tech product image strip ── */}
        <div className="dash-tech-strip">
          <div className="dash-tech-strip-track" style={{ transform: `translateX(-${imgIdx * (136 + 12)}px)` }}>
            {[...TECH_IMAGES, ...TECH_IMAGES].map((img, i) => (
              <div key={i} className="dash-tech-img-card">
                <img src={img.src} alt={img.label} loading="lazy" />
                <span className="dash-tech-img-label">{img.label}</span>
              </div>
            ))}
          </div>
          <div className="dash-strip-fade-left"  />
          <div className="dash-strip-fade-right" />
        </div>

        {/* ── KPI cards ── */}
        <div className="dashboard-cards">
          <DashboardCard title="Products"        value={report.totalProducts}         color="#2563eb" icon="📦" trendLabel="In catalogue" />
          <DashboardCard title="Orders"          value={report.totalOrders}           color="#f59e0b" icon="🛒" trendLabel="All time" />
          <DashboardCard title="Customers"       value={report.totalCustomers}        color="#0891b2" icon="👥" trendLabel="Registered users" />
          <DashboardCard title="Revenue"         value={fmtRevenue(report.totalRevenue)} color="#16a34a" icon="💰" trendLabel="Total collected" />
          <DashboardCard title="Pending Payments" value={report.pendingPayments}      color="#e11d48" icon="⏳" trendLabel="Awaiting verification" />
        </div>

        {/* ── Quick actions ── */}
        <div className="dash-quick-row">
          {[
            { label:"Add Product", href:"/admin/products", icon:"➕", color:"#2563eb" },
            { label:"View Orders", href:"/admin/orders",   icon:"📋", color:"#f59e0b" },
            { label:"Payments",    href:"/admin/payments", icon:"💳", color:"#16a34a" },
            { label:"Reports",     href:"/admin/reports",  icon:"📊", color:"#7c3aed" },
            { label:"Send Notif",  href:"/admin/notifications", icon:"🔔", color:"#0891b2" },
            { label:"Meetings",    href:"/admin/meetings", icon:"📅", color:"#e11d48" },
          ].map(q => (
            <a key={q.href} href={q.href} className="dash-quick-card" style={{ borderLeft:`4px solid ${q.color}` }}>
              <span className="dash-quick-icon" style={{ background:`${q.color}18`, color:q.color }}>{q.icon}</span>
              <span className="dash-quick-label">{q.label}</span>
            </a>
          ))}
        </div>

        {/* ── Bottom grid: Recent Orders + Notifications + Charts ── */}
        <div className="dash-bottom-grid">

          {/* Recent Orders */}
          <div className="dash-widget">
            <div className="dash-widget-header">
              <h3 className="dash-widget-title">📦 Recent Orders</h3>
              <Link to="/admin/orders" className="dash-widget-link">View all →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="dash-widget-empty">No orders yet</div>
            ) : (
              <div className="dash-orders-list">
                {recentOrders.map(order => {
                  const sm = STATUS_META[order.status] || STATUS_META.Pending;
                  return (
                    <div key={order._id} className="dash-order-row">
                      <div className="dash-order-avatar">
                        {order.user?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="dash-order-info">
                        <div className="dash-order-name">{order.user?.name || "Guest"}</div>
                        <div className="dash-order-id">#{order._id?.slice(-7)}</div>
                      </div>
                      <div className="dash-order-right">
                        <div className="dash-order-amount">{Number(order.totalPrice || 0).toLocaleString()} ETB</div>
                        <span className="dash-order-status" style={{ background:sm.bg, color:sm.color }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="dash-widget">
            <div className="dash-widget-header">
              <h3 className="dash-widget-title">🔔 My Notifications</h3>
              <Link to="/admin/notifications" className="dash-widget-link">Manage →</Link>
            </div>
            {notifications.length === 0 ? (
              <div className="dash-widget-empty">No notifications</div>
            ) : (
              <div className="dash-notif-list">
                {notifications.map(n => (
                  <div key={n._id} className={`dash-notif-row ${!n.isRead ? "unread" : ""}`}>
                    <span className="dash-notif-icon">{n.icon || "🔔"}</span>
                    <div className="dash-notif-content">
                      <div className="dash-notif-title">{n.title}</div>
                      <div className="dash-notif-msg">{n.message}</div>
                    </div>
                    {!n.isRead && <span className="dash-notif-dot" />}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Charts ── */}
        <div className="charts-grid">
          <div className="chart-box">
            <h2>Monthly Sales</h2>
            <SalesChart data={report.monthlySales || []} />
          </div>
          <div className="chart-box">
            <h2>Orders by Status</h2>
            <OrdersChart data={report.ordersByStatus || []} />
          </div>
          <div className="chart-box">
            <h2>Products by Category</h2>
            <CategoryChart data={report.productsByCategory || []} />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default Dashboard;
