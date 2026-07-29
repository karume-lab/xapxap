import { profiles } from "@db/users/schema";
import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  actorId: uuid("actor_id").references(() => profiles.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'like', 'comment', 'gift', 'system'
  content: text("content").notNull(),
  amount: integer("amount"), // for gifts
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
