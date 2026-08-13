import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import "./Reports.css";

const ICONS = {
  "Total Orders": "📦",
  "Total Products": "🛍️",
  "Customers": "👥",
  "Revenue": "💰",
  "Pending Payments": "⏳",
};

const COLORS = {
  "Total Orders":    "#6366f1",
  "Total Products":  "#f59e0b",
  "Customers":       "#10b981",
  "Revenue":         "#2563eb",
  "Pending Payments":"#ef4444",
};

function Reports() {
  const [report, setReport] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { getReports(); }, []);

  const getReports = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/reports");
      setReport({
        totalOrders:    res.data.totalOrders    || 0,
        totalProducts:  res.data.totalProducts  || 0,
        totalCustomers: res.data.totalCustomers || 0,
        totalRevenue:   res.data.totalRevenue   || 0,
        pendingPayments:res.data.pendingPayments|| 0,
      });
    } catch (error) {
      console.log("REPORT ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: "Total Orders",    value: report.totalOrders },
    { label: "Total Products",  value: report.totalProducts },
    { label: "Customers",       value: report.totalCustomers },
    { label: "Revenue",         value: `${report.totalRevenue.toLocaleString()} ETB` },
    { label: "Pending Payments",value: report.pendingPayments },
  ];

  return (
    <AdminLayout>
      <div className="reports-page">

        <div className="reports-header">
          <h1>Sales Reports</h1>
          <p>Overview of your business performance</p>
        </div>

        {loading ? (
          <div className="reports-loading">Loading reports...</div>
        ) : (
          <div className="reports-grid">
            {cards.map((card) => (
              <div
                className="report-card"
                key={card.label}
                style={{ borderTop: `4px solid ${COLORS[card.label]}` }}
              >
                <div className="report-icon">{ICONS[card.label]}</div>
                <div className="report-value">{card.value}</div>
                <div className="report-label">{card.label}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default Reports;
