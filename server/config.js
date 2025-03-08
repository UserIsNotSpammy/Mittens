import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Posts } from "./db/postsSchema.js";
import sharp from "sharp";
import { getVideoMetadata } from "./utils/helperFunctions.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __uploads = path.join(__dirname, "uploads");
const __temp = path.join(__dirname, "temp");

const deleteOldFiles = () => {
  const now = Date.now();

  fs.readdir(__temp, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(__temp, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }

        const fileAge = (now - stats.mtimeMs) / 1000;
        // if (fileAge > 5 * 3600) {
        if (fileAge > 5 * 60) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log(`Deleted: ${file}`);
            }
          });
        }
      });
    });
  });
};

setInterval(deleteOldFiles, 1000);
// setInterval(deleteOldFiles, 10 * 3600 * 1000);

const checkForErrors = async () => {
  try {
    let faultyPostsIds = [];
    // posts.forEach((post) => {
    //   post.postBody?.image?.forEach(async (image) => {
    //     // if (!fs.existsSync(path.join(__uploads, "/posts", image))) {
    //     //   faultyPostsIds.push(post.post_id);
    //     // }

    //   });
    // });
    // posts.forEach(async (post) => {
    //   if (fs.existsSync(path.join(__uploads, "/posts", post.postBody.video))) {
    //     const metadata = await getVideoMetadata(
    //       path.join(__uploads, `posts/${post.postBody.video}`)
    //     );
    //     const img = {
    //       fileName: post.postBody.video,
    //       metadata: metadata,
    //     };

    //     await Posts.updateOne(
    //       { post_id: post.post_id },
    //       { $set: { "postBody.image": null, "postBody.video": img } }
    //     );
    //   }
    // });

    // await Posts.deleteMany({
    //   post_id: { $in: faultyPostsIds },
    // }).lean();
  } catch (err) {
    console.log(err);
  }
};

checkForErrors();
export { __dirname, __uploads, __temp };
