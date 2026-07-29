import { db } from "@db/client";
import { notifications } from "@db/notifications/schema";

export const seedNotifications = async () => {
  console.log("  Inserting notifications...");
  await db
    .insert(notifications)
    .values([
      {
        id: "22222222-2222-2222-2222-222222222221",
        userId: "00000000-0000-0000-0000-000000000001",
        actorId: "00000000-0000-0000-0000-000000000002",
        type: "gift",
        content: "tipped you 50 Gems on your Wave",
        amount: 50,
        isRead: false,
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        userId: "00000000-0000-0000-0000-000000000001",
        actorId: "00000000-0000-0000-0000-000000000002",
        type: "comment",
        content: "commented: 'This looks so beautiful! Cannot wait for the next Drop.'",
        isRead: false,
      },
      {
        id: "22222222-2222-2222-2222-222222222223",
        userId: "00000000-0000-0000-0000-000000000001",
        actorId: "00000000-0000-0000-0000-000000000002",
        type: "like",
        content: "liked your Wave",
        isRead: true,
      },
      {
        id: "22222222-2222-2222-2222-222222222224",
        userId: "00000000-0000-0000-0000-000000000001",
        type: "system",
        content: "Welcome to XapXap! Start dropping your waves and start earning Gems today.",
        isRead: true,
      },
    ])
    .onConflictDoNothing();
};
