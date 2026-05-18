import {
  type InfiniteData,
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { FameBurstItem } from "@/lib/types";

export type { FameBurstItem };

import { mockFameBursts, toggleFameInteraction } from "@/features/fame/mock-data/fame";

export const fameBurstOptions = infiniteQueryOptions({
  queryKey: ["fame-burst"],
  queryFn: async ({ pageParam = 0 }) => {
    // Simulate pagination of in-memory fame items
    const pageSize = 5;
    const start = pageParam * pageSize;
    const end = start + pageSize;

    // If we run out of predefined items, we loop them or return empty
    let pageItems = mockFameBursts.slice(start, end);
    if (pageItems.length === 0 && start === 0) {
      pageItems = [...mockFameBursts];
    }

    // Ensure every item has appropriate dates so the countdown works correctly
    const data = pageItems.map((item, index) => {
      const timeOffset = index * 30000;
      return {
        ...item,
        fame_heuristics: item.fame_heuristics
          ? {
              ...item.fame_heuristics,
              burstEndedAt: new Date(Date.now() + 60000 - timeOffset),
            }
          : undefined,
      };
    });

    return {
      data,
      nextPage: pageItems.length === pageSize ? pageParam + 1 : undefined,
    };
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextPage,
});

export function useFameBurst() {
  return useInfiniteQuery(fameBurstOptions);
}

export function useToggleFameInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: "hug" | "echo" | "cast" | "anchor";
    }) => {
      return toggleFameInteraction(postId, type);
    },
    onSuccess: (updatedPost) => {
      if (updatedPost) {
        // Update the infinite query cache locally
        queryClient.setQueryData<
          InfiniteData<{ data: FameBurstItem[]; nextPage: number | undefined }>
        >(fameBurstOptions.queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item: FameBurstItem) =>
                item.id === updatedPost.id ? { ...item, ...updatedPost } : item
              ),
            })),
          };
        });
      }
    },
  });
}
