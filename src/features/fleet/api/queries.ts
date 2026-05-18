import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FleetPostWithAuthor, PollWithDetails, Profile } from "@/lib/types";

export type { FleetPostWithAuthor, PollWithDetails };

import {
  createFleetPost,
  mockFleetPosts,
  mockPolls,
  toggleFleetInteraction,
  voteInPoll,
} from "@/features/fleet/mock-data/fleet";

export function useFleetThreads() {
  return useQuery({
    queryKey: ["fleet-threads"],
    queryFn: async () => {
      return [...mockFleetPosts];
    },
  });
}

export function usePoll(pollId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      return mockPolls[pollId] || null;
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      return voteInPoll(pollId, optionId);
    },
    onSuccess: (updatedPoll) => {
      if (updatedPoll) {
        queryClient.setQueryData(["poll", pollId], updatedPoll);
        queryClient.invalidateQueries({ queryKey: ["fleet-threads"] });
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
        queryClient.setQueryData(["fleet-threads"], (old: FleetPostWithAuthor[] | undefined) => {
          if (!old) return old;
          return old.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
        });
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
