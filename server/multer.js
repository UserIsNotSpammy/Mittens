import multer from "multer";
import { __temp, __uploads } from "./config.js";
import { randomBytes } from "crypto";
import { unlink } from "fs/promises";
import path from "path";

const storage = multer.diskStorage({
  destination: __temp,
  filename: (req, file, cb) => {
    const FileName =
      randomBytes(16).toString("hex") +
      Date.now() +
      path.extname(file.originalname);
    req.filePath = path.join(__temp, FileName);
    cb(null, FileName);
  },
});

const fileFilter = function (req, file, callback) {
  req.on("aborted", () => {
    if (file.stream) {
      file.stream.on("end", async () => {
        await unlink(req.filePath);
        callback(new Error("err"), false);
      });
      file.stream.emit("end");
    }
  });
  callback(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export { upload };
