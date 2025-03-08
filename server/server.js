import express from "express";
import { initSocketIO } from "./socket.js"; // Import the function
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
import posts from "./routes/posts.js";
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import { __uploads } from "./config.js";
import { createServer } from "http"; // Import http module to create server
import comments from "./routes/comments.js";
import chats from "./routes/chats.js";
import MongoStore from "connect-mongo";

import "./test.js";

import {
  LoadImage,
  throwError,
  LoadMeowment,
  LoadVideo,
} from "./utils/helperFunctions.js";

const app = express();
const server = createServer(app);
initSocketIO(server);

mongoose.connect("mongodb://localhost:27017/kitty");

const sessionMiddleware = session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/kitty",
    collectionName: "sessions",
  }),
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 3, httpOnly: true },
});
app.use(sessionMiddleware);

app.use(cookieParser("for real yoo"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/posts", posts);
app.use("/posts/:post_id/comments", comments);

app.use("/users", users);
app.use("/auth", auth);
app.use("/chats", chats);
app.get("/loadImage/:type/:id", LoadImage);
app.get("/LoadMeowment/:id/:key", LoadMeowment);
app.get("/loadVideo/:type/:id", LoadVideo);

server.listen(3000);
export { sessionMiddleware };
