import { useMemo } from "react";
import { create } from "zustand";
import { Dater } from "@/lib/utils/dater";
import { persist } from "zustand/middleware";
import {
  type Account,
  type Transaction,
  type TransactionGroup,
} from "@/lib/data/wallet";

interface WalletState {
  accounts: Account[];
  transactions: Transaction[];
}

type WalletActions = {
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (
    id: string,
    patch: Partial<Omit<Transaction, "id">>,
  ) => void;
  removeTransaction: (id: string) => void;
  addAccount: (acc: Account) => void;
  updateAccount: (id: string, patch: Partial<Omit<Account, "id">>) => void;
  removeAccount: (id: string) => void;
};

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set) => ({
      accounts: [],
      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
          accounts: state.accounts.map((a) => {
            if (a.id === tx.accountId)
              return { ...a, balance: a.balance + tx.amount };
            if (tx.toAccountId && a.id === tx.toAccountId)
              return { ...a, balance: a.balance + Math.abs(tx.amount) };
            return a;
          }),
        })),
      updateTransaction: (id, patch) =>
        set((state) => {
          const old = state.transactions.find((t) => t.id === id);
          if (!old) return {};
          const updated = { ...old, ...patch };
          return {
            transactions: state.transactions.map((t) =>
              t.id === id ? updated : t,
            ),
            accounts: state.accounts.map((a) => {
              if (a.id === old.accountId && a.id === updated.accountId) {
                return {
                  ...a,
                  balance: a.balance - old.amount + updated.amount,
                };
              }
              if (a.id === old.accountId) {
                return { ...a, balance: a.balance - old.amount };
              }
              if (a.id === updated.accountId) {
                return { ...a, balance: a.balance + updated.amount };
              }
              return a;
            }),
          };
        }),
      removeTransaction: (id) =>
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id);
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: tx
              ? state.accounts.map((a) =>
                  a.id === tx.accountId
                    ? { ...a, balance: a.balance - tx.amount }
                    : a,
                )
              : state.accounts,
          };
        }),
      addAccount: (acc) =>
        set((state) => ({
          accounts: [...state.accounts, acc],
        })),
      updateAccount: (id, patch) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        })),
      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          transactions: state.transactions.filter((t) => t.accountId !== id),
        })),
    }),
    {
      name: "wallet-storage",
      skipHydration: true,
    },
  ),
);

function groupTransactions(transactions: Transaction[]): TransactionGroup[] {
  const groups = new Map<string, Transaction[]>();
  const today = Dater.now().iso();
  const yesterday = Dater.now().addDays(-1).iso();

  for (const tx of transactions) {
    let label: string;
    if (tx.date === today) {
      label = "Today's Transactions";
    } else if (tx.date === yesterday) {
      label = "Yesterday";
    } else {
      label = new Date(tx.date + "T12:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(tx);
  }

  return Array.from(groups.entries()).map(([label, txs]) => ({
    label,
    transactions: txs,
  }));
}

export function useGroupedTransactions(): TransactionGroup[] {
  const transactions = useWalletStore((s) => s.transactions);
  return useMemo(() => groupTransactions(transactions), [transactions]);
}

export function useAvailableCurrencies(): string[] {
  const accounts = useWalletStore((s) => s.accounts);
  return useMemo(
    () => [...new Set(accounts.map((a) => a.currency))],
    [accounts],
  );
}
