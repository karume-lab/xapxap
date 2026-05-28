import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activities,
  addTransaction,
  updateWalletBalance,
  wallets,
} from "@/features/gems/mock-data/gems";
import type { PayoutRequest } from "@/lib/types";

export const walletBalanceOptions = (userId: string | null) =>
  queryOptions({
    queryKey: ["wallet-balance", userId],
    queryFn: async () => {
      if (!userId) {
        return { userId: "mock-user-id", balance: 0, updatedAt: new Date() };
      }
      return wallets[userId]
        ? { ...wallets[userId] }
        : { userId, balance: 0, updatedAt: new Date() };
    },
  });

export function useWalletBalance(userId: string | null) {
  return useQuery(walletBalanceOptions(userId));
}

export const gemActivityOptions = (userId: string | null) =>
  queryOptions({
    queryKey: ["gem-activity", userId],
    queryFn: async () => {
      if (!userId || !activities[userId]) {
        return [];
      }
      return [...activities[userId]];
    },
  });

export function useGemActivity(userId: string | null) {
  return useQuery(gemActivityOptions(userId));
}

export function usePayoutMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Partial<PayoutRequest>) => {
      console.log("Processing payout:", request);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (userId) {
        const gemAmt = request.gemAmount || 0;
        updateWalletBalance(userId, -gemAmt);
        addTransaction(
          userId,
          "Withdrew gems",
          `To mobile money (${request.provider})`,
          `-${gemAmt}`,
          "withdrawal"
        );
      }

      return { success: true, ...request };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", userId] });
      queryClient.invalidateQueries({ queryKey: ["gem-activity", userId] });
    },
  });
}

export function useTipMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creatorId, amount }: { creatorId: string; amount: number }) => {
      console.log(`Tipping ${amount} gems to ${creatorId}`);
      if (userId) {
        updateWalletBalance(userId, -amount);
        addTransaction(userId, "Tipped gems", `Gifted to @${creatorId}`, `-${amount}`, "sent");
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", userId] });
      queryClient.invalidateQueries({ queryKey: ["gem-activity", userId] });
    },
  });
}
