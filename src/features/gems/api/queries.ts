import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTransaction,
  mockActivity,
  mockWallet,
  updateWalletBalance,
} from "@/features/gems/mock-data/gems";
import type { PayoutRequest } from "@/lib/types";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      return { ...mockWallet };
    },
  });
}

export function useGemActivity() {
  return useQuery({
    queryKey: ["gem-activity"],
    queryFn: async () => {
      return [...mockActivity];
    },
  });
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
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["gem-activity"] });
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
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["gem-activity"] });
    },
  });
}
