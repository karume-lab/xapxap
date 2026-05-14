import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PayoutRequest, Wallet } from "@/lib/types";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      // Mocking Supabase wallets fetch
      const mockWallet: Wallet = {
        userId: "curr-user",
        balance: 1250,
        updatedAt: new Date(),
      };
      return mockWallet;
    },
  });
}

export function usePayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Partial<PayoutRequest>) => {
      // Mocking Supabase payout_requests insert
      console.log("Processing payout:", request);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true, ...request };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["wallet-balance"], (old: Wallet | undefined) => {
        if (!old) return old;
        return {
          ...old,
          balance: old.balance - (data.gemAmount || 0),
        };
      });
    },
  });
}

export function useTipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creatorId, amount }: { creatorId: string; amount: number }) => {
      // Mocking tipping logic
      console.log(`Tipping ${amount} gems to ${creatorId}`);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["wallet-balance"], (old: Wallet | undefined) => {
        if (!old) return old;
        return {
          ...old,
          balance: old.balance - variables.amount,
        };
      });
    },
  });
}
