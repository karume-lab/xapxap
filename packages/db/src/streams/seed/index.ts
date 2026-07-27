import { db } from "@db/client";
import { liveStreams, streamTickets } from "@db/streams/schema";
import data from "./data.json";

export const seedStreams = async () => {
  console.log("  Inserting live streams...");
  await db
    .insert(liveStreams)
    .values(data.liveStreams as (typeof liveStreams.$inferInsert)[])
    .onConflictDoNothing();

  console.log("  Inserting stream tickets...");
  await db
    .insert(streamTickets)
    .values(data.streamTickets as (typeof streamTickets.$inferInsert)[])
    .onConflictDoNothing();
};
