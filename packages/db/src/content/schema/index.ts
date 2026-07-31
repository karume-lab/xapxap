import { profiles } from "@db/users/schema";
import {
  type AnyPgColumn,
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const fleetDecks = pgTable("fleet_decks", {
  id: uuid("id").primaryKey().defaultRandom(),
  captainId: uuid("captain_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 60 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  isOpen: boolean("is_open").default(true),
  memberCount: integer("member_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const fleetDeckMembers = pgTable(
  "fleet_deck_members",
  {
    deckId: uuid("deck_id")
      .references(() => fleetDecks.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 20 }).default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.deckId, t.userId] }),
  })
);

export const fleetPosts = pgTable("fleet_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => fleetPosts.id, {
    onDelete: "cascade",
  }),
  deckId: uuid("deck_id").references(() => fleetDecks.id, {
    onDelete: "set null",
  }),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 100 }),
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

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  tag: varchar("tag", { length: 50 }).unique().notNull(),
  count: integer("count").default(0),
});

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .references(() => fleetPosts.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  })
);
