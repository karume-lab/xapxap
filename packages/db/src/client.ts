import * as content from "@db/content/schema";
import { env } from "@db/env";
import * as fame from "@db/fame/schema";
import * as streams from "@db/streams/schema";
import * as users from "@db/users/schema";
import * as wallets from "@db/wallets/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(env.DATABASE_URL, {
  max: 15,
  idle_timeout: 30,
  prepare: false,
});

const schema = {
  ...users,
  ...wallets,
  ...content,
  ...fame,
  ...streams,
};

export const db = drizzle(queryClient, { schema });
