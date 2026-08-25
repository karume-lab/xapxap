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
  captainId: uuid("captainId")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 60 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  isOpen: boolean("isOpen").default(true),
  memberCount: integer("memberCount").default(0).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

export const fleetDeckMembers = pgTable(
  "fleet_deck_members",
  {
    deckId: uuid("deckId")
      .references(() => fleetDecks.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("userId")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 20 }).default("member"),
    joinedAt: timestamp("joinedAt", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.deckId, t.userId] }),
  })
);

export const fleetPosts = pgTable("fleet_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("authorId")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  parentId: uuid("parentId").references((): AnyPgColumn => fleetPosts.id, {
    onDelete: "cascade",
  }),
  deckId: uuid("deckId").references(() => fleetDecks.id, {
    onDelete: "set null",
  }),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  mediaType: varchar("mediaType", { length: 100 }),
  checksum: text("checksum"),
  resolution: integer("resolution"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

export const polls = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("postId")
    .references(() => fleetPosts.id, { onDelete: "cascade" })
    .notNull(),
  question: text("question").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

export const pollOptions = pgTable("poll_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("pollId")
    .references(() => polls.id, { onDelete: "cascade" })
    .notNull(),
  optionText: text("optionText").notNull(),
});

export const pollVotes = pgTable(
  "poll_votes",
  {
    optionId: uuid("optionId")
      .references(() => pollOptions.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("userId")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.optionId, t.userId] }),
  })
);

export const postInteractions = pgTable(
  "post_interactions",
  {
    postId: uuid("postId")
      .references(() => fleetPosts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("userId")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 10 }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
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
    postId: uuid("postId")
      .references(() => fleetPosts.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tagId")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  })
);
