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

      const { error: payoutError } = await supabase.from("payout_requests").insert({
        user_id: userId,
        gem_amount: request.gemAmount,
        fiat_amount: request.fiatAmount ?? 0,
        fiat_currency: request.fiatCurrency,
        mobile_money_number: request.mobileMoneyNumber,
        provider: request.provider,
        status: "pending",
      });
      if (payoutError) throw payoutError;

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (!wallet || wallet.balance < request.gemAmount) {
        throw new Error("Insufficient balance");
      }

      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: wallet.balance - request.gemAmount })
        .eq("user_id", userId);
      if (walletError) throw walletError;

      await supabase.from("gem_transactions").insert({
        sender_id: userId,
        amount: request.gemAmount,
        type: "withdrawal",
        status: "completed",
      });

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

      const { error: txError } = await supabase.from("gem_transactions").insert({
        sender_id: userId,
        receiver_id: creatorId,
        amount,
        type: "tip",
        status: "completed",
      });
      if (txError) throw txError;

      const { data: senderWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (!senderWallet || senderWallet.balance < amount) {
        throw new Error("Insufficient balance");
      }

      await supabase
        .from("wallets")
        .update({ balance: senderWallet.balance - amount })
        .eq("user_id", userId);

      const { data: receiverWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", creatorId)
        .single();

      await supabase
        .from("wallets")
        .upsert(
          { user_id: creatorId, balance: (receiverWallet?.balance ?? 0) + amount },
          { onConflict: "user_id" }
        );

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gemsKeys.walletBalance(userId) });
      queryClient.invalidateQueries({ queryKey: gemsKeys.activity(userId) });
    },
  });
}
