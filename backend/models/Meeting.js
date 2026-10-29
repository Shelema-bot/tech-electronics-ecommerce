/**
 * Meeting — scheduled staff & seller meetings with full video conferencing support.
 * Features:
 * - In-app WebRTC video room & Jitsi integration
 * - Staff role and department targeting
 * - Live in-meeting text chat
 * - RSVP & attendance tracking
 */
import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type:        {
      type: String,
      enum: [
        "general", "training", "onboarding", "plan_review", "support",
        "all_sellers", "staff_sync", "department_sync", "emergency", "tech_review"
      ],
      default: "staff_sync",
    },

    // ── Scheduling ───────────────────────────────────────────
    scheduledAt: { type: Date, required: true },
    durationMin: { type: Number, default: 60 },
    location:    { type: String, default: "" },
    platform:    {
      type: String,
      enum: ["in_app_video", "jitsi", "video_room", "zoom", "google_meet", "teams", "phone", "in_person", "other"],
      default: "in_app_video",
    },
    meetingLink: { type: String, default: "" },
    roomId:      { type: String, default: "" },
    passcode:    { type: String, default: "" },

    // ── Participants & Audience Targeting ────────────────────
    organizer:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetAudience: {
      type: String,
      enum: ["all_staff", "all_sellers", "roles", "selected_individuals"],
      default: "all_staff",
    },
    targetRoles: [{ type: String }],
    targetAll:   { type: Boolean, default: false }, // legacy support for all sellers
    invitees: [
      {
        user:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status:   { type: String, enum: ["pending", "accepted", "declined", "attended"], default: "pending" },
        joinedAt: { type: Date },
        note:     { type: String, default: "" },
      },
    ],

    // ── In-Meeting Live Chat Messages ─────────────────────────
    messages: [
      {
        sender:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        senderName: { type: String, default: "Staff" },
        senderRole: { type: String, default: "Staff" },
        text:       { type: String, required: true },
        createdAt:  { type: Date, default: Date.now },
      },
    ],

    // ── Status ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    cancelReason: { type: String, default: "" },
    notes:        { type: String, default: "" },
  },
  { timestamps: true }
);

meetingSchema.index({ scheduledAt: 1 });
meetingSchema.index({ organizer: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ roomId: 1 });

export default mongoose.model("Meeting", meetingSchema);
