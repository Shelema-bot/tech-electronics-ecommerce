import AccountLayout from "../../components/AccountLayout/AccountLayout";
import { useNotifications } from "../../context/NotificationContext";
import "./Notifications.css";

const TYPE_ICON = {
  order:        "📦",
  payment:      "💳",
  promotion:    "🎁",
  system:       "⚙️",
  delivery:     "🚚",
  verification: "✅",
};

function Notifications() {
  const { notifications, unreadCount, loading, markRead, markAllRead, deleteNotif } = useNotifications();

  return (
    <AccountLayout>
      <div className="notif-page">

        <div className="notif-header">
          <div>
            <h1>
              Notifications
              {unreadCount > 0 && <span className="notif-unread-badge">{unreadCount} new</span>}
            </h1>
            <p>Stay updated on your orders, payments, and account activity</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ padding:"8px 16px", background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}
            >
              ✓ Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ color:"#64748b", padding:"40px 0", textAlign:"center" }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", background:"white", borderRadius:"14px", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔔</div>
            <h3 style={{ margin:"0 0 8px", color:"#0f172a" }}>No notifications yet</h3>
            <p style={{ color:"#64748b", fontSize:14, margin:0 }}>You'll see order updates, payment confirmations, and promotions here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => (
              <div
                className={`notif-item ${!n.isRead ? "unread" : ""}`}
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                style={{ cursor: !n.isRead ? "pointer" : "default" }}
              >
                <div className="notif-icon-wrap">
                  {TYPE_ICON[n.type] || n.icon || "🔔"}
                </div>
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-time">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString("en-US",{
                      month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
                    }) : ""}
                  </div>
                </div>
                {!n.isRead && <span className="notif-dot" aria-label="Unread" />}
                <button
                  className="notif-delete"
                  onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                  aria-label="Delete notification"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </AccountLayout>
  );
}

export default Notifications;
