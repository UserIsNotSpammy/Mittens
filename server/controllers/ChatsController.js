import Users from "../db/usersSchema.js";
import Conversation from "../db/conversationSchema.js";
import Messages from "../db/messagesSchema.js";
import { handleError, throwError } from "../utils/helperFunctions.js";
import { getIO, usersSockets } from "../socket.js";
import { handleAttachments } from "../utils/processFIles.js";
import mongoose from "mongoose";

const LoadChats = async (req, res) => {
  try {
    const { filter } = req.query;
    const user_id = req.session.user_id;
    const loadedChats = req.body.loadedChats || [];

    if (!filter) {
      const test = await Conversation.aggregate([
        {
          $match: {
            participants: { $in: [user_id] },
            _id: {
              $nin: loadedChats.map((id) => new mongoose.Types.ObjectId(id)),
            }, // Match conversations where the user is a participant
          },
        },

        { $sort: { "lastMessage.createdAt": -1 } },
        { $limit: 10 },
        {
          $addFields: {
            targetedUserId: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$participants",
                    as: "participant",
                    cond: { $ne: ["$$participant", user_id] }, // Filter out the current user
                  },
                },
                0, // Get the first element (the other user)
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users", // Join with the Users collection
            localField: "targetedUserId",
            foreignField: "user_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails", // Unwind the userDetails array (since lookup returns an array)
        },
        {
          $lookup: {
            from: "messages", // Join with the Messages collection
            let: { targetUserId: "$targetedUserId", conversationId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$sender", "$$targetUserId"] }, // Messages sent by the other user
                      { $eq: ["$recipient", user_id] }, // Messages received by the current user
                      { $eq: ["$isSeen", false] }, // Unread messages
                    ],
                  },
                },
              },
              {
                $count: "unReadMsg", // Count the number of unread messages
              },
            ],
            as: "unreadMessages",
          },
        },
        {
          $addFields: {
            unReadMsg: { $arrayElemAt: ["$unreadMessages.unReadMsg", 0] }, // Extract the count of unread messages
          },
        },
        {
          $project: {
            _id: 1,
            userTag: "$userDetails.userTag",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            lastMsg: "$lastMessage.text",
            lastMsgDate: "$lastMessage.createdAt",
            unReadMsg: { $ifNull: ["$unReadMsg", 0] }, // Default to 0 if no unread messages
          },
        },
      ]);
      return res.json(test);
    } else {
      const chats = await Users.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { firstName: { $regex: `^${filter}`, $options: "i" } }, // First name starts with filter
                  { lastName: { $regex: `^${filter}`, $options: "i" } }, // Last name starts with filter
                  { userTag: filter }, // Exact match for userTag
                  {
                    $expr: {
                      $regexMatch: {
                        input: { $concat: ["$firstName", " ", "$lastName"] },
                        regex: filter, // Matches any part of the full name
                        options: "i",
                      },
                    },
                  },
                ],
              },
              { user_id: { $ne: user_id } },
              {
                _id: {
                  $nin: loadedChats.map(
                    (id) => new mongoose.Types.ObjectId(id)
                  ),
                },
              },
            ],
          },
        },
        { $limit: 10 },

        {
          $lookup: {
            from: "conversations",
            let: { userId: "$user_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$$userId", "$participants"] },
                      { $in: [user_id, "$participants"] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "conversation",
          },
        },
        {
          $set: {
            conversation: { $arrayElemAt: ["$conversation", 0] },
          },
        },
        {
          $addFields: {
            lastMsg: {
              $ifNull: ["$conversation.lastMessage.text", null], // Set to null if no conversation exists
            },
            lastMsgDate: {
              $ifNull: ["$conversation.lastMessage.createdAt", null], // Set to null if no conversation exists
            },
          },
        },

        {
          $project: {
            _id: 1,
            userTag: 1,
            firstName: 1,
            lastName: 1,
            lastMsg: 1,
            lastMsgDate: 1,
            unReadMsg: { $ifNull: ["$unReadMsg", 0] }, // Default to 0 if no unread messages
          },
        },
      ]);

      return res.json(chats);
    }
  } catch (err) {
    handleError(res, err);
  }
};

const LoadMessages = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const { userTag } = req.params;
    const fetchedMessages = req.body.fetchedMessages || [];
    const findUser = await Users.findOne({ userTag: userTag }).lean();
    if (!findUser) throwError("User was not found", 404);

    const findMessages = await Messages.aggregate([
      {
        $match: {
          _id: {
            $nin: fetchedMessages.map((id) => new mongoose.Types.ObjectId(id)),
          },
          $or: [
            { sender: user_id, recipient: findUser.user_id },
            { sender: findUser.user_id, recipient: user_id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 15 },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "recipient",
          foreignField: "user_id",
          as: "recipientData",
          pipeline: [{ $limit: 1 }],
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "user_id",
          as: "senderData",
          pipeline: [{ $limit: 1 }],
        },
      },
      {
        $addFields: {
          sender: { $arrayElemAt: ["$senderData", 0] },
          recipient: { $arrayElemAt: ["$recipientData", 0] },
        },
      },

      {
        $project: {
          messageBody: 1,
          createdAt: 1,
          "sender.userTag": 1,
          "sender.firstName": 1,
          "sender.lastName": 1,
          "recipient.userTag": 1,
          "recipient.firstName": 1,
          "recipient.lastName": 1,
          isSeen: 1,
          _id: 1,
        },
      },
    ]);

    if (findMessages.length)
      await MarkMessageAsSeen(
        findMessages[findMessages.length - 1].createdAt,
        findUser.user_id,
        user_id
      );
    return res.json(findMessages);
  } catch (err) {
    // handleError(err);
    console.log(err);
  }
};

const MarkMessageAsSeen = async (latestMessage, sender, recipient) => {
  await Messages.updateMany(
    {
      sender: sender,
      recipient: recipient,
      createdAt: { $lte: latestMessage },
      isSeen: false,
    },
    { isSeen: true }
  );
};
const CreateMessage = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const senderUserTag = req.session.userTag;

    const findSender = await Users.findOne({ user_id: user_id });
    const { userTag } = req.params;
    const { data } = req.body;

    if (!data) throwError("Message body is empty", 400);

    if (
      !data.text.trim() &&
      (!data.attachments || data.attachments.length === 0)
    )
      throwError("Message body is empty", 400);

    const findRecipient = await Users.findOne({ userTag: userTag });
    if (!findRecipient) throwError("User wan not found", 404);

    switch (!!data.attachments.length) {
      case true:
        await handleAttachments(
          "chats",
          data.attachments,
          async (attachments, flag) => {
            let msgBody = {
              text: data.text || "",
              image: flag ? attachments : null, //
              video: flag ? null : attachments[0],
            };

            await addMessage(findSender, msgBody, findRecipient);
          }
        );
        break;
      case false:
        await addMessage(
          findSender,
          {
            text: data.text,
            image: null, //
            video: null,
          },
          findRecipient
        );
        break;
    }
    return res.status(200).json({});
  } catch (err) {
    handleError(res, err);
  }

  async function addMessage(sender, body, recipient) {
    const findConversation = await Conversation.findOne({
      participants: { $all: [sender.user_id, recipient.user_id] },
    });

    const io = getIO();
    const chatRoomId = [sender.userTag, recipient.userTag].sort().join("");
    console.log(chatRoomId);
    const recipientSockets = usersSockets.get(recipient.user_id) || new Set();
    console.log(recipientSockets);
    const recipientIsOnline = [...recipientSockets].some((socketId) =>
      io.sockets.adapter.rooms.get(chatRoomId)?.has(socketId)
    );

    const newMessage = new Messages({
      sender: sender.user_id,
      recipient: recipient.user_id,
      messageBody: body,
      isSeen: recipientIsOnline,
    });

    let conversation;
    if (!findConversation) {
      conversation = new Conversation({
        participants: [sender.user_id, recipient.user_id],
        lastMessage: {
          text: body.text || null,
          sender: sender.user_id,
          createdAt: new Date(),
        },
      });

      // Save both the new message and the new conversation
      await Promise.all([newMessage.save(), conversation.save()]);
    } else {
      const [message, updatedConversation] = await Promise.all([
        newMessage.save(),
        Conversation.findOneAndUpdate(
          {
            participants: { $all: [sender.user_id, recipient.user_id] },
          },
          {
            $set: {
              lastMessage: {
                text: body.text,
                sender: sender.user_id,
                createdAt: new Date(),
              },
            },
          },
          { new: true }
        ),
      ]);

      conversation = updatedConversation;
    }

    const boradCastedMessage = {
      sender: {
        firstName: sender.firstName,
        lastName: sender.lastName,
        userTag: sender.userTag,
      },
      recipient: {
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        userTag: recipient.userTag,
      },
      messageBody: {
        ...newMessage.messageBody,
      },
      createdAt: new Date(),
      isSeen: newMessage.isSeen,
      _id: newMessage._id,
    };

    if (!recipientIsOnline) {
      io.to(recipient.userTag).emit("messageNotification", {
        ...boradCastedMessage,
        conversation_id: conversation._id,
      });
    }

    io.to(chatRoomId).emit("message", boradCastedMessage);
  }
};

export { LoadChats, LoadMessages, CreateMessage, MarkMessageAsSeen };
