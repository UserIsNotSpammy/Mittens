import { Router } from "express";
import { upload } from "../multer.js";

import {
  UpdateProfilePicture,
  UpdateCoverPhoto,
  LoadUser,
  LoadUsers,
  FollowUser,
  UnFollowUser,
  LoadFollowingList,
  LoadFollowersList,
  LoadNotifications,
  UpdateNotificationSettings,
  UpdateMeowMents,
  UpdatePassword,
  UpdateGeneralInfo,
  UpdateBio,
} from "../controllers/UsersController.js";
const users = Router();
users.post(
  "/updateProfilePicture",
  upload.single("file"),
  UpdateProfilePicture
);

users.post("/updateCoverPicture", upload.single("file"), UpdateCoverPhoto);

users.post("/:userTag", LoadUser);

users.post("/notifications", LoadNotifications);

users.post("/", LoadUsers);

users.post("/:userTag/follow", FollowUser);

users.post("/:userTag/unFollow", UnFollowUser);

users.post("/:userTag/following", LoadFollowingList);

users.post("/:userTag/followers", LoadFollowersList);

users.post("/notifications/list", LoadNotifications);

users.post("/updateNotificationsSettings/:type", UpdateNotificationSettings);

users.post("/MeowMents/update", UpdateMeowMents);

users.post("/password/update", UpdatePassword);

users.post("/generalInfo/update", UpdateGeneralInfo);
users.post("/bio/update", UpdateBio);

export default users;
