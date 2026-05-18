import type { LiveStreamWithAuthor, Profile } from "@/lib/types";

export const mockLiveStreams: LiveStreamWithAuthor[] = [
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
    author: { id: "u1", username: "music_man", avatarUrl: null, isPremium: true },
    viewerCount: 145,
  },
  {
    id: "stream-2",
    broadcasterId: "u2",
    title: "Aqua Premium: Web3 Workshop 💎",
    quality: "aqua_premium",
    isLive: true,
    playbackUrl: "https://picsum.photos/seed/s2/400/225",
    isGated: true,
    entryFeeGems: 50,
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    author: { id: "u2", username: "crypto_queen", avatarUrl: null, isPremium: false },
    viewerCount: 89,
  },
  {
    id: "stream-3",
    broadcasterId: "u3",
    title: "Gated Tech Talk 🚀",
    quality: "aqua_premium",
    isLive: true,
    playbackUrl: "https://picsum.photos/seed/s3/400/225",
    isGated: true,
    entryFeeGems: 100,
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    author: { id: "u3", username: "tech_titan", avatarUrl: null, isPremium: true },
    viewerCount: 42,
  },
];

export function purchaseTicket(streamId: string, _ticketCost: number) {
  const stream = mockLiveStreams.find((s) => s.id === streamId);
  if (stream) {
    stream.viewerCount += 1;
  }
  return stream;
}

export function startLiveStream(
  title: string,
  quality: "drift_expo" | "aqua_premium",
  isGated: boolean,
  entryFeeGems: number,
  broadcaster: Profile | null
) {
  const newStream: LiveStreamWithAuthor = {
    id: `stream-${Date.now()}`,
    broadcasterId: broadcaster?.id || "mock-user-id",
    title,
    quality,
    isLive: true,
    playbackUrl: `https://picsum.photos/seed/${Date.now()}/400/225`,
    isGated,
    entryFeeGems: isGated ? entryFeeGems : 0,
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    author: {
      id: broadcaster?.id || "mock-user-id",
      username: broadcaster?.username || "wave_rider",
      avatarUrl: broadcaster?.avatarUrl || null,
      isPremium: broadcaster?.isPremium || false,
    },
    viewerCount: 1,
  };
  mockLiveStreams.unshift(newStream);
  return newStream;
}
