import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockFameBursts } from "@/features/fame/mock-data/fame";
import type { FleetPostWithAuthor } from "@/lib/types";

// In-memory mock database of comments using the database-derived FleetPostWithAuthor type.
// - Top-level comments have parentId set to the postId (e.g. "fame-1")
// - Reply comments have parentId set to their parent comment's id (e.g. "c-1")
export const mockComments: FleetPostWithAuthor[] = [
  // fame-1 comments
  {
    id: "c-1",
    authorId: "u20",
    parentId: "fame-1",
    content: "This is wild! Rift valley is beautiful. 🇰🇪✨",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 2),
    author: {
      id: "u20",
      username: "rift_fan",
      avatarUrl: "https://i.pravatar.cc/150?u=rift_fan",
      isPremium: false,
    },
    counts: { hugs: 24, echoes: 1, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
  {
    id: "c-2",
    authorId: "u11",
    parentId: "c-1",
    content: "Agreed, went there last month and it was breathtaking!",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 1.8),
    updatedAt: new Date(Date.now() - 3600000 * 1.8),
    author: {
      id: "u11",
      username: "solar_mesh",
      avatarUrl: "https://i.pravatar.cc/150?u=u11",
      isPremium: false,
    },
    counts: { hugs: 8, echoes: 0, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
  {
    id: "c-3",
    authorId: "u21",
    parentId: "fame-1",
    content: "Where exactly is this spot? Need to visit ASAP! 🗺️",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 1.5),
    updatedAt: new Date(Date.now() - 3600000 * 1.5),
    author: {
      id: "u21",
      username: "explorer_kenya",
      avatarUrl: "https://i.pravatar.cc/150?u=explorer_kenya",
      isPremium: true,
    },
    counts: { hugs: 12, echoes: 0, casts: 0, anchors: 0 },
    myInteractions: { hug: true, echo: false, cast: false, anchor: false },
  },

  // fame-2 comments
  {
    id: "c-4",
    authorId: "u22",
    parentId: "fame-2",
    content: "Love the off-grid mesh network projects. What routing protocol are you running?",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 4),
    updatedAt: new Date(Date.now() - 3600000 * 4),
    author: {
      id: "u22",
      username: "packet_hunter",
      avatarUrl: "https://i.pravatar.cc/150?u=packet_hunter",
      isPremium: true,
    },
    counts: { hugs: 42, echoes: 1, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
  {
    id: "c-5",
    authorId: "u11",
    parentId: "c-4",
    content: "I'm running a lightweight distance vector protocol modified for low power! 🔋📡",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 3.8),
    updatedAt: new Date(Date.now() - 3600000 * 3.8),
    author: {
      id: "u11",
      username: "solar_mesh",
      avatarUrl: "https://i.pravatar.cc/150?u=u11",
      isPremium: false,
    },
    counts: { hugs: 19, echoes: 0, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
  {
    id: "c-6",
    authorId: "u23",
    parentId: "fame-2",
    content: "Solid clean build! Respect the solar power setup. ☀️🔋",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 3),
    updatedAt: new Date(Date.now() - 3600000 * 3),
    author: {
      id: "u23",
      username: "green_byte",
      avatarUrl: "https://i.pravatar.cc/150?u=green_byte",
      isPremium: false,
    },
    counts: { hugs: 5, echoes: 0, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },

  // fame-3 comments
  {
    id: "c-7",
    authorId: "u24",
    parentId: "fame-3",
    content: "Nairobi has the best tech ecosystem in East Africa. Keep grinding! 💻🔥",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 5),
    updatedAt: new Date(Date.now() - 3600000 * 5),
    author: {
      id: "u24",
      username: "silicon_savannah",
      avatarUrl: "https://i.pravatar.cc/150?u=silicon_savannah",
      isPremium: true,
    },
    counts: { hugs: 89, echoes: 0, casts: 0, anchors: 0 },
    myInteractions: { hug: true, echo: false, cast: false, anchor: false },
  },
  {
    id: "c-8",
    authorId: "u25",
    parentId: "fame-3",
    content: "What stack are you working on? 👀",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 4.5),
    updatedAt: new Date(Date.now() - 3600000 * 4.5),
    author: {
      id: "u25",
      username: "bug_slayer",
      avatarUrl: "https://i.pravatar.cc/150?u=bug_slayer",
      isPremium: false,
    },
    counts: { hugs: 14, echoes: 1, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
  {
    id: "c-9",
    authorId: "u12",
    parentId: "c-8",
    content: "React Native + Bun + Expo on frontend, Drizzle + Supabase on backend! 🔥🚀",
    mediaUrl: null,
    mediaType: null,
    checksum: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3600000 * 4.2),
    updatedAt: new Date(Date.now() - 3600000 * 4.2),
    author: {
      id: "u12",
      username: "nairobi_coder",
      avatarUrl: "https://i.pravatar.cc/150?u=u12",
      isPremium: true,
    },
    counts: { hugs: 37, echoes: 0, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
];

export function useComments(postId: string | null) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return [];

      // Find top-level comments (where parentId matches the postId)
      const topLevel = mockComments.filter((c) => c.parentId === postId);
      const topLevelIds = new Set(topLevel.map((c) => c.id));

      // Find replies (where parentId is one of the topLevelIds)
      const replies = mockComments.filter(
        (c) => c.parentId !== null && topLevelIds.has(c.parentId)
      );

      // Combine both top-level comments and child replies, sorting by oldest first
      return [...topLevel, ...replies].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });
    },
    enabled: !!postId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      parentId, // Top level uses postId, replies use parentCommentId
      content,
      author,
    }: {
      postId: string;
      parentId: string;
      content: string;
      author: { id: string; username: string; avatarUrl: string | null; isPremium: boolean };
    }) => {
      const newComment: FleetPostWithAuthor = {
        id: `c-${Math.random().toString(36).substring(2, 11)}`,
        authorId: author.id,
        parentId,
        content,
        mediaUrl: null,
        mediaType: null,
        checksum: null,
        resolution: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author,
        counts: { hugs: 0, echoes: 0, casts: 0, anchors: 0 },
        myInteractions: { hug: false, echo: false, cast: false, anchor: false },
      };
      mockComments.push(newComment);

      // Increment comments (echoes) count of the target fame post
      const post = mockFameBursts.find((p) => p.id === postId);
      if (post) {
        post.counts.echoes += 1;
      }

      return { newComment, postId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["comments", res.postId] });
      queryClient.invalidateQueries({ queryKey: ["fame-burst"] }); // Invalidate feed to update echoes counts
    },
  });
}

export function useToggleCommentLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const comment = mockComments.find((c) => c.id === commentId);
      if (!comment) throw new Error("Comment not found");
      const isOn = comment.myInteractions.hug;
      comment.myInteractions.hug = !isOn;
      comment.counts.hugs += isOn ? -1 : 1;
      return { comment, postId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["comments", res.postId] });
    },
  });
}
