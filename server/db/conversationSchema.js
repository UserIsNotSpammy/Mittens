import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [String],
    required: true,
  },
  lastMessage: {
    text: String,
    sender: { type: String },
    createdAt: Date,
  },
});

// Create an index on the participants field
conversationSchema.index({ participants: 1, "lastMessage.createdAt": -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
