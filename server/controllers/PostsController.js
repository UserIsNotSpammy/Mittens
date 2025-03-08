import { Posts } from "../db/postsSchema.js";
import Interactions from "../db/InteractionsSchema.js";
import { Comments } from "../db/commentsSchema.js";
import Users from "../db/usersSchema.js";
import { unlink } from "fs/promises";
import { getIO } from "../socket.js";

import path from "path";
import { __temp, __uploads } from "../config.js";
import { randomBytes } from "crypto";
import { param } from "express-validator";
import { addPawprint, handleError } from "../utils/helperFunctions.js";
import { handleAttachments } from "../utils/processFIles.js";
import {
  throwError,
  broadcastNotifications,
  updateEngagementScore,
  updateUserEngagement,
} from "../utils/helperFunctions.js";

import redis from "../test.js";

const DeletePost = async (req, res) => {
  const user_id = req.session.user_id;
  await param("id").trim().escape().run(req);
  const { id } = req.params;
  try {
    const findPost = await Posts.findOne({ post_id: id }).lean();
    if (!findPost) throwError("Post was not found", 400);
    if (findPost.user_id != user_id) throwError("Not your post", 400);
    const attachedMedia = findPost.postBody.video || findPost.postBody.image;

    try {
      await Promise.all([
        Interactions.deleteMany({ post_id: id }),
        Users.updateOne({ user_id: user_id }, { $inc: { postsCount: -1 } }),
        Comments.deleteMany({ post_id: id }),
        Posts.deleteOne({ post_id: id }),
      ]);

      if (findPost.isRemeow) {
        await Promise.all([
          Interactions.deleteOne({
            post_id: findPost.isRemeow,
            user_id: user_id,
            type: "remeow",
          }),
          Posts.updateOne(
            { post_id: findPost.isRemeow },
            {
              $inc: { ["interactions.remeows.count"]: -1, engagementScore: -5 },
              $unset: { [`interactions.remeows.users.${user_id}`]: "" },
            }
          ),
        ]);

        await broadcasrInteractions(findPost.isRemeow, "remeow");
      }
      await deleteAttachments(attachedMedia);
    } catch {
      throwError("An error occurred while deleting the post", 500);
    }

    return res.status(200).json({});
  } catch (err) {
    handleError(res, err);
  }

  async function deleteAttachments(attachedMedia) {
    if (attachedMedia) {
      try {
        if (Array.isArray(attachedMedia)) {
          attachedMedia.forEach(async (media) => {
            await unlink(path.join(__uploads, `/posts/${media.fileName}`));
          });
        } else {
          await unlink(
            path.join(__uploads, `/posts/${attachedMedia.fileName}`)
          );
        }
      } catch {
        throwError("An error occurred while deleting the post's Media", 500);
      }
    }
  }
}; //finished

const CreatePost = async (req, res) => {
  const user_id = req.session.user_id;
  const { attachments, postText, event, poll } = req.body;
  try {
    if (!attachments && !postText && !event && !poll)
      throwError("Post body cannot be empty!", 400);
    switch (getType()) {
      case "attachments":
        await handleAttachments(
          "posts",
          attachments,
          async (attachments, flag) => {
            const formattedPost = await addPost(
              {
                text: postText || null,
                image: flag ? attachments : null,
                video: flag ? null : attachments[0],
              },
              "regular",
              user_id
            );
            return res.json(formattedPost);
          }
        );
        break;
      case "event":
        await handleEvent();
        break;
      case "poll":
        await handlePoll();
        break;
      default:
        await handleDefault();
        break;
    }
  } catch (err) {
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }

  async function addPost(postBody, type, user_id) {
    let newPost = null;
    try {
      newPost = new Posts({
        user_id: user_id,
        type: type,
        post_id: randomBytes(10).toString("hex") + Date.now(),
        postBody,
      });

      await Promise.all([
        newPost.save(),
        Users.updateOne({ user_id: user_id }, { $inc: { postsCount: 1 } }),
      ]);
    } catch (err) {
      return new Promise((reject) => {
        reject(err.message);
      });
    }

    const { firstName, lastName, userTag } = await Users.findOne({
      user_id: newPost.user_id,
    });

    // const formattedPost = {
    //   ...newPost.postBody,
    //   isRemeow: { status: false },
    //   since: timeDifference(newPost.createdAt),
    //   post_id: newPost.post_id,
    //   postType: newPost.type,
    //   interactionsCount: 0,
    //   isLiked: false,
    //   isRemeowed: false,
    //   isSaved: false,
    //   likesCount: 0,
    //   savesCount: 0,
    //   remeowsCount: 0,
    //   commentsCount: 0,
    //   postedBy: {
    //     firstName: firstName,
    //     lastName: lastName,
    //     tag: userTag,
    //   },
    // };
    const formattedPost = {
      post_id: newPost.post_id,
      postBody: {
        text: newPost.postBody?.text || null,
        video: newPost.postBody?.video || null,
        image: newPost.postBody?.image || null,
        event: newPost.postBody?.event || null,
        poll: newPost.postBody?.poll || null,
      },
      isRemeow: {
        status: false,
        originalPost: {}, // Update this if necessary
      },
      type: newPost.type || "regular",
      createdAt: newPost.createdAt,
      postedBy: {
        // user_id: newPost.user_id || null,
        firstName: firstName,
        lastName: lastName,
        userTag: userTag,
        // pfp: newPost.pfp || null,
      },
      interactions: {
        likes: {
          count: 0,
          isInteracted: false,
        },
        saves: {
          count: 0,
          isInteracted: false,
        },
        remeows: {
          count: 0,
          isInteracted: false,
        },
      },
      commentsCount: 0,
    };

    return new Promise((resolve, reject) => {
      resolve(formattedPost);
    });
  }

  async function handleEvent() {
    try {
      const formattedPost = await addPost(
        { text: postText, event: event },
        "event",
        user_id
      );
      return res.json(formattedPost);
    } catch {
      throwError("an error occurred while processing your post (2)", 500);
    }
  }

  async function handlePoll() {
    try {
      let newPoll = {
        options: poll.map((value) => {
          return { option: value, votes: 0 };
        }),
        voters: {},
      };
      const formattedPost = await addPost(
        {
          text: postText,
          poll: newPoll,
        },
        "poll",
        user_id
      );
      return res.json(formattedPost);
    } catch {
      throwError("An error occurred while processing your post (3)", 500);
    }
  }
  async function handleDefault() {
    try {
      const formattedPost = await addPost(
        { text: postText },
        "regular",
        user_id
      );
      return res.json(formattedPost);
    } catch {
      throwError("An error occurred while processing your post (4)", 500);
    }
  }
  function getType() {
    if (Array.isArray(attachments) && attachments.length) return "attachments";
    if (event) return "event";
    if (poll) return "poll";
  }
}; // semiFinished

const RemeowPost = async (req, res) => {
  const userId = req.session.user_id;
  const { text } = req.body;
  const { id } = req.params;
  try {
    if (!id) throwError("Post id is required", 400);
    const findRemeow = await Posts.findOne({ post_id: id });
    if (!findRemeow) throwError("Post was not found", 400);
    try {
      const newPost = new Posts({
        post_id: randomBytes(10).toString("hex") + Date.now(),
        user_id: userId,
        postBody: {
          text: text,
        },
        type: "regular",
        isRemeow: id,
      });
      await newPost.save();
      await Users.updateOne({ user_id: userId }, { $inc: { postsCount: 1 } });
      let isRemeow = { status: false };
      const { firstName, lastName, userTag } = await Users.findOne({
        user_id: findRemeow.user_id,
      });

      const findUser = await Users.findOne({ user_id: userId });

      isRemeow = {
        status: true,
        originalPost: {
          post_id: findRemeow.post_id,
          type: findRemeow.type,
          createdAt: findRemeow.createdAt,
          postBody: {
            text: findRemeow.postBody?.text || null,
            video: findRemeow.postBody?.video || null,
            image: findRemeow.postBody?.image || null,
            event: findRemeow.postBody?.event || null,
            poll: findRemeow.postBody?.poll || null,
          },
          postedBy: {
            firstName: firstName,
            lastName: lastName,
            userTag: userTag,
          },
        },
      };
      const formattedPost = {
        post_id: newPost.post_id,
        postBody: {
          text: newPost.postBody?.text || null,
          video: newPost.postBody?.video || null,
          image: newPost.postBody?.image || null,
          event: newPost.postBody?.event || null,
          poll: newPost.postBody?.poll || null,
        },
        isRemeow,
        type: newPost.type || "regular",
        createdAt: newPost.createdAt,
        postedBy: {
          user_id: userId,
          firstName: findUser.firstName,
          lastName: findUser.lastName,
          userTag: findUser.userTag,
        },
        interactions: {
          likes: {
            count: 0,
            isInteracted: false,
          },
          saves: {
            count: 0,
            isInteracted: false,
          },
          remeows: {
            count: 0,
            isInteracted: false,
          },
        },

        commentsCount: 0,
      };

      const newInteraction = new Interactions({
        user_id: userId,
        post_id: id,
        type: "remeow",
        id: id,
      });

      await Promise.all([
        addPawprint({ user_id: userId, userTag: findUser.userTag }, "remeow", {
          type: "post",
          post: {
            id: id,
            postedBy: {
              firstName: firstName,
              lastName: lastName,
              userTag: userTag,
            },
          },
        }),
        newInteraction.save(),
        Posts.updateOne(
          { post_id: id },
          {
            $inc: { [`interactions.remeows.count`]: 1 },
            $set: {
              [`interactions.remeows.users.${userId}`]: true,
            },
          }
        ),
        updateEngagementScore(id, "add", "remeow"),
        // updateUserEngagement(),
      ]);

      await broadcastNotifications(userId, findRemeow.user_id, {
        target: "post",
        action: "remeow",
        targetId: id,
      });
      await broadcasrInteractions(id, "remeow");

      return res.status(200).json(formattedPost);
    } catch (err) {
      console.log(err);
      throwError("An error occurred while processing your post", 500);
    }
  } catch (err) {
    handleError(res, err);
  }
}; // finished

const PollVote = async (req, res) => {
  const io = getIO();
  const userId = req.session.user_id;
  const { id } = req.params;
  const { option } = req.body;
  try {
    const findPost = await Posts.findOne({ post_id: id });
    if (!findPost) return res.status(400).send("No post was found");

    if (findPost.type !== "poll" || !findPost.postBody.poll)
      return res.status(400).send("Invalid Post");

    if (!option || !option.value || option.index == null)
      return res.status(400).send("No option was selected");

    const { value, index } = option;

    if (findPost.postBody.poll.options[index].option !== value)
      return res.status(400).send("Invalid option was selected");
    try {
      let newStuff;
      if (findPost.postBody.poll.voters?.hasOwnProperty(userId)) {
        const votedFor = findPost.postBody.poll.voters[userId];
        if (votedFor === index) {
          newStuff = await Posts.findOneAndUpdate(
            { post_id: id },
            {
              $unset: {
                [`postBody.poll.voters.${userId}`]: "", // Update user's vote
              },
              $inc: {
                [`postBody.poll.options.${votedFor}.votes`]: -1, // Decrement old vote
              },
            },
            { new: true }
          ).lean();
          const { options, voters } = newStuff.postBody.poll;
          io.to(id).emit("poll", { id: id, options: options, voters: voters });
          return res.send("All removed");
        }
        newStuff = await Posts.findOneAndUpdate(
          { post_id: id },
          {
            $set: {
              [`postBody.poll.voters.${userId}`]: index, // Update user's vote
            },
            $inc: {
              [`postBody.poll.options.${votedFor}.votes`]: -1, // Decrement old vote
              [`postBody.poll.options.${index}.votes`]: 1, // Increment new vote
            },
          },
          { new: true }
        ).lean();
      } else {
        newStuff = await Posts.findOneAndUpdate(
          { post_id: id },
          {
            $set: {
              [`postBody.poll.voters.${userId}`]: index, // Update user's vote
            },
            $inc: {
              [`postBody.poll.options.${index}.votes`]: 1, // Increment new vote
            },
          },
          { new: true }
        ).lean();
      }

      const { options, voters } = newStuff.postBody.poll;
      io.to(id).emit("poll", { id: id, options: options, voters: voters });

      return res.status(200).send("created");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal error during voting");
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).send("internal err");
  }
};

const LoadPostsOld = async (req, res) => {
  try {
    const user_id = req.session.user_id || "2";
    const { filter } = req.query || null;
    const { user } = req.query || null;

    const loadedPosts = req.body.loadedPosts || [];

    const findUserId = await Users.findOne({ userTag: user }, { user_id: 1 });
    const findReqMaker = await Users.findOne({ user_id: user_id }).lean();

    const algoStage = [
      // { $sample: { size: 1 } },
      {
        $addFields: {
          isFollowingAuthor: {
            $gt: [
              {
                $getField: {
                  field: "$postedBy.user_id",
                  input: findReqMaker.following.users,
                },
              },
              null,
            ],
          },
          isFollowedByAuthor: {
            $gt: [
              {
                $getField: {
                  field: "$postedBy.user_id",
                  input: findReqMaker.followers.users,
                },
              },
              null,
            ],
          },
          follwoingFactor: {
            $ifNull: [
              {
                $getField: {
                  field: "$postedBy.user_id",
                  input: findReqMaker.following.users,
                },
              },
              null,
            ],
          },
          myEngagement: {
            $ifNull: [
              {
                $getField: {
                  field: "$postedBy.user_id",
                  input: findReqMaker.engagements,
                },
              },
              { interactionCount: 0, lastInteraction: null },
            ],
          },
        },
      },

      {
        $addFields: {
          authorEngagement: {
            $ifNull: [
              `$postedBy.engagements.${user_id}`,
              { interactionCount: 0, lastInteraction: null },
            ],
          },
        },
      },

      {
        $addFields: {
          authorEngagementWeight: {
            $switch: {
              branches: [
                {
                  case: {
                    $gte: [
                      "$authorEngagement.lastInteraction",
                      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.3,
                },
                {
                  case: {
                    $gte: [
                      "$authorEngagement.lastInteraction",
                      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.15,
                },
                {
                  case: {
                    $gte: [
                      "$authorEngagement.lastInteraction",
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.08,
                },
              ],
              default: 0,
            },
          },
          myEngagementWeight: {
            $switch: {
              branches: [
                {
                  case: {
                    $gte: [
                      "$myEngagement.lastInteraction",
                      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.5,
                },
                {
                  case: {
                    $gte: [
                      "$myEngagement.lastInteraction",
                      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.2,
                },
                {
                  case: {
                    $gte: [
                      "$myEngagement.lastInteraction",
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.1,
                },
              ],
              default: 0,
            },
          },
        },
      },

      {
        $addFields: {
          engagementsRankingScore: {
            $add: [
              {
                $divide: [
                  {
                    $multiply: [
                      "$authorEngagement.interactionCount",
                      "$authorEngagementWeight",
                    ],
                  },
                  { $multiply: [{ $rand: {} }, 10] },
                ],
              },
              {
                $divide: [
                  {
                    $multiply: [
                      "$myEngagement.interactionCount",
                      "$myEngagementWeight",
                    ],
                  },
                  { $multiply: [{ $rand: {} }, 10] },
                ],
              },
              {
                $divide: [
                  "$engagementScore",
                  {
                    $cond: {
                      if: { $eq: ["$postedBy.postsCount", 0] },
                      then: 1,
                      else: "$postedBy.postsCount",
                    },
                  },
                ],
              },
            ],
          },
        },
      },

      {
        $addFields: {
          timeFactor: {
            $switch: {
              branches: [
                {
                  case: {
                    $gte: [
                      "$createdAt",
                      new Date(Date.now() - 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 5,
                },
                {
                  case: {
                    $gte: [
                      "$createdAt",
                      new Date(Date.now() - 35 * 60 * 60 * 1000),
                    ],
                  },
                  then: 1.2,
                },
                {
                  case: {
                    $gte: [
                      "$createdAt",
                      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.5,
                },
                {
                  case: {
                    $gte: [
                      "$createdAt",
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  then: 0.2,
                },
              ],
              default: 0.1,
            },
          },
          followFactor: {
            $cond: { if: "$isFollowingAuthor", then: 1.6, else: 0.5 },
          },
          followedByFactor: {
            $cond: { if: "$isFollowedByAuthor", then: 1.1, else: 1 },
          },
          randomValueFactor: {
            $multiply: [{ $rand: {} }, 99],
          },
        },
      },
      {
        $addFields: {
          rankingScore: {
            $multiply: [
              { $add: ["$engagementsRankingScore", 1] },
              {
                $multiply: [
                  "$timeFactor",
                  "$followFactor",
                  "$followedByFactor",
                  "$randomValueFactor",
                ],
              },
            ],
          },
        },
      },

      { $sort: { rankingScore: -1, createdAt: -1 } },

      { $limit: 15 },
    ];

    let defaultQuery = [
      { $match: { post_id: { $nin: loadedPosts } } },

      // { $sort: { createdAt: -1, engagementScore: -1 } },
      {
        $lookup: {
          from: "users",
          foreignField: "user_id",
          localField: "user_id",
          as: "postedBy",
        },
      },
      {
        $match: {
          postedBy: {
            $ne: [],
          },
        },
      },
      {
        $set: {
          postedBy: {
            $arrayElemAt: ["$postedBy", 0],
          },
        },
      },

      //interactions
    ];

    const projectionSatge = [
      {
        $project: {
          "postedBy.password": 0,
          "postedBy.folder": 0,
          "postedBy.cover": 0,
          "postedBy.pfp": 0,
          "postedBy.generalInfo": 0,
          "postedBy.meowments": 0,
          "postedBy._id": 0,
          "postedBy.postsCount": 0,
          "postedBy.followers": 0,
          "postedBy.following": 0,
          "postedBy.user_id": 0,
          "postedBy.engagements": 0,
          "isRemeow.originalPost.isRemeow": 0,
          "isRemeow.originalPost.__v": 0,
          "isRemeow.originalPost._id": 0,
          "isRemeow.originalPost.user_id": 0,
          "isRemeow.originalPost.postedBy.password": 0,
          "isRemeow.originalPost.postedBy.folder": 0,
          "isRemeow.originalPost.postedBy._id": 0,
          "isRemeow.originalPost.postedBy.pfp": 0,
          "isRemeow.originalPost.postedBy.cover": 0,
          "isRemeow.originalPost.postedBy.meowments": 0,
          "isRemeow.originalPost.postedBy.generalInfo": 0,
          "isRemeow.originalPost.postedBy.followers": 0,
          "isRemeow.originalPost.postedBy.postsCount": 0,
          "isRemeow.originalPost.postedBy.engagements": 0,
          "isRemeow.originalPost.interactions": 0,
          "isRemeow.originalPost.postedBy.following": 0,
          "isRemeow.originalPost.engagementScore": 0,
          tempInteractions: 0,
          "isRemeow.id": 0,
          user_id: 0,
          _id: 0,
          isRemeowData: 0,
          originalPoster: 0,
          // engagementScore: 0,
          __v: 0,
        },
      },
    ];

    const reformingStage = [
      {
        $addFields: {
          "interactions.likes": {
            $mergeObjects: [
              { count: "$interactions.likes.count" },
              {
                isInteracted: {
                  $ne: [
                    { $ifNull: [`$interactions.likes.users.${user_id}`, null] },
                    null,
                  ],
                },
              },
            ],
          },
          "interactions.saves": {
            $mergeObjects: [
              { count: "$interactions.saves.count" },
              {
                isInteracted: {
                  $ne: [
                    { $ifNull: [`$interactions.saves.users.${user_id}`, null] },
                    null,
                  ],
                },
              },
            ],
          },
          "interactions.remeows": {
            $mergeObjects: [
              { count: "$interactions.remeows.count" },
              {
                isInteracted: {
                  $ne: [
                    {
                      $ifNull: [`$interactions.remeows.users.${user_id}`, null],
                    },
                    null,
                  ],
                },
              },
            ],
          },
        },
      },
      //remeows
      {
        $addFields: {
          isRemeow: {
            $cond: {
              if: { $ne: ["$isRemeow", null] }, // Check if isRemeow is not null
              then: {
                id: "$isRemeow",
                status: true,
              },
              else: { status: false },
            },
          },
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "isRemeow.id", // The ID of the reposted post
          foreignField: "post_id",
          as: "isRemeowData",
        },
      },
      {
        $set: {
          isRemeowData: { $arrayElemAt: ["$isRemeowData", 0] },
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "user_id",
          localField: "isRemeowData.user_id",
          as: "originalPoster",
        },
      },
      {
        $addFields: {
          originalPoster: { $arrayElemAt: ["$originalPoster", 0] },
        },
      },
      {
        $addFields: {
          "isRemeow.originalPost": "$isRemeowData",
        },
      },
      {
        $addFields: {
          "isRemeow.originalPost.postedBy": "$originalPoster",
        },
      },
      {
        $match: {
          $nor: [
            { "isRemeow.status": true, "isRemeow.originalPost": { $eq: {} } },
          ],
        },
      },
    ];

    if (user && !filter) {
      if (!findUserId) throwError("User was not found", 400);
      defaultQuery = [
        { $match: { user_id: findUserId.user_id } },
        { $sort: { createdAt: -1 } },
        ...defaultQuery,
        ...reformingStage,
        ...projectionSatge,
      ];
    } else if (filter && user_id === findUserId.user_id) {
      defaultQuery = [
        {
          $match: {
            [`interactions.saves.users.${user_id}`]: { $exists: true },
          },
        },
        { $sort: { createdAt: -1 } },

        ...defaultQuery,
        ...reformingStage,
        ...projectionSatge,
      ];
    } else {
      defaultQuery = [
        ...defaultQuery,
        ...algoStage,
        ...reformingStage,
        ...projectionSatge,
      ];
    }

    const result = await Posts.aggregate(defaultQuery, {
      allowDiskUse: true,
    });

    return res.json(result);
  } catch (err) {
    console.log(err);
    handleError(res, err);
  }
};

const LoadPosts = async (req, res) => {
  const user_id = req.session.user_id;
  const { filter } = req.query || null;
  const { user } = req.query || null;
  const loadedPosts = req.body.loadedPosts || [];

  const skipCache = user || filter;

  if (!skipCache) {
    const cacheKey = `user:${user_id}:posts`;
    const cachedPosts = await redis.lrange(cacheKey, 0, -1);

    if (cachedPosts.length > 0) {
      const filteredCachedPosts = cachedPosts
        .map((post) => JSON.parse(post))
        .filter((post) => !loadedPosts.includes(post.post_id));
      const result = filteredCachedPosts.slice(0, 15);
      return res.json(result);
    }
  }

  const findUserId = await Users.findOne({ userTag: user }, { user_id: 1 });
  const findReqMaker = await Users.findOne({ user_id: user_id }).lean();
  const algoStage = [
    // { $sample: { size: 1 } },
    {
      $addFields: {
        isFollowingAuthor: {
          $gt: [
            {
              $getField: {
                field: "$postedBy.user_id",
                input: findReqMaker.following.users,
              },
            },
            null,
          ],
        },
        isFollowedByAuthor: {
          $gt: [
            {
              $getField: {
                field: "$postedBy.user_id",
                input: findReqMaker.followers.users,
              },
            },
            null,
          ],
        },
        follwoingFactor: {
          $ifNull: [
            {
              $getField: {
                field: "$postedBy.user_id",
                input: findReqMaker.following.users,
              },
            },
            null,
          ],
        },
        myEngagement: {
          $ifNull: [
            {
              $getField: {
                field: "$postedBy.user_id",
                input: findReqMaker.engagements,
              },
            },
            { interactionCount: 0, lastInteraction: null },
          ],
        },
      },
    },

    {
      $addFields: {
        authorEngagement: {
          $ifNull: [
            `$postedBy.engagements.${user_id}`,
            { interactionCount: 0, lastInteraction: null },
          ],
        },
      },
    },

    {
      $addFields: {
        authorEngagementWeight: {
          $switch: {
            branches: [
              {
                case: {
                  $gte: [
                    "$authorEngagement.lastInteraction",
                    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.3,
              },
              {
                case: {
                  $gte: [
                    "$authorEngagement.lastInteraction",
                    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.15,
              },
              {
                case: {
                  $gte: [
                    "$authorEngagement.lastInteraction",
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.08,
              },
            ],
            default: 0,
          },
        },
        myEngagementWeight: {
          $switch: {
            branches: [
              {
                case: {
                  $gte: [
                    "$myEngagement.lastInteraction",
                    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.5,
              },
              {
                case: {
                  $gte: [
                    "$myEngagement.lastInteraction",
                    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.2,
              },
              {
                case: {
                  $gte: [
                    "$myEngagement.lastInteraction",
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.1,
              },
            ],
            default: 0,
          },
        },
      },
    },

    {
      $addFields: {
        engagementsRankingScore: {
          $add: [
            {
              $divide: [
                {
                  $multiply: [
                    "$authorEngagement.interactionCount",
                    "$authorEngagementWeight",
                  ],
                },
                { $multiply: [{ $rand: {} }, 10] },
              ],
            },
            {
              $divide: [
                {
                  $multiply: [
                    "$myEngagement.interactionCount",
                    "$myEngagementWeight",
                  ],
                },
                { $multiply: [{ $rand: {} }, 10] },
              ],
            },
            {
              $divide: [
                "$engagementScore",
                {
                  $cond: {
                    if: { $eq: ["$postedBy.postsCount", 0] },
                    then: 1,
                    else: "$postedBy.postsCount",
                  },
                },
              ],
            },
          ],
        },
      },
    },

    {
      $addFields: {
        timeFactor: {
          $switch: {
            branches: [
              {
                case: {
                  $gte: [
                    "$createdAt",
                    new Date(Date.now() - 24 * 60 * 60 * 1000),
                  ],
                },
                then: 5,
              },
              {
                case: {
                  $gte: [
                    "$createdAt",
                    new Date(Date.now() - 35 * 60 * 60 * 1000),
                  ],
                },
                then: 1.2,
              },
              {
                case: {
                  $gte: [
                    "$createdAt",
                    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.5,
              },
              {
                case: {
                  $gte: [
                    "$createdAt",
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ],
                },
                then: 0.2,
              },
            ],
            default: 0.1,
          },
        },
        followFactor: {
          $cond: { if: "$isFollowingAuthor", then: 1.6, else: 0.5 },
        },
        followedByFactor: {
          $cond: { if: "$isFollowedByAuthor", then: 1.1, else: 1 },
        },
        randomValueFactor: {
          $multiply: [{ $rand: {} }, 99],
        },
      },
    },
    {
      $addFields: {
        rankingScore: {
          $multiply: [
            { $add: ["$engagementsRankingScore", 1] },
            {
              $multiply: [
                "$timeFactor",
                "$followFactor",
                "$followedByFactor",
                "$randomValueFactor",
              ],
            },
          ],
        },
      },
    },

    { $sort: { rankingScore: -1, createdAt: -1 } },

    { $limit: 15 },
  ];

  let defaultQuery = [
    { $match: { post_id: { $nin: loadedPosts } } },

    // { $sort: { createdAt: -1, engagementScore: -1 } },
    {
      $lookup: {
        from: "users",
        foreignField: "user_id",
        localField: "user_id",
        as: "postedBy",
      },
    },
    {
      $match: {
        postedBy: {
          $ne: [],
        },
      },
    },
    {
      $set: {
        postedBy: {
          $arrayElemAt: ["$postedBy", 0],
        },
      },
    },

    //interactions
  ];

  const projectionSatge = [
    {
      $project: {
        "postedBy.password": 0,
        "postedBy.folder": 0,
        "postedBy.cover": 0,
        "postedBy.pfp": 0,
        "postedBy.generalInfo": 0,
        "postedBy.meowments": 0,
        "postedBy._id": 0,
        "postedBy.postsCount": 0,
        "postedBy.followers": 0,
        "postedBy.following": 0,
        "postedBy.user_id": 0,
        "postedBy.engagements": 0,
        "isRemeow.originalPost.isRemeow": 0,
        "isRemeow.originalPost.__v": 0,
        "isRemeow.originalPost._id": 0,
        "isRemeow.originalPost.user_id": 0,
        "isRemeow.originalPost.postedBy.password": 0,
        "isRemeow.originalPost.postedBy.folder": 0,
        "isRemeow.originalPost.postedBy._id": 0,
        "isRemeow.originalPost.postedBy.pfp": 0,
        "isRemeow.originalPost.postedBy.cover": 0,
        "isRemeow.originalPost.postedBy.meowments": 0,
        "isRemeow.originalPost.postedBy.generalInfo": 0,
        "isRemeow.originalPost.postedBy.followers": 0,
        "isRemeow.originalPost.postedBy.postsCount": 0,
        "isRemeow.originalPost.postedBy.engagements": 0,
        "isRemeow.originalPost.interactions": 0,
        "isRemeow.originalPost.postedBy.following": 0,
        "isRemeow.originalPost.engagementScore": 0,
        tempInteractions: 0,
        "isRemeow.id": 0,
        user_id: 0,
        _id: 0,
        isRemeowData: 0,
        originalPoster: 0,
        // engagementScore: 0,
        __v: 0,
      },
    },
  ];

  const reformingStage = [
    {
      $addFields: {
        "interactions.likes": {
          $mergeObjects: [
            { count: "$interactions.likes.count" },
            {
              isInteracted: {
                $ne: [
                  { $ifNull: [`$interactions.likes.users.${user_id}`, null] },
                  null,
                ],
              },
            },
          ],
        },
        "interactions.saves": {
          $mergeObjects: [
            { count: "$interactions.saves.count" },
            {
              isInteracted: {
                $ne: [
                  { $ifNull: [`$interactions.saves.users.${user_id}`, null] },
                  null,
                ],
              },
            },
          ],
        },
        "interactions.remeows": {
          $mergeObjects: [
            { count: "$interactions.remeows.count" },
            {
              isInteracted: {
                $ne: [
                  {
                    $ifNull: [`$interactions.remeows.users.${user_id}`, null],
                  },
                  null,
                ],
              },
            },
          ],
        },
      },
    },
    //remeows
    {
      $addFields: {
        isRemeow: {
          $cond: {
            if: { $ne: ["$isRemeow", null] }, // Check if isRemeow is not null
            then: {
              id: "$isRemeow",
              status: true,
            },
            else: { status: false },
          },
        },
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "isRemeow.id", // The ID of the reposted post
        foreignField: "post_id",
        as: "isRemeowData",
      },
    },
    {
      $set: {
        isRemeowData: { $arrayElemAt: ["$isRemeowData", 0] },
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "user_id",
        localField: "isRemeowData.user_id",
        as: "originalPoster",
      },
    },
    {
      $addFields: {
        originalPoster: { $arrayElemAt: ["$originalPoster", 0] },
      },
    },
    {
      $addFields: {
        "isRemeow.originalPost": "$isRemeowData",
      },
    },
    {
      $addFields: {
        "isRemeow.originalPost.postedBy": "$originalPoster",
      },
    },
    {
      $match: {
        $nor: [
          { "isRemeow.status": true, "isRemeow.originalPost": { $eq: {} } },
        ],
      },
    },
  ];

  if (user && !filter) {
    if (!findUserId) throwError("User was not found", 400);
    defaultQuery = [
      { $match: { user_id: findUserId.user_id } },
      { $sort: { createdAt: -1 } },
      ...defaultQuery,
      ...reformingStage,
      ...projectionSatge,
    ];
  } else if (filter && user_id === findUserId.user_id) {
    defaultQuery = [
      {
        $match: {
          [`interactions.saves.users.${user_id}`]: { $exists: true },
        },
      },
      { $sort: { createdAt: -1 } },

      ...defaultQuery,
      ...reformingStage,
      ...projectionSatge,
    ];
  } else {
    defaultQuery = [
      ...defaultQuery,
      ...algoStage,
      ...reformingStage,
      ...projectionSatge,
    ];
  }

  const result = await Posts.aggregate(defaultQuery, {
    allowDiskUse: true,
  });

  return res.json(result);
};
const LoadPost = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { id } = req.params;

    const defaultQuery = [
      {
        $match: { post_id: id },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "user_id",
          localField: "user_id",
          as: "postedBy",
          pipeline: [{ $limit: 1 }],
        },
      },
      {
        $match: {
          postedBy: {
            $ne: [],
          },
        },
      },
      {
        $set: {
          postedBy: {
            $arrayElemAt: ["$postedBy", 0],
          },
        },
      },

      // interactions
      {
        $addFields: {
          "interactions.likes": {
            $mergeObjects: [
              { count: "$interactions.likes.count" },
              {
                isInteracted: {
                  $ne: [
                    { $ifNull: [`$interactions.likes.users.${user_id}`, null] },
                    null,
                  ],
                },
              },
            ],
          },
          "interactions.saves": {
            $mergeObjects: [
              { count: "$interactions.saves.count" },
              {
                isInteracted: {
                  $ne: [
                    { $ifNull: [`$interactions.saves.users.${user_id}`, null] },
                    null,
                  ],
                },
              },
            ],
          },
          "interactions.remeows": {
            $mergeObjects: [
              { count: "$interactions.remeows.count" },
              {
                isInteracted: {
                  $ne: [
                    {
                      $ifNull: [`$interactions.remeows.users.${user_id}`, null],
                    },
                    null,
                  ],
                },
              },
            ],
          },
        },
      },
      // comments

      // isRemeow
      {
        $addFields: {
          isRemeow: {
            $cond: {
              if: { $ne: ["$isRemeow", null] }, // Check if isRemeow is not null
              then: {
                id: "$isRemeow",
                status: true,
              },
              else: { status: false },
            },
          },
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "isRemeow.id", // The ID of the reposted post
          foreignField: "post_id",
          as: "isRemeowData",
        },
      },
      {
        $set: {
          isRemeowData: { $arrayElemAt: ["$isRemeowData", 0] },
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "user_id",
          localField: "isRemeowData.user_id",
          as: "originalPoster",
        },
      },
      {
        $unwind: {
          path: "$originalPoster",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "isRemeow.originalPost": "$isRemeowData",
        },
      },
      {
        $addFields: {
          "isRemeow.originalPost.postedBy": "$originalPoster",
        },
      },
      {
        $project: {
          "postedBy.password": 0,
          "postedBy.folder": 0,
          "postedBy.cover": 0,
          "postedBy.pfp": 0,
          "postedBy.generalInfo": 0,
          "postedBy.meowments": 0,
          "postedBy._id": 0,
          "postedBy.postsCount": 0,
          "postedBy.followers": 0,
          "postedBy.following": 0,
          "postedBy.user_id": 0,

          "isRemeow.originalPost.isRemeow": 0,
          "isRemeow.originalPost.__v": 0,
          "isRemeow.originalPost._id": 0,
          "isRemeow.originalPost.user_id": 0,
          "isRemeow.originalPost.postedBy.password": 0,
          "isRemeow.originalPost.postedBy.folder": 0,
          "isRemeow.originalPost.postedBy._id": 0,
          "isRemeow.originalPost.postedBy.pfp": 0,
          "isRemeow.originalPost.postedBy.cover": 0,
          "isRemeow.originalPost.postedBy.meowments": 0,
          "isRemeow.originalPost.postedBy.generalInfo": 0,
          "isRemeow.originalPost.postedBy.followers": 0,
          "isRemeow.originalPost.postedBy.postsCount": 0,
          "isRemeow.originalPost.interactions": 0,
          "isRemeow.originalPost.postedBy.following": 0,
          tempInteractions: 0,

          "isRemeow.id": 0,
          user_id: 0,
          _id: 0,
          isRemeowData: 0,
          originalPoster: 0,
          __v: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $match: {
          $nor: [
            { "isRemeow.status": true, "isRemeow.originalPost": { $eq: {} } },
          ],
        },
      },
    ];

    const post = await Posts.aggregate(defaultQuery);

    if (!post.length) {
      return res.status(404).send("Post not found");
    }

    return res.json(post[0]);
  } catch (err) {
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
};

const LoadVirals = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 2);
    const findVirals = await Posts.aggregate([
      {
        $match: {
          createdAt: { $gte: oneMonthAgo },
          isRemeow: null,
        },
      },

      {
        $sort: { engagmentScore: -1, createdAt: -1 },
      },
      {
        $limit: 5,
      },

      {
        $lookup: {
          localField: "user_id",
          foreignField: "user_id",
          from: "users",
          as: "postedBy",
        },
      },
      {
        $set: {
          postedBy: { $arrayElemAt: ["$postedBy", 0] },
          postText: "$postBody.text",
        },
      },

      {
        $project: {
          post_id: 1,
          interactionsCount: 1,
          "postedBy.userTag": 1,
          "postedBy.firstName": 1,
          "postedBy.lastName": 1,
          createdAt: 1,
          postText: 1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.json(findVirals);
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
};
async function handleInteraction(req, res, interactionType) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).send("Post was not found");
    const findPost = await Posts.findOne({ post_id: id }).lean();
    if (!findPost) return res.status(400).send("Post was not found");
    const findUser = await Users.findOne({ user_id: findPost.user_id });

    const { isInteracted } = req.body;
    const userId = req.session.user_id;

    switch (isInteracted) {
      case true:
        await addInteraction();
        break;
      case false:
        await removeInteraction();
        break;
      default:
        throwError("An error occurred", 500);
        break;
    }

    async function addInteraction() {
      if (interactionType === "like") {
        const findOgUser = await Users.findOne({ user_id: userId });
        await addPawprint(
          { user_id: userId, userTag: findOgUser.userTag },
          "purr",
          {
            type: "post",
            post: {
              id: id,
              postedBy: {
                userTag: findUser.userTag,
                firstName: findUser.firstName,
                lastName: findUser.lastName,
              },
            },
          }
        );
      }
      if (
        findPost.interactions[`${interactionType}s`].users.hasOwnProperty(
          userId
        )
      )
        throwError("This post was already interacted with", 400);

      const newInteraction = new Interactions({
        user_id: userId,
        post_id: id,
        type: interactionType,
      });

      await broadcastNotifications(userId, findPost.user_id, {
        target: "post",
        action: interactionType,
        targetId: id,
      });

      await Promise.all([
        newInteraction.save(),
        Posts.updateOne(
          { post_id: id },
          {
            $inc: { [`interactions.${interactionType}s.count`]: 1 },
            $set: {
              [`interactions.${interactionType}s.users.${userId}`]: true,
            },
          }
        ),
        findUser.user_id != userId
          ? updateEngagementScore(id, "add", interactionType)
          : "",
        findUser.user_id != userId
          ? updateUserEngagement(findUser.user_id, userId, 1)
          : "",
      ]);
    }
    async function removeInteraction() {
      if (
        !findPost.interactions[`${interactionType}s`].users.hasOwnProperty(
          userId
        )
      )
        throwError("Post was not interacted with", 400);
      await Promise.all([
        Interactions.deleteOne({
          type: interactionType,
          post_id: id,
          user_id: userId,
        }),

        Posts.updateOne(
          { post_id: id },
          {
            $inc: { [`interactions.${interactionType}s.count`]: -1 },
            $unset: {
              [`interactions.${interactionType}s.users.${userId}`]: "",
            },
          }
        ),
        findUser.user_id != userId &&
          updateEngagementScore(id, "remove", interactionType),
        findUser.user_id != userId &&
          updateUserEngagement(findUser.user_id, userId, -1),
      ]);
    }

    await broadcasrInteractions(id, interactionType);

    return res.status(200).send("all done");
  } catch (err) {
    handleError(res, err);
  }
}

async function broadcasrInteractions(id, interactionType) {
  const { interactions } = await Posts.findOne(
    { post_id: id },
    { interactions: 1 }
  );

  const likesCount = interactions.likes.count;
  const savesCount = interactions.saves.count;

  const remeowsCount = interactions.remeows.count;

  const totalInteractions = likesCount + savesCount + remeowsCount;

  const io = getIO();
  io.to(id).emit(interactionType, {
    postId: id,
    likesCount,
    savesCount,
    remeowsCount,
    totalInteractions,
  });
}

const searchPosts = async (req, res) => {
  try {
    const user_id = req.session.user_id || "2";
    const alreadyLoaded = req.body.alreadyLoaded || [];
    const { searchQuery } = req.query;
    if (!searchQuery) throwError("No search query was provided", 400);
    const posts = await Posts.aggregate([
      {
        $match: {
          post_id: { $nin: alreadyLoaded },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "postedBy",
          pipeline: [
            { $limit: 1 },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                userTag: 1,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $set: {
          postedBy: { $first: "$postedBy" },
        },
      },
      {
        $match: {
          $or: [
            // Match within postBody.text (any part of a word)
            {
              "postBody.text": {
                $regex: `(^|\\s)${req.query.searchQuery}`,
                $options: "i",
              },
            },
            // Match exact user tag
            {
              "postedBy.userTag": req.query.searchQuery,
            },
            // Match first name (start of a word)
            {
              "postedBy.firstName": {
                $regex: `(^|\\s)${req.query.searchQuery}`,
                $options: "i",
              },
            },
            // Match last name (start of a word)
            {
              "postedBy.lastName": {
                $regex: `(^|\\s)${req.query.searchQuery}`,
                $options: "i",
              },
            },
            // Match first name + last name as a single string
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: ["$postedBy.firstName", " ", "$postedBy.lastName"],
                  },
                  regex: `(^|\\s)${req.query.searchQuery}`,
                  options: "i",
                },
              },
            },
          ],
        },
      },

      {
        $sort: { createdAt: -1, engagmentScore: -1 },
      },
      {
        $limit: 4,
      },
      {
        $addFields: {
          postText: "$postBody.text",
        },
      },
      {
        $set: { type: "post" },
      },
      {
        $project: {
          postBody: 0,
          comments: 0,
          user_id: 0,
          isRemeow: 0,
          interactions: 0,
          engagementScore: 0,
          commentsCount: 0,

          _id: 0,
        },
      },
    ]);

    return res.json(posts);
  } catch (error) {
    handleError(res, error);
  }
};

export {
  DeletePost,
  CreatePost,
  RemeowPost,
  PollVote,
  // DiscardAttachment,
  LoadVirals,
  LoadPosts,
  LoadPost,
  // ProcessImageUploads,
  // ProcessVideoUploads,
  handleInteraction,
  searchPosts,
};
