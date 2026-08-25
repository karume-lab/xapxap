import { fleetPosts } from "@db/content/schema";
import { boolean, decimal, integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const fameStatusEnum = pgEnum("fame_status", [
  "evaluating",
  "fame_burst",
  "trend_deck",
  "rejected",
]);

export const fameHeuristics = pgTable("fame_heuristics", {
  postId: uuid("postId")
    .primaryKey()
    .references(() => fleetPosts.id, { onDelete: "cascade" }),
  status: fameStatusEnum("status").default("evaluating"),
  checksumVerified: boolean("checksumVerified").default(false),
  resolutionMeetsFloor: boolean("resolutionMeetsFloor").default(false),
  sentimentScore: decimal("sentimentScore", { precision: 5, scale: 4 }),
  tagCorrelationScore: decimal("tagCorrelationScore", {
    precision: 5,
    scale: 4,
  }),
  burstStartedAt: timestamp("burstStartedAt", { withTimezone: true }),
  burstEndedAt: timestamp("burstEndedAt", { withTimezone: true }),
  viewsCount: integer("viewsCount").default(0),
  completionRate: decimal("completionRate", {
    precision: 5,
    scale: 4,
  }).default("0"),
  latencyOfInterestMs: integer("latencyOfInterestMs"),
  followConversionRate: decimal("followConversionRate", {
    precision: 5,
    scale: 4,
  }).default("0"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
