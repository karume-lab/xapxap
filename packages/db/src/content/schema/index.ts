import { profiles } from "@db/users/schema";
import {
  type AnyPgColumn,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const fleetPosts = pgTable("fleet_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => fleetPosts.id, {
    onDelete: "cascade",
  }),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 20 }),
  checksum: text("checksum"),
  resolution: integer("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const polls = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .references(() => fleetPosts.id, { onDelete: "cascade" })
    .notNull(),
  question: text("question").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const pollOptions = pgTable("poll_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .references(() => polls.id, { onDelete: "cascade" })
    .notNull(),
  optionText: text("option_text").notNull(),
});

export const pollVotes = pgTable(
  "poll_votes",
  {
    optionId: uuid("option_id")
      .references(() => pollOptions.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.optionId, t.userId] }),
  })
);

export const postInteractions = pgTable(
  "post_interactions",
  {
    postId: uuid("post_id")
      .references(() => fleetPosts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 10 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.userId, t.type] }),
  })
);
