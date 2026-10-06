import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import SalesChart from "../components/Charts/SalesChart";
import OrdersChart from "../components/Charts/OrdersChart";
import CategoryChart from "../components/Charts/CategoryChart";
import "../components/Charts/Charts.css";
import "./Reports.css";

const fmtCurrency = (v) => {
  const n = Number(v) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ETB`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K ETB`;
  return `${n.toLocaleString()} ETB`;
};

const STAT_META = [
  { key:"totalOrders",    label:"Total Orders",    icon:"📦", color:"#2563eb" },
  { key:"totalProducts",  label:"Products",         icon:"🛍️", color:"#f59e0b" },
  { key:"totalCustomers", label:"Customers",         icon:"👥", color:"#0891b2" },
  { key:"totalRevenue",   label:"Total Revenue",     icon:"💰", color:"#16a34a", currency:true },
  { key:"pendingPayments",label:"Pending Payments",  icon:"⏳", color:"#e11d48" },
];

function Reports() {
  const [report, setReport] = useState({
    totalOrders:0, totalProducts:0, totalCustomers:0,
    totalRevenue:0, pendingPayments:0,
    monthlySales:[], ordersByStatus:[], productsByCategory:[],
    topProducts:[],
  });
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/reports");
      setReport(res.data);
    } catch (err) {
      console.error("Reports error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setExporting(true);
    const rows = [
      ["Metric","Value"],
      ["Total Orders",    report.totalOrders],
      ["Total Products",  report.totalProducts],
      ["Total Customers", report.totalCustomers],
      ["Total Revenue (ETB)", report.totalRevenue],
      ["Pending Payments",report.pendingPayments],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <AdminLayout>
      <div className="reports-page">

        {/* Header */}
        <div className="rep-header">
          <div>
            <h1 className="rep-title">Reports & Analytics</h1>
            <p className="rep-sub">Overview of your business performance</p>
          </div>
          <div className="rep-header-actions">
            <button className="rep-refresh-btn" onClick={fetchReports}>↻ Refresh</button>
            <button className="rep-export-btn" onClick={handleExport} disabled={exporting}>
              {exporting ? "Exporting…" : "⬇ Export CSV"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rep-loading">
            <div className="rep-spinner" /> Loading reports…
          </div>
        ) : (
          <>
            {/* KPI Stats */}
            <div className="rep-stats-grid">
              {STAT_META.map(s => (
                <div key={s.key} className="rep-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
                  <div className="rep-stat-top">
                    <span className="rep-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</span>
                  </div>
                  <div className="rep-stat-value" style={{ color:s.color }}>
                    {s.currency ? fmtCurrency(report[s.key]) : Number(report[s.key] || 0).toLocaleString()}
                  </div>
                  <div className="rep-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="rep-charts-grid">
              <div className="chart-box">
                <h2>Monthly Sales Revenue</h2>
                <SalesChart data={report.monthlySales || []} />
              </div>
              <div className="chart-box">
                <h2>Orders by Status</h2>
                <OrdersChart data={report.ordersByStatus || []} />
              </div>
            </div>

            <div className="rep-charts-grid" style={{ gridTemplateColumns:"1fr" }}>
              <div className="chart-box">
                <h2>Products by Category</h2>
                <CategoryChart data={report.productsByCategory || []} />
              </div>
            </div>

            {/* Top products table */}
            {report.topProducts?.length > 0 && (
              <div className="rep-section">
                <h2 className="rep-section-title">🏆 Top Selling Products</h2>
                <div className="rep-top-table-wrap">
                  <table className="rep-top-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topProducts.map((p, i) => (
                        <tr key={p._id || i}>
                          <td className="rep-rank">
                            <span className={`rep-rank-badge ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="rep-prod-name">{p.name || p._id}</td>
                          <td style={{ fontSize:13, color:"#64748b" }}>{p.category || "—"}</td>
                          <td style={{ fontWeight:700, color:"#0f172a" }}>{p.totalSold || p.count || 0}</td>
                          <td style={{ fontWeight:700, color:"#16a34a" }}>
                            {fmtCurrency(p.totalRevenue || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary tiles */}
            <div className="rep-summary-grid">
              <div className="rep-summary-card">
                <div className="rep-summary-icon" style={{ background:"#dbeafe", color:"#2563eb" }}>📊</div>
                <div className="rep-summary-content">
                  <div className="rep-summary-title">Avg. Order Value</div>
                  <div className="rep-summary-value">
                    {report.totalOrders > 0
                      ? fmtCurrency(report.totalRevenue / report.totalOrders)
                      : "—"}
                  </div>
                </div>
              </div>
              <div className="rep-summary-card">
                <div className="rep-summary-icon" style={{ background:"#dcfce7", color:"#16a34a" }}>💳</div>
                <div className="rep-summary-content">
                  <div className="rep-summary-title">Payment Rate</div>
                  <div className="rep-summary-value">
                    {report.totalOrders > 0
                      ? `${Math.round(((report.totalOrders - report.pendingPayments) / report.totalOrders) * 100)}%`
                      : "—"}
                  </div>
                </div>
              </div>
              <div className="rep-summary-card">
                <div className="rep-summary-icon" style={{ background:"#ede9fe", color:"#7c3aed" }}>📦</div>
                <div className="rep-summary-content">
                  <div className="rep-summary-title">Products per Category</div>
                  <div className="rep-summary-value">
                    {report.productsByCategory?.length > 0
                      ? Math.round(report.totalProducts / report.productsByCategory.length)
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default Reports;
