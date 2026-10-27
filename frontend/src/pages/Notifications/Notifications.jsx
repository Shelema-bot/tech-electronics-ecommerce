import { useState } from "react";
import { useTranslation } from "react-i18next";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import { useNotifications } from "../../context/NotificationContext";
import "./Notifications.css";

const TYPE_META = {
  order:        { icon: "📦", label: "Orders",       color: "#2563eb", bg: "#dbeafe" },
  payment:      { icon: "💳", label: "Payments",     color: "#16a34a", bg: "#dcfce7" },
  promotion:    { icon: "🎁", label: "Promotions",   color: "#7c3aed", bg: "#ede9fe" },
  system:       { icon: "⚙️", label: "System",       color: "#475569", bg: "#f1f5f9" },
  delivery:     { icon: "🚚", label: "Delivery",     color: "#0891b2", bg: "#e0f2fe" },
  verification: { icon: "✅", label: "Verification", color: "#16a34a", bg: "#dcfce7" },
};

const FILTERS = [
  { key: "all",          label: "All" },
  { key: "order",        label: "Orders" },
  { key: "payment",      label: "Payments" },
  { key: "delivery",     label: "Delivery" },
  { key: "promotion",    label: "Promotions" },
  { key: "system",       label: "System" },
  { key: "verification", label: "Verification" },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Notifications() {
  const {
    notifications, unreadCount, loading,
    markRead, markAllRead, deleteNotif,
  } = useNotifications();
  const { t } = useTranslation();

  const [filter,     setFilter]     = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  const filtered = notifications.filter(n => {
    const matchType   = filter === "all" || n.type === filter;
    const matchUnread = !unreadOnly || !n.isRead;
    return matchType && matchUnread;
  });

  const handleDelete = async (id) => {
    setDeleting(id);
    await deleteNotif(id);
    setDeleting(null);
  };

  const typeCounts = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <AccountLayout>
      <div className="notif-page">

        {/* Header */}
        <div className="notif-header">
          <div>
            <h1>
              {t("account.notifications", "Notifications")}
              {unreadCount > 0 && (
                <span className="notif-unread-badge">{unreadCount} new</span>
              )}
            </h1>
            <p>Stay updated on your orders, payments, and account activity</p>
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn" onClick={markAllRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="notif-stats-row">
          {[
            { label: t("common.total", "Total"),       value: notifications.length, icon: "🔔", color: "#2563eb" },
            { label: t("account.unreadAlerts", "Unread"), value: unreadCount,          icon: "🔵", color: "#e11d48" },
            { label: t("admin.orders", "Orders"),      value: typeCounts.order    || 0, icon: "📦", color: "#f59e0b" },
            { label: t("account.payment", "Payments"), value: typeCounts.payment  || 0, icon: "💳", color: "#16a34a" },
          ].map(s => (
            <div key={s.label} className="notif-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <span className="notif-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</span>
              <div>
                <div className="notif-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="notif-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="notif-toolbar">
          <div className="notif-filter-pills">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`notif-pill ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.key !== "all" && <span>{TYPE_META[f.key]?.icon}</span>}
                {f.key === "all" ? t("common.all", "All") : f.label}
                {f.key !== "all" && typeCounts[f.key] > 0 && (
                  <span className="notif-pill-count">{typeCounts[f.key]}</span>
                )}
              </button>
            ))}
          </div>
          <label className="notif-unread-toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={e => setUnreadOnly(e.target.checked)}
            />
            Unread only
          </label>
        </div>

        {/* Content */}
        {loading ? (
          <div className="notif-loading">
            <div className="notif-spinner" /> {t("common.loading", "Loading notifications…")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-icon">
              {filter === "all" ? "🔔" : TYPE_META[filter]?.icon || "🔔"}
            </div>
            <h3>
              {unreadOnly
                ? "No unread notifications"
                : filter === "all"
                ? "No notifications yet"
                : `No ${TYPE_META[filter]?.label || filter} notifications`}
            </h3>
            <p>
              {filter === "all" && !unreadOnly
                ? "You'll see order updates, payment confirmations, and promotions here."
                : "Try changing your filter."}
            </p>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map(n => {
              const tm = TYPE_META[n.type] || TYPE_META.system;
              return (
                <div
                  key={n._id}
                  className={`notif-item ${!n.isRead ? "unread" : ""}`}
                  onClick={() => { if (!n.isRead) markRead(n._id); }}
                  style={{ cursor: !n.isRead ? "pointer" : "default" }}
                >
                  {/* Type icon */}
                  <div
                    className="notif-icon-wrap"
                    style={{ background: tm.bg, color: tm.color }}
                  >
                    {n.icon || tm.icon}
                  </div>

                  {/* Content */}
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-meta-row">
                      <span className="notif-type-chip" style={{ background: tm.bg, color: tm.color }}>
                        {tm.label}
                      </span>
                      <span className="notif-time">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && <span className="notif-dot" aria-label="Unread" />}

                  {/* Delete */}
                  <button
                    className="notif-delete"
                    disabled={deleting === n._id}
                    onClick={e => { e.stopPropagation(); handleDelete(n._id); }}
                    aria-label="Delete"
                    title="Delete"
                  >
                    {deleting === n._id ? "…" : "✕"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AccountLayout>
  );
}
