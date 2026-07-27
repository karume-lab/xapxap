import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

const getEnv = (): Env => {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
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
