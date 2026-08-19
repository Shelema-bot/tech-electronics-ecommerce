import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./ContactMessages.css";

function ContactMessages() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => { getMessages(); }, []);

  const getMessages = async () => {
    try {
      const res = await API.get("/contact/admin");
      setMessages(res.data);
    } catch (err) {
      console.log("CONTACT ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/contact/admin/${id}`, { status });
      getMessages();
    } catch (err) {
      console.log(err);
    }
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) { toast.warning("Please write a reply first"); return; }
    try {
      await API.put(`/contact/admin/reply/${id}`, { reply: replyText });
      toast.success("Reply sent successfully");
      setReplyText("");
      setSelectedMessage(null);
      getMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reply failed");
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await API.delete(`/contact/admin/${id}`);
      toast.success("Message deleted");
      getMessages();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return <div className="contact-loading"><h2>Loading messages...</h2></div>;
  }

  return (
    <div className="admin-contacts">
      <div className="contacts-header">
        <div>
          <h1>Contact Messages</h1>
          <p>Manage customer messages</p>
        </div>
        <div className="message-count">{messages.length}<span>Messages</span></div>
      </div>

      {messages.length === 0 ? (
        <div className="no-contact-messages"><h2>No Messages Found</h2></div>
      ) : (
        <>
          <div className="contact-table-container">
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Customer</th><th>Email</th><th>Subject</th>
                  <th>Message</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id}>
                    <td>{msg.name}</td>
                    <td>{msg.email}</td>
                    <td>{msg.subject}</td>
                    <td>
                      <div className="message-text">{msg.message}</div>
                      {msg.screenshot && (
                        <a href={msg.screenshot} target="_blank" rel="noreferrer" className="view-screenshot-btn">📎 View Screenshot</a>
                      )}
                    </td>
                    <td>
                      <select value={msg.status} onChange={e => updateStatus(msg._id, e.target.value)} className={`message-status ${msg.status}`}>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                    </td>
                    <td>
                      <button className="reply-message-btn" onClick={() => setSelectedMessage(msg)}>Reply</button>
                      <button className="delete-message-btn" onClick={() => deleteMessage(msg._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="contact-cards">
            {messages.map((msg) => (
              <div className="contact-card" key={msg._id}>
                <div className="contact-card-row">
                  <div>
                    <div className="contact-card-name">{msg.name}</div>
                    <div className="contact-card-email">{msg.email}</div>
                  </div>
                  <select value={msg.status} onChange={e => updateStatus(msg._id, e.target.value)} className={`message-status ${msg.status}`}>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
                <div className="contact-card-subject">{msg.subject}</div>
                <div className="contact-card-message">{msg.message}</div>
                {msg.screenshot && (
                  <a href={msg.screenshot} target="_blank" rel="noreferrer" className="view-screenshot-btn">📎 View Screenshot</a>
                )}
                <div className="contact-card-footer">
                  <button className="reply-message-btn" onClick={() => setSelectedMessage(msg)}>Reply</button>
                  <button className="delete-message-btn" onClick={() => deleteMessage(msg._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedMessage && (
        <div className="reply-box">
          <h2>Reply To: {selectedMessage.name}</h2>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write reply..." />
          <div className="reply-actions">
            <button className="send-reply-btn" onClick={() => sendReply(selectedMessage._id)}>Send Reply</button>
            <button className="cancel-reply-btn" onClick={() => { setSelectedMessage(null); setReplyText(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactMessages;
