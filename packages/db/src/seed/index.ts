import { createInterface } from "node:readline";
import { db } from "@db/client";
import { seedContent } from "@db/content/seed";
import { seedFame } from "@db/fame/seed";
import { seedNotifications } from "@db/notifications/seed";
import { env } from "@db/seed/env";
import { ensureBucket } from "@db/seed/utils/uploadMedia";
import { seedStreams } from "@db/streams/seed";
import { seedUsers } from "@db/users/seed";
import { seedWallets } from "@db/wallets/seed";
import { sql } from "drizzle-orm";

const ENTITY_FLAGS = ["users", "wallets", "content", "fame", "streams", "notifications"] as const;

type Entity = (typeof ENTITY_FLAGS)[number];

const printUsage = () => {
  console.log(`
Usage: bun run src/seed/index.ts [options]

Options:
  --users          Seed users (profiles)
  --wallets        Seed wallets, gem transactions, and payout requests
  --content        Seed fleet posts, polls, and interactions
  --fame           Seed fame heuristics
  --streams        Seed live streams and tickets
  --force, -f      Clear all data before seeding
  --help, -h       Show this help message

If no entity flags are specified, all entities are seeded.
`);
};

const askForConfirmation = async (question: string): Promise<boolean> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (Y/n) `, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === "" || trimmed === "y" || trimmed === "yes");
    });
  });
};

const clearAllData = async () => {
  const tables = [
    "stream_tickets",
    "live_streams",
    "fame_heuristics",
    "post_tags",
    "tags",
    "poll_votes",
    "poll_options",
    "polls",
    "post_interactions",
    "fleet_posts",
    "notifications",
    "payout_requests",
    "gem_transactions",
    "wallets",
    "profiles",
  ];
  for (const table of tables) {
    await db.execute(sql.raw(`DELETE FROM "${table}"`));
  }
};

const SEED_ORDER: { flag: Entity; label: string; fn: () => Promise<void> }[] = [
  { flag: "users", label: "users", fn: seedUsers },
  { flag: "wallets", label: "wallets", fn: seedWallets },
  { flag: "content", label: "content", fn: seedContent },
  { flag: "fame", label: "fame", fn: seedFame },
  { flag: "streams", label: "streams", fn: seedStreams },
  { flag: "notifications", label: "notifications", fn: seedNotifications },
];

const main = async () => {
  const args = process.argv.slice(2);
  const hasForce = args.includes("--force") || args.includes("-f");
  const hasHelp = args.includes("--help") || args.includes("-h");

  const requestedEntities = args
    .filter(
      (a): a is Entity =>
        a.startsWith("--") &&
        !["--force", "-f", "--help", "-h"].includes(a) &&
        ENTITY_FLAGS.includes(a.replace(/^--/, "") as Entity)
    )
    .map((a) => a.replace(/^--/, "") as Entity);

  const unknownFlags = args.filter(
    (a) =>
      a.startsWith("--") &&
      !["--force", "-f", "--help", "-h"].includes(a) &&
      !ENTITY_FLAGS.includes(a.replace(/^--/, "") as Entity)
  );

  if (hasHelp) {
    printUsage();
    process.exit(0);
  }

  if (unknownFlags.length > 0) {
    console.error(`Unknown flag(s): ${unknownFlags.join(", ")}\n`);
    printUsage();
    process.exit(1);
  }

  const seedAll = requestedEntities.length === 0;

  if (hasForce) {
    if (env.NODE_ENV === "production") {
      console.log("\nPRODUCTION ENVIRONMENT DETECTED\n");
    }
    const confirmed = await askForConfirmation(
      "This will DELETE all existing data and re-seed from scratch"
    );
    if (!confirmed) {
      console.log("Aborted.");
      process.exit(0);
    }
    console.log("Clearing all data before seeding...");
    await clearAllData();
    console.log();
  }

  if (seedAll) {
    console.log("Seeding all entities...\n");
  } else {
    console.log(`Seeding: ${requestedEntities.join(", ")}\n`);
  }

  await ensureBucket("media");

  for (const step of SEED_ORDER) {
    if (seedAll || requestedEntities.includes(step.flag)) {
      console.log(`[${step.label}]`);
      await step.fn();
      console.log();
    }
  }

  console.log("Done!");
  process.exit(0);
};

main().catch((error) => {
  console.error("Seeding error:", error);
  process.exit(1);
});
