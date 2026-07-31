import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const searchKeys = {
  all: ["search"] as const,
  trendingWaves: () => [...searchKeys.all, "trending-waves"] as const,
  popularTags: () => [...searchKeys.all, "popular-tags"] as const,
};

export type TrendingWave = {
  id: string;
  content: string | null;
  author: string;
  authorId: string;
  buzz: number;
  mediaUrl: string | null;
  mediaType: string | null;
};

export type PopularTag = {
  id: string;
  tag: string;
  count: number;
};

export function useTrendingWaves() {
  return useQuery({
    queryKey: searchKeys.trendingWaves(),
    queryFn: async () => {
      // The user wants just a simple count of interactions
      const { data, error } = await supabase
        .from("fleet_posts")
        .select(`
          id,
          content,
          media_url,
          media_type,
          profiles!author_id(username),
          post_interactions(count)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // biome-ignore lint/suspicious/noExplicitAny: Supabase query returns generic data
      return (data || []).map((post: any) => ({
        id: post.id,
        content: post.content,
        author: post.profiles?.username ?? "",
        authorId: post.profiles?.id,
        buzz: post.post_interactions?.[0]?.count || 0,
        mediaUrl: post.media_url ?? null,
        mediaType: post.media_type ?? null,
      })) as TrendingWave[];
    },
  });
}

export function usePopularTags() {
  return useQuery({
    queryKey: searchKeys.popularTags(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("count", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []) as PopularTag[];
    },
  });
}
