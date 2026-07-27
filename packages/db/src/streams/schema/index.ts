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
  broadcasterId: uuid("broadcaster_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  quality: streamQualityEnum("quality").default("drift_expo"),
  isLive: boolean("is_live").default(false),
  playbackUrl: text("playback_url"),
  isGated: boolean("is_gated").default(false),
  entryFeeGems: integer("entry_fee_gems").default(0),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const streamTickets = pgTable(
  "stream_tickets",
  {
    streamId: uuid("stream_id")
      .references(() => liveStreams.id, { onDelete: "cascade" })
      .notNull(),
    viewerId: uuid("viewer_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    purchasedAt: timestamp("purchased_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.streamId, t.viewerId] }),
  })
);
