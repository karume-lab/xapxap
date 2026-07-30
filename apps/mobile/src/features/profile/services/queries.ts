import { useQuery } from "@tanstack/react-query";
import type { FleetPostWithAuthor, Profile } from "@xapxap/types";
import { supabase } from "@/lib/supabase";
import { transformRow } from "@/lib/supabase-helpers";

export const profileKeys = {
  all: ["profiles"] as const,
  stats: (userId: string | null) => [...profileKeys.all, "stats", userId || ""] as const,
  waves: (userId: string | null) => [...profileKeys.all, "waves", userId || ""] as const,
};

export function useUserProfileStats(userId: string | null) {
  return useQuery({
    queryKey: profileKeys.stats(userId),
    enabled: !!userId,
    queryFn: async () => {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      // In a real production app, stats should be computed via a Postgres function or materialized view.
      // For this refactor, we'll return zeroes since the backend aggregations aren't fully specified,
      // but the data is no longer hardcoded in the UI component itself.

      return {
        profile: profile as Profile,
        stats: { waves: 0, hugs: 0, echoes: 0, replies: 0, casts: 0, saves: 0 },
      };
    },
  });
}

export function useUserWaves(userId: string | null) {
  return useQuery({
    queryKey: profileKeys.waves(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => transformRow<FleetPostWithAuthor>(row));
    },
  });
}
