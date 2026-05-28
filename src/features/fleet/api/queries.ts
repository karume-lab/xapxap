import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FleetPostWithAuthor, PollWithDetails, Profile } from "@/lib/types";

export type { FleetPostWithAuthor, PollWithDetails };

import { fameBurstOptions } from "@/features/fame/api/queries";
import {
  createFleetPost,
  fleetInteractions,
  mockFleetPosts,
  mockPolls,
  pollVotes,
  toggleFleetInteraction,
  voteInPoll,
} from "@/features/fleet/mock-data/fleet";

export const fleetThreadsOptions = (userId: string | null) =>
  queryOptions({
    queryKey: ["fleet-threads", userId],
    queryFn: async () => {
      return mockFleetPosts.map((post) => ({
        ...post,
        myInteractions:
          userId && typeof userId === "string" && fleetInteractions[post.id]
            ? {
                hug: fleetInteractions[post.id].hugs.includes(userId),
                echo: fleetInteractions[post.id].echoes.includes(userId),
                cast: fleetInteractions[post.id].casts.includes(userId),
                anchor: fleetInteractions[post.id].anchors.includes(userId),
              }
            : { hug: false, echo: false, cast: false, anchor: false },
      }));
    },
  });

export function useFleetThreads(userId: string | null) {
  return useQuery(fleetThreadsOptions(userId));
}

export const pollOptions = (pollId: string, userId: string | null) =>
  queryOptions({
    queryKey: ["poll", pollId, userId],
    queryFn: async () => {
      const poll = mockPolls[pollId];
      if (!poll) return null;
      return {
        ...poll,
        userVotedId:
          userId && typeof userId === "string" && pollVotes[pollId]
            ? pollVotes[pollId][userId] || null
            : null,
      };
    },
  });

export function usePoll(pollId: string, userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery(pollOptions(pollId, userId));

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      return voteInPoll(userId, pollId, optionId);
    },
    onSuccess: (updatedPoll) => {
      if (updatedPoll) {
        queryClient.setQueryData(pollOptions(pollId, userId).queryKey, updatedPoll);
        queryClient.invalidateQueries({ queryKey: ["fleet-threads"] });
      }
    },
  });

  return { ...query, vote: voteMutation.mutate };
}

export function useToggleFleetInteraction(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: "hug" | "echo" | "cast" | "anchor";
    }) => {
      return toggleFleetInteraction(userId, postId, type);
    },
    onSuccess: (updatedPost) => {
      if (updatedPost) {
        queryClient.setQueryData(
          fleetThreadsOptions(userId).queryKey,
          (old: FleetPostWithAuthor[] | undefined) => {
            if (!old) return old;
            return old.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
          }
        );
        queryClient.invalidateQueries({ queryKey: ["fame-burst"] });
      }
    },
  });
}

export function useCreateFleetPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      authorProfile,
    }: {
      content: string;
      authorProfile: Profile | null;
    }) => {
      return createFleetPost(content, authorProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-threads"] });
      queryClient.invalidateQueries({ queryKey: ["fame-burst"] });
    },
  });
}
