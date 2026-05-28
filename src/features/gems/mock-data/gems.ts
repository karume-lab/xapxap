import { mockProfile } from "@/features/auth/mock-data/auth";
import type { Wallet } from "@/lib/types";

export const wallets: Record<string, Wallet> = {
  [mockProfile.id]: {
    userId: mockProfile.id,
    balance: 1250,
    updatedAt: new Date(),
  },
};

export interface GemTransactionMock {
  id: string;
  type: "received" | "sent" | "withdrawal";
  label: string;
  sublabel: string;
  amount: string;
}

export const activities: Record<string, GemTransactionMock[]> = {
  [mockProfile.id]: [
    { id: "1", type: "received", label: "Received gems", sublabel: "Gift on a wave", amount: "+1" },
    { id: "2", type: "received", label: "Received gems", sublabel: "Gift on a wave", amount: "+1" },
    { id: "3", type: "received", label: "Received gems", sublabel: "Welcome gift", amount: "+50" },
  ],
};

export function updateWalletBalance(userId: string, amount: number) {
  if (!wallets[userId]) {
    wallets[userId] = { userId, balance: 0, updatedAt: new Date() };
  }
  wallets[userId].balance = Math.max(0, wallets[userId].balance + amount);
  wallets[userId].updatedAt = new Date();
  return wallets[userId];
}

export function addTransaction(
  userId: string,
  label: string,
  sublabel: string,
  amount: string,
  type: "received" | "sent" | "withdrawal"
) {
  const newTx: GemTransactionMock = {
    id: `tx-${Date.now()}`,
    type,
    label,
    sublabel,
    amount,
  };
  if (!activities[userId]) {
    activities[userId] = [];
  }
  activities[userId].unshift(newTx);
  return newTx;
}
