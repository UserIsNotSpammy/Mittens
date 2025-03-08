import mongoose from "mongoose";

const pawprintsSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  user_tag: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["purr", "remeow", "scratch", "post"],
  },
  target: {
    type: {
      type: String,
      required: true,
      enum: ["post", "comment"],
    },
    post: {},
    comment: {
      type: String,
      default: null,
    },
  },

  createdAt: { type: Date, default: Date.now },
});

const Pawprints = mongoose.model("Pawprints", pawprintsSchema);
export default Pawprints;
