import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FleetDeck, FleetPostWithAuthor, PollWithDetails, Profile } from "@xapxap/types";
import { generateUUID, getMediaUrl, supabase, uploadMedia } from "@/lib/supabase";

export async function fetchInteractions(
  postIds: string[],
  userId: string | null
): Promise<{
  counts: Record<
    string,
    { hugs: number; echoes: number; casts: number; anchors: number; comments: number }
  >;
  userInteractions: Record<string, { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }>;
}> {
  const counts: Record<
    string,
    { hugs: number; echoes: number; casts: number; anchors: number; comments: number }
  > = {};
  const userInteractions: Record<
    string,
    { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }
  > = {};

  for (const id of postIds) {
    counts[id] = { hugs: 0, echoes: 0, casts: 0, anchors: 0, comments: 0 };
    userInteractions[id] = { hug: false, echo: false, cast: false, anchor: false };
  }

  const [{ data: interactions }, { data: commentRows }] = await Promise.all([
    supabase.from("post_interactions").select("postId, type, userId").in("postId", postIds),
    supabase
      .from("fleet_posts")
      .select("parentId")
      .in("parentId", postIds)
      .not("parentId", "is", null),
  ]);

  for (const row of commentRows || []) {
    if (row.parentId) {
      const c = counts[row.parentId];
      if (c) c.comments += 1;
    }
  }

  for (const ix of interactions || []) {
    const c = counts[ix.postId];
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
    if (userId && ix.userId === userId) {
      const u = userInteractions[ix.postId];
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
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .order("createdAt", { ascending: false });

      if (error || !posts || posts.length === 0) return [];

      const postIds = posts.map((p) => p.id);

      const [{ counts, userInteractions }, { data: polls }] = await Promise.all([
        fetchInteractions(postIds, userId),
        supabase.from("polls").select("id, postId").in("postId", postIds),
      ]);

      const pollMap = new Map(polls?.map((p) => [p.postId, p.id]) || []);

      return posts.map((post) => ({
        ...(post as FleetPostWithAuthor),
        pollId: pollMap.get(post.id) || null,
        counts: counts[post.id],
        myInteractions: userInteractions[post.id],
      }));
    },
  });
}

export function useFleets() {
  return useQuery({
    queryKey: fleetKeys.decks(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_decks")
        .select("*")
        .order("createdAt", { ascending: false });
      if (error || !data) return [];
      return data as FleetDeck[];
    },
  });
}

export function useFleetDeck(deckId: string) {
  return useQuery({
    queryKey: [...fleetKeys.all, "deck", deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fleet_decks")
        .select("*")
        .eq("id", deckId)
        .single();
      if (error || !data) return null;
      return data as FleetDeck;
    },
  });
}

export function useFleetDeckPosts(deckId: string, userId: string | null) {
  return useQuery({
    queryKey: [...fleetKeys.all, "deck", deckId, "posts", userId],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .eq("deckId", deckId)
        .order("createdAt", { ascending: false });

      if (error || !posts || posts.length === 0) return [];

      const postIds = posts.map((p) => p.id);

      const [{ counts, userInteractions }, { data: polls }] = await Promise.all([
        fetchInteractions(postIds, userId),
        supabase.from("polls").select("id, postId").in("postId", postIds),
      ]);

      const pollMap = new Map(polls?.map((p) => [p.postId, p.id]) || []);

      return posts.map((post) => ({
        ...(post as FleetPostWithAuthor),
        pollId: pollMap.get(post.id) || null,
        counts: counts[post.id],
        myInteractions: userInteractions[post.id],
      }));
    },
  });
}

export function useCreateFleetDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      isOpen,
      profileId,
    }: {
      name: string;
      description: string;
      category: string | null;
      isOpen: boolean;
      profileId: string;
    }) => {
      const { data, error } = await supabase
        .from("fleet_decks")
        .insert({
          captainId: profileId,
          name,
          description: description || null,
          category,
          isOpen: isOpen,
          memberCount: 1,
        })
        .select("*")
        .single();

      if (error || !data) throw error || new Error("Failed to create fleet deck");
      const deck = data as FleetDeck;

      const { error: memberError } = await supabase
        .from("fleet_deck_members")
        .insert({ deckId: deck.id, userId: profileId, role: "captain" });

      if (memberError) {
        await supabase.from("fleet_decks").delete().eq("id", deck.id);
        throw memberError;
      }

      return deck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
    },
  });
}

export function useJoinFleetDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deckId }: { deckId: string }) => {
      const { error } = await supabase.rpc("join_fleet_deck", { p_deck_id: deckId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
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
        .select("optionId, userId")
        .in("optionId", optionIds);

      const votesByOption = new Map<string, number>();
      for (const v of votes || []) {
        votesByOption.set(v.optionId, (votesByOption.get(v.optionId) || 0) + 1);
      }

      const userVote = votes?.find((v) => userId && v.userId === userId);

      return {
        ...(poll as PollWithDetails),
        options: (Array.isArray(poll.options) ? poll.options : []).map(
          (opt: Record<string, unknown>) => ({
            ...opt,
            votes: votesByOption.get((opt.id as string) ?? "") ?? 0,
          })
        ),
        totalVotes: votes?.length ?? 0,
        userVotedId: userVote?.optionId ?? null,
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

      await supabase.from("poll_votes").delete().in("optionId", optionIds).eq("userId", userId);

      const { error } = await supabase.from("poll_votes").insert({ optionId, userId });

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
        .select("postId")
        .eq("postId", postId)
        .eq("userId", userId)
        .eq("type", type)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("post_interactions")
          .delete()
          .eq("postId", postId)
          .eq("userId", userId)
          .eq("type", type);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_interactions").insert({ postId, userId, type });
        if (error) throw error;
      }
    },
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: fleetKeys.all });
      const previous = queryClient.getQueryData(fleetKeys.all);

      type PostType = FleetPostWithAuthor & {
        counts?: Record<string, number>;
        myInteractions?: Record<string, boolean>;
      };
      queryClient.setQueriesData(
        { queryKey: fleetKeys.all },
        (oldData: PostType[] | { pages: { data: PostType[] }[] } | undefined) => {
          if (!oldData) return oldData;

          // If data is array (normal query)
          if (Array.isArray(oldData)) {
            return oldData.map((post) => {
              if (post.id === postId) {
                const isActive = post.myInteractions?.[type as keyof typeof post.myInteractions];
                const countKey = `${type}s`;
                return {
                  ...post,
                  myInteractions: {
                    ...post.myInteractions,
                    [type]: !isActive,
                  },
                  counts: {
                    ...post.counts,
                    [countKey]: Math.max(0, (post.counts?.[countKey] || 0) + (isActive ? -1 : 1)),
                  },
                };
              }
              return post;
            });
          }

          // If data is paginated (infinite query)
          if ("pages" in oldData) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: page.data.map((post) => {
                  if (post.id === postId) {
                    const isActive =
                      post.myInteractions?.[type as keyof typeof post.myInteractions];
                    const countKey = `${type}s`;
                    return {
                      ...post,
                      myInteractions: {
                        ...post.myInteractions,
                        [type]: !isActive,
                      },
                      counts: {
                        ...post.counts,
                        [countKey]: Math.max(
                          0,
                          (post.counts?.[countKey] || 0) + (isActive ? -1 : 1)
                        ),
                      },
                    };
                  }
                  return post;
                }),
              })),
            };
          }

          return oldData;
        }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueriesData({ queryKey: fleetKeys.all }, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      queryClient.invalidateQueries({ queryKey: ["fame"] });
      // Profile screens show interaction counts too.
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
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
      deckId,
    }: {
      content: string;
      authorProfile: Profile | null;
      mediaUrl?: string;
      mediaType?: "image" | "video" | "pdf";
      deckId?: string;
    }) => {
      let uploadedUrl: string | null = null;
      let uploadedMediaType: string | null = mediaType ?? null;

      if (mediaUrl && authorProfile) {
        const mimeMap: Record<string, string> = {
          image: "image/jpeg",
          video: "video/mp4",
          pdf: "application/pdf",
        };
        const extMap: Record<string, string> = {
          image: "jpg",
          video: "mp4",
          pdf: "pdf",
        };
        const resolvedType = mediaType ?? "image";
        const ext = extMap[resolvedType] ?? "jpg";
        const path = `posts/${authorProfile.id}/${generateUUID()}.${ext}`;

        await uploadMedia(
          { uri: mediaUrl, name: path, type: mimeMap[resolvedType] ?? "image/jpeg" },
          path
        );

        uploadedUrl = getMediaUrl(path);
        uploadedMediaType = mimeMap[resolvedType] ?? "image/jpeg";
      }

      const { data, error } = await supabase
        .from("fleet_posts")
        .insert({
          authorId: authorProfile?.id,
          content,
          mediaUrl: uploadedUrl,
          mediaType: uploadedMediaType,
          deckId: deckId || null,
        })
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .single();

      if (error) throw error;
      return data as FleetPostWithAuthor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      queryClient.invalidateQueries({ queryKey: ["fame"] });
    },
  });
}

export function useEditPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      mediaUrl,
      mediaType,
      authorProfile,
    }: {
      postId: string;
      content: string;
      mediaUrl?: string | null;
      mediaType?: string | null;
      authorProfile: { id: string };
    }) => {
      let uploadedUrl: string | null = mediaUrl ?? null;
      let uploadedMediaType: string | null = mediaType ?? null;

      if (mediaUrl && mediaUrl !== "") {
        const mimeMap: Record<string, string> = {
          image: "image/jpeg",
          video: "video/mp4",
          pdf: "application/pdf",
        };
        const extMap: Record<string, string> = {
          image: "jpg",
          video: "mp4",
          pdf: "pdf",
        };
        const resolvedType = mediaType ?? "image";
        const ext = extMap[resolvedType] ?? "jpg";
        const path = `posts/${authorProfile.id}/${generateUUID()}.${ext}`;

        await uploadMedia(
          { uri: mediaUrl, name: path, type: mimeMap[resolvedType] ?? "image/jpeg" },
          path
        );

        uploadedUrl = getMediaUrl(path);
        uploadedMediaType = mimeMap[resolvedType] ?? "image/jpeg";
      }

      const { data, error } = await supabase
        .from("fleet_posts")
        .update({
          content,
          mediaUrl: uploadedUrl,
          mediaType: uploadedMediaType,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", postId)
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .single();

      if (error) throw error;
      return data as FleetPostWithAuthor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      queryClient.invalidateQueries({ queryKey: ["fame"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("fleet_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      queryClient.invalidateQueries({ queryKey: ["fame"] });
    },
  });
}
