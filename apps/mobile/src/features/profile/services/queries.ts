import { useQuery } from "@tanstack/react-query";
import type { FleetPostWithAuthor, Profile } from "@xapxap/types";
import { fetchInteractions } from "@/features/fleet/services/queries";
import { supabase } from "@/lib/supabase";

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
        .eq("authorId", id);

      const postIds = userPosts?.map((p) => p.id) ?? [];

      const [wavesResult, repliesResult, interactionsResult] = await Promise.all([
        supabase
          .from("fleet_posts")
          .select("*", { count: "exact", head: true })
          .eq("authorId", id)
          .is("parentId", null),
        postIds.length > 0
          ? supabase
              .from("fleet_posts")
              .select("*", { count: "exact", head: true })
              .in("parentId", postIds)
          : Promise.resolve({ count: 0, data: null, error: null }),
        postIds.length > 0
          ? supabase.from("post_interactions").select("type").in("postId", postIds)
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

export function useUserWaves(userId: string | null, viewerId: string | null = null) {
  return useQuery({
    queryKey: [...profileKeys.waves(userId), viewerId],
    enabled: !!userId,
    queryFn: async () => {
      // Only top-level waves: comments (posts with parentId) live under their parent post.
      const { data, error } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .eq("authorId", userId)
        .is("parentId", null)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      const posts = (data || []) as FleetPostWithAuthor[];
      if (posts.length === 0) return posts;

      const { counts, userInteractions } = await fetchInteractions(
        posts.map((p) => p.id),
        viewerId
      );

      return posts.map((post) => ({
        ...post,
        counts: counts[post.id],
        myInteractions: userInteractions[post.id],
      }));
    },
  });
}
