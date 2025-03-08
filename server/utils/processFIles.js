import path from "path";
import mime from "mime-types";
import sharp from "sharp";
import { throwError } from "./helperFunctions.js"; // Adjust the import path as needed
import { __temp, __uploads } from "../config.js"; // Adjust the import path as needed
import { readFile, unlink } from "fs/promises";
import fs from "fs"; // For unlink and readFile
import { fileTypeFromBuffer } from "file-type"; // For detecting video file types
import imageType from "image-type";
import { processVideo, getVideoMetadata } from "./helperFunctions.js";
async function handleAttachments(destination, attachments, callback) {
  try {
    console.log(destination);
    let processedAttachments = [];
    let flag;
    if (attachments.length > 1) {
      const allImages = attachments.every((attachment) => {
        const mimetype = mime.lookup(path.join(__temp, attachment));
        return mimetype && mimetype.includes("image");
      });

      if (!allImages) {
        throwError(
          "All attachments must be images when there are multiple files.",
          400
        );
      }

      // Set flag to true for images
      flag = true;

      // Process all images
      processedAttachments = await Promise.all(
        attachments.map(async (attachment) => {
          const inputPath = path.join(__temp, attachment);
          const outputPath = path.join(
            __uploads,
            `${destination}/${attachment}`
          );

          // Extract metadata
          const metadata = await sharp(inputPath).metadata();

          // Process and save image
          await sharp(inputPath)
            .rotate()
            .resize(800)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(outputPath);

          return {
            fileName: attachment,
            metadata: {
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
            },
          };
        })
      );
    } else {
      // Handle single attachment case
      const mimetype = mime.lookup(path.join(__temp, attachments[0]));

      if (mimetype && mimetype.includes("image")) {
        // It's a single image
        flag = true;

        const metadata = await sharp(
          path.join(__temp, attachments[0])
        ).metadata();
        processedAttachments = [
          {
            fileName: attachments[0],
            metadata: {
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
            },
          },
        ];
        // Process the single image
        await sharp(path.join(__temp, attachments[0]))
          .resize(800)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(path.join(__uploads, `${destination}/${attachments[0]}`));
      } else if (mimetype && mimetype.includes("video")) {
        // It's a video
        flag = false;

        // Process the video
        await processVideo(
          path.join(__temp, attachments[0]),
          path.join(__uploads, `${destination}/${attachments[0]}`)
        );
        const metadata = await getVideoMetadata(
          path.join(__uploads, `${destination}/${attachments[0]}`)
        );
        processedAttachments = [
          {
            fileName: attachments[0],
            metadata: metadata,
          },
        ];
      } else {
        throwError("Invalid attachment type. Must be an image or video.", 400);
      }
    }

    await callback(processedAttachments, flag);
  } catch (error) {
    console.log(error);
    throwError("An error occurred while processing your media.", 500);
  }
}

const ProcessImageUploads = async (req, res) => {
  try {
    if (!req.file)
      throwError("An error occurred while uploading the file", 400);
    if (req.file.size > 25 * 1024 * 1024) {
      await unlink(req.file.path);
      throwError("File is too large", 413);
    }
    const fileBuffer = await readFile(req.file.path);
    if (!(await imageType(fileBuffer))) {
      await unlink(req.file.path);
      throwError("Invalid file type", 400);
    }

    res.status(200).json({ status: true, message: req.file.filename });
  } catch (err) {
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
}; //semitfinished-login

const ProcessVideoUploads = async function (req, res) {
  try {
    if (!req.file)
      throwError("An error occurred while uploading your file", 400);

    if (req.file.size > 1000 * 1024 * 1024) {
      await unlink(req.file.path);
      throwError("File is too large", 413);
    }
    try {
      const type = await fileTypeFromBuffer(fs.readFileSync(req.file.path));
      const validTypes = [
        "video/mp4",
        "video/x-msvideo",
        "video/x-flv",
        "video/quicktime",
        "video/x-matroska",
        "video/webm",
      ];

      if (!type || !validTypes.includes(type.mime)) {
        await unlink(req.file.path);
        return res.status(400).send("Invalid file type");
      }

      res.status(200).json({ status: true, message: req.file.filename });
    } catch (error) {
      await unlink(req.file.path);
      throwError(
        "An error occurred while processing the file",
        500,
        error.message
      );
    }
  } catch (err) {
    console.log(err);
    return res
      .status(err.status || 500)
      .send(err.message || "Unknown error occurred");
  }
};
export { handleAttachments, ProcessImageUploads, ProcessVideoUploads };
