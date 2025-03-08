import { Router } from "express";
import { upload } from "../multer.js";
import {
  LoadChats,
  LoadMessages,
  CreateMessage,
} from "../controllers/ChatsController.js";
import {
  ProcessImageUploads,
  ProcessVideoUploads,
} from "../utils/processFIles.js";

import { __temp, __uploads } from "../config.js";

const chats = Router();

chats.post("/", LoadChats);

chats.post("/messages/LoadMessages/:userTag", LoadMessages);

chats.post("/messages/:userTag", CreateMessage);

chats.post(
  "/messages/uploadAttachemnts/image",
  upload.single("file"),
  ProcessImageUploads
);

chats.post(
  "/messages/uploadAttachemnts/video",
  upload.single("file"),
  ProcessVideoUploads
);

// chats.post("/messages/:userTag/markAsSeen", MarkMessageAsSeen);
export default chats;
