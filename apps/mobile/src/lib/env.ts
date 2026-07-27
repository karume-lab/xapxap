import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().min(1, "EXPO_PUBLIC_SUPABASE_URL is required"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "EXPO_PUBLIC_SUPABASE_ANON_KEY is required"),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

const getEnv = (): Env => {
  if (!_env) {
    const result = envSchema.safeParse({
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    });
    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join("; ");
      throw new Error(`Invalid environment variables: ${message}`);
    }
    _env = result.data;
  }
  return _env;
};

export const env = new Proxy({} as Env, {
  get(_, prop: string | symbol) {
    return getEnv()[prop as keyof Env];
  },
}) as Env;
