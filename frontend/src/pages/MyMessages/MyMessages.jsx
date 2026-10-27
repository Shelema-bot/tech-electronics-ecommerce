import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../../api/axios";
import AccountLayout from "../../components/AccountLayout/AccountLayout";
import "./MyMessages.css";

function MyMessages() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [expanded, setExpanded] = useState(null);

  const STATUS_META = {
    new:     { bg: "#fef9c3", color: "#a16207", label: t("messages.statusNew", "New"),         icon: "🔵" },
    read:    { bg: "#dbeafe", color: "#1d4ed8", label: t("messages.statusRead", "Read"),       icon: "👁" },
    replied: { bg: "#dcfce7", color: "#16a34a", label: t("messages.statusReplied", "Replied"), icon: "✓" },
  };

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
            <h1>{t("account.messageCenter", "Message Center")}</h1>
            <p>{t("messages.subTitle", "Your contact messages and admin replies")}</p>
          </div>
          {counts.new > 0 && (
            <span className="mm-new-badge">{t("messages.newBadge", "{{count}} new", { count: counts.new })}</span>
          )}
        </div>

        {/* Search + filter */}
        <div className="mm-toolbar">
          <input
            className="mm-search"
            type="text"
            placeholder={t("messages.searchPlaceholder", "🔍  Search messages…")}
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
                {s === "all" ? t("common.all", "All") : STATUS_META[s]?.label}
                <span className="mm-pill-count">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mm-loading">
            <div className="mm-spinner" /> {t("common.loading", "Loading messages…")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mm-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <h3>{search || filter !== "all" ? t("messages.noMatching", "No matching messages") : t("messages.noMessages", "No messages yet")}</h3>
            <p>
              {search || filter !== "all"
                ? t("messages.noMatchingDesc", "Try adjusting your search or filter")
                : t("messages.noMessagesDesc", "Send us a message via the Contact page and your conversation history will appear here.")}
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
                  {/* Card header — always visible (Click to expand/collapse) */}
                  <div className="mm-card-header" onClick={() => setExpanded(isOpen ? null : msg._id)}>
                    <div className="mm-card-header-left">
                      <span className="mm-card-status" style={{ background: sm.bg, color: sm.color }}>
                        {sm.icon} {sm.label}
                      </span>
                      <span className="mm-card-subject">{msg.subject || t("messages.noSubject", "No Subject")}</span>
                    </div>
                    <div className="mm-card-header-right">
                      {msg.reply && (
                        <span className="mm-has-reply-tag">{t("messages.adminReplied", "Admin replied")}</span>
                      )}
                      <span className="mm-card-date">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : ""}
                      </span>
                      <span className={`mm-chevron ${isOpen ? "open" : ""}`}>›</span>
                    </div>
                  </div>

                  {/* Expanded body (collapsible) */}
                  {isOpen && (
                    <div className="mm-card-body">
                      <div className="mm-message-bubble">
                        <div className="mm-bubble-label">{t("messages.youWrote", "You wrote")}</div>
                        <p className="mm-bubble-text">{msg.message}</p>
                        {msg.screenshot && (
                          <a href={msg.screenshot} target="_blank" rel="noreferrer" className="mm-screenshot-link">
                            {t("messages.viewScreenshot", "📎 View Screenshot")}
                          </a>
                        )}
                      </div>

                      {msg.reply && (
                        <div className="mm-message-bubble mm-reply-bubble">
                          <div className="mm-bubble-label admin-label">
                            🛡️ {t("messages.adminReplied", "Admin replied")}
                            {msg.repliedAt && (
                              <span className="mm-reply-date">
                                {new Date(msg.repliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            )}
                          </div>
                          <p className="mm-bubble-text">{msg.reply}</p>
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
