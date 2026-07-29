import path from "node:path";
import { db } from "@db/client";
import {
  fleetPosts,
  pollOptions,
  polls,
  pollVotes,
  postInteractions,
  postTags,
  tags,
} from "@db/content/schema";
import { uploadMediaFile } from "@db/seed/utils/uploadMedia";
import data from "./data.json";

export const seedContent = async () => {
  console.log("  Uploading post media...");

  const postsToInsert = await Promise.all(
    data.fleetPosts.map(async (post) => {
      const { mediaFile, mediaType, ...rest } = post;
      let mediaUrl = null;
      if (mediaFile) {
        const localPath = path.resolve(`../../apps/mobile/assets/fame/${mediaFile}`);
        mediaUrl = await uploadMediaFile("media", `posts/${rest.id}/${mediaFile}`, localPath);
      }
      return { ...rest, mediaUrl, mediaType: mediaType || null };
    })
  );

  console.log("  Inserting fleet posts...");
  await db
    .insert(fleetPosts)
    .values(postsToInsert as (typeof fleetPosts.$inferInsert)[])
    .onConflictDoNothing();

  const tagMap = new Map<string, { id: string; count: number }>();
  const postTagsToInsert: { postId: string; tagId: string }[] = [];

  for (const post of data.fleetPosts) {
    if (!post.content) continue;
    const matches = post.content.match(/#[\w]+/g);
    if (matches) {
      for (const match of matches) {
        if (!tagMap.has(match)) {
          tagMap.set(match, { id: crypto.randomUUID(), count: 0 });
        }
        const t = tagMap.get(match);
        if (!t) continue;
        t.count++;
        postTagsToInsert.push({ postId: post.id, tagId: t.id });
      }
    }
  }

  if (tagMap.size > 0) {
    console.log("  Inserting tags...");
    const tagsToInsert = Array.from(tagMap.entries()).map(([tag, val]) => ({
      id: val.id,
      tag,
      count: val.count,
    }));
    await db.insert(tags).values(tagsToInsert).onConflictDoNothing();

    console.log("  Inserting post tags...");
    await db.insert(postTags).values(postTagsToInsert).onConflictDoNothing();
  }

  console.log("  Inserting polls...");
  await db
    .insert(polls)
    .values(
      data.polls.map((p) => ({
        ...p,
        expiresAt: new Date(p.expiresAt),
      })) as (typeof polls.$inferInsert)[]
    )
    .onConflictDoNothing();

  console.log("  Inserting poll options...");
  await db
    .insert(pollOptions)
    .values(data.pollOptions as (typeof pollOptions.$inferInsert)[])
    .onConflictDoNothing();

  console.log("  Inserting poll votes...");
  await db
    .insert(pollVotes)
    .values(data.pollVotes as (typeof pollVotes.$inferInsert)[])
    .onConflictDoNothing();

  console.log("  Inserting post interactions...");
  await db
    .insert(postInteractions)
    .values(data.postInteractions as (typeof postInteractions.$inferInsert)[])
    .onConflictDoNothing();
};
