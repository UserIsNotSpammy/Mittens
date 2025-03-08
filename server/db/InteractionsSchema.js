import mongoose from "mongoose";

const InteractionSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  post_id: {
    type: String,
  },
  type: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});
InteractionSchema.index({ post_id: 1, user_id: 1 });
const Interactions = mongoose.model("Interactions", InteractionSchema);
export default Interactions;
