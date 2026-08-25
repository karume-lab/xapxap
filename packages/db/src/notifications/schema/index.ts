import { profiles } from "@db/users/schema";
import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  actorId: uuid("actorId").references(() => profiles.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(),
  content: text("content").notNull(),
  amount: integer("amount"),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});
