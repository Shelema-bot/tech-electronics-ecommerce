import { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../../context/ToastContext";
import "./ContactMessages.css";

const STATUS_META = {
  new:     { bg:"#fef9c3", color:"#a16207", label:"New",     icon:"🔵" },
  read:    { bg:"#dbeafe", color:"#1d4ed8", label:"Read",    icon:"👁" },
  replied: { bg:"#dcfce7", color:"#16a34a", label:"Replied", icon:"✓" },
};

function ReplyModal({ message, onClose, onSent }) {
  const toast = useToast();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const taRef = useRef(null);

  useEffect(() => { taRef.current?.focus(); }, []);

  const send = async () => {
    if (!text.trim()) { toast.warning("Please write a reply first"); return; }
    setSending(true);
    try {
      await API.put(`/contact/admin/reply/${message._id}`, { reply: text });
      toast.success("Reply sent successfully");
      onSent();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-modal-header">
          <div>
            <h3>Reply to {message.name}</h3>
            <div className="cm-modal-email">{message.email}</div>
          </div>
          <button className="cm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cm-modal-body">
          <div className="cm-original-msg">
            <div className="cm-original-label">Original message</div>
            <div className="cm-original-subject">{message.subject}</div>
            <div className="cm-original-text">{message.message}</div>
          </div>
          <textarea
            ref={taRef}
            className="cm-reply-textarea"
            placeholder="Write your reply…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows="5"
          />
          <div className="cm-modal-actions">
            <button className="cm-send-btn" onClick={send} disabled={sending}>
              {sending ? "Sending…" : "📨 Send Reply"}
            </button>
            <button className="cm-cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ message, onClose }) {
  if (!message) return null;
  const sm = STATUS_META[message.status] || STATUS_META.new;
  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-modal-header">
          <div>
            <h3>{message.subject || "No Subject"}</h3>
            <div className="cm-modal-email">From: {message.name} &lt;{message.email}&gt;</div>
          </div>
          <button className="cm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cm-modal-body">
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <span className="cm-status-badge" style={{ background:sm.bg, color:sm.color }}>{sm.icon} {sm.label}</span>
            <span className="cm-date-chip">
              {message.createdAt ? new Date(message.createdAt).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" }) : "—"}
            </span>
          </div>
          <div className="cm-detail-message">{message.message}</div>
          {message.screenshot && (
            <a href={message.screenshot} target="_blank" rel="noreferrer" className="cm-proof-link">📎 View Screenshot</a>
          )}
          {message.adminReply && (
            <div className="cm-reply-preview">
              <div className="cm-reply-preview-label">Your reply</div>
              <div className="cm-reply-preview-text">{message.adminReply}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactMessages() {
  const toast = useToast();
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyTarget, setReplyTarget] = useState(null);
  const [detailMsg, setDetailMsg]     = useState(null);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/contact/admin");
      setMessages(Array.isArray(res.data) ? res.data : res.data.contacts || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/contact/admin/${id}`, { status });
      setMessages(ms => ms.map(m => m._id === id ? { ...m, status } : m));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    try {
      await API.delete(`/contact/admin/${id}`);
      toast.success("Message deleted");
      setMessages(ms => ms.filter(m => m._id !== id));
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const filtered = messages.filter(m => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      m.name?.toLowerCase().includes(s) ||
      m.email?.toLowerCase().includes(s) ||
      m.subject?.toLowerCase().includes(s) ||
      m.message?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total:   messages.length,
    new:     messages.filter(m => m.status === "new").length,
    read:    messages.filter(m => m.status === "read").length,
    replied: messages.filter(m => m.status === "replied").length,
  };

  return (
    <AdminLayout>
      <div className="admin-contacts">

        {/* Header */}
        <div className="cm-header">
          <div>
            <h1 className="cm-title">Contact Messages</h1>
            <p className="cm-sub">Manage and respond to customer enquiries</p>
          </div>
          <button className="cm-refresh-btn" onClick={fetchMessages}>↻ Refresh</button>
        </div>

        {/* Stats */}
        <div className="cm-stats-grid">
          {[
            { label:"Total",   value: counts.total,   icon:"📬", color:"#2563eb" },
            { label:"New",     value: counts.new,     icon:"🔵", color:"#f59e0b" },
            { label:"Read",    value: counts.read,    icon:"👁", color:"#0891b2" },
            { label:"Replied", value: counts.replied, icon:"✓",  color:"#16a34a" },
          ].map(s => (
            <div key={s.label} className="cm-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
              <div className="cm-stat-row">
                <span className="cm-stat-icon" style={{ background:`${s.color}18`, color:s.color }}>{s.icon}</span>
                <span className="cm-stat-value" style={{ color:s.color }}>{s.value}</span>
              </div>
              <div className="cm-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="cm-toolbar">
          <input
            className="cm-search"
            type="text"
            placeholder="🔍  Search name, email, subject…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="cm-filter-pills">
            {["all","new","read","replied"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`cm-pill ${statusFilter === s ? "active" : ""}`}
                style={statusFilter === s && s !== "all"
                  ? { background: STATUS_META[s]?.bg, color: STATUS_META[s]?.color, borderColor: STATUS_META[s]?.color }
                  : {}}
              >
                {s === "all" ? "All" : STATUS_META[s]?.label}
                {s !== "all" && (
                  <span className="cm-pill-count">{counts[s]}</span>
                )}
              </button>
            ))}
          </div>
          <span className="cm-count">{filtered.length} of {counts.total}</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="cm-loading-state">
            <div className="cm-spinner" /> Loading messages…
          </div>
        ) : filtered.length === 0 ? (
          <div className="cm-empty-state">
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>No messages found</div>
            <div style={{ fontSize:14, color:"#94a3b8", marginTop:4 }}>
              {search || statusFilter !== "all" ? "Try adjusting your filters" : "You're all caught up!"}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="cm-table-wrap">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(msg => {
                    const sm = STATUS_META[msg.status] || STATUS_META.new;
                    return (
                      <tr
                        key={msg._id}
                        className={`cm-row ${msg.status === "new" ? "cm-row-new" : ""}`}
                        onClick={() => { setDetailMsg(msg); updateStatus(msg._id, msg.status === "new" ? "read" : msg.status); }}
                        title="Click to view full message"
                      >
                        <td>
                          <div className="cm-sender-cell">
                            <div className="cm-avatar">{msg.name?.charAt(0).toUpperCase() || "?"}</div>
                            <div>
                              <div className="cm-sender-name">{msg.name}</div>
                              <div className="cm-sender-email">{msg.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="cm-subject-cell">{msg.subject || "—"}</td>
                        <td>
                          <div className="cm-msg-preview">{msg.message}</div>
                          {msg.screenshot && (
                            <a href={msg.screenshot} target="_blank" rel="noreferrer"
                              className="cm-proof-link-sm" onClick={e => e.stopPropagation()}>
                              📎 Screenshot
                            </a>
                          )}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <select
                            className="cm-status-select"
                            value={msg.status}
                            onChange={e => updateStatus(msg._id, e.target.value)}
                            style={{ background: sm.bg, color: sm.color }}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                        </td>
                        <td className="cm-date">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })
                            : "—"}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="cm-actions">
                            <button
                              className="cm-reply-btn"
                              onClick={() => setReplyTarget(msg)}
                              title="Reply"
                            >
                              ↩ Reply
                            </button>
                            <button
                              className="cm-delete-btn"
                              onClick={() => deleteMessage(msg._id)}
                              title="Delete"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="cm-cards">
              {filtered.map(msg => {
                const sm = STATUS_META[msg.status] || STATUS_META.new;
                return (
                  <div key={msg._id} className={`cm-card ${msg.status === "new" ? "cm-card-new" : ""}`}>
                    <div className="cm-card-top">
                      <div>
                        <div className="cm-sender-name">{msg.name}</div>
                        <div className="cm-sender-email">{msg.email}</div>
                      </div>
                      <span className="cm-status-badge" style={{ background:sm.bg, color:sm.color }}>{sm.label}</span>
                    </div>
                    <div className="cm-card-subject">{msg.subject}</div>
                    <div className="cm-card-text">{msg.message}</div>
                    <div className="cm-card-footer">
                      <button className="cm-reply-btn" onClick={() => setReplyTarget(msg)}>↩ Reply</button>
                      <button className="cm-delete-btn" onClick={() => deleteMessage(msg._id)}>🗑 Delete</button>
                      <span className="cm-date" style={{ marginLeft:"auto" }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Reply modal */}
      {replyTarget && (
        <ReplyModal
          message={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSent={fetchMessages}
        />
      )}

      {/* Detail modal */}
      {detailMsg && (
        <DetailModal message={detailMsg} onClose={() => setDetailMsg(null)} />
      )}
    </AdminLayout>
  );
}

export default ContactMessages;
