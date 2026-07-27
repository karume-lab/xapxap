import { db } from "@db/client";
import { gemTransactions, payoutRequests, wallets } from "@db/wallets/schema";
import data from "./data.json";

export const seedWallets = async () => {
  console.log("  Inserting wallets...");
  await db
    .insert(wallets)
    .values(data.wallets as (typeof wallets.$inferInsert)[])
    .onConflictDoNothing();

  console.log("  Inserting gem transactions...");
  await db
    .insert(gemTransactions)
    .values(data.gemTransactions as (typeof gemTransactions.$inferInsert)[])
    .onConflictDoNothing();

  console.log("  Inserting payout requests...");
  await db
    .insert(payoutRequests)
    .values(data.payoutRequests as (typeof payoutRequests.$inferInsert)[])
    .onConflictDoNothing();
};
