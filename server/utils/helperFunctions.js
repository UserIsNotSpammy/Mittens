import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import { __uploads } from "../config.js";
import Users from "../db/usersSchema.js";
import { Posts } from "../db/postsSchema.js";
import Notifications from "../db/notificationSchema.js";
import { getIO } from "../socket.js";
import { exists } from "fs-extra";
import { param, validationResult } from "express-validator";
import Pawprints from "../db/pawprintsSchema.js";
import fs from "fs";
import { UAParser } from "ua-parser-js";
ffmpeg.setFfmpegPath(ffmpegPath);
function getUserAgentData(req) {
  const userAgent = req.headers["user-agent"] || "unknown";
  const ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown";

  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();

  return {
    os: result.os.name || "unknown",
    ip,
    browser: result.browser.name || "unknown",
    device: result.device.model || "unknown",
  };
}

const throwError = (message, status, details) => {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  throw error;
};

function handleError(res, err) {
  return res.status(err.status || 500).json({
    message: err?.message || "Unknown error occurred",
    details: err?.details || null,
  });
}
function timeDifference(pastTime) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(pastTime)) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

function processVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions("-vf", "scale=1280:-2") // Resize to 720p while maintaining aspect ratio
      .outputOptions("-c:v", "libx264") // Set codec to H.264
      .outputOptions("-crf", "23") // Adjust CRF for quality/compression balance
      .outputOptions("-preset", "medium") // Adjust encoding speed/quality trade-off
      .outputOptions("-c:a", "aac") // Set audio codec to AAC
      .outputOptions("-b:a", "128k") // Set audio bitrate
      .save(outputPath)
      .on("end", () => {
        resolve();
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

function getVideoMetadata(filePath) {
  return new Promise((resolve) => {
    // Check if ffprobe is available
    if (!ffmpeg.ffprobe) {
      console.warn("ffprobe not found. Returning unknown metadata.");
      return resolve({
        codec_name: "unknown",
        width: "unknown",
        height: "unknown",
        bit_rate: "unknown",
        r_frame_rate: "unknown",
      });
    }

    // Attempt to get metadata
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.warn("Error retrieving video metadata:", err.message);
        return resolve({
          codec_name: "unknown",
          width: "unknown",
          height: "unknown",
          bit_rate: "unknown",
          r_frame_rate: "unknown",
        });
      }

      // Find the video stream
      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video"
      );

      // If no video stream is found, return unknown values
      if (!videoStream) {
        console.warn("No video stream found in the file.");
        return resolve({
          codec_name: "unknown",
          width: "unknown",
          height: "unknown",
          bit_rate: "unknown",
          r_frame_rate: "unknown",
        });
      }

      // Resolve with the video metadata
      resolve({
        codec_name: videoStream.codec_name || "unknown",
        width: videoStream.width || "unknown",
        height: videoStream.height || "unknown",
        bit_rate: videoStream.bit_rate || "unknown",
        r_frame_rate: videoStream.r_frame_rate || "unknown",
      });
    });
  });
}

const LoadImage = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (type === "post") {
      const filePath = path.join(__uploads, `/posts/${id}`);
      return res.sendFile(filePath);
    }
    if (type === "comment") {
      const filePath = path.join(__uploads, `/comments/${id}`);
      return res.sendFile(filePath);
    }
    if (type === "pfp") {
      const { folder, pfp } = await Users.findOne({ userTag: id });
      if (!pfp) {
        const filePath = path.join(
          __uploads,
          `/profiles/default/default_pfp.png`
        );
        return res.sendFile(filePath);
      }
      const filePath = path.join(__uploads, `/profiles/${folder}/${pfp}`);
      return res.sendFile(filePath);
    }
    if (type === "cover") {
      const { folder, cover } = await Users.findOne({ userTag: id });
      if (!cover) {
        const filePath = path.join(
          __uploads,
          `/profiles/default/default_cover.png`
        );
        return res.sendFile(filePath);
      }
      const filePath = path.join(__uploads, `/profiles/${folder}/${cover}`);
      return res.sendFile(filePath);
    }
    if (type === "chat") {
      const filePath = path.join(__uploads, `/chats/${id}`);
      return res.sendFile(filePath);
    }
  } catch (err) {
    console.log(err);
    handleError(res, err);
  }
};

const LoadMeowment = async (req, res) => {
  try {
    const { key, id } = req.params;
    const { folder, meowments } = await Users.findOne({ userTag: id });
    if (meowments.length === 0)
      return res.sendFile(path.join(__uploads, `/profiles/default2.png`));

    const filePath = path.join(__uploads, `/profiles/${folder}/${key}`);

    if (!(await exists(filePath))) {
      return res.sendFile(path.join(__uploads, `/profiles/default2.png`));
    }

    return res.sendFile(filePath);
  } catch (err) {
    handleError(res, err);
  }
};
const LoadVideo = async (req, res) => {
  try {
    await param("id").trim().escape().notEmpty().run(req);
    await param("type").trim().escape().notEmpty().run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) throwError("An error occurred", 400, errors.array());

    const { id, type } = req.params;
    const videoPath = path.join(__uploads, `${type}s/${id}`);

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
};
async function broadcastNotifications(sender, recipient, details) {
  console.log("i was called");
  if (sender === recipient) return;
  // const date = new Date(Date.now() - 30 * 1000);
  // const checkNotification = await Notifications.exists({
  //   sender: sender,
  //   recipient: recipient,
  //   details: details,

  //   createdAt: { $gt: date },
  // });
  const checkNotification = false;
  if (!checkNotification) {
    const io = getIO();
    const findRecipient = await Users.findOne(
      { user_id: recipient },
      { userTag: 1, firstName: 1, lastName: 1, notificationSettings: 1, _id: 0 }
    );

    const findSender = await Users.findOne(
      { user_id: sender },
      { userTag: 1, firstName: 1, lastName: 1, _id: 0 }
    ).lean();
    const newNotification = new Notifications({
      sender: sender,
      recipient: recipient,
      details: details,
    });

    switch (details.target) {
      case "post":
        if (
          details.action === "like" &&
          !findRecipient.notificationSettings?.purrsOnPosts
        )
          return;
        if (
          details.action === "comment" &&
          !findRecipient.notificationSettings?.scratchesOnPosts
        )
          return;
        if (
          details.action === "remeow" &&
          !findRecipient.notificationSettings?.remeowsOnPosts
        )
          return;
        if (
          details.action === "save" &&
          !findRecipient.notificationSettings?.savesOnPosts
        )
          return;
        break;
      case "comment":
        if (
          details.action === "like" &&
          !findRecipient.notificationSettings?.purrsOnComments
        )
          return;
        if (
          details.action === "reply" &&
          !findRecipient.notificationSettings?.repliesOnComments
        )
          return;
        break;
      case "user":
        if (
          details.action === "follow" &&
          !findRecipient.notificationSettings?.followsYou
        )
          return;
        break;
    }

    await newNotification.save();

    const broadcastedNotification = {
      details: newNotification.details,
      sender: findSender,
      createdAt: newNotification.createdAt,
      _id: newNotification._id,
    };
    io.to(findRecipient.userTag).emit("notification", broadcastedNotification);
  }
}

async function addPawprint(user, type, target) {
  try {
    const pawprint = new Pawprints({
      user_id: user.user_id,
      user_tag: user.userTag,
      type: type,
      target: target,
    });
    await pawprint.save();
  } catch {
    throwError("An error occurred", 500);
  }
}

async function updateEngagementScore(postId, action, type) {
  const interactionWeights = {
    like: 1,
    save: 1,
    remeow: 2.2,
    comment: 1.5,
  };
  const weight = interactionWeights[type] || 0;
  if (!weight) return;

  const incrementValue = action === "add" ? weight : -weight;

  await Posts.updateOne(
    { post_id: postId },
    { $inc: { engagementScore: incrementValue } }
  );
}

async function updateUserEngagement(recipient, initiator, val) {
  await Users.updateOne(
    { user_id: initiator },
    {
      $inc: { [`engagements.${recipient}.interactionCount`]: val },
      $set: { [`engagements.${recipient}.lastInteraction`]: new Date() },
    }
  );
}

export {
  throwError,
  processVideo,
  timeDifference,
  LoadImage,
  LoadMeowment,
  handleError,
  LoadVideo,
  broadcastNotifications,
  addPawprint,
  updateEngagementScore,
  updateUserEngagement,
  getVideoMetadata,
  getUserAgentData,
};
