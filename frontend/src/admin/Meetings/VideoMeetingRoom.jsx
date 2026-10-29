import React, { useState, useEffect, useRef } from "react";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./VideoMeetingRoom.css";

export default function VideoMeetingRoom({ meeting, onClose, currentUser }) {
  const toast = useToast();

  // Video & Audio Stream States
  const [localStream, setLocalStream]         = useState(null);
  const [screenStream, setScreenStream]       = useState(null);
  const [isVideoOn, setIsVideoOn]             = useState(true);
  const [isAudioOn, setIsAudioOn]             = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [mediaError, setMediaError]           = useState(null);

  // Video Mode: "native" (In-app WebRTC Video Hub) vs "jitsi" (Multi-Peer Cloud Grid)
  const defaultMode = meeting?.platform === "jitsi" ? "jitsi" : "native";
  const [videoMode, setVideoMode] = useState(defaultMode);

  // Chat & Sidebar States
  const [activeSidebar, setActiveSidebar] = useState("chat"); // "chat", "participants", or null
  const [messages, setMessages]           = useState(meeting?.messages || []);
  const [newMsg, setNewMsg]               = useState("");
  const [sendingMsg, setSendingMsg]       = useState(false);

  // Attendees list & timer
  const [participants, setParticipants] = useState(meeting?.invitees || []);
  const [elapsedSec, setElapsedSec]     = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const localVideoRef  = useRef(null);
  const screenVideoRef = useRef(null);
  const chatBottomRef  = useRef(null);
  const roomWrapperRef = useRef(null);
  const streamRef      = useRef(null);
  const screenRef      = useRef(null);

  const roomName = `TechStaff-${meeting?.roomId || meeting?._id || "room"}`;
  const displayName = currentUser?.name || "Staff Member";
  const userRole = currentUser?.role || "Staff";

  // ── 1. Initialize Media Stream ────────────────────────────────────
  useEffect(() => {
    let active = true;

    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Media devices error:", err.message);
        setMediaError(
          "Camera or microphone not accessible. You can still join with audio/view mode or Multi-Peer Cloud Grid."
        );
      }
    }

    startMedia();

    // Call join endpoint to record attendance
    if (meeting?._id) {
      API.patch(`/meetings/${meeting._id}/join`).catch((e) =>
        console.log("Join record err:", e.message)
      );
    }

    // Timer
    const timerInterval = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);

    return () => {
      active = false;
      clearInterval(timerInterval);

      // Clean up media streams on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenRef.current) {
        screenRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [meeting?._id]);

  // Bind local video element whenever stream or mode changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, videoMode, isSharingScreen]);

  // ── 2. Poll Chat Messages ─────────────────────────────────────────
  useEffect(() => {
    if (!meeting?._id) return;

    const fetchMsgs = async () => {
      try {
        const res = await API.get(`/meetings/${meeting._id}/messages`);
        if (res.data.messages) {
          setMessages(res.data.messages);
        }
      } catch (e) {
        // silent
      }
    };

    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3500);
    return () => clearInterval(interval);
  }, [meeting?._id]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSidebar]);

  // ── 3. Toggle Camera ──────────────────────────────────────────────
  const toggleCamera = () => {
    if (localStream) {
      const vTrack = localStream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setIsVideoOn(vTrack.enabled);
        toast.info(vTrack.enabled ? "📹 Camera Turned ON" : "📷 Camera Turned OFF");
      }
    } else {
      toast.warning("Camera stream is not available.");
    }
  };

  // ── 4. Toggle Microphone ──────────────────────────────────────────
  const toggleAudio = () => {
    if (localStream) {
      const aTrack = localStream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setIsAudioOn(aTrack.enabled);
        toast.info(aTrack.enabled ? "🎤 Microphone Unmuted" : "🔇 Microphone Muted");
      }
    } else {
      toast.warning("Microphone stream is not available.");
    }
  };

  // ── 5. Toggle Screen Sharing ──────────────────────────────────────
  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      if (screenRef.current) {
        screenRef.current.getTracks().forEach((t) => t.stop());
        screenRef.current = null;
      }
      setScreenStream(null);
      setIsSharingScreen(false);
      toast.info("🖥️ Screen sharing stopped.");
    } else {
      try {
        const scStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenRef.current = scStream;
        setScreenStream(scStream);
        setIsSharingScreen(true);
        toast.success("🖥️ Screen sharing active!");

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = scStream;
        }

        // When user clicks browser's native "Stop Sharing" button
        scStream.getVideoTracks()[0].onended = () => {
          setIsSharingScreen(false);
          setScreenStream(null);
          screenRef.current = null;
          toast.info("🖥️ Screen sharing ended.");
        };
      } catch (err) {
        console.warn("Screen share cancelled:", err.message);
      }
    }
  };

  // ── 6. Send In-Meeting Chat Message ────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || sendingMsg) return;

    try {
      setSendingMsg(true);
      const res = await API.post(`/meetings/${meeting._id}/messages`, {
        text: newMsg.trim(),
      });
      if (res.data.messages) {
        setMessages(res.data.messages);
      }
      setNewMsg("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  // ── 7. Toggle Fullscreen ──────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      roomWrapperRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ── 8. Copy Room Invite Link ──────────────────────────────────────
  const copyMeetingLink = () => {
    const link = `${window.location.origin}/admin/meetings?room=${meeting.roomId || meeting._id}`;
    navigator.clipboard.writeText(link);
    toast.success("📋 Meeting link copied to clipboard!");
  };

  // Format Elapsed Time
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Clean Leave
  const handleLeave = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (screenRef.current) {
      screenRef.current.getTracks().forEach((t) => t.stop());
    }
    onClose();
  };

  return (
    <div className="vm-overlay" ref={roomWrapperRef}>
      <div className="vm-container">
        {/* ── Top Header Bar ── */}
        <header className="vm-header">
          <div className="vm-header-left">
            <div className="vm-status-pulse" />
            <div>
              <h2 className="vm-title">{meeting.title || "Staff Video Meeting"}</h2>
              <div className="vm-meta">
                <span className="vm-room-tag">Room: {meeting.roomId || "LIVE"}</span>
                <span className="vm-timer">⏱ {formatTimer(elapsedSec)}</span>
                <span className="vm-audience-badge">
                  {meeting.targetAudience === "all_staff"
                    ? "🏢 All Staff"
                    : meeting.targetAudience === "roles"
                    ? `👥 ${(meeting.targetRoles || []).join(", ")}`
                    : "🔒 Private Session"}
                </span>
              </div>
            </div>
          </div>

          <div className="vm-header-right">
            {/* Mode Switcher */}
            <div className="vm-mode-switch">
              <button
                type="button"
                className={`vm-mode-btn ${videoMode === "native" ? "active" : ""}`}
                onClick={() => setVideoMode("native")}
                title="Switch to Native High-Performance Video Hub"
              >
                💻 Native Hub
              </button>
              <button
                type="button"
                className={`vm-mode-btn ${videoMode === "jitsi" ? "active" : ""}`}
                onClick={() => setVideoMode("jitsi")}
                title="Switch to Multi-Device Cloud Mesh Grid"
              >
                🌐 Multi-Peer Cloud Grid
              </button>
            </div>

            <button
              type="button"
              className="vm-icon-btn"
              onClick={copyMeetingLink}
              title="Copy Meeting Invite Link"
            >
              🔗 Copy Link
            </button>

            <button
              type="button"
              className="vm-icon-btn"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? "↙ Exit Fullscreen" : "⛶ Fullscreen"}
            </button>

            <button
              type="button"
              className="vm-leave-btn"
              onClick={handleLeave}
              title="Leave / End Meeting"
            >
              ✕ Leave Call
            </button>
          </div>
        </header>

        {/* ── Main Stage Area ── */}
        <div className="vm-stage-wrapper">
          <div className="vm-video-stage">
            {/* Mode A: Native WebRTC Stage */}
            {videoMode === "native" ? (
              <div className="vm-native-grid">
                {/* Screen Share Tile (if sharing) */}
                {isSharingScreen && (
                  <div className="vm-tile vm-screen-tile">
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      playsInline
                      className="vm-video-element"
                    />
                    <div className="vm-tile-overlay">
                      <span className="vm-tile-name">🖥️ Screen Share (You)</span>
                    </div>
                  </div>
                )}

                {/* Local Camera Tile */}
                <div
                  className={`vm-tile vm-local-tile ${
                    isSharingScreen ? "vm-pip-tile" : ""
                  }`}
                >
                  {isVideoOn && localStream ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="vm-video-element"
                    />
                  ) : (
                    <div className="vm-avatar-fallback">
                      <div className="vm-avatar-circle">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="vm-avatar-name">{displayName}</span>
                      <span className="vm-avatar-sub">Camera Off</span>
                    </div>
                  )}

                  <div className="vm-tile-overlay">
                    <span className="vm-tile-name">
                      {displayName} (You) &bull; {userRole}
                    </span>
                    <span className="vm-tile-mic-status">
                      {isAudioOn ? "🎤" : "🔇"}
                    </span>
                  </div>
                </div>

                {/* Remote Participant Placeholder Tiles */}
                {participants.length > 0 ? (
                  participants
                    .filter((p) => String(p.user?._id) !== String(currentUser?._id))
                    .slice(0, 3)
                    .map((p, idx) => (
                      <div key={p.user?._id || idx} className="vm-tile vm-remote-tile">
                        <div className="vm-avatar-fallback">
                          <div
                            className="vm-avatar-circle"
                            style={{
                              background: [
                                "#0891b2",
                                "#7c3aed",
                                "#059669",
                                "#d97706",
                              ][idx % 4],
                            }}
                          >
                            {(p.user?.name || "Staff").charAt(0).toUpperCase()}
                          </div>
                          <span className="vm-avatar-name">
                            {p.user?.name || "Staff Colleague"}
                          </span>
                          <span className="vm-avatar-sub">
                            {p.status === "attended"
                              ? "🟢 In Call"
                              : "⏳ Invited"}
                          </span>
                        </div>
                        <div className="vm-tile-overlay">
                          <span className="vm-tile-name">
                            {p.user?.name || "Colleague"} &bull;{" "}
                            {p.user?.role || "Staff"}
                          </span>
                          <span className="vm-tile-mic-status">
                            {p.status === "attended" ? "🎤" : "—"}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="vm-tile vm-remote-tile vm-waiting-tile">
                    <div className="vm-avatar-fallback">
                      <div className="vm-waiting-icon">👥</div>
                      <span className="vm-avatar-name">Waiting for colleagues…</span>
                      <span className="vm-avatar-sub">
                        Share the room link or notify invited staff members
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Mode B: Multi-Device Cloud Jitsi Grid */
              <div className="vm-jitsi-wrapper">
                <iframe
                  title="Staff Video Conference Room"
                  src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(
                    displayName
                  )}`}
                  allow="camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; autoplay"
                  className="vm-jitsi-frame"
                />
              </div>
            )}

            {mediaError && (
              <div className="vm-media-warning">
                <span>⚠️ {mediaError}</span>
              </div>
            )}

            {/* ── Floating Meeting Control Bar ── */}
            <div className="vm-control-bar">
              <button
                type="button"
                className={`vm-ctrl-btn ${!isAudioOn ? "muted" : ""}`}
                onClick={toggleAudio}
                title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                <span className="vm-ctrl-icon">{isAudioOn ? "🎤" : "🔇"}</span>
                <span className="vm-ctrl-label">{isAudioOn ? "Mute" : "Unmuted"}</span>
              </button>

              <button
                type="button"
                className={`vm-ctrl-btn ${!isVideoOn ? "off" : ""}`}
                onClick={toggleCamera}
                title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                <span className="vm-ctrl-icon">{isVideoOn ? "📹" : "📷"}</span>
                <span className="vm-ctrl-label">{isVideoOn ? "Stop Cam" : "Start Cam"}</span>
              </button>

              <button
                type="button"
                className={`vm-ctrl-btn ${isSharingScreen ? "active-share" : ""}`}
                onClick={toggleScreenShare}
                title={isSharingScreen ? "Stop Screen Share" : "Share Your Screen"}
              >
                <span className="vm-ctrl-icon">🖥️</span>
                <span className="vm-ctrl-label">
                  {isSharingScreen ? "Stop Share" : "Share Screen"}
                </span>
              </button>

              <div className="vm-ctrl-divider" />

              <button
                type="button"
                className={`vm-ctrl-btn ${activeSidebar === "chat" ? "active" : ""}`}
                onClick={() =>
                  setActiveSidebar((curr) => (curr === "chat" ? null : "chat"))
                }
                title="In-Meeting Chat"
              >
                <span className="vm-ctrl-icon">💬</span>
                <span className="vm-ctrl-label">Chat ({messages.length})</span>
              </button>

              <button
                type="button"
                className={`vm-ctrl-btn ${
                  activeSidebar === "participants" ? "active" : ""
                }`}
                onClick={() =>
                  setActiveSidebar((curr) =>
                    curr === "participants" ? null : "participants"
                  )
                }
                title="Participant Directory"
              >
                <span className="vm-ctrl-icon">👥</span>
                <span className="vm-ctrl-label">
                  People ({participants.length + 1})
                </span>
              </button>

              <div className="vm-ctrl-divider" />

              <button
                type="button"
                className="vm-ctrl-btn vm-ctrl-end"
                onClick={handleLeave}
                title="End Video Call"
              >
                <span className="vm-ctrl-icon">📞</span>
                <span className="vm-ctrl-label">Leave Room</span>
              </button>
            </div>
          </div>

          {/* ── Right Collapsible Sidebar (Chat & Participants) ── */}
          {activeSidebar && (
            <aside className="vm-sidebar">
              <div className="vm-sidebar-tabs">
                <button
                  type="button"
                  className={`vm-tab-btn ${activeSidebar === "chat" ? "active" : ""}`}
                  onClick={() => setActiveSidebar("chat")}
                >
                  💬 In-Call Chat
                </button>
                <button
                  type="button"
                  className={`vm-tab-btn ${
                    activeSidebar === "participants" ? "active" : ""
                  }`}
                  onClick={() => setActiveSidebar("participants")}
                >
                  👥 Attendees ({participants.length + 1})
                </button>
                <button
                  type="button"
                  className="vm-sidebar-close"
                  onClick={() => setActiveSidebar(null)}
                >
                  ✕
                </button>
              </div>

              {/* Chat View */}
              {activeSidebar === "chat" && (
                <div className="vm-chat-pane">
                  <div className="vm-chat-messages">
                    {messages.length === 0 ? (
                      <div className="vm-chat-empty">
                        <span>💬 No messages yet. Say hello to your team!</span>
                      </div>
                    ) : (
                      messages.map((m, i) => {
                        const isMe =
                          String(m.sender?._id || m.sender) ===
                          String(currentUser?._id);
                        return (
                          <div
                            key={m._id || i}
                            className={`vm-msg-item ${isMe ? "me" : "remote"}`}
                          >
                            <div className="vm-msg-header">
                              <span className="vm-msg-sender">
                                {m.senderName || "Colleague"}
                              </span>
                              <span className="vm-msg-role">
                                {m.senderRole || "Staff"}
                              </span>
                              <span className="vm-msg-time">
                                {m.createdAt
                                  ? new Date(m.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                            <div className="vm-msg-bubble">{m.text}</div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <form className="vm-chat-input-form" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      className="vm-chat-input"
                      placeholder="Type message to meeting participants…"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!newMsg.trim() || sendingMsg}
                      className="vm-chat-send-btn"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* Attendees View */}
              {activeSidebar === "participants" && (
                <div className="vm-roster-pane">
                  <div className="vm-roster-list">
                    {/* Self */}
                    <div className="vm-roster-item active-user">
                      <div className="vm-roster-avatar">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="vm-roster-info">
                        <div className="vm-roster-name">
                          {displayName} <span className="vm-you-pill">(You)</span>
                        </div>
                        <div className="vm-roster-sub">
                          Role: {userRole} &bull; 🟢 In Call
                        </div>
                      </div>
                    </div>

                    {/* Invitees */}
                    {participants.map((inv, idx) => (
                      <div key={inv._id || idx} className="vm-roster-item">
                        <div
                          className="vm-roster-avatar"
                          style={{
                            background: [
                              "#0891b2",
                              "#7c3aed",
                              "#059669",
                              "#d97706",
                            ][idx % 4],
                          }}
                        >
                          {(inv.user?.name || "S").charAt(0).toUpperCase()}
                        </div>
                        <div className="vm-roster-info">
                          <div className="vm-roster-name">
                            {inv.user?.name || "Staff Member"}
                          </div>
                          <div className="vm-roster-sub">
                            {inv.user?.email || "staff@shop.com"}
                          </div>
                        </div>
                        <span
                          className={`vm-roster-status ${
                            inv.status === "attended" ? "online" : "pending"
                          }`}
                        >
                          {inv.status === "attended" ? "Joined" : inv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
