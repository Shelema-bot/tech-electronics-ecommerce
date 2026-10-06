import "./DashboardCard.css";

function DashboardCard({ title, value, color, icon, trend, trendLabel }) {
  const isPositive = trend > 0;
  const isNeutral  = trend === undefined || trend === null;

  return (
    <div className="dashboard-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="dc-top">
        <div className="dc-icon-wrap" style={{ background: `${color}18`, color }}>
          {icon || "📊"}
        </div>
        {!isNeutral && (
          <span className={`dc-trend ${isPositive ? "up" : "down"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="dc-value" style={{ color }}>{value}</div>
      <div className="dc-title">{title}</div>
      {trendLabel && <div className="dc-trend-label">{trendLabel}</div>}
    </div>
  );
}

export default DashboardCard;
