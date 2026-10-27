import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:   { type: String, default: "Notification" },
    message: { type: String, required: true },
    type:    {
      type: String,
      default: "order",
    },
    isRead:  { type: Boolean, default: false },
    read:    { type: Boolean, default: false },
    link:    { type: String, default: "" },  // e.g. "/my-orders"
    icon:    { type: String, default: "🔔" },
  },
  { timestamps: true }
);

notificationSchema.pre("save", function (next) {
  if (this.read !== undefined && this.isRead === undefined) this.isRead = this.read;
  if (this.isRead !== undefined && this.read === undefined) this.read = this.isRead;
  if (!this.title && this.message) {
    this.title = this.message.slice(0, 40);
  }
  next();
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
