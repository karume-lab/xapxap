import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FleetPostWithAuthor, PollWithDetails, Profile } from "@/lib/types";

export type { FleetPostWithAuthor, PollWithDetails };

import { fameBurstOptions } from "@/features/fame/api/queries";
import {
  createFleetPost,
  mockFleetPosts,
  mockPolls,
  toggleFleetInteraction,
  voteInPoll,
} from "@/features/fleet/mock-data/fleet";

export const fleetThreadsOptions = queryOptions({
  queryKey: ["fleet-threads"],
  queryFn: async () => {
    return [...mockFleetPosts];
  },
});

export function useFleetThreads() {
  return useQuery(fleetThreadsOptions);
}

export const pollOptions = (pollId: string) =>
  queryOptions({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      return mockPolls[pollId] || null;
    },
  });

export function usePoll(pollId: string) {
  const queryClient = useQueryClient();

  const query = useQuery(pollOptions(pollId));

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      return voteInPoll(pollId, optionId);
    },
    onSuccess: (updatedPoll) => {
      if (updatedPoll) {
        queryClient.setQueryData(pollOptions(pollId).queryKey, updatedPoll);
        queryClient.invalidateQueries({ queryKey: fleetThreadsOptions.queryKey });
      }
    },
  });

  return { ...query, vote: voteMutation.mutate };
}

export function useToggleFleetInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: "hug" | "echo" | "cast" | "anchor";
    }) => {
      return toggleFleetInteraction(postId, type);
    },
    onSuccess: (updatedPost) => {
      if (updatedPost) {
        queryClient.setQueryData(
          fleetThreadsOptions.queryKey,
          (old: FleetPostWithAuthor[] | undefined) => {
            if (!old) return old;
            return old.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
          }
        );
        queryClient.invalidateQueries({ queryKey: fameBurstOptions.queryKey });
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
      queryClient.invalidateQueries({ queryKey: fleetThreadsOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: fameBurstOptions.queryKey });
    },
  });
}
