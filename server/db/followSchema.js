import mongoose, { Schema } from "mongoose";
const followSchema = new Schema({
  initiator: { type: String },
  recipient: { type: String },
  followedAt: { type: Date, default: Date.now },
});
followSchema.index({ initiator: 1, recipient: 1 });
const Followers = mongoose.model("followers", followSchema);

export default Followers;
