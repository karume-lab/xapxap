import {
  type InfiniteData,
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { FameBurstItem } from "@/lib/types";

export type { FameBurstItem };

import {
  mockFameBursts,
  postInteractions,
  toggleFameInteraction,
} from "@/features/fame/mock-data/fame";

export const fameBurstOptions = (userId: string | null) =>
  infiniteQueryOptions({
    queryKey: ["fame-burst", userId],
    queryFn: async ({ pageParam = 0 }) => {
      // Simulate pagination of in-memory fame items looping infinitely
      const pageSize = 5;
      const start = pageParam * pageSize;
      const totalCount = mockFameBursts.length;

      if (totalCount === 0) {
        return {
          data: [],
          nextPage: undefined,
        };
      }

      const pageItems = Array.from({ length: pageSize }, (_, i) => {
        const idx = (start + i) % totalCount;
        const originalItem = mockFameBursts[idx];
        return {
          ...originalItem,
          // Make the ID unique for the page to prevent duplicate key issues in the FlatList
          id: `${originalItem.id}-p${pageParam}-${i}`,
        };
      });

      // Ensure every item has appropriate dates so the countdown works correctly
      const data = pageItems.map((item, index) => {
        const timeOffset = index * 30000;
        const originalId = item.id.split("-p")[0];
        return {
          ...item,
          fame_heuristics: item.fame_heuristics
            ? {
                ...item.fame_heuristics,
                burstEndedAt: new Date(Date.now() + 60000 - timeOffset),
              }
            : undefined,
          myInteractions:
            userId && postInteractions[originalId]
              ? {
                  hug: postInteractions[originalId].hugs.includes(userId),
                  echo: postInteractions[originalId].echoes.includes(userId),
                  cast: postInteractions[originalId].casts.includes(userId),
                  anchor: postInteractions[originalId].anchors.includes(userId),
                }
              : { hug: false, echo: false, cast: false, anchor: false },
        };
      });

      return {
        data,
        nextPage: pageParam + 1,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

export function useFameBurst(userId: string | null) {
  return useInfiniteQuery(fameBurstOptions(userId));
}

export function useToggleFameInteraction(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: "hug" | "echo" | "cast" | "anchor";
    }) => {
      const realPostId = postId.split("-p")[0];
      return toggleFameInteraction(userId, realPostId, type);
    },
    onSuccess: (updatedPost) => {
      if (updatedPost) {
        // Update the infinite query cache locally
        queryClient.setQueryData<
          InfiniteData<{ data: FameBurstItem[]; nextPage: number | undefined }>
        >(fameBurstOptions(userId).queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FameBurstItem) => {
                const originalId = item.id.split("-p")[0];
                if (originalId === updatedPost.id) {
                  return { ...item, ...updatedPost, id: item.id };
                }
                return item;
              }),
            })),
          };
        });
      }
    },
  });
}
