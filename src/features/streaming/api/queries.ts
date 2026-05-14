import { useQuery } from "@tanstack/react-query";
import type { LiveStream } from "@/lib/types";

export interface LiveStreamWithAuthor extends LiveStream {
  author: {
    username: string;
    avatarUrl: string | null;
  };
  viewerCount: number;
}

export function useLiveStreams() {
  return useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      // Mocking Supabase live_streams fetch
      const mockStreams: LiveStreamWithAuthor[] = [
        {
          id: "stream-1",
          broadcasterId: "u1",
          title: "Morning Vibes & Music 🎵",
          quality: "drift_expo",
          isLive: true,
          playbackUrl: "https://picsum.photos/seed/s1/400/225",
          isGated: false,
          entryFeeGems: 0,
          startedAt: new Date(),
          endedAt: null,
          createdAt: new Date(),
          author: { username: "music_man", avatarUrl: null },
          viewerCount: 145,
        },
        {
          id: "stream-2",
          broadcasterId: "u2",
          title: "Aqua Premium: Web3 Workshop",
          quality: "aqua_premium",
          isLive: true,
          playbackUrl: "https://picsum.photos/seed/s2/400/225",
          isGated: true,
          entryFeeGems: 50,
          startedAt: new Date(),
          endedAt: null,
          createdAt: new Date(),
          author: { username: "crypto_queen", avatarUrl: null },
          viewerCount: 89,
        },
        {
          id: "stream-3",
          broadcasterId: "u3",
          title: "Gated Tech Talk",
          quality: "aqua_premium",
          isLive: true,
          playbackUrl: "https://picsum.photos/seed/s3/400/225",
          isGated: true,
          entryFeeGems: 100,
          startedAt: new Date(),
          endedAt: null,
          createdAt: new Date(),
          author: { username: "tech_titan", avatarUrl: null },
          viewerCount: 42,
        },
      ];
      return mockStreams;
    },
  });
}
