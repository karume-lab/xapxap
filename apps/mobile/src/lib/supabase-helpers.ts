const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";

export function fixMediaUrl<T>(obj: T): T {
  if (!SUPABASE_URL) return obj;
  if (typeof obj === "string" && obj.includes("127.0.0.1:54321")) {
    return obj.replace("http://127.0.0.1:54321", SUPABASE_URL) as T;
  }
  return obj;
}
