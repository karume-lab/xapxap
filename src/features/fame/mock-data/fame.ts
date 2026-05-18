import type { FameBurstItem, FameHeuristic } from "@/lib/types";

export const mockFameBursts: FameBurstItem[] = [
  {
    id: "fame-1",
    content: "Surfing down the sand dunes of the rift valley! 🏄‍♂️✨ #Adrenaline #Vibes",
    mediaUrl: "https://picsum.photos/seed/fame1/1080/1920",
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
      checksumVerified: true,
      resolutionMeetsFloor: true,
      sentimentScore: "0.95",
      tagCorrelationScore: "0.88",
      viewsCount: 14500,
      completionRate: "0.92",
      latencyOfInterestMs: 42,
      followConversionRate: "0.15",
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
    mediaType: "video",
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
      checksumVerified: true,
      resolutionMeetsFloor: true,
      sentimentScore: "0.91",
      tagCorrelationScore: "0.85",
      viewsCount: 9200,
      completionRate: "0.89",
      latencyOfInterestMs: 48,
      followConversionRate: "0.11",
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
      "Midnight coding sessions in the heart of Nairobi. The energy is unmatched! 💻🔥 #Coding #Vibe",
    mediaUrl: "https://picsum.photos/seed/fame3/1080/1920",
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
      checksumVerified: true,
      resolutionMeetsFloor: true,
      sentimentScore: "0.97",
      tagCorrelationScore: "0.94",
      viewsCount: 28000,
      completionRate: "0.95",
      latencyOfInterestMs: 38,
      followConversionRate: "0.19",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as FameHeuristic,
    parentId: null,
    checksum: null,
    resolution: 1080,
  },
];

export function toggleFameInteraction(postId: string, type: "hug" | "echo" | "cast" | "anchor") {
  const post = mockFameBursts.find((p) => p.id === postId);
  if (!post) return null;
  const isOn = post.myInteractions[type];
  post.myInteractions[type] = !isOn;
  const key =
    type === "hug" ? "hugs" : type === "echo" ? "echoes" : type === "cast" ? "casts" : "anchors";
  post.counts[key] += isOn ? -1 : 1;
  return post;
}
