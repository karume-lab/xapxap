import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LiveStreamWithAuthor, Profile } from "@/lib/types";

export type { LiveStreamWithAuthor };

import {
  mockLiveStreams,
  purchaseTicket,
  startLiveStream,
} from "@/features/streaming/mock-data/streaming";

export function useLiveStreams() {
  return useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      return [...mockLiveStreams];
    },
  });
}

export function useJoinStreamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, fee }: { streamId: string; fee: number }) => {
      console.log(`Joining stream ${streamId} for fee ${fee} gems`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return purchaseTicket(streamId, fee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-streams"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["gem-activity"] });
    },
  });
}

export function useStartStreamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      quality,
      isGated,
      entryFeeGems,
      broadcaster,
    }: {
      title: string;
      quality: "drift_expo" | "aqua_premium";
      isGated: boolean;
      entryFeeGems: number;
      broadcaster: Profile | null;
    }) => {
      console.log("Broadcaster starting stream:", title);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return startLiveStream(title, quality, isGated, entryFeeGems, broadcaster);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-streams"] });
    },
  });
}
