import mongoose from "mongoose";

const postsSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  post_id: { type: String, required: true },
  postBody: {
    text: { type: String, default: null },
    image: {
      type: [Object],
      default: null,
    },

    video: {
      type: Object,
      default: null,
    },
    event: { type: Object, default: null },
    poll: { type: Object, default: null },
  },

  commentsCount: { type: Number, default: 0 },

  interactions: {
    likes: {
      count: { type: Number, default: 0 },
      users: { type: Map, of: Boolean, default: () => new Map() },
    },
    saves: {
      count: { type: Number, default: 0 },
      users: { type: Map, of: Boolean, default: () => new Map() },
    },
    remeows: {
      count: { type: Number, default: 0 },
      users: { type: Map, of: Boolean, default: () => new Map() },
    },
  },

  engagementScore: { type: Number, default: 0 },

  isRemeow: { type: String, default: null },

  type: {
    type: String,
    enum: ["event", "poll", "regular"],
    default: "regular",
  },

  createdAt: { type: Date, default: Date.now },
});

postsSchema.index({ post_id: 1 }); // Index on post_id
postsSchema.index({ user_id: 1 }); // Index on user_id
postsSchema.index({ post_id: 1, user_id: 1 });
postsSchema.index({ post_id: 1, engagementScore: -1, createdAt: -1 });

// postsSchema.index({ "interactions.likes.users": 1 }); // Index on interactions.likes.users
// postsSchema.index({ "interactions.saves.users": 1 }); // Index on interactions.saves.users
// postsSchema.index({ "interactions.remeows.users": 1 }); // Index on interactions.remeows.users

export const Posts = mongoose.model("Posts", postsSchema);
