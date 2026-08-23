import { useQuery } from "@tanstack/react-query";
import type { FleetPostWithAuthor } from "@xapxap/types";
import { supabase } from "@/lib/supabase";

async function enrichComments(
  comments: Record<string, unknown>[],
  userId: string | null
): Promise<FleetPostWithAuthor[]> {
  const ids = comments.map((c) => c.id as string);

  const { data: interactions } = await supabase
    .from("post_interactions")
    .select("postId, type, userId")
    .in("postId", ids);

  const counts: Record<string, { hugs: number; echoes: number; casts: number; anchors: number }> =
    {};
  const userInt: Record<string, { hug: boolean; echo: boolean; cast: boolean; anchor: boolean }> =
    {};

  for (const id of ids) {
    counts[id] = { hugs: 0, echoes: 0, casts: 0, anchors: 0 };
    userInt[id] = { hug: false, echo: false, cast: false, anchor: false };
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
      c[key] = (c[key] ?? 0) + 1;
    }
    if (userId && ix.userId === userId) {
      const u = userInt[ix.postId];
      if (u) u[ix.type as keyof typeof u] = true;
    }
  }

  return comments.map((comment) => {
    return {
      ...(comment as FleetPostWithAuthor),
      counts: counts[comment.id as string] ?? { hugs: 0, echoes: 0, casts: 0, anchors: 0 },
      myInteractions: userInt[comment.id as string] ?? {
        hug: false,
        echo: false,
        cast: false,
        anchor: false,
      },
    };
  });
}

export const commentsKeys = {
  all: ["comments"] as const,
  postComments: (postId: string | null, userId: string | null) =>
    [...commentsKeys.all, postId, userId] as const,
};

export function useComments(postId: string | null, userId: string | null = null) {
  const realPostId = postId ? postId.split("-p")[0] : null;
  return useQuery({
    queryKey: commentsKeys.postComments(realPostId, userId),
    queryFn: async (): Promise<FleetPostWithAuthor[]> => {
      if (!realPostId) return [];

      const { data: topLevel } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .eq("parentId", realPostId)
        .order("createdAt", { ascending: true });

      if (!topLevel || topLevel.length === 0) return [];

      const topLevelIds = topLevel.map((c) => c.id);
      const { data: replies } = await supabase
        .from("fleet_posts")
        .select("*, author:profiles!fleet_posts_author_id_profiles_id_fk(*)")
        .in("parentId", topLevelIds)
        .order("createdAt", { ascending: true });

      const all = [...topLevel, ...(replies || [])];
      return enrichComments(all, userId);
    },
    enabled: !!realPostId,
  });
}
