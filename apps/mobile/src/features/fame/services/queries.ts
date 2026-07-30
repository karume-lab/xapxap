import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FameBurstItem } from "@xapxap/types";
import { supabase } from "@/lib/supabase";
import { transformRow } from "@/lib/supabase-helpers";

const PAGE_SIZE = 20;

export const fameKeys = {
  all: ["fame"] as const,
  fameBurst: (userId: string | null) => [...fameKeys.all, "burst", userId] as const,
};

export function useFameBurst(userId: string | null) {
  return useInfiniteQuery({
    queryKey: fameKeys.fameBurst(userId),
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data: posts, error } = await supabase
        .from("fleet_posts")
        .select(
          "*, author:profiles!fleet_posts_author_id_profiles_id_fk(*), fame_heuristics!inner(*)"
        )
        .eq("fame_heuristics.status", "fame_burst")
        .order("created_at", { ascending: false })
        .range(start, end);

      if (error) {
        console.error("[useFameBurst] Query error:", error.message, error.code, error.details);
        return { data: [], nextPage: undefined };
      }
      if (!posts || posts.length === 0) {
        return { data: [], nextPage: undefined };
      }

      const postIds = posts.map((p) => p.id);

      const { data: interactions } = await supabase
        .from("post_interactions")
        .select("post_id, type, user_id")
        .in("post_id", postIds);

      const countsMap: Record<
        string,
        { hugs: number; echoes: number; casts: number; anchors: number }
      > = {};
      const userMap: Record<
        string,
        { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }
      > = {};

      for (const post of posts) {
        countsMap[post.id] = { hugs: 0, echoes: 0, casts: 0, anchors: 0 };
        userMap[post.id] = { hug: false, echo: false, cast: false, anchor: false };
      }

      for (const ix of interactions || []) {
        const c = countsMap[ix.post_id];
        if (c) {
          const key =
            ix.type === "echo"
              ? "echoes"
              : ix.type === "cast"
                ? "casts"
                : ix.type === "anchor"
                  ? "anchors"
                  : "hugs";
          c[key] = (c[key] || 0) + 1;
        }
        if (userId && ix.user_id === userId) {
          const u = userMap[ix.post_id];
          if (u) u[ix.type as keyof typeof u] = true;
        }
      }

      const data: FameBurstItem[] = posts.map((post) => {
        const transformed = transformRow<Record<string, unknown>>(post);
        if (transformed.fameHeuristics !== undefined) {
          transformed.fame_heuristics = transformed.fameHeuristics;
          delete transformed.fameHeuristics;
        }
        return {
          ...transformed,
          counts: countsMap[post.id],
          myInteractions: userMap[post.id],
        } as FameBurstItem;
      });

      return {
        data,
        nextPage: posts.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextPage?: number }) => lastPage.nextPage,
  });
}

export function useToggleFameInteraction(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: "hug" | "echo" | "cast" | "anchor";
    }) => {
      if (!userId) throw new Error("Not authenticated");
      const realPostId = postId.split("-p")[0];

      const { data: existing } = await supabase
        .from("post_interactions")
        .select("post_id")
        .eq("post_id", realPostId)
        .eq("user_id", userId)
        .eq("type", type)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("post_interactions")
          .delete()
          .eq("post_id", realPostId)
          .eq("user_id", userId)
          .eq("type", type);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_interactions")
          .insert({ post_id: realPostId, user_id: userId, type });
        if (error) throw error;
      }
    },
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: fameKeys.all });
      const previous = queryClient.getQueriesData({ queryKey: fameKeys.all });

      queryClient.setQueriesData(
        { queryKey: fameKeys.all },
        (oldData: { pages: { data: FameBurstItem[] }[] } | undefined) => {
          if (!oldData?.pages) return oldData;
          const realPostId = postId.split("-p")[0];
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (post.id === realPostId) {
                  const isActive = post.myInteractions?.[type as keyof typeof post.myInteractions];
                  const countKey = `${type}s` as keyof typeof post.counts;
                  return {
                    ...post,
                    myInteractions: {
                      ...post.myInteractions,
                      [type]: !isActive,
                    },
                    counts: {
                      ...post.counts,
                      [countKey]: Math.max(0, (post.counts?.[countKey] || 0) + (isActive ? -1 : 1)),
                    },
                  };
                }
                return post;
              }),
            })),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fameKeys.all });
    },
  });
}
