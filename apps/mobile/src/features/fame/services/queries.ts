import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FameBurstItem } from "@xapxap/types";
import { supabase } from "@/lib/supabase";

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
        .is("parentId", null)
        .not("fame_heuristics.status", "eq", "rejected")
        .order("createdAt", { ascending: false })
        .range(start, end);

      if (error) {
        console.error("[useFameBurst] Query error:", error.message, error.code, error.details);
        return { data: [], nextPage: undefined };
      }
      if (!posts || posts.length === 0) {
        return { data: [], nextPage: undefined };
      }

      const postIds = posts.map((p) => p.id);

      const [{ data: interactions }, { data: commentRows }] = await Promise.all([
        supabase.from("post_interactions").select("postId, type, userId").in("postId", postIds),
        supabase
          .from("fleet_posts")
          .select("parentId")
          .in("parentId", postIds)
          .not("parentId", "is", null),
      ]);

      const commentCounts: Record<string, number> = {};
      for (const row of commentRows || []) {
        if (row.parentId) {
          commentCounts[row.parentId] = (commentCounts[row.parentId] || 0) + 1;
        }
      }

      const countsMap: Record<
        string,
        { hugs: number; echoes: number; casts: number; anchors: number; comments: number }
      > = {};
      const userMap: Record<
        string,
        { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }
      > = {};

      for (const post of posts) {
        countsMap[post.id] = {
          hugs: 0,
          echoes: 0,
          casts: 0,
          anchors: 0,
          comments: commentCounts[post.id] || 0,
        };
        userMap[post.id] = { hug: false, echo: false, cast: false, anchor: false };
      }

      for (const ix of interactions || []) {
        const c = countsMap[ix.postId];
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
        if (userId && ix.userId === userId) {
          const u = userMap[ix.postId];
          if (u) u[ix.type as keyof typeof u] = true;
        }
      }

      const data = posts.map((post) => ({
        ...post,
        counts: countsMap[post.id],
        myInteractions: userMap[post.id],
      })) as FameBurstItem[];

      return {
        data,
        nextPage: posts.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextPage?: number }) => lastPage.nextPage,
  });
}

export function useFamePost(postId: string | null, userId: string | null) {
  return useQuery({
    queryKey: [...fameKeys.all, "post", postId, userId],
    enabled: !!postId,
    queryFn: async () => {
      if (!postId) return null;

      const { data: post, error } = await supabase
        .from("fleet_posts")
        .select(
          "*, author:profiles!fleet_posts_author_id_profiles_id_fk(*), fame_heuristics!inner(*)"
        )
        .eq("id", postId)
        .single();

      if (error || !post) return null;

      const [{ data: interactions }, { data: commentRows }] = await Promise.all([
        supabase.from("post_interactions").select("postId, type, userId").eq("postId", postId),
        supabase.from("fleet_posts").select("parentId").eq("parentId", postId),
      ]);

      const commentCount = commentRows?.length || 0;

      let hugs = 0,
        echoes = 0,
        casts = 0,
        anchors = 0;
      let hug = false,
        echo = false,
        cast = false,
        anchor = false;

      for (const ix of interactions || []) {
        if (ix.type === "echo") echoes++;
        else if (ix.type === "cast") casts++;
        else if (ix.type === "anchor") anchors++;
        else hugs++;
      }

      for (const ix of interactions || []) {
        if (userId && ix.userId === userId) {
          if (ix.type === "hug") hug = true;
          else if (ix.type === "echo") echo = true;
          else if (ix.type === "cast") cast = true;
          else if (ix.type === "anchor") anchor = true;
        }
      }

      return {
        ...post,
        counts: { hugs, echoes, casts, anchors, comments: commentCount },
        myInteractions: { hug, echo, cast, anchor },
      } as FameBurstItem;
    },
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
        .select("postId")
        .eq("postId", realPostId)
        .eq("userId", userId)
        .eq("type", type)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("post_interactions")
          .delete()
          .eq("postId", realPostId)
          .eq("userId", userId)
          .eq("type", type);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_interactions")
          .insert({ postId: realPostId, userId, type });
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
