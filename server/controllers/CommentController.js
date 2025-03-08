import { randomBytes } from "crypto";
import { Posts } from "../db/postsSchema.js";
import { getIO } from "../socket.js";
import Users from "../db/usersSchema.js";
import { Comments } from "../db/commentsSchema.js";
import CommentsInteraction from "../db/commentsInteractions.js";
import { param } from "express-validator";
import path from "path";
import { __uploads } from "../config.js";
import { unlink } from "fs/promises";
import {
  addPawprint,
  handleError,
  throwError,
  broadcastNotifications,
} from "../utils/helperFunctions.js";

import { handleAttachments } from "../utils/processFIles.js";

const CreateComment = async (req, res) => {
  try {
    const { post_id } = req.params;
    let id = post_id;
    const user_id = req.session.user_id;
    const { data } = req.body;

    if (!data.attachments.length && !data.text.trim())
      return throwError("Comment body can not be empty", 400);

    const findPost = await Posts.findOne({ post_id: id });
    if (!findPost) return throwError("Post was not found", 404);
    const findPoster = await Users.findOne({ user_id: findPost.user_id });

    switch (!!data.attachments.length) {
      case true:
        await handleAttachments(
          "comments",
          data.attachments,
          async (attachments, flag) => {
            let body = {
              text: data.text || "",
              image: flag ? attachments : null, //
              video: flag ? null : attachments[0],
            };
            await addComment(body, findPoster, id);
          }
        );
        break;
      case false:
        await addComment(
          {
            text: data.text,
          },
          findPoster,
          id
        );
        break;
    }
    return res.status(200).json({});
  } catch (err) {
    handleError(res, err);
  }

  async function addComment(commentBody, poster, id) {
    const user_id = req.session.user_id;
    const newComment = new Comments({
      user_id: user_id,
      post_id: id,
      comment_id: randomBytes(20).toString("hex"),
      commentBody,
      interactions: {
        likes: [],
      },
    });

    await Promise.all([
      addPawprint(
        { user_id: user_id, userTag: req.session.userTag },
        "scratch",
        {
          type: "post",
          post: {
            id: id,
            postedBy: {
              userTag: poster.userTag,
              firstName: poster.firstName,
              lastName: poster.lastName,
            },
          },
        }
      ),
      newComment.save(),
      Posts.updateOne({ post_id: id }, { $inc: { commentsCount: 1 } }),

      broadcastNotifications(user_id, poster.user_id, {
        target: "post",
        action: "comment",
        targetId: id,
      }),
    ]);

    const findCommenter = await Users.findOne({ user_id: user_id });
    const formattedComment = {
      commentBody: newComment.commentBody,
      createdAt: newComment.createdAt,
      comment_id: newComment.comment_id,
      post_id: newComment.post_id,
      commentedBy: {
        firstName: findCommenter.firstName,
        lastName: findCommenter.lastName,
        userTag: findCommenter.userTag,
      },
      interactions: {
        likes: {
          count: 0,
          isInteracted: false,
        },
      },
    };

    const io = getIO();
    io.to(id).emit("comment", formattedComment);
  }
};
const LoadComments = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const limit = req.query?.limit || 4;
    const { fetchedComments } = req?.body || [];
    const { post_id } = req.params;
    let id = post_id;
    console.log("post id:", id);
    const findPost = await Posts.exists({ post_id: id });
    if (!findPost) throwError("Post was not found", 400);

    try {
      const comments = await Comments.aggregate([
        {
          $match: { post_id: id, comment_id: { $nin: fetchedComments || [] } },
        },
        {
          $set: {
            "interactions.likes": {
              $mergeObjects: [
                { count: { $size: "$interactions.likes" } },
                { isInteracted: { $in: [user_id, "$interactions.likes"] } },
              ],
            },
          },
        },
        {
          $lookup: {
            foreignField: "user_id",
            localField: "user_id",
            from: "users",
            as: "commentedBy",
            pipeline: [
              { $project: { firstName: 1, userTag: 1, lastName: 1, _id: 0 } },
            ],
          },
        },
        {
          $set: {
            commentedBy: { $arrayElemAt: ["$commentedBy", 0] },
          },
        },
        {
          $unset: ["_id", "__v", "user_id"],
        },
        { $limit: parseInt(limit) },
      ]);
      return res.json(comments);
    } catch {
      throwError("An error occurred while loading the comments", 500);
    }
  } catch (err) {
    handleError(res, err);
  }
};

const DeleteComment = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { post_id, comment_id } = req.params;
    const findComment = await Comments.findOne({
      post_id: post_id,
      comment_id: comment_id,
    }).lean();
    if (!findComment) throwError("Post was not found", 404);
    if (findComment.user_id != user_id) throwError("Not your post", 400);

    try {
      await Promise.all([
        CommentsInteraction.deleteMany({
          post_id: post_id,
          comment_id: comment_id,
        }),
        Comments.deleteOne({ post_id: post_id, comment_id: comment_id }),
        Posts.updateOne({ post_id: post_id }, { $inc: { commentsCount: -1 } }),
      ]);
    } catch {
      throwError("An error occurred while deleting the post", 500);
    }

    const attachedMedia =
      findComment.commentBody.video || findComment.commentBody.image;
    if (attachedMedia) {
      try {
        if (Array.isArray(attachedMedia)) {
          attachedMedia.forEach(async (media) => {
            await unlink(path.join(__uploads, `/comments/${media}`));
          });
        } else {
          await unlink(path.join(__uploads, `/comments/${attachedMedia}`));
        }
      } catch (err) {
        console.log(err);
        throwError("An error occurred while deleting the post's Media", 500);
      }
    }

    return res.status(200).json({});
  } catch (err) {
    handleError(res, err);
  }
};

async function handleInteraction(req, res, interactionType) {
  try {
    const { post_id, comment_id } = req.params;

    if (!post_id || !comment_id) throwError("Post was not found", 404);

    const findPost = await Posts.findOne({ post_id: post_id });
    if (!findPost) return throwError("Post was not found", 404);

    const findComment = await Comments.findOne({ comment_id: comment_id });
    if (!findComment) return throwError("Comment was not found", 404);

    const { isInteracted } = req.body;
    const user_id = req.session.user_id;

    if (isInteracted) {
      const newInteraction = new CommentsInteraction({
        user_id: user_id,
        post_id: post_id,
        comment_id: comment_id,
        type: interactionType,
      });

      await Promise.all([
        newInteraction.save(),
        Comments.updateOne(
          {
            post_id: post_id,
            comment_id: comment_id,
            "interactions.likes": { $nin: [user_id] },
          },
          { $push: { ["interactions.likes"]: user_id } }
        ),
        broadcastNotifications(user_id, findComment.user_id, {
          target: "comment",
          action: "like",
          targetId: post_id,
        }),
      ]);
    } else {
      await Promise.all([
        Comments.updateOne(
          {
            post_id: post_id,
            comment_id: comment_id,
          },
          { $pull: { ["interactions.likes"]: user_id } }
        ),
        CommentsInteraction.deleteOne({
          type: interactionType,
          post_id: post_id,
          user_id: user_id,
          comment_id: comment_id,
        }),
      ]);
    }

    await broadcasrInteractions(post_id, comment_id, interactionType);

    return res.status(200).json({});
  } catch (err) {
    handleError(res, err);
  }
}

async function broadcasrInteractions(post_id, comment_id, interactionType) {
  const findComment = await Comments.findOne({
    comment_id: comment_id,
    post_id: post_id,
  }).lean();

  const totalInteractions = findComment.interactions.likes.length;
  const likesCount = findComment.interactions.likes.length;
  const io = getIO();
  io.to(comment_id).emit(`${interactionType}-comment`, {
    comment_id: comment_id,
    likesCount: likesCount,
    totalInteractions: totalInteractions,
  });
}

export { CreateComment, LoadComments, handleInteraction, DeleteComment };
