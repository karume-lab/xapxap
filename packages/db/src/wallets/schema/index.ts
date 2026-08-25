import { profiles } from "@db/users/schema";
import { decimal, integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "tip",
  "deposit",
  "withdrawal",
  "stream_entry",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "fraud_flagged",
]);

export const wallets = pgTable("wallets", {
  userId: uuid("userId")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  balance: integer("balance").default(0).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

export const gemTransactions = pgTable("gem_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("senderId").references(() => profiles.id),
  receiverId: uuid("receiverId").references(() => profiles.id),
  amount: integer("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").default("completed"),
  referenceId: varchar("referenceId", { length: 255 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

export const payoutRequests = pgTable("payout_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  gemAmount: integer("gemAmount").notNull(),
  fiatAmount: decimal("fiatAmount", { precision: 10, scale: 2 }).notNull(),
  fiatCurrency: varchar("fiatCurrency", { length: 3 }).default("KES"),
  mobileMoneyNumber: varchar("mobileMoneyNumber", { length: 20 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  status: transactionStatusEnum("status").default("pending"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  processedAt: timestamp("processedAt", { withTimezone: true }),
});
