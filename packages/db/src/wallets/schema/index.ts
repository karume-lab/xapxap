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
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  balance: integer("balance").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const gemTransactions = pgTable("gem_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").references(() => profiles.id),
  receiverId: uuid("receiver_id").references(() => profiles.id),
  amount: integer("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").default("completed"),
  referenceId: varchar("reference_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const payoutRequests = pgTable("payout_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  gemAmount: integer("gem_amount").notNull(),
  fiatAmount: decimal("fiat_amount", { precision: 10, scale: 2 }).notNull(),
  fiatCurrency: varchar("fiat_currency", { length: 3 }).default("KES"),
  mobileMoneyNumber: varchar("mobile_money_number", { length: 20 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  status: transactionStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});
