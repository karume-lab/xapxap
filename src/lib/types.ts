import type { InferSelectModel } from "drizzle-orm";
import type * as schema from "@/lib/db/schema";

export type Profile = InferSelectModel<typeof schema.profiles>;
export type Wallet = InferSelectModel<typeof schema.wallets>;
export type GemTransaction = InferSelectModel<typeof schema.gemTransactions>;
export type PayoutRequest = InferSelectModel<typeof schema.payoutRequests>;
export type FleetPost = InferSelectModel<typeof schema.fleetPosts>;
export type Poll = InferSelectModel<typeof schema.polls>;
export type PollOption = InferSelectModel<typeof schema.pollOptions>;
export type PollVote = InferSelectModel<typeof schema.pollVotes>;
export type FameHeuristic = InferSelectModel<typeof schema.fameHeuristics>;
export type LiveStream = InferSelectModel<typeof schema.liveStreams>;
export type StreamTicket = InferSelectModel<typeof schema.streamTickets>;

export type TransactionType = "tip" | "deposit" | "withdrawal" | "stream_entry";
export type TransactionStatus = "pending" | "completed" | "failed" | "fraud_flagged";
export type FameStatus = "evaluating" | "fame_burst" | "trend_deck" | "rejected";
export type StreamQuality = "drift_expo" | "aqua_premium";

export type FleetPostWithAuthor = FleetPost & {
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  counts: {
    hugs: number;
    echoes: number;
    casts: number;
    anchors: number;
  };
  myInteractions: {
    hug: boolean;
    echo: boolean;
    cast: boolean;
    anchor: boolean;
  };
  pollId?: string | null;
};

export type PollWithDetails = Poll & {
  options: (PollOption & { votes: number })[];
  totalVotes: number;
  userVotedId: string | null;
};

export type FameBurstItem = FleetPost & {
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  counts: {
    hugs: number;
    echoes: number;
    casts: number;
    anchors: number;
  };
  myInteractions: {
    hug: boolean;
    echo: boolean;
    cast: boolean;
    anchor: boolean;
  };
  fame_heuristics?: FameHeuristic;
};

export type LiveStreamWithAuthor = LiveStream & {
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  viewerCount: number;
};
