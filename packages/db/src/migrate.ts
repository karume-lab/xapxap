import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, queryClient } from "./client";

async function main() {
  console.log("Applying migrations...");
  try {
    await migrate(db, { migrationsFolder: "../../apps/supabase/migrations" });
    console.log("Migrations applied successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

main();
