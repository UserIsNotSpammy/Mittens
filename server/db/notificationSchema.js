import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    required: true,
    target: {
      type: String,
      enum: ["post", "comment", "user"],
      required: true,
    },
    action: {
      type: String,
      enum: ["follow", "like", "comment", "reply"],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
  },
  isSeen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ recipient: 1 });
const Notifications = mongoose.model("Notification", notificationSchema);

export default Notifications;
