import type { Wallet } from "@/lib/types";

export const mockWallet: Wallet = {
  userId: "mock-user-id",
  balance: 1250,
  updatedAt: new Date(),
};

export interface GemTransactionMock {
  id: string;
  type: "received" | "sent" | "withdrawal";
  label: string;
  sublabel: string;
  amount: string;
}

export const mockActivity: GemTransactionMock[] = [
  { id: "1", type: "received", label: "Received gems", sublabel: "Gift on a wave", amount: "+1" },
  { id: "2", type: "received", label: "Received gems", sublabel: "Gift on a wave", amount: "+1" },
  { id: "3", type: "received", label: "Received gems", sublabel: "Welcome gift", amount: "+50" },
];

export function updateWalletBalance(amount: number) {
  mockWallet.balance = Math.max(0, mockWallet.balance + amount);
  mockWallet.updatedAt = new Date();
  return mockWallet;
}

export function addTransaction(
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
  mockActivity.unshift(newTx);
  return newTx;
}
