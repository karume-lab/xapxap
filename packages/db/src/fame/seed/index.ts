import { db } from "@db/client";
import { fameHeuristics } from "@db/fame/schema";
import data from "./data.json";

export const seedFame = async () => {
  console.log("  Inserting fame heuristics...");
  await db
    .insert(fameHeuristics)
    .values(data as (typeof fameHeuristics.$inferInsert)[])
    .onConflictDoNothing();
};
