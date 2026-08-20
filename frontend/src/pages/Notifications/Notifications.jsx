import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./Notifications.css";

// Placeholder notifications — in production connect to a real notification system
const SAMPLE_NOTIFICATIONS = [
  { id: 1, icon: "📦", title: "Order Confirmed", message: "Your order has been placed and is being processed.", time: "Just now", read: false },
  { id: 2, icon: "✅", title: "Payment Successful", message: "Your Chapa payment was verified and your order is confirmed.", time: "2 hours ago", read: false },
  { id: 3, icon: "🚚", title: "Order Shipped", message: "Your order is on its way! Expected delivery in 1-3 days.", time: "Yesterday", read: true },
  { id: 4, icon: "⭐", title: "Review Reminder", message: "How was your recent purchase? Share your feedback.", time: "3 days ago", read: true },
];

function Notifications() {
  const unread = SAMPLE_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <AccountLayout>
      <div className="notif-page">

        <div className="notif-header">
          <h1>
            Notifications
            {unread > 0 && <span className="notif-unread-badge">{unread} new</span>}
          </h1>
          <p>Stay updated on your orders and account activity</p>
        </div>

        <div className="notif-list">
          {SAMPLE_NOTIFICATIONS.map(n => (
            <div className={`notif-item ${!n.read ? "unread" : ""}`} key={n.id}>
              <div className="notif-icon-wrap">{n.icon}</div>
              <div className="notif-content">
                <div className="notif-title">{n.title}</div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">{n.time}</div>
              </div>
              {!n.read && <span className="notif-dot" aria-label="Unread" />}
            </div>
          ))}
        </div>

      </div>
    </AccountLayout>
  );
}

export default Notifications;
