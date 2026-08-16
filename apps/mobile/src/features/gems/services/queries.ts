import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PayoutRequest } from "@xapxap/types";
import { supabase } from "@/lib/supabase";
import { transformRow } from "@/lib/supabase-helpers";

interface GemActivityItem {
  id: string;
  type: "received" | "sent" | "withdrawal";
  label: string;
  sublabel: string;
  amount: string;
}

function toGemActivity(tx: Record<string, unknown>, userId: string): GemActivityItem {
  const type = tx.type as string;
  const senderId = tx.senderId as string | null;
  const receiverId = tx.receiverId as string | null;
  const amount = tx.amount as number;

  if (type === "withdrawal") {
    return {
      id: tx.id as string,
      type: "withdrawal",
      label: "Withdrew gems",
      sublabel: "Mobile money withdrawal",
      amount: `-${amount}`,
    };
  }
  if (type === "tip" && receiverId === userId) {
    return {
      id: tx.id as string,
      type: "received",
      label: "Received gems",
      sublabel: "Gift from a fan",
      amount: `+${amount}`,
    };
  }
  if (type === "tip" && senderId === userId) {
    return {
      id: tx.id as string,
      type: "sent",
      label: "Tipped gems",
      sublabel: "Gift to a creator",
      amount: `-${amount}`,
    };
  }
  if (type === "deposit") {
    return {
      id: tx.id as string,
      type: "received",
      label: "Deposited gems",
      sublabel: "Account top-up",
      amount: `+${amount}`,
    };
  }
  if (type === "stream_entry") {
    return {
      id: tx.id as string,
      type: "sent",
      label: "Stream entry",
      sublabel: "Entered a gated stream",
      amount: `-${amount}`,
    };
  }
  return {
    id: tx.id as string,
    type: "received",
    label: "Gem transaction",
    sublabel: "",
    amount: `${amount}`,
  };
}

export const gemsKeys = {
  all: ["gems"] as const,
  walletBalance: (userId: string | null) => [...gemsKeys.all, "wallet-balance", userId] as const,
  activity: (userId: string | null) => [...gemsKeys.all, "activity", userId] as const,
};

export function useWalletBalance(userId: string | null) {
  return useQuery({
    queryKey: gemsKeys.walletBalance(userId),
    queryFn: async () => {
      if (!userId) return { userId: "", balance: 0, updatedAt: new Date() };
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !data) return { userId, balance: 0, updatedAt: new Date() };
      return transformRow<{ userId: string; balance: number; updatedAt: Date }>(data);
    },
  });
}

export function useGemActivity(userId: string | null) {
  return useQuery({
    queryKey: gemsKeys.activity(userId),
    queryFn: async (): Promise<GemActivityItem[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("gem_transactions")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !data) return [];
      return data.map((row) => toGemActivity(transformRow(row), userId));
    },
  });
}

export function usePayoutMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Partial<PayoutRequest>) => {
      if (!userId) throw new Error("Not authenticated");

      if (
        !request.gemAmount ||
        !request.fiatCurrency ||
        !request.mobileMoneyNumber ||
        !request.provider
      ) {
        throw new Error("Missing required payout fields");
      }

      const { error } = await supabase.rpc("request_payout", {
        p_gem_amount: request.gemAmount,
        p_fiat_currency: request.fiatCurrency,
        p_mobile_money_number: request.mobileMoneyNumber,
        p_provider: request.provider,
      });
      if (error) throw error;

      return { success: true, ...request };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gemsKeys.walletBalance(userId) });
      queryClient.invalidateQueries({ queryKey: gemsKeys.activity(userId) });
    },
  });
}

export function useTipMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creatorId, amount }: { creatorId: string; amount: number }) => {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("tip_gems", {
        p_creator_id: creatorId,
        p_amount: amount,
      });
      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gemsKeys.walletBalance(userId) });
      queryClient.invalidateQueries({ queryKey: gemsKeys.activity(userId) });
    },
  });
}
