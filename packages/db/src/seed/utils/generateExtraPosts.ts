import fs from "node:fs";
import path from "node:path";

const contentDataPath = path.resolve(__dirname, "../../content/seed/data.json");
const fameDataPath = path.resolve(__dirname, "../../fame/seed/data.json");

const contentData = JSON.parse(fs.readFileSync(contentDataPath, "utf8"));
const fameData = JSON.parse(fs.readFileSync(fameDataPath, "utf8"));

const mediaFiles = [
  { file: "img1.jpg", type: "image/jpeg" },
  { file: "img2.jpg", type: "image/jpeg" },
  { file: "bunny.mp4", type: "video/mp4" },
];

const authorIds = [
  "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "c02b2b1a-3e5e-4a64-9a8c-9b8a8e3d2f1b",
  "d13c3c2b-4f6f-5b75-ab9d-ac9b9f4e302c",
  "21e76024-c504-498a-8c15-e51042b2555a",
];

for (let i = 0; i < 15; i++) {
  const id = crypto.randomUUID();
  const media = mediaFiles[i % mediaFiles.length];

  contentData.fleetPosts.push({
    id,
    authorId: authorIds[i % authorIds.length],
    content: `Generated post ${i + 1} for fame burst testing! #trending`,
    mediaFile: media.file,
    mediaType: media.type,
  });

  fameData.push({
    postId: id,
    status: "fame_burst",
    viewsCount: 1000 + i * 100,
  });
}

fs.writeFileSync(contentDataPath, JSON.stringify(contentData, null, 2));
fs.writeFileSync(fameDataPath, JSON.stringify(fameData, null, 2));
console.log("Successfully added 15 posts to seed data.");
