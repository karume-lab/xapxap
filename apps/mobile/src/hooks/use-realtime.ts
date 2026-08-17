import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

type QueryClient = ReturnType<typeof useQueryClient>;
type Channel = ReturnType<typeof supabase.channel>;

// Module-level shared subscription. Multiple mounted hooks (e.g. the FleetDeck
// screen and the home feed) share one channel, so we don't create/remove
// duplicate channels when components mount and unmount independently.
let fleetSubscriberCount = 0;
let fleetChannel: Channel | null = null;

function invalidateFleetData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["fleet"] });
  queryClient.invalidateQueries({ queryKey: ["fame"] });
  queryClient.invalidateQueries({ queryKey: ["search"] });
}

function ensureFleetSubscription(queryClient: QueryClient): () => void {
  if (fleetSubscriberCount === 0) {
    fleetChannel = supabase
      .channel("public:fleet_posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "fleet_posts" }, () => {
        invalidateFleetData(queryClient);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "post_interactions" }, () => {
        invalidateFleetData(queryClient);
      })
      .subscribe();
  }
  fleetSubscriberCount += 1;

  return () => {
    fleetSubscriberCount -= 1;
    if (fleetSubscriberCount <= 0) {
      fleetSubscriberCount = 0;
      if (fleetChannel) {
        supabase.removeChannel(fleetChannel);
        fleetChannel = null;
      }
    }
  };
}

export function useRealtimeFleetPosts() {
  const queryClient = useQueryClient();

  useEffect(() => ensureFleetSubscription(queryClient), [queryClient]);
}

export function useRealtimeLiveStreams() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("public:live_streams")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_streams" }, () => {
        queryClient.invalidateQueries({ queryKey: ["streaming"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useRealtimeNotifications(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}
