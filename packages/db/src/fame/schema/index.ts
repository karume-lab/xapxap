import { fleetPosts } from "@db/content/schema";
import { boolean, decimal, integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const fameStatusEnum = pgEnum("fame_status", [
  "evaluating",
  "fame_burst",
  "trend_deck",
  "rejected",
]);

export const fameHeuristics = pgTable("fame_heuristics", {
  postId: uuid("post_id")
    .primaryKey()
    .references(() => fleetPosts.id, { onDelete: "cascade" }),
  status: fameStatusEnum("status").default("evaluating"),
  checksumVerified: boolean("checksum_verified").default(false),
  resolutionMeetsFloor: boolean("resolution_meets_floor").default(false),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 4 }),
  tagCorrelationScore: decimal("tag_correlation_score", {
    precision: 5,
    scale: 4,
  }),
  burstStartedAt: timestamp("burst_started_at", { withTimezone: true }),
  burstEndedAt: timestamp("burst_ended_at", { withTimezone: true }),
  viewsCount: integer("views_count").default(0),
  completionRate: decimal("completion_rate", {
    precision: 5,
    scale: 4,
  }).default("0"),
  latencyOfInterestMs: integer("latency_of_interest_ms"),
  followConversionRate: decimal("follow_conversion_rate", {
    precision: 5,
    scale: 4,
  }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
