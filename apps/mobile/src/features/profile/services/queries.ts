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
      const id = userId as string;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (profileError) throw profileError;

      const { data: userPosts } = await supabase
        .from("fleet_posts")
        .select("id")
        .eq("author_id", id);

      const postIds = userPosts?.map((p) => p.id) ?? [];

      const [wavesResult, repliesResult, interactionsResult] = await Promise.all([
        supabase
          .from("fleet_posts")
          .select("*", { count: "exact", head: true })
          .eq("author_id", id)
          .is("parent_id", null),
        postIds.length > 0
          ? supabase
              .from("fleet_posts")
              .select("*", { count: "exact", head: true })
              .in("parent_id", postIds)
          : Promise.resolve({ count: 0, data: null, error: null }),
        postIds.length > 0
          ? supabase.from("post_interactions").select("type").in("post_id", postIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const counts = { hugs: 0, echoes: 0, casts: 0, saves: 0 };
      for (const ix of interactionsResult.data ?? []) {
        if (ix.type === "hug") counts.hugs++;
        else if (ix.type === "echo") counts.echoes++;
        else if (ix.type === "cast") counts.casts++;
        else if (ix.type === "anchor") counts.saves++;
      }

      return {
        profile: profile as Profile,
        stats: {
          waves: wavesResult.count ?? 0,
          hugs: counts.hugs,
          echoes: counts.echoes,
          replies: repliesResult.count ?? 0,
          casts: counts.casts,
          saves: counts.saves,
        },
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
