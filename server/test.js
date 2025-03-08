import Redis from "ioredis";
import Users from "./db/usersSchema.js";
import { Posts } from "./db/postsSchema.js";

const redis = new Redis();

async function fetchPersonalizedPostsForUser(user_id) {
  const findReqMaker = await Users.findOne({ user_id: user_id });
  const algoStage = [
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

    { $limit: 300 },
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
  const defaultQuery = [
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

    ...algoStage,
    ...reformingStage,
    ...projectionSatge,
    // Include personalization logic
  ];
  const result = await Posts.aggregate(defaultQuery, { allowDiskUse: true });
  return result.slice(0, 300);
}

async function cachePersonalizedPostsForAllUsers() {
  try {
    const users = await Users.find({}, { user_id: 1 });

    for (const user of users) {
      const user_id = user.user_id;
      const personalizedPosts = await fetchPersonalizedPostsForUser(user_id);

      if (personalizedPosts.length > 0) {
        const cacheKey = user_id;
        const postsToCache = personalizedPosts.map((post) =>
          JSON.stringify(post)
        );
        await redis.del(cacheKey);
        await redis.lpush(cacheKey, ...postsToCache);
        await redis.ltrim(cacheKey, 0, 299);
        await redis.expire(cacheKey, 3600);
      }
    }

    console.log("Caching completed for all users.");
  } catch (err) {
    console.error("Error caching personalized posts:", err);
  }
}

setInterval(cachePersonalizedPostsForAllUsers, 60 * 60 * 1000);

cachePersonalizedPostsForAllUsers();

export default redis;
