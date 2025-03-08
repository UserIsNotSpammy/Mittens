import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  post_id: {
    type: String,
  },
  comment_id: {
    type: String,
  },
  commentBody: {
    text: {
      type: String,
      default: null,
    },
    image: {
      type: [Object],
      default: null,
    },

    video: {
      type: Object,
      default: null,
    },
  },

  interactions: {
    likes: { type: [String], default: [] },
  },
  createdAt: { type: Date, default: Date.now },
});
export const Comments = mongoose.model("Comments", commentsSchema);
