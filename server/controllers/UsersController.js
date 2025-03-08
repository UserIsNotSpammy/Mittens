import { unlink, readFile } from "fs/promises";
import sharp from "sharp";
import Followers from "../db/followSchema.js";
import { broadcastNotifications } from "../utils/helperFunctions.js";
import mongoose from "mongoose";
import Pawprints from "../db/pawprintsSchema.js";
import { throwError } from "../utils/helperFunctions.js";
import imageType from "image-type";
import fs from "fs/promises";
import Conversation from "../db/conversationSchema.js";
import { handleError } from "../utils/helperFunctions.js";
import Users from "../db/usersSchema.js";
import Notifications from "../db/notificationSchema.js";
import path from "path";
import { __uploads, __temp } from "../config.js";
import { handleAttachments } from "../utils/processFIles.js";
import { hash, compare } from "bcrypt";
import { body, validationResult } from "express-validator";
const UpdateProfilePicture = async (req, res) => {
  const user_id = req.session.user_id;
  try {
    if (!req.file) throwError("No file was uploaded", 400, null);
    const findUser = await Users.findOne({ user_id });
    if (!findUser) throwError("User was not found", 400, null);
    const { folder, pfp } = findUser;
    if (req.file.size > 25 * 1024 * 1024) {
      await unlink(req.file.path);
      throwError("File is too large", 413);
    }
    const fileBuffer = await readFile(req.file.path);
    if (!(await imageType(fileBuffer))) {
      await unlink(req.file.path);
      throwError("Invalid file type", 400);
    }

    await sharp(path.join(__temp, req.file.filename))
      .resize({ width: 500, height: 500, fit: "fill" })
      .jpeg({ quality: 90 })

      .toFile(path.join(__uploads, `profiles/${folder}/${req.file.filename}`));

    await Users.updateOne(
      { user_id: user_id },
      {
        $set: {
          pfp: req.file.filename,
        },
      }
    );

    if (pfp) {
      await unlink(path.join(__uploads, "profiles", folder, pfp));
    }

    res.status(200).send("Profile picture updated successfully");
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
};

const UpdateCoverPhoto = async (req, res) => {
  const user_id = req.session.user_id;
  try {
    if (!req.file) throwError("No file was uploaded", 400, null);
    const findUser = await Users.findOne({ user_id });
    if (!findUser) throwError("User was not found", 400, null);
    const { folder, cover } = findUser;
    if (req.file.size > 25 * 1024 * 1024) {
      await unlink(req.file.path);
      throwError("File is too large", 413);
    }
    const fileBuffer = await readFile(req.file.path);
    if (!(await imageType(fileBuffer))) {
      await unlink(req.file.path);
      throwError("Invalid file type", 400);
    }

    await sharp(path.join(__temp, req.file.filename))
      .resize({ width: 900, height: 450, fit: "fill" })
      .jpeg({ quality: 90 })

      .toFile(path.join(__uploads, `profiles/${folder}/${req.file.filename}`));

    await Users.updateOne(
      { user_id: user_id },
      {
        $set: {
          cover: req.file.filename,
        },
      }
    );

    if (cover) {
      await unlink(path.join(__uploads, "profiles", folder, cover));
    }

    res.status(200).send("Profile picture updated successfully");
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
};

const LoadUser = async (req, res) => {
  const userId = req.session.user_id;
  const userData = await Users.findOne(
    { user_id: userId },
    { following: 1 }
  ).lean();
  const { userTag } = req.params;
  try {
    const findUser = await Users.findOne(
      { userTag: userTag }, // Match the user by their userTag
      {
        // Projection to exclude specific fields
        password: 0,
        folder: 0,
        pfp: 0,
        cover: 0,
        _id: 0,
      }
    ).lean();

    if (!findUser) throwError("User was not found", 400);
    const isFollowed = userData.following.users.hasOwnProperty(
      findUser.user_id
    );
    console.log(userData.following);
    const findPawprints = await Pawprints.find({ user_id: findUser.user_id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const { user_id, following, followers, ...result } = {
      ...findUser,
      followersCount: findUser.followers.count,
      followingCount: findUser.following.count,

      pawprints: findPawprints,
      isFollowed: isFollowed,
    };

    return res.json(result);
  } catch (err) {
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
};

const LoadUsers = async (req, res) => {
  try {
    const { fetchedUsers } = req.body;
    const limit = req.query.limit || 3;
    const user_id = req.session.user_id;

    if (!user_id) return res.status(401).send("Unauthorized");

    const findUser = await Users.findOne({ user_id });

    if (!findUser) return res.status(404).send("User not found");

    const findUsers = await Users.find(
      {
        [`followers.users.${user_id}`]: { $exists: false }, // Users you're NOT following
        user_id: { $ne: user_id }, // Exclude yourself
        userTag: { $nin: fetchedUsers }, // Avoid already fetched users
      },
      { userTag: 1, firstName: 1, lastName: 1, _id: 0 }
    ).limit(limit);

    return res.json(findUsers);
  } catch (err) {
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
};

const FollowUser = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { userTag } = req.params;
    const findUser = await Users.findOne({ userTag: userTag }).lean();
    if (!findUser) throwError("User was not found", 404);
    if (findUser.user_id === user_id)
      throwError("You can't follow yourself", 400);

    const findMe = await Users.findOne({ user_id: user_id }).lean();
    const findFollow = findMe.following.users.hasOwnProperty(findUser.user_id);

    if (findFollow) {
      return res.status(400).send(`You are already following "${userTag}"`);
    }

    const isFollowingBack = findUser.following.hasOwnProperty(user_id);

    const newFollower = new Followers({
      initiator: user_id,
      recipient: findUser.user_id,
    });

    const findConversation = await Conversation.exists({
      participants: { $all: [user_id, findUser.user_id] },
    });

    const conversation = new Conversation({
      participants: [user_id, findUser.user_id],
      lastMessage: { text: null, sender: null, createdAt: new Date() },
    });

    await Promise.all([
      newFollower.save(),
      await Users.updateOne(
        { user_id: user_id },
        {
          $set: {
            [`following.users.${findUser.user_id}`]: {
              isFollowingBack: isFollowingBack,
            },
          },
          $inc: { "following.count": 1 },
        }
      ),
      await Users.updateOne(
        { user_id: findUser.user_id },
        {
          $set: {
            [`followers.users.${user_id}`]: new Date(), // Sets current timestamp
          },
          $inc: { "followers.count": 1 },
        }
      ),

      !findConversation && conversation.save(),
      broadcastNotifications(user_id, findUser.user_id, {
        target: "user",
        action: "follow",
        targetId: findUser.userTag,
      }),
    ]);

    return res.status(200).send(`User "${userTag}" was followed successfully`);
  } catch (err) {
    handleError(res, err);
  }
};

const UnFollowUser = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { userTag } = req.params;
    const findUser = await Users.findOne({ userTag: userTag });
    const findMe = await Users.findOne({ user_id: user_id }).lean();

    if (!findUser) throwError("User was not found", 404);
    if (!findMe.following.users.hasOwnProperty(findUser.user_id))
      throwError("You were not following that user", 401);

    await Promise.all([
      Followers.deleteOne({
        initiator: user_id,
        recipient: findUser.user_id,
      }),

      Users.updateOne(
        { user_id: user_id },
        {
          $unset: {
            [`following.users.${findUser.user_id}`]: "",
          },
          $inc: { "following.count": -1 },
        }
      ),
      Users.updateOne(
        { user_id: findUser.user_id },
        {
          $unset: {
            [`followers.users.${user_id}`]: "", // Sets current timestamp
          },
          $inc: { "followers.count": -1 },
        }
      ),
    ]);
    return res
      .status(200)
      .send(`User "${userTag}" was unfollowed successfully`);
  } catch (err) {
    handleError(res, err);
  }
};

const LoadFollowingList = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { userTag } = req.params;
    const loadedUsers = req.body.loadedUsers || [];

    const findSearchedUser = await Users.findOne({ userTag: userTag });
    if (!findSearchedUser) throwError("User was not found", 404);
    const followedUsers = await Users.aggregate([
      {
        $match: {
          [`followers.users.${findSearchedUser.user_id}`]: { $exists: true }, // Check if user is followed
          user_id: { $ne: user_id }, // Exclude yourself
          userTag: { $nin: loadedUsers }, // Exclude already loaded users
        },
      },
      {
        $addFields: {
          isFollowed: true,
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          userTag: 1,
          isFollowed: 1,
          _id: 0,
        },
      },
      { $limit: 5 },
    ]);

    return res.json(followedUsers);
  } catch (err) {
    handleError(res, err);
  }
};

const LoadFollowersList = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { userTag } = req.params;
    const loadedUsers = req.body.loadedUsers || [];
    const findMe = await Users.findOne({ user_id: user_id }).lean();
    const findSearchedUser = await Users.findOne({ userTag }).lean();
    if (!findSearchedUser) throwError("User was not found", 404);

    const followedUsers = await Users.aggregate([
      {
        $match: {
          [`following.users.${findSearchedUser.user_id}`]: { $exists: true }, // Check if in followers Map
          user_id: { $ne: user_id }, // Exclude yourself
          userTag: { $nin: loadedUsers }, // Exclude already loaded users
        },
      },
      {
        $addFields: {
          isFollowed: {
            $gt: [
              {
                $getField: { field: "$user_id", input: findMe.following.users },
              },
              null,
            ],
          },
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          userTag: 1,
          isFollowed: 1,
          _id: 0,
        },
      },
      { $limit: 5 },
    ]);

    return res.json(followedUsers);
  } catch (err) {
    handleError(res, err);
  }
};

const LoadNotifications = async (req, res) => {
  try {
    const loadedNotifications = req.body.loadedNotifications || [];
    const user_id = req.session.user_id;
    const notifications = await Notifications.aggregate([
      {
        $match: {
          recipient: user_id,
          _id: {
            $nin: loadedNotifications.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
          },
        },
      },

      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "user_id",
          as: "senderData",
          pipeline: [
            { $limit: 1 },
            { $project: { firstName: 1, lastName: 1, userTag: 1, _id: 0 } },
          ],
        },
      },
      {
        $set: {
          sender: { $arrayElemAt: ["$senderData", 0] },
        },
      },
      {
        $project: {
          details: 1,
          createdAt: 1,
          sender: 1,
          isSeen: 1,
        },
      },
    ]);

    if (notifications.length === 0) return res.status(200).json(notifications);
    await Notifications.updateMany(
      {
        recipient: req.session.user_id,
        isSeen: false,
        createdAt: { $lte: notifications[0].createdAt },
      },
      { $set: { isSeen: true } }
    );

    return res.status(200).json(notifications);
  } catch (err) {
    console.log(err);
    handleError(res, err);
  }
};

const UpdateNotificationSettings = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { type } = req.params;
    const { isToggled } = req.body;

    if (!type) throwError("No type was provided", 400);

    const validTypes = [
      "purrsOnPosts",
      "savesOnPosts",
      "scratchesOnPosts",
      "remeowsOnPosts",
      "purrsOnComments",
      "repliesOnComments",
      "followsYou",
    ];

    if (!validTypes.includes(type))
      throwError("Invalid notification type", 400);

    const updatedUser = await Users.findOneAndUpdate(
      { user_id: user_id },
      { $set: { [`notificationSettings.${type}`]: isToggled } },
      { new: true }
    );

    if (!updatedUser) throwError("User not found", 404);

    return res.json({
      success: true,
      notificationSettings: updatedUser.notificationSettings,
      type: type,
    });
  } catch (err) {
    handleError(res, err);
  }
};

const UpdateMeowMents = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { meowments } = req.body;
    const findUser = await Users.findOne({ user_id: user_id }).lean();
    if (!meowments) throwError("No meowments were provided", 400);
    if (meowments.length > 6) throwError("Too many meowments", 400);
    if (meowments.length === 0) {
      await setNewMeowments();
      return;
    }

    const nonExistentMeowments = meowments
      .filter((image) => !image?.isStored)
      .map((image) => image?.fileName);

    if (nonExistentMeowments.length == 0) {
      await setNewMeowments();
      return;
    }

    await handleAttachments(
      `/profiles/${findUser.folder}`,
      nonExistentMeowments,
      async (attachments, flag) => {
        if (!flag) throwError("Invalid File Type", 400);
        await setNewMeowments();
      }
    );

    async function setNewMeowments() {
      const modified = await Promise.all(
        meowments.map(async (image) => {
          const inputPath = path.join(
            __uploads,
            `/profiles/${findUser.folder}`,
            image.fileName
          );
          const metadata = await sharp(inputPath).metadata();
          return {
            fileName: image.fileName,
            metadata: {
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
            },
          };
        })
      );

      await Users.updateOne(
        { user_id },
        {
          $set: {
            meowments: modified,
          },
        }
      );

      return res.json({ meowments: modified, success: true });
    }
  } catch (err) {
    handleError(res, err);
  }
};

const UpdatePassword = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    await Promise.all([
      body("currentPassword")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Current Password Field must Not Be Empty")
        .run(req),
      body("newPassword")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("New Password Field must Not Be Empty")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errDetails = errors.array();
      throwError("An error occurred", 400, errDetails);
    }
    const { currentPassword, newPassword } = req.body;
    const user = await Users.findOne({ user_id: user_id });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) throwError("Wrong passowrd", 400);
    const hashedNewPassword = await hash(newPassword, 10);
    await Users.updateOne(
      { user_id: user_id },
      { $set: { password: hashedNewPassword } }
    );

    return res.json({ status: "password updated" });
  } catch (err) {
    handleError(res, err);
  }
};

const UpdateGeneralInfo = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    await Promise.all([
      body("firstName")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("First Name Field must Not Be Empty")
        .isLength({ min: 2, max: 20 })
        .withMessage("First Name must be between 2 and 20 characters")
        .matches(/^[a-zA-Z]+$/)
        .withMessage("Only letters allowed in First Name")
        .run(req),
      body("lastName")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Last Name Field must Not Be Empty")
        .isLength({ min: 2, max: 20 })
        .withMessage("Last Name must be between 2 and 20 characters")
        .matches(/^[a-zA-Z]+$/)
        .withMessage("Only letters allowed in Last Name")
        .run(req),
      body("birthDate")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Date of Birth Field must Not Be Empty")
        .isISO8601()
        .withMessage("Invalid Date of Birth")
        .run(req),
      body("gender")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Gender Field must Not Be Empty")
        .isIn(["male", "female"])
        .withMessage("Invalid Gender")
        .run(req),
      body("country")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Country Field must Not Be Empty")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Only letters allowed in Country")
        .run(req),
      body("password")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Password Field must Not Be Empty")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .run(req),
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errDetails = errors.array();
      throwError("An error occurred", 400, errDetails);
    }

    const { firstName, lastName, birthDate, gender, country, password } =
      req.body;
    const user = await Users.findOne({ user_id: user_id });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) throwError("Wrong password", 400);

    await Users.updateOne(
      { user_id: user_id },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          "generalInfo.gender": gender,
          "generalInfo.livesIn": country,
          "generalInfo.dateOfBirth": birthDate,
        },
      }
    );

    return res.json({ status: "general info updated" });
  } catch (err) {
    handleError(res, err);
  }
};

const UpdateBio = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    await body("bio")
      .escape()
      .trim()
      .notEmpty()
      .withMessage("Bio must not be empty")
      .isLength({ max: 70, min: 10 })
      .withMessage(
        "Bio must be at most 70 characters long and at least 10 characters long"
      )
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errDetails = errors.array();
      throwError("An error occurred", 400, errDetails);
    }

    const { bio } = req.body;

    await Users.updateOne(
      { user_id: user_id },
      {
        $set: {
          "generalInfo.bio": bio,
        },
      }
    );

    return res.json({ status: "bio updated" });
  } catch (err) {
    handleError(res, err);
  }
};
export {
  UpdateProfilePicture,
  UpdateCoverPhoto,
  LoadUsers,
  LoadUser,
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
};
