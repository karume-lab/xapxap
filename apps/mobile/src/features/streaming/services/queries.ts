import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LiveStreamWithAuthor, Profile } from "@xapxap/types";
import { gemsKeys } from "@/features/gems/services/queries";
import { supabase } from "@/lib/supabase";

export const streamingKeys = {
  all: ["streaming"] as const,
  liveStreams: () => [...streamingKeys.all, "live-streams"] as const,
};

export function useLiveStreams() {
  return useQuery({
    queryKey: streamingKeys.liveStreams(),
    queryFn: async () => {
      const { data: streams, error } = await supabase
        .from("live_streams")
        .select("*, author:profiles!live_streams_broadcaster_id_profiles_id_fk(*)")
        .eq("isLive", true)
        .order("createdAt", { ascending: false });

      if (error || !streams || streams.length === 0) return [];

      const streamIds = streams.map((s) => s.id);
      const { data: tickets } = await supabase
        .from("stream_tickets")
        .select("streamId")
        .in("streamId", streamIds);

      const viewerCounts = new Map<string, number>();
      for (const t of tickets || []) {
        viewerCounts.set(t.streamId, (viewerCounts.get(t.streamId) || 0) + 1);
      }

      return streams.map((stream) => {
        const enriched = stream as LiveStreamWithAuthor;
        enriched.viewerCount = viewerCounts.get(stream.id) ?? 0;
        return enriched;
      });
    },
  });
}

export function useJoinStreamMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId }: { streamId: string }) => {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("enter_stream", { p_stream_id: streamId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: streamingKeys.liveStreams() });
      queryClient.invalidateQueries({ queryKey: gemsKeys.walletBalance(userId) });
      queryClient.invalidateQueries({ queryKey: gemsKeys.activity(userId) });
    },
  });
}

export function useStartStreamMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      quality,
      isGated,
      entryFeeGems,
    }: {
      title: string;
      quality: "drift_expo" | "aqua_premium";
      isGated: boolean;
      entryFeeGems: number;
      broadcaster: Profile | null;
    }) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("live_streams")
        .insert({
          broadcasterId: userId,
          title,
          quality,
          isLive: true,
          isGated: isGated,
          entryFeeGems: isGated ? entryFeeGems : 0,
          startedAt: new Date().toISOString(),
        })
        .select("*, author:profiles!live_streams_broadcaster_id_profiles_id_fk(*)")
        .single();

      if (error) throw error;

      const enriched = data as LiveStreamWithAuthor;
      enriched.viewerCount = 1;
      return enriched;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: streamingKeys.liveStreams() });
    },
  });
}
