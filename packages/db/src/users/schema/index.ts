import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  displayName: varchar("displayName", { length: 100 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  isPremium: boolean("isPremium").default(false),
  role: varchar("role", { length: 20 }).default("user"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
