import type { FameBurstItem, FameHeuristic } from "@/lib/types";

export const mockFameBursts: FameBurstItem[] = [
  {
    id: "fame-1",
    content: "Surfing down the sand dunes of the rift valley! 🏄‍♂️✨ #Adrenaline #Vibes",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    mediaType: "video",
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: "u10",
    author: {
      id: "u10",
      username: "rift_surfer",
      avatarUrl: "https://i.pravatar.cc/150?u=u10",
      isPremium: true,
    },
    counts: { hugs: 1245, echoes: 412, casts: 92, anchors: 25 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-1",
      status: "fame_burst",
      burstStartedAt: new Date(),
      burstEndedAt: new Date(Date.now() + 60000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-2",
    content: "Checking out the solar-powered mesh network node I set up today! ☀️🔋 #DIY #OffGrid",
    mediaUrl: "https://picsum.photos/seed/fame2/1080/1920",
    mediaType: "image",
    createdAt: new Date(Date.now() - 60000),
    updatedAt: new Date(Date.now() - 60000),
    authorId: "u11",
    author: {
      id: "u11",
      username: "solar_mesh",
      avatarUrl: "https://i.pravatar.cc/150?u=u11",
      isPremium: false,
    },
    counts: { hugs: 843, echoes: 124, casts: 34, anchors: 12 },
    myInteractions: { hug: true, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-2",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 60000),
      burstEndedAt: new Date(Date.now() + 120000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-3",
    content:
      "My thesis presentation slides! Very excited to share this research. 📚 #Research #Tech",
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    mediaType: "video",
    createdAt: new Date(Date.now() - 120000),
    updatedAt: new Date(Date.now() - 120000),
    authorId: "u12",
    author: {
      id: "u12",
      username: "nairobi_coder",
      avatarUrl: "https://i.pravatar.cc/150?u=u12",
      isPremium: true,
    },
    counts: { hugs: 2310, echoes: 789, casts: 145, anchors: 84 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-3",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 120000),
      burstEndedAt: new Date(Date.now() + 180000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-4",
    content: "Beautiful sunrise in the city! 🏙️🌅",
    mediaUrl: "https://picsum.photos/seed/fame4/1080/1920",
    mediaType: "image",
    createdAt: new Date(Date.now() - 180000),
    updatedAt: new Date(Date.now() - 180000),
    authorId: "u13",
    author: {
      id: "u13",
      username: "city_walker",
      avatarUrl: "https://i.pravatar.cc/150?u=u13",
      isPremium: false,
    },
    counts: { hugs: 560, echoes: 45, casts: 12, anchors: 2 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-4",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 180000),
      burstEndedAt: new Date(Date.now() + 240000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-5",
    content: "Look at this amazing animation 🎬",
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    mediaType: "video",
    createdAt: new Date(Date.now() - 240000),
    updatedAt: new Date(Date.now() - 240000),
    authorId: "u14",
    author: {
      id: "u14",
      username: "animator_pro",
      avatarUrl: "https://i.pravatar.cc/150?u=u14",
      isPremium: true,
    },
    counts: { hugs: 8900, echoes: 1200, casts: 340, anchors: 150 },
    myInteractions: { hug: true, echo: true, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-5",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 240000),
      burstEndedAt: new Date(Date.now() + 300000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-6",
    content: "Can you believe this view? ⛰️",
    mediaUrl: "https://picsum.photos/seed/fame6/1080/1920",
    mediaType: "image",
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(Date.now() - 300000),
    authorId: "u15",
    author: {
      id: "u15",
      username: "mountain_explorer",
      avatarUrl: "https://i.pravatar.cc/150?u=u15",
      isPremium: false,
    },
    counts: { hugs: 430, echoes: 20, casts: 5, anchors: 1 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-6",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 300000),
      burstEndedAt: new Date(Date.now() + 360000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-7",
    content: "Project specs and documentation for the new API! 📄💻",
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    mediaType: "video",
    createdAt: new Date(Date.now() - 360000),
    updatedAt: new Date(Date.now() - 360000),
    authorId: "u16",
    author: {
      id: "u16",
      username: "tech_lead",
      avatarUrl: "https://i.pravatar.cc/150?u=u16",
      isPremium: true,
    },
    counts: { hugs: 120, echoes: 5, casts: 2, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-7",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 360000),
      burstEndedAt: new Date(Date.now() + 420000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-8",
    content: "Just another day in paradise 🏝️",
    mediaUrl: "https://picsum.photos/seed/fame8/1080/1920",
    mediaType: "image",
    createdAt: new Date(Date.now() - 420000),
    updatedAt: new Date(Date.now() - 420000),
    authorId: "u17",
    author: {
      id: "u17",
      username: "beach_bum",
      avatarUrl: "https://i.pravatar.cc/150?u=u17",
      isPremium: false,
    },
    counts: { hugs: 750, echoes: 80, casts: 15, anchors: 3 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-8",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 420000),
      burstEndedAt: new Date(Date.now() + 480000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-9",
    content: "Look at this blazing fire! 🔥",
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    mediaType: "video",
    createdAt: new Date(Date.now() - 480000),
    updatedAt: new Date(Date.now() - 480000),
    authorId: "u18",
    author: {
      id: "u18",
      username: "fire_starter",
      avatarUrl: "https://i.pravatar.cc/150?u=u18",
      isPremium: true,
    },
    counts: { hugs: 3200, echoes: 450, casts: 100, anchors: 20 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-9",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 480000),
      burstEndedAt: new Date(Date.now() + 540000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
  {
    id: "fame-10",
    content: "Driving down the coast 🚗🌊",
    mediaUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    mediaType: "video",
    createdAt: new Date(Date.now() - 540000),
    updatedAt: new Date(Date.now() - 540000),
    authorId: "u19",
    author: {
      id: "u19",
      username: "road_trip",
      avatarUrl: "https://i.pravatar.cc/150?u=u19",
      isPremium: false,
    },
    counts: { hugs: 2100, echoes: 300, casts: 50, anchors: 10 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
    fame_heuristics: {
      postId: "fame-10",
      status: "fame_burst",
      burstStartedAt: new Date(Date.now() - 540000),
      burstEndedAt: new Date(Date.now() + 600000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
];

export const postInteractions: Record<
  string,
  { hugs: string[]; echoes: string[]; casts: string[]; anchors: string[] }
> = {};

mockFameBursts.forEach((post) => {
  postInteractions[post.id] = { hugs: [], echoes: [], casts: [], anchors: [] };
  // Add some initial fake interactions for the mock user if it was true before
  if (post.myInteractions.hug) postInteractions[post.id].hugs.push("mock-user-id");
  if (post.myInteractions.echo) postInteractions[post.id].echoes.push("mock-user-id");
  if (post.myInteractions.cast) postInteractions[post.id].casts.push("mock-user-id");
  if (post.myInteractions.anchor) postInteractions[post.id].anchors.push("mock-user-id");
});

export function toggleFameInteraction(
  userId: string | null,
  postId: string,
  type: "hug" | "echo" | "cast" | "anchor"
) {
  if (!userId) return null;
  const post = mockFameBursts.find((p) => p.id === postId);
  if (!post) return null;

  const _interactionList =
    postInteractions[postId][`${type}s` as keyof (typeof postInteractions)[string]] ||
    postInteractions[postId][`${type}es` as keyof (typeof postInteractions)[string]];
  // handle the key mapping
  let key: "hugs" | "echoes" | "casts" | "anchors" = "hugs";
  if (type === "echo") key = "echoes";
  if (type === "cast") key = "casts";
  if (type === "anchor") key = "anchors";

  const list = postInteractions[postId][key];
  const isOn = list.includes(userId);

  if (isOn) {
    postInteractions[postId][key] = list.filter((id) => id !== userId);
    post.counts[key] = Math.max(0, post.counts[key] - 1);
  } else {
    postInteractions[postId][key].push(userId);
    post.counts[key] += 1;
  }

  // Update the returned post with the new interaction state for the user
  return {
    ...post,
    myInteractions: {
      hug: postInteractions[postId].hugs.includes(userId),
      echo: postInteractions[postId].echoes.includes(userId),
      cast: postInteractions[postId].casts.includes(userId),
      anchor: postInteractions[postId].anchors.includes(userId),
    },
  };
}
