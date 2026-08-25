import { profiles } from "@db/users/schema";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const streamQualityEnum = pgEnum("stream_quality", ["drift_expo", "aqua_premium"]);

export const liveStreams = pgTable("live_streams", {
  id: uuid("id").primaryKey().defaultRandom(),
  broadcasterId: uuid("broadcasterId")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  quality: streamQualityEnum("quality").default("drift_expo"),
  isLive: boolean("isLive").default(false),
  playbackUrl: text("playbackUrl"),
  isGated: boolean("isGated").default(false),
  entryFeeGems: integer("entryFeeGems").default(0),
  startedAt: timestamp("startedAt", { withTimezone: true }),
  endedAt: timestamp("endedAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

export const streamTickets = pgTable(
  "stream_tickets",
  {
    streamId: uuid("streamId")
      .references(() => liveStreams.id, { onDelete: "cascade" })
      .notNull(),
    viewerId: uuid("viewerId")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    purchasedAt: timestamp("purchasedAt", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.streamId, t.viewerId] }),
  })
);
