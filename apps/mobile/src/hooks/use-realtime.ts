import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useRealtimeFleetPosts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("public:fleet_posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "fleet_posts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["fleet-threads"] });
        queryClient.invalidateQueries({ queryKey: ["fame-burst"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "post_interactions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["fleet-threads"] });
        queryClient.invalidateQueries({ queryKey: ["fame-burst"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useRealtimeLiveStreams() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("public:live_streams")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_streams" }, () => {
        queryClient.invalidateQueries({ queryKey: ["live-streams"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
