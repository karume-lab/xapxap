import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FleetPostWithAuthor, PollWithDetails, Profile } from "@xapxap/types";
import { supabase } from "@/lib/supabase";
import { transformRow } from "@/lib/supabase-helpers";

export type { FleetPostWithAuthor, PollWithDetails };

async function fetchInteractions(
  postIds: string[],
  userId: string | null
): Promise<{
  counts: Record<string, { hugs: number; echoes: number; casts: number; anchors: number }>;
  userInteractions: Record<string, { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }>;
}> {
  const counts: Record<string, { hugs: number; echoes: number; casts: number; anchors: number }> =
    {};
  const userInteractions: Record<
    string,
    { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }
  > = {};

  for (const id of postIds) {
    counts[id] = { hugs: 0, echoes: 0, casts: 0, anchors: 0 };
    userInteractions[id] = { hug: false, echo: false, cast: false, anchor: false };
  }

  const { data: interactions } = await supabase
    .from("post_interactions")
    .select("post_id, type, user_id")
    .in("post_id", postIds);

  for (const ix of interactions || []) {
    const c = counts[ix.post_id];
    if (c) {
      const key =
        ix.type === "echo"
          ? "echoes"
          : ix.type === "cast"
            ? "casts"
            : ix.type === "anchor"
              ? "anchors"
              : "hugs";
      c[key] = (c[key] || 0) + 1;
    }
    if (userId && ix.user_id === userId) {
      const u = userInteractions[ix.post_id];
      if (u) u[ix.type as keyof typeof u] = true;
    }
  }

  return { counts, userInteractions };
}

export const fleetKeys = {
  all: ["fleet"] as const,
  threads: (userId: string | null) => [...fleetKeys.all, "threads", userId] as const,
  decks: () => [...fleetKeys.all, "decks"] as const,
  poll: (pollId: string, userId: string | null) =>
    [...fleetKeys.all, "poll", pollId, userId] as const,
};

export function useFleetThreads(userId: string | null) {
  return useQuery({
    queryKey: fleetKeys.threads(userId),
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles(*)")
        .order("created_at", { ascending: false });

      if (error || !posts || posts.length === 0) return [];

      const postIds = posts.map((p) => p.id);

      const [{ counts, userInteractions }, { data: polls }] = await Promise.all([
        fetchInteractions(postIds, userId),
        supabase.from("polls").select("id, post_id").in("post_id", postIds),
      ]);

      const pollMap = new Map(polls?.map((p) => [p.post_id, p.id]) || []);

      return posts.map((post) => {
        const transformed = transformRow<FleetPostWithAuthor>(post);
        return {
          ...transformed,
          pollId: pollMap.get(post.id) || null,
          counts: counts[post.id],
          myInteractions: userInteractions[post.id],
        };
      });
    },
  });
}

export function useFleets() {
  return useQuery({
    queryKey: fleetKeys.decks(),
    queryFn: async () => {
      const { data, error } = await supabase.from("fleet_decks").select("*");
      if (error) return [];
      return data || [];
    },
  });
}

export function usePoll(pollId: string, userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: fleetKeys.poll(pollId, userId),
    queryFn: async (): Promise<PollWithDetails | null> => {
      const { data: poll, error } = await supabase
        .from("polls")
        .select("*, options:poll_options(*)")
        .eq("id", pollId)
        .single();

      if (error || !poll) return null;

      const optionIds = poll.options?.map((o: { id: string }) => o.id) || [];
      const { data: votes } = await supabase
        .from("poll_votes")
        .select("option_id, user_id")
        .in("option_id", optionIds);

      const votesByOption = new Map<string, number>();
      for (const v of votes || []) {
        votesByOption.set(v.option_id, (votesByOption.get(v.option_id) || 0) + 1);
      }

      const userVote = votes?.find((v) => userId && v.user_id === userId);
      const transformed = transformRow<PollWithDetails>(poll);

      return {
        ...transformed,
        options: (Array.isArray(poll.options) ? poll.options : []).map(
          (opt: Record<string, unknown>) => ({
            ...transformRow<Record<string, unknown>>(opt),
            votes: votesByOption.get((opt.id as string) || "") || 0,
          })
        ),
        totalVotes: votes?.length || 0,
        userVotedId: userVote?.option_id || null,
      };
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      if (!userId) throw new Error("Not authenticated");

      const { data: poll } = await supabase
        .from("polls")
        .select("id, options:poll_options(id)")
        .eq("id", pollId)
        .single();

      const optionIds = poll?.options?.map((o: { id: string }) => o.id) || [];

      await supabase.from("poll_votes").delete().in("option_id", optionIds).eq("user_id", userId);

      const { error } = await supabase
        .from("poll_votes")
        .insert({ option_id: optionId, user_id: userId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
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
      if (!userId) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("post_interactions")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .eq("type", type)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("post_interactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId)
          .eq("type", type);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_interactions")
          .insert({ post_id: postId, user_id: userId, type });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      queryClient.invalidateQueries({ queryKey: ["fame"] });
    },
  });
}

export function useCreateFleetPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      authorProfile,
      mediaUrl,
      mediaType,
    }: {
      content: string;
      authorProfile: Profile | null;
      mediaUrl?: string;
      mediaType?: "image" | "video" | "pdf";
    }) => {
      const { data, error } = await supabase
        .from("fleet_posts")
        .insert({
          author_id: authorProfile?.id,
          content,
          media_url: mediaUrl || null,
          media_type: mediaType || "text",
        })
        .select("*, author:profiles(*)")
        .single();

      if (error) throw error;
      return transformRow<FleetPostWithAuthor>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      queryClient.invalidateQueries({ queryKey: ["fame"] });
    },
  });
}
