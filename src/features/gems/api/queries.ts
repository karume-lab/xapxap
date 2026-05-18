import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTransaction,
  mockActivity,
  mockWallet,
  updateWalletBalance,
} from "@/features/gems/mock-data/gems";
import type { PayoutRequest } from "@/lib/types";

export const walletBalanceOptions = queryOptions({
  queryKey: ["wallet-balance"],
  queryFn: async () => {
    return { ...mockWallet };
  },
});

export function useWalletBalance() {
  return useQuery(walletBalanceOptions);
}

export const gemActivityOptions = queryOptions({
  queryKey: ["gem-activity"],
  queryFn: async () => {
    return [...mockActivity];
  },
});

export function useGemActivity() {
  return useQuery(gemActivityOptions);
}

export function usePayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Partial<PayoutRequest>) => {
      console.log("Processing payout:", request);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const gemAmt = request.gemAmount || 0;
      updateWalletBalance(-gemAmt);
      addTransaction(
        "Withdrew gems",
        `To mobile money (${request.provider})`,
        `-${gemAmt}`,
        "withdrawal"
      );

      return { success: true, ...request };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletBalanceOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: gemActivityOptions.queryKey });
    },
  });
}

export function useTipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creatorId, amount }: { creatorId: string; amount: number }) => {
      console.log(`Tipping ${amount} gems to ${creatorId}`);
      updateWalletBalance(-amount);
      addTransaction("Tipped gems", `Gifted to @${creatorId}`, `-${amount}`, "sent");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletBalanceOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: gemActivityOptions.queryKey });
    },
  });
}
