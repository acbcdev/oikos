import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useWalletStore } from "./wallet-store";

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  currency: string;
}

interface BudgetState {
  budgets: Budget[];
  addBudget: (b: Budget) => void;
  updateBudget: (id: string, patch: Partial<Omit<Budget, "id">>) => void;
  removeBudget: (id: string) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budgets: [],
      addBudget: (b) =>
        set((state) => ({ budgets: [...state.budgets, b] })),
      updateBudget: (id, patch) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...patch } : b,
          ),
        })),
      removeBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
    }),
    { name: "budget-storage", skipHydration: true },
  ),
);

export function useBudgetsWithSpend() {
  const budgets = useBudgetStore((s) => s.budgets);
  const transactions = useWalletStore((s) => s.transactions);
  const accounts = useWalletStore((s) => s.accounts);

  return useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return budgets.map((budget) => {
      const accountIdsForCurrency = new Set(
        accounts.filter((a) => a.currency === budget.currency).map((a) => a.id),
      );

      const spent = transactions
        .filter(
          (t) =>
            t.categoryId === budget.categoryId &&
            t.amount < 0 &&
            t.date.startsWith(thisMonthStr) &&
            accountIdsForCurrency.has(t.accountId),
        )
        .reduce((s, t) => s + Math.abs(t.amount), 0);

      const currency = budget.currency;

      const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const remaining = budget.limit - spent;
      const isOver = spent > budget.limit;

      return { ...budget, spent, percent, remaining, isOver, currency };
    });
  }, [budgets, transactions, accounts]);
}
