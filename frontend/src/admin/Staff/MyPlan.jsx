import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./MyPlan.css";

const SUB_META = {
  active:    { bg:"#dcfce7", color:"#16a34a", label:"Active",    icon:"✅" },
  trial:     { bg:"#dbeafe", color:"#1d4ed8", label:"Trial",     icon:"🎁" },
  overdue:   { bg:"#fff7ed", color:"#c2410c", label:"Overdue",   icon:"⚠️" },
  suspended: { bg:"#fee2e2", color:"#dc2626", label:"Suspended", icon:"🚫" },
  none:      { bg:"#f1f5f9", color:"#64748b", label:"No Plan",   icon:"📋" },
};

const RSVP_META = {
  pending:  { bg:"#fef9c3", color:"#a16207", label:"Pending"  },
  accepted: { bg:"#dcfce7", color:"#16a34a", label:"Accepted" },
  declined: { bg:"#fee2e2", color:"#dc2626", label:"Declined" },
  attended: { bg:"#dbeafe", color:"#1d4ed8", label:"Attended" },
};

export default function MyPlan() {
  const toast = useToast();
  const [planData,  setPlanData]  = useState(null);
  const [meetings,  setMeetings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => { fetchPlan(); fetchMeetings(); }, []);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await API.get("/seller-plans/me");
      setPlanData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load plan");
    } finally { setLoading(false); }
  };

  const fetchMeetings = async () => {
    try {
      const res = await API.get("/meetings/my");
      setMeetings(res.data.meetings || []);
    } catch {}
  };

  const respond = async (meetingId, status) => {
    setResponding(meetingId + status);
    try {
      await API.patch(`/meetings/${meetingId}/respond`, { status });
      toast.success(`RSVP: ${status}`);
      fetchMeetings();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setResponding(null); }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="mp-loading"><div className="mp-spinner" /> Loading your plan…</div>
      </AdminLayout>
    );
  }

  const plan      = planData?.plan;
  const user      = planData?.user;
  const sub       = user?.staffInfo?.subscriptionStatus || "none";
  const sm        = SUB_META[sub] || SUB_META.none;
  const used      = planData?.listingsThisMonth || 0;
  const limit     = plan?.productLimit || 0;
  const usePct    = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const expiresAt = user?.staffInfo?.planExpiresAt;
  const daysLeft  = expiresAt ? Math.ceil((new Date(expiresAt) - new Date()) / 86400000) : null;

  const upcomingMeetings = meetings.filter(m => m.status === "scheduled" && new Date(m.scheduledAt) >= new Date());
  const pastMeetings     = meetings.filter(m => m.status !== "scheduled" || new Date(m.scheduledAt) < new Date());

  return (
    <AdminLayout>
      <div className="mp-page">

        {/* Header */}
        <div className="mp-header">
          <div>
            <h1 className="mp-title">My Seller Plan</h1>
            <p className="mp-sub">Your subscription, listing usage, and scheduled meetings</p>
          </div>
        </div>

        {/* Plan hero card */}
        <div className="mp-plan-hero" style={{ borderLeft: `5px solid ${plan?.color || "#2563eb"}` }}>
          <div className="mp-plan-hero-left">
            <div className="mp-plan-icon-lg">{plan?.icon || "📋"}</div>
            <div>
              <div className="mp-plan-name">{plan?.name || "No Plan Assigned"}</div>
              <div className="mp-plan-desc">{plan?.description || "Contact your admin to get a plan assigned."}</div>
              <div style={{ marginTop:8 }}>
                <span className="mp-sub-badge" style={{ background:sm.bg, color:sm.color }}>
                  {sm.icon} {sm.label}
                </span>
              </div>
            </div>
          </div>
          {plan && (
            <div className="mp-plan-hero-right">
              <div className="mp-plan-price" style={{ color: plan.color || "#2563eb" }}>
                {plan.monthlyFee === 0 ? "Free" : `${Number(plan.monthlyFee).toLocaleString()} ETB`}
                <span className="mp-plan-cycle">/{plan.billingCycle?.replace("ly","")}</span>
              </div>
              {daysLeft !== null && (
                <div className={`mp-expiry ${daysLeft <= 7 ? "warn" : ""}`}>
                  {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining` : "Expired"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alert banners */}
        {sub === "overdue" && (
          <div className="mp-alert overdue">
            ⚠️ Your subscription payment is <strong>overdue</strong>. You cannot submit new products until your balance is settled. Please contact the admin.
          </div>
        )}
        {sub === "suspended" && (
          <div className="mp-alert suspended">
            🚫 Your seller account is <strong>suspended</strong>. Contact the admin to resolve this.
          </div>
        )}
        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="mp-alert expiring">
            ⏰ Your plan expires in <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""}</strong>. Contact admin to renew.
          </div>
        )}

        {/* Stats row */}
        {plan && (
          <div className="mp-stats-grid">
            <div className="mp-stat-card">
              <div className="mp-stat-icon" style={{ background:"#eff6ff", color:"#2563eb" }}>📦</div>
              <div className="mp-stat-body">
                <div className="mp-stat-label">Listings This Month</div>
                <div className="mp-stat-value">{used} <span style={{ fontSize:14, color:"#94a3b8", fontWeight:400 }}>/ {limit}</span></div>
                <div className="mp-usage-bar-wrap">
                  <div className="mp-usage-bar">
                    <div
                      className="mp-usage-fill"
                      style={{
                        width:`${usePct}%`,
                        background: usePct >= 90 ? "#dc2626" : usePct >= 70 ? "#f59e0b" : "#2563eb",
                      }}
                    />
                  </div>
                  <span className="mp-usage-pct">{Math.round(usePct)}%</span>
                </div>
              </div>
            </div>
            <div className="mp-stat-card">
              <div className="mp-stat-icon" style={{ background:"#dcfce7", color:"#16a34a" }}>💹</div>
              <div className="mp-stat-body">
                <div className="mp-stat-label">Commission Rate</div>
                <div className="mp-stat-value">{plan.commissionRate}%</div>
                <div className="mp-stat-sub">On every sale</div>
              </div>
            </div>
            {plan.minProductPrice > 0 && (
              <div className="mp-stat-card">
                <div className="mp-stat-icon" style={{ background:"#fef9c3", color:"#a16207" }}>💰</div>
                <div className="mp-stat-body">
                  <div className="mp-stat-label">Min Listing Price</div>
                  <div className="mp-stat-value">{Number(plan.minProductPrice).toLocaleString()} ETB</div>
                </div>
              </div>
            )}
            {plan.maxProductPrice > 0 && (
              <div className="mp-stat-card">
                <div className="mp-stat-icon" style={{ background:"#fff7ed", color:"#c2410c" }}>🏷️</div>
                <div className="mp-stat-body">
                  <div className="mp-stat-label">Max Listing Price</div>
                  <div className="mp-stat-value">{Number(plan.maxProductPrice).toLocaleString()} ETB</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {plan?.features?.length > 0 && (
          <div className="mp-features-card">
            <div className="mp-features-title">Plan Features</div>
            <div className="mp-features-grid">
              {plan.features.map((f, i) => (
                <div key={i} className="mp-feature-item">
                  <span className="mp-feature-check" style={{ color: plan.color || "#2563eb" }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming meetings */}
        <div className="mp-section">
          <div className="mp-section-header">
            <h2 className="mp-section-title">📅 Upcoming Meetings</h2>
            <span className="mp-section-count">{upcomingMeetings.length}</span>
          </div>

          {upcomingMeetings.length === 0 ? (
            <div className="mp-no-meetings">No upcoming meetings scheduled for you.</div>
          ) : (
            <div className="mp-meetings-list">
              {upcomingMeetings.map(m => {
                const rsvp    = m.myStatus || "pending";
                const rc      = RSVP_META[rsvp] || RSVP_META.pending;
                const isKey   = responding === m._id + "accepted" || responding === m._id + "declined";
                return (
                  <div key={m._id} className="mp-meeting-card">
                    <div className="mp-meeting-top">
                      <div className="mp-meeting-info">
                        <div className="mp-meeting-title">{m.title}</div>
                        <div className="mp-meeting-meta">
                          <span>📅 {new Date(m.scheduledAt).toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric" })}</span>
                          <span>🕐 {new Date(m.scheduledAt).toLocaleTimeString("en-US",{ hour:"2-digit", minute:"2-digit" })}</span>
                          <span>⏱ {m.durationMin} min</span>
                        </div>
                        {m.description && <p className="mp-meeting-desc">{m.description}</p>}
                        {m.meetingLink && (
                          <a href={m.meetingLink} target="_blank" rel="noreferrer" className="mp-join-btn">
                            🔗 Join Meeting
                          </a>
                        )}
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <span className="mp-rsvp-badge" style={{ background:rc.bg, color:rc.color }}>{rc.label}</span>
                      </div>
                    </div>
                    {rsvp === "pending" && (
                      <div className="mp-rsvp-actions">
                        <span style={{ fontSize:13, color:"#64748b", marginRight:10 }}>Will you attend?</span>
                        <button
                          className="mp-rsvp-btn accept"
                          disabled={isKey}
                          onClick={() => respond(m._id, "accepted")}
                        >
                          {responding === m._id+"accepted" ? "…" : "✓ Accept"}
                        </button>
                        <button
                          className="mp-rsvp-btn decline"
                          disabled={isKey}
                          onClick={() => respond(m._id, "declined")}
                        >
                          {responding === m._id+"declined" ? "…" : "✗ Decline"}
                        </button>
                      </div>
                    )}
                    {rsvp === "accepted" && (
                      <div className="mp-rsvp-actions">
                        <span style={{ fontSize:13, color:"#16a34a", fontWeight:600 }}>✓ You accepted this meeting</span>
                        <button className="mp-rsvp-btn decline" style={{ marginLeft:"auto" }} onClick={() => respond(m._id,"declined")}>Change to Decline</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past meetings */}
        {pastMeetings.length > 0 && (
          <div className="mp-section">
            <div className="mp-section-header">
              <h2 className="mp-section-title">📂 Past Meetings</h2>
              <span className="mp-section-count">{pastMeetings.length}</span>
            </div>
            <div className="mp-meetings-list">
              {pastMeetings.slice(0,5).map(m => {
                const rsvp = m.myStatus || "pending";
                const rc   = RSVP_META[rsvp] || RSVP_META.pending;
                return (
                  <div key={m._id} className="mp-meeting-card past">
                    <div className="mp-meeting-top">
                      <div className="mp-meeting-info">
                        <div className="mp-meeting-title">{m.title}</div>
                        <div className="mp-meeting-meta">
                          <span>📅 {new Date(m.scheduledAt).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" })}</span>
                          <span>⏱ {m.durationMin} min</span>
                        </div>
                      </div>
                      <span className="mp-rsvp-badge" style={{ background:rc.bg, color:rc.color }}>{rc.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
