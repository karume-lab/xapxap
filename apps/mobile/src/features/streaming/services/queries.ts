import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LiveStreamWithAuthor, Profile } from "@xapxap/types";
import { supabase } from "@/lib/supabase";
import { transformRow } from "@/lib/supabase-helpers";

export type { LiveStreamWithAuthor };

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
        .eq("is_live", true)
        .order("created_at", { ascending: false });

      if (error || !streams || streams.length === 0) return [];

      const streamIds = streams.map((s) => s.id);
      const { data: tickets } = await supabase
        .from("stream_tickets")
        .select("stream_id")
        .in("stream_id", streamIds);

      const viewerCounts = new Map<string, number>();
      for (const t of tickets || []) {
        viewerCounts.set(t.stream_id, (viewerCounts.get(t.stream_id) || 0) + 1);
      }

      return streams.map((stream) => {
        const transformed = transformRow<Record<string, unknown>>(stream);
        transformed.viewerCount = viewerCounts.get(stream.id) ?? 0;
        return transformed as LiveStreamWithAuthor;
      });
    },
  });
}

export function useJoinStreamMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ streamId, fee }: { streamId: string; fee: number }) => {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("stream_tickets")
        .insert({ stream_id: streamId, viewer_id: userId });
      if (error) throw error;

      if (fee > 0) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", userId)
          .single();

        if (!wallet || wallet.balance < fee) {
          throw new Error("Insufficient gems");
        }

        await supabase
          .from("wallets")
          .update({ balance: wallet.balance - fee })
          .eq("user_id", userId);

        await supabase.from("gem_transactions").insert({
          sender_id: userId,
          amount: fee,
          type: "stream_entry",
          status: "completed",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: streamingKeys.liveStreams() });
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["gem-activity"] });
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
          broadcaster_id: userId,
          title,
          quality,
          is_live: true,
          is_gated: isGated,
          entry_fee_gems: isGated ? entryFeeGems : 0,
          started_at: new Date().toISOString(),
        })
        .select("*, author:profiles!live_streams_broadcaster_id_profiles_id_fk(*)")
        .single();

      if (error) throw error;

      const transformed = transformRow<Record<string, unknown>>(data);
      transformed.viewerCount = 1;
      return transformed as LiveStreamWithAuthor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: streamingKeys.liveStreams() });
    },
  });
}
