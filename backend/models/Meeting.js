/**
 * Meeting — scheduled meetings between owner/admin and sellers.
 * Owner schedules; sellers see and can accept/decline.
 */
import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type:        {
      type: String,
      enum: ["general","training","onboarding","plan_review","support","all_sellers"],
      default: "general",
    },

    // ── Scheduling ───────────────────────────────────────────
    scheduledAt: { type: Date, required: true },
    durationMin: { type: Number, default: 60 },                 // meeting duration in minutes
    location:    { type: String, default: "" },                 // physical or virtual link
    platform:    {
      type: String,
      enum: ["zoom","google_meet","teams","phone","in_person","other"],
      default: "other",
    },
    meetingLink: { type: String, default: "" },                 // video call URL if virtual

    // ── Participants ─────────────────────────────────────────
    organizer:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // If targetAll=true every verified seller is invited; otherwise use invitees array
    targetAll:   { type: Boolean, default: false },
    invitees: [
      {
        user:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending","accepted","declined","attended"], default: "pending" },
        note:   { type: String, default: "" },
      },
    ],

    // ── Status ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ["scheduled","ongoing","completed","cancelled"],
      default: "scheduled",
    },
    cancelReason: { type: String, default: "" },
    notes:        { type: String, default: "" },                // post-meeting notes
  },
  { timestamps: true }
);

meetingSchema.index({ scheduledAt: 1 });
meetingSchema.index({ organizer: 1 });
meetingSchema.index({ status: 1 });

export default mongoose.model("Meeting", meetingSchema);
