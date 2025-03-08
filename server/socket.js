import { Server } from "socket.io";
import { sessionMiddleware } from "./server.js";

let io;
const usersSockets = new Map();

export function initSocketIO(server) {
  io = new Server(server, {
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on("connection", (socket) => {
    const session = socket.request.session;
    if (!session?.user_id) {
      return socket.disconnect(true);
    }

    console.log(`User connected: ${session.user_id}`);
    if (!usersSockets.has(session.user_id)) {
      usersSockets.set(session.user_id, new Set());
    }

    usersSockets.get(session.user_id).add(socket.id);

    socket.on("joinPostRoom", (postId) => {
      socket.join(postId);
    });

    socket.on("joinCommentRoom", (commentId) => {
      socket.join(commentId);
    });

    socket.on("joinNotificationsRoom", (userTag) => {
      socket.join(userTag);
    });

    socket.on("joinChatRoom", (chatRoom) => {
      if (!chatRoom) return;
      const chatRoomUsers = new Set(chatRoom.split("@").filter(Boolean));
      const currentUserTag = session.userTag.replace("@", "");
      if (!chatRoomUsers.has(currentUserTag)) {
        console.log("Access denied: You don't belong in this chat room.");
        return;
      }

      socket.join(chatRoom);
      console.log(`User ${session.userTag} joined room ${chatRoom}`);
    });

    socket.on("leaveChatRoom", (chatRoom) => {
      console.log(`User ${session.userTag} left room ${chatRoom}`);
      socket.leave(chatRoom);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${session.user_id}`);
      if (usersSockets.has(session.user_id)) {
        usersSockets.get(session.user_id).delete(socket.id);
        if (usersSockets.get(session.user_id).size === 0) {
          usersSockets.delete(session.user_id);
        }
      }
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export { getIO, usersSockets };
