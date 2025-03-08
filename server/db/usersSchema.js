import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  userTag: { type: String, required: true, unique: true },
  folder: { type: String, default: null },
  pfp: { type: String, default: null },
  cover: { type: String, default: null },

  password: { type: String, required: true },

  generalInfo: {
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    dateOfBirth: { type: Date },
    livesIn: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    bio: { type: String, trim: true, default: "You've got to be kitten me!" },
  },

  postsCount: { type: Number, default: 0 },

  engagements: {
    type: Map,
    of: new mongoose.Schema(
      {
        interactionCount: { type: Number, default: 0 },
        lastInteraction: { type: Date, default: null },
      },
      { _id: false }
    ),
    default: {},
  },

  meowments: { type: [Object], default: [] },
  followers: {
    count: { type: Number, default: 0 },
    users: {
      type: Map,
      default: {},
    },
  },

  following: {
    count: { type: Number, default: 0 },
    users: {
      type: Map,
      of: new mongoose.Schema(
        {
          followedAt: { type: Date, default: Date.now },
          isFollowingBack: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  notificationSettings: {
    purrsOnPosts: { type: Boolean, default: true },
    savesOnPosts: { type: Boolean, default: true },
    scratchesOnPosts: { type: Boolean, default: true },
    remeowsOnPosts: { type: Boolean, default: true },
    purrsOnComments: { type: Boolean, default: true },
    repliesOnComments: { type: Boolean, default: true },
    followsYou: { type: Boolean, default: true },
  },
});

// usersSchema.index({ user_id: 1 });
// usersSchema.index({ userTag: 1 });
// usersSchema.index({ "followers.users": 1 }); // Index on followers.users
// usersSchema.index({ "following.users": 1 }); // Index on following.users
// usersSchema.index({ "engagements": 1 }); // Index on engagements
const Users = mongoose.model("Users", usersSchema);
export default Users;
