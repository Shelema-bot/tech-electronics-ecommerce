import { useEffect, useState } from "react";
import API from "../../api/axios";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./MyMessages.css";

function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get("/contact/my-messages")
      .then(res => setMessages(res.data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccountLayout>
      <div className="my-messages">

        <h1>Message Center</h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px", marginTop: "4px" }}>
          Your contact messages and admin replies
        </p>

        {loading ? (
          <div style={{ color: "#64748b", padding: "40px 0" }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px", background: "white",
            borderRadius: "14px", border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
            <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>No messages yet</h3>
            <p style={{ color: "#64748b", margin: "0 0 20px", fontSize: "14px" }}>
              Send us a message via the Contact page.
            </p>
          </div>
        ) : (
          messages.map(message => (
            <div className="message-card" key={message._id}>
              <h3>{message.subject}</h3>
              <p>{message.message}</p>
              <p className="status-line">
                Status: <strong>{message.status}</strong>
              </p>
              {message.reply && (
                <div className="admin-reply">
                  <h4>Admin Reply</h4>
                  <p>{message.reply}</p>
                </div>
              )}
            </div>
          ))
        )}

      </div>
    </AccountLayout>
  );
}

export default MyMessages;
