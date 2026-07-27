import type { Config } from "drizzle-kit";
import { env } from "./src/env";

export default {
  schema: "./src/index.ts",
  out: "../../apps/supabase/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config;
