import { Router } from "express";
import { __temp, __uploads } from "../config.js";
import { upload } from "../multer.js";
import { ProcessImageUploads } from "../utils/processFIles.js";
import { ProcessVideoUploads } from "../utils/processFIles.js";
import {
  CreateComment,
  LoadComments,
  handleInteraction,
  DeleteComment,
} from "../controllers/CommentController.js";
const comments = Router({ mergeParams: true });

comments.post(
  "/uploadAttachments/image",
  upload.single("file"),
  ProcessImageUploads
);

comments.post(
  "/uploadAttachments/video",
  upload.single("file"),
  ProcessVideoUploads
);
comments.post("/createComment", CreateComment);

comments.post("/loadComments", LoadComments);

comments.delete("/:comment_id/delete", DeleteComment);

comments.post("/:comment_id/like", async (req, res) =>
  handleInteraction(req, res, "like")
);
export default comments;
