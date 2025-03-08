import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  isSeen: { type: Boolean, default: false },
  messageBody: {
    text: { type: String, default: null },
    image: {
      type: [Object],
      default: null,
    },

    video: {
      type: Object,
      default: null,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

messagesSchema.index({ sender: 1, recipient: 1 });

messagesSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
const Messages = mongoose.model("Messages", messagesSchema);
export default Messages;
