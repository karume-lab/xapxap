import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FleetPostWithAuthor } from "@xapxap/types";
import { notificationKeys } from "@/features/notifications/services/queries";
import { supabase } from "@/lib/supabase";
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
          authorId: author.id,
          parentId: realParentId,
          content,
        })
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .single();

      if (error) throw error;

      // Send notification to post owner (if not self)
      if (author.id) {
        const { data: post } = await supabase
          .from("fleet_posts")
          .select("authorId")
          .eq("id", postId)
          .single();

        if (post?.authorId && post.authorId !== author.id) {
          await supabase.from("notifications").insert({
            userId: post.authorId,
            actorId: author.id,
            type: "comment",
            content: `${author.username} commented on your wave`,
          });
        }
      }

      return { newComment: data as FleetPostWithAuthor, postId };
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
        .select("postId")
        .eq("postId", commentId)
        .eq("userId", userId)
        .eq("type", "hug")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("post_interactions")
          .delete()
          .eq("postId", commentId)
          .eq("userId", userId)
          .eq("type", "hug");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_interactions")
          .insert({ postId: commentId, userId, type: "hug" });
        if (error) throw error;
      }

      // Send notification to comment owner (if not self)
      if (userId) {
        const { data: comment } = await supabase
          .from("fleet_posts")
          .select("authorId")
          .eq("id", commentId)
          .single();

        if (comment?.authorId && comment.authorId !== userId) {
          await supabase.from("notifications").insert({
            userId: comment.authorId,
            actorId: userId,
            type: "hug",
            content: `${userId.substring(0, 8)}... liked your comment`,
          });
        }
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
    onSuccess: (res, _vars, context) => {
      const pId = res?.postId || context?.realPostId;
      if (pId) {
        queryClient.invalidateQueries({ queryKey: ["comments", pId] });
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
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
