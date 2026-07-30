import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FleetPostWithAuthor } from "@xapxap/types";
import { supabase } from "@/lib/supabase";
import { transformRow } from "@/lib/supabase-helpers";
import { commentsKeys } from "./queries";

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
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .single();

      if (error) throw error;
      return { newComment: transformRow<FleetPostWithAuthor>(data), postId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.postComments(res.postId, null) });
      queryClient.invalidateQueries({ queryKey: ["fame"] });
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
    onMutate: async ({ commentId, postId }) => {
      const realPostId = postId.split("-p")[0];
      const commentKey = ["comments", realPostId] as const;
      await queryClient.cancelQueries({ queryKey: commentKey });
      const previous = queryClient.getQueriesData({ queryKey: commentKey });

      queryClient.setQueriesData(
        { queryKey: commentKey },
        (oldData: FleetPostWithAuthor[] | undefined) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((comment) => {
            if (comment.id === commentId) {
              const isActive = comment.myInteractions?.hug;
              return {
                ...comment,
                myInteractions: {
                  ...comment.myInteractions,
                  hug: !isActive,
                },
                counts: {
                  ...comment.counts,
                  hugs: Math.max(0, (comment.counts?.hugs || 0) + (isActive ? -1 : 1)),
                },
              };
            }
            return comment;
          });
        }
      );

      return { previous, realPostId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: (res, _err, _vars, context) => {
      const pId = res?.postId || context?.realPostId;
      if (pId) {
        queryClient.invalidateQueries({ queryKey: ["comments", pId] });
      }
    },
  });
}
