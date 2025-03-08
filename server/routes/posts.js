import { Router } from "express";
import { upload } from "../multer.js";
import { validatePost, validateRemeow } from "../middlewares/validators.js";
import {
  DeletePost,
  CreatePost,
  RemeowPost,
  PollVote,
  LoadVirals,
  LoadPost,
  LoadPosts,
  handleInteraction,
  searchPosts,
} from "../controllers/PostsController.js";
import { checkLogin } from "../middlewares/checkLogin.js";

import {
  ProcessImageUploads,
  ProcessVideoUploads,
} from "../utils/processFIles.js";
// import LoadPosts from "../test.js";
const posts = Router();

// posts.use(checkLogin);
posts.post(
  "/uploadAttachments/image",
  upload.single("file"),
  ProcessImageUploads
);

posts.post(
  "/uploadAttachments/video",
  upload.single("file"),
  ProcessVideoUploads
);

posts.delete("/:id/deletePost", DeletePost);

posts.post("/createPost", validatePost, CreatePost);

posts.post("/:id/like", (req, res) => handleInteraction(req, res, "like"));

posts.post("/:id/save", (req, res) => handleInteraction(req, res, "save"));

posts.post("/:id/remeow", validateRemeow, RemeowPost);

posts.post("/:id/poll/vote", PollVote);

posts.post("/loadPosts", LoadPosts);

posts.get("/:id", LoadPost);

posts.post("/getVirals", LoadVirals);

// posts.delete("/attachments/discard", DiscardAttachment);

posts.post("/search/post", searchPosts);
export default posts;
