import { Router } from "express";
import { checkLogin } from "../middlewares/checkLogin.js";
import { compare } from "bcrypt";
import Users from "../db/usersSchema.js";
import { handleError } from "../utils/helperFunctions.js";
import Notifications from "../db/notificationSchema.js";
import { validateRegFormData } from "../middlewares/validators.js";

import { verifyCode, register, logout } from "../controllers/AuthController.js";
const auth = Router();

const dummyLogin = async (req, res) => {
  try {
    const { userTag, password } = req.body;

    const findUser = await Users.findOne(
      { userTag: userTag },
      {
        firstName: 1,
        lastName: 1,
        userTag: 1,
        user_id: 1,
        following: 1,
        followers: 1,
        bio: 1,
        password: 1,
        notificationSettings: 1,
        _id: 0,
      }
    ).lean();

    if (!findUser) return res.status(400).send("no user");

    if (!(await compare(password, findUser.password)))
      return res.status(400).send("wrong password");

    req.session.user_id = findUser.user_id;
    req.session.userTag = findUser.userTag;

    const findUnreadNotifications = await Notifications.countDocuments({
      recipient: req.session.user_id,
      isSeen: false,
    });
    let result = {
      firstName: findUser.firstName,
      lastName: findUser.lastName,
      userTag: findUser.userTag,
      followingCount: findUser.following.count,
      followersCount: findUser.followers.count,
      bio: 1,
      unReadNotifications: findUnreadNotifications,
      notificationSettings: findUser.notificationSettings,
    };
    return res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
};

auth.post("/login", dummyLogin);

auth.post("/autologin", checkLogin, async (req, res) => {
  try {
    if (!req.session.user_id) return res.status(400).send("no");
    const findUser = await Users.findOne(
      { user_id: req.session.user_id },
      {
        firstName: 1,
        lastName: 1,
        userTag: 1,
        user_id: 1,
        following: 1,
        followers: 1,
        bio: 1,
        notificationSettings: 1,
        _id: 0,
      }
    ).lean();

    const findUnreadNotifications = await Notifications.countDocuments({
      recipient: req.session.user_id,
      isSeen: false,
    });

    let result = {
      firstName: findUser.firstName,
      lastName: findUser.lastName,
      userTag: findUser.userTag,
      followingCount: findUser.following.count,
      followersCount: findUser.followers.count,
      bio: 1,
      unReadNotifications: findUnreadNotifications,
      notificationSettings: findUser.notificationSettings,
    };
    return res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
});

auth.post("/logout", logout);

auth.post("/register", validateRegFormData, register);

auth.post("/verifyAccount", verifyCode);

export default auth;
