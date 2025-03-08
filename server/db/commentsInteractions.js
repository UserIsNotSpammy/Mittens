import mongoose from "mongoose";

const commentsInteractionSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  post_id: {
    type: String,
  },
  comment_id: {
    type: String,
  },
  type: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const CommentsInteraction = mongoose.model(
  "commentsInteraction",
  commentsInteractionSchema
);
export default CommentsInteraction;
