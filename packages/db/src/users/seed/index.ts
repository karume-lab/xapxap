import path from "node:path";
import { db } from "@db/client";
import { supabase, uploadMediaFile } from "@db/seed/utils/uploadMedia";
import { profiles } from "@db/users/schema";
import data from "./data.json";

export const seedUsers = async () => {
  console.log("  Uploading user avatars & creating auth users...");

  const profilesToInsert = await Promise.all(
    data.map(async (user) => {
      const { avatarFile, email, phone, password, ...rest } = user;

      // Create auth user
      const { error: authError } = await supabase.auth.admin.createUser({
        id: rest.id,
        email,
        phone,
        password,
        email_confirm: true,
        phone_confirm: true,
      });

      if (authError) {
        if (authError.message.includes("already exists")) {
          console.log(`  Auth user ${email} already exists, skipping creation.`);
        } else {
          console.error(`  Failed to create auth user ${email}:`, authError.message);
        }
      }

      let avatarUrl = null;
      if (avatarFile) {
        const localPath = path.resolve(__dirname, `../../seed/assets/${avatarFile}`);
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
