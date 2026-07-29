import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FleetPostWithAuthor } from "@xapxap/types";
import { supabase } from "@/lib/supabase";
import { transformRow } from "@/lib/supabase-helpers";

async function enrichComments(
  comments: Record<string, unknown>[],
  userId: string | null
): Promise<FleetPostWithAuthor[]> {
  const ids = comments.map((c) => c.id as string);

  const { data: interactions } = await supabase
    .from("post_interactions")
    .select("post_id, type, user_id")
    .in("post_id", ids);

  const counts: Record<string, { hugs: number; echoes: number; casts: number; anchors: number }> =
    {};
  const userInt: Record<string, { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }> =
    {};

  for (const id of ids) {
    counts[id] = { hugs: 0, echoes: 0, casts: 0, anchors: 0 };
    userInt[id] = { hug: false, echo: false, cast: false, anchor: false };
  }

  for (const ix of interactions || []) {
    const c = counts[ix.post_id];
    if (c) {
      const key =
        ix.type === "echo"
          ? "echoes"
          : ix.type === "cast"
            ? "casts"
            : ix.type === "anchor"
              ? "anchors"
              : "hugs";
      c[key] = (c[key] ?? 0) + 1;
    }
    if (userId && ix.user_id === userId) {
      const u = userInt[ix.post_id];
      if (u) u[ix.type as keyof typeof u] = true;
    }
  }

  return comments.map((comment) => {
    const transformed = transformRow<FleetPostWithAuthor>(comment);
    return {
      ...transformed,
      counts: counts[transformed.id] ?? { hugs: 0, echoes: 0, casts: 0, anchors: 0 },
      myInteractions: userInt[transformed.id] ?? {
        hug: false,
        echo: false,
        cast: false,
        anchor: false,
      },
    };
  });
}

export const commentsKeys = {
  all: ["comments"] as const,
  postComments: (postId: string | null, userId: string | null) =>
    [...commentsKeys.all, postId, userId] as const,
};

export function useComments(postId: string | null, userId: string | null = null) {
  const realPostId = postId ? postId.split("-p")[0] : null;
  return useQuery({
    queryKey: commentsKeys.postComments(realPostId, userId),
    queryFn: async (): Promise<FleetPostWithAuthor[]> => {
      if (!realPostId) return [];

      const { data: topLevel } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles(*)")
        .eq("parent_id", realPostId)
        .order("created_at", { ascending: true });

      if (!topLevel || topLevel.length === 0) return [];

      const topLevelIds = topLevel.map((c) => c.id);
      const { data: replies } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles(*)")
        .in("parent_id", topLevelIds)
        .order("created_at", { ascending: true });

      const all = [...topLevel, ...(replies || [])];
      return enrichComments(all, userId);
    },
    enabled: !!realPostId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      parentId,
      content,
      author,
    }: {
      postId: string;
      parentId: string;
      content: string;
      author: { id: string; username: string; avatarUrl: string | null; isPremium: boolean };
    }) => {
      const realParentId = parentId.split("-p")[0];

      const { data, error } = await supabase
        .from("fleet_posts")
        .insert({
          author_id: author.id,
          parent_id: realParentId,
          content,
        })
        .select("*, author:profiles(*)")
        .single();

      if (error) throw error;
      return { newComment: transformRow<FleetPostWithAuthor>(data), postId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.postComments(res.postId, null) });
      queryClient.invalidateQueries({ queryKey: ["fame-burst"] });
    },
  });
}

export function useToggleCommentLike(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const realPostId = postId.split("-p")[0];

      const { data: existing } = await supabase
        .from("post_interactions")
        .select("post_id")
        .eq("post_id", commentId)
        .eq("user_id", userId)
        .eq("type", "hug")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("post_interactions")
          .delete()
          .eq("post_id", commentId)
          .eq("user_id", userId)
          .eq("type", "hug");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_interactions")
          .insert({ post_id: commentId, user_id: userId, type: "hug" });
        if (error) throw error;
      }

      return { postId: realPostId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.postComments(res.postId, null) });
    },
  });
}
