import { useEffect, useState } from "react";
import API from "../../api/axios";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./MyMessages.css";

const STATUS_META = {
  new:     { bg: "#fef9c3", color: "#a16207", label: "New",     icon: "🔵" },
  read:    { bg: "#dbeafe", color: "#1d4ed8", label: "Read",    icon: "👁" },
  replied: { bg: "#dcfce7", color: "#16a34a", label: "Replied", icon: "✓" },
};

function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get("/contact/my-messages")
      .then(res => setMessages(Array.isArray(res.data) ? res.data : res.data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = messages.filter(m => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      m.subject?.toLowerCase().includes(s) ||
      m.message?.toLowerCase().includes(s);
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:     messages.length,
    new:     messages.filter(m => m.status === "new").length,
    read:    messages.filter(m => m.status === "read").length,
    replied: messages.filter(m => m.status === "replied").length,
  };

  return (
    <AccountLayout>
      <div className="mm-page">

        {/* Header */}
        <div className="mm-header">
          <div>
            <h1>Message Center</h1>
            <p>Your contact messages and admin replies</p>
          </div>
          {counts.new > 0 && (
            <span className="mm-new-badge">{counts.new} new</span>
          )}
        </div>

        {/* Search + filter */}
        <div className="mm-toolbar">
          <input
            className="mm-search"
            type="text"
            placeholder="🔍  Search messages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="mm-pills">
            {["all", "new", "read", "replied"].map(s => (
              <button
                key={s}
                className={`mm-pill ${filter === s ? "active" : ""}`}
                onClick={() => setFilter(s)}
                style={filter === s && s !== "all"
                  ? { background: STATUS_META[s]?.bg, color: STATUS_META[s]?.color, borderColor: STATUS_META[s]?.color }
                  : {}}
              >
                {s === "all" ? "All" : STATUS_META[s]?.label}
                <span className="mm-pill-count">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mm-loading">
            <div className="mm-spinner" /> Loading messages…
          </div>
        ) : filtered.length === 0 ? (
          <div className="mm-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <h3>{search || filter !== "all" ? "No matching messages" : "No messages yet"}</h3>
            <p>
              {search || filter !== "all"
                ? "Try adjusting your search or filter"
                : "Send us a message via the Contact page and your conversation history will appear here."}
            </p>
          </div>
        ) : (
          <div className="mm-list">
            {filtered.map(msg => {
              const sm = STATUS_META[msg.status] || STATUS_META.new;
              const isOpen = expanded === msg._id;
              return (
                <div
                  key={msg._id}
                  className={`mm-card ${msg.status === "new" ? "mm-card-new" : ""} ${isOpen ? "mm-card-open" : ""}`}
                >
                  {/* Card header — always visible */}
                  <div className="mm-card-header" onClick={() => setExpanded(isOpen ? null : msg._id)}>
                    <div className="mm-card-header-left">
                      <span className="mm-card-status" style={{ background: sm.bg, color: sm.color }}>
                        {sm.icon} {sm.label}
                      </span>
                      <span className="mm-card-subject">{msg.subject || "No Subject"}</span>
                    </div>
                    <div className="mm-card-header-right">
                      {msg.reply && (
                        <span className="mm-has-reply-tag">Admin replied</span>
                      )}
                      <span className="mm-card-date">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : ""}
                      </span>
                      <span className={`mm-chevron ${isOpen ? "open" : ""}`}>›</span>
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isOpen && (
                    <div className="mm-card-body">
                      <div className="mm-message-bubble">
                        <div className="mm-bubble-label">You wrote</div>
                        <p className="mm-bubble-text">{msg.message}</p>
                        {msg.screenshot && (
                          <a href={msg.screenshot} target="_blank" rel="noreferrer" className="mm-screenshot-link">
                            📎 View Screenshot
                          </a>
                        )}
                      </div>

                      {msg.reply ? (
                        <div className="mm-reply-bubble">
                          <div className="mm-reply-label">✓ Admin replied</div>
                          <p className="mm-reply-text">{msg.reply}</p>
                        </div>
                      ) : (
                        <div className="mm-pending-note">
                          ⏳ Awaiting admin reply…
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AccountLayout>
  );
}

export default MyMessages;
