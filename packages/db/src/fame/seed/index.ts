import { db } from "@db/client";
import { fameHeuristics } from "@db/fame/schema";
import { sql } from "drizzle-orm";
import data from "./data.json";

export const seedFame = async () => {
  console.log("  Updating fame heuristics status...");
  for (const row of data) {
    await db
      .update(fameHeuristics)
      .set({
        status: row.status,
        viewsCount: row.viewsCount,
        checksumVerified: true,
        resolutionMeetsFloor: true,
        sentimentScore: "0.8500",
        tagCorrelationScore: "0.8000",
        completionRate: "0.7500",
        latencyOfInterestMs: 2000,
        followConversionRate: "0.1000",
        burstStartedAt: sql`now() - interval '${sql.raw(String(Math.floor(Math.random() * 24 + 1)))} hours'`,
        burstEndedAt: sql`now() + interval '${sql.raw(String(Math.floor(Math.random() * 24 + 12)))} hours'`,
        updatedAt: sql`now()`,
      })
      .where(sql`${fameHeuristics.postId} = ${row.postId}`);
  }
  console.log(`  Updated ${data.length} fame heuristics to ${data[0]?.status ?? "fame_burst"}.`);
};
