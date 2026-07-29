import { db } from "@db/client";
import { notifications } from "@db/notifications/schema";

export const seedNotifications = async () => {
  console.log("  Inserting notifications...");
  await db
    .insert(notifications)
    .values([
      {
        id: "b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0",
        userId: "21e76024-c504-498a-8c15-e51042b2555a",
        actorId: "c02b2b1a-3e5e-4a64-9a8c-9b8a8e3d2f1b",
        type: "hug",
        content: "Cyber Punk hugged your wave",
        isRead: false,
      },
      {
        id: "c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0",
        userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        actorId: "21e76024-c504-498a-8c15-e51042b2555a",
        type: "echo",
        content: "Rumz replied to your wave",
        isRead: true,
      },
      {
        id: "d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0",
        userId: "c02b2b1a-3e5e-4a64-9a8c-9b8a8e3d2f1b",
        actorId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        type: "tip",
        content: "Neon Rider sent you 100 gems!",
        isRead: false,
      },
      {
        id: "22222222-2222-2222-2222-222222222224",
        userId: "21e76024-c504-498a-8c15-e51042b2555a",
        type: "system",
        content: "Welcome to XapXap! Start dropping your waves and start earning Gems today.",
        isRead: true,
      },
    ])
    .onConflictDoNothing();
};
