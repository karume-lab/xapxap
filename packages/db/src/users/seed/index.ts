import path from "node:path";
import { db } from "@db/client";
import { uploadMediaFile } from "@db/seed/utils/uploadMedia";
import { profiles } from "@db/users/schema";
import data from "./data.json";

export const seedUsers = async () => {
  console.log("  Uploading user avatars...");

  const profilesToInsert = await Promise.all(
    data.map(async (user) => {
      const { avatarFile, ...rest } = user;
      let avatarUrl = null;
      if (avatarFile) {
        const localPath = path.resolve(`../../apps/mobile/assets/fame/${avatarFile}`);
        avatarUrl = await uploadMediaFile("media", `avatars/${rest.id}/${avatarFile}`, localPath);
      }
      return { ...rest, avatarUrl };
    })
  );

  console.log("  Inserting profiles...");
  await db
    .insert(profiles)
    .values(profilesToInsert as (typeof profiles.$inferInsert)[])
    .onConflictDoNothing();
};
