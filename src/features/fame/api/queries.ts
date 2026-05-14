import { useInfiniteQuery } from "@tanstack/react-query";
import type { FameHeuristic, FleetPost } from "@/lib/types";

export type FameBurstItem = FleetPost & {
  author: {
    username: string;
    avatarUrl: string | null;
  };
  fame_heuristics?: FameHeuristic;
};

export function useFameBurst() {
  return useInfiniteQuery({
    queryKey: ["fame-burst"],
    queryFn: async ({ pageParam = 0 }) => {
      // Mocking Supabase fame_heuristics and fleet_posts join
      const mockData: FameBurstItem[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `fame-${pageParam}-${i}`,
        content: `Epic Fame Burst content #${pageParam * 5 + i}`,
        mediaUrl: `https://picsum.photos/seed/${pageParam * 5 + i}/1080/1920`,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: `user-${i}`,
        author: {
          username: `wave_surfer_${i}`,
          avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
        },
        fame_heuristics: {
          postId: `fame-${pageParam}-${i}`,
          status: "fame_burst",
          burstStartedAt: new Date(),
          burstEndedAt: new Date(Date.now() + 60000), // 60 seconds from now
          checksumVerified: true,
          resolutionMeetsFloor: true,
          sentimentScore: "0.9",
          tagCorrelationScore: "0.8",
          viewsCount: 100,
          completionRate: "0.9",
          latencyOfInterestMs: 50,
          followConversionRate: "0.1",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as FameHeuristic,
        mediaType: "video",
        parentId: null,
        checksum: null,
        resolution: 1080,
      }));

      return {
        data: mockData,
        nextPage: pageParam + 1,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
