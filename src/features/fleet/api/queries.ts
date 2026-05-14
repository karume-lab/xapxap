import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FleetPost, Poll, PollOption } from "@/lib/types";

export type FleetPostWithAuthor = FleetPost & {
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  counts: {
    hugs: number;
    echoes: number;
    casts: number;
    anchors: number;
  };
  myInteractions: {
    hug: boolean;
    echo: boolean;
    cast: boolean;
    anchor: boolean;
  };
  pollId?: string | null;
};

export type PollWithDetails = Poll & {
  options: (PollOption & { votes: number })[];
  totalVotes: number;
  userVotedId: string | null;
};

export function useFleetThreads() {
  return useQuery({
    queryKey: ["fleet-threads"],
    queryFn: async () => {
      // Mocking Supabase fleet_posts fetch
      const mockPosts: FleetPostWithAuthor[] = [
        {
          id: "post-1",
          content: "What should be the next major feature in XapXap? 🚀 #XapXap #Community",
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: "u1",
          mediaUrl: null,
          mediaType: "text",
          parentId: null,
          pollId: "poll-1",
          checksum: null,
          resolution: null,
          author: { id: "u1", username: "founder", avatarUrl: null, isPremium: true },
          counts: { hugs: 120, echoes: 45, casts: 12, anchors: 5 },
          myInteractions: { hug: false, echo: false, cast: false, anchor: false },
        } as FleetPostWithAuthor,
        {
          id: "post-2",
          content: "Just arrived at the tech hub. The 3G signal is surprisingly stable here! 📶",
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000),
          authorId: "u2",
          mediaUrl: null,
          mediaType: "text",
          parentId: null,
          pollId: null,
          checksum: null,
          resolution: null,
          author: { id: "u2", username: "dev_explorer", avatarUrl: null, isPremium: false },
          counts: { hugs: 85, echoes: 12, casts: 2, anchors: 1 },
          myInteractions: { hug: true, echo: false, cast: false, anchor: false },
        } as FleetPostWithAuthor,
      ];
      return mockPosts;
    },
  });
}

export function usePoll(pollId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["poll", pollId],
    queryFn: async () => {
      // Mocking Supabase polls fetch
      const mockPoll: PollWithDetails = {
        id: pollId,
        postId: "post-1",
        question: "Next major feature?",
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
        options: [
          { id: "opt-1", pollId, optionText: "Video Stories", votes: 45 },
          { id: "opt-2", pollId, optionText: "Marketplace", votes: 30 },
          { id: "opt-3", pollId, optionText: "Direct Messaging", votes: 25 },
        ],
        totalVotes: 100,
        userVotedId: null,
      };
      return mockPoll;
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      // Mocking Supabase vote update
      return { optionId };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["poll", pollId], (old: PollWithDetails | undefined) => {
        if (!old) return old;
        return {
          ...old,
          userVotedId: data.optionId,
          totalVotes: old.totalVotes + 1,
          options: old.options.map((opt) =>
            opt.id === data.optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      });
    },
  });

  return { ...query, vote: voteMutation.mutate };
}
