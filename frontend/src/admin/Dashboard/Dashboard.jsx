import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import DashboardCard from "../components/DashboardCard";
import SalesChart from "../components/Charts/SalesChart";
import OrdersChart from "../components/Charts/OrdersChart";
import CategoryChart from "../components/Charts/CategoryChart";
import "../components/Charts/Charts.css";
import "./Dashboard.css";

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    productsByCategory: [],
    monthlySales: [],
    ordersByStatus: [],
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get("/admin/reports");
      setReport(res.data);
    } catch (err) {
      console.error("Dashboard Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmtRevenue = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M ETB`;
    if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}K ETB`;
    return `${v} ETB`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="dash-spinner" />
          Loading dashboard…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-page">

        {/* Welcome banner */}
        <div className="dash-welcome">
          <div className="dash-welcome-left">
            <h2 className="dash-welcome-title">
              {greeting}, {currentUser.name?.split(" ")[0] || "Admin"} 👋
            </h2>
            <p className="dash-welcome-sub">
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="dash-welcome-badge">
            <span>⚡ Live Data</span>
          </div>
        </div>

        {/* KPI cards */}
        <div className="dashboard-cards">
          <DashboardCard
            title="Total Products"
            value={report.totalProducts}
            color="#2563eb"
            icon="📦"
            trendLabel="In catalogue"
          />
          <DashboardCard
            title="Total Orders"
            value={report.totalOrders}
            color="#f59e0b"
            icon="🛒"
            trendLabel="All time"
          />
          <DashboardCard
            title="Customers"
            value={report.totalCustomers}
            color="#0891b2"
            icon="👥"
            trendLabel="Registered users"
          />
          <DashboardCard
            title="Revenue"
            value={fmtRevenue(report.totalRevenue)}
            color="#16a34a"
            icon="💰"
            trendLabel="Total collected"
          />
          <DashboardCard
            title="Pending Payments"
            value={report.pendingPayments}
            color="#e11d48"
            icon="⏳"
            trendLabel="Awaiting verification"
          />
        </div>

        {/* Quick-action row */}
        <div className="dash-quick-row">
          {[
            { label: "Add Product",  href: "/admin/products",  icon: "➕", color: "#2563eb" },
            { label: "View Orders",  href: "/admin/orders",    icon: "📋", color: "#f59e0b" },
            { label: "Payments",     href: "/admin/payments",  icon: "💳", color: "#16a34a" },
            { label: "Reports",      href: "/admin/reports",   icon: "📊", color: "#7c3aed" },
          ].map(q => (
            <a key={q.href} href={q.href} className="dash-quick-card" style={{ borderLeft: `4px solid ${q.color}` }}>
              <span className="dash-quick-icon" style={{ background: `${q.color}18`, color: q.color }}>{q.icon}</span>
              <span className="dash-quick-label">{q.label}</span>
            </a>
          ))}
        </div>

        {/* Charts */}
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
