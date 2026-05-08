import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useWalletStore } from "./wallet-store";
import { analyzeSpend } from "@/lib/services/spend-analysis";

export type SpendCeilingPlan = {
  id: string;
  type: "spend-ceiling";
  name: string;
  categoryId: string;
  currency: string;
  limit: number;
};

export type SavingsTargetPlan = {
  id: string;
  type: "savings-target";
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date YYYY-MM-DD
  currency: string;
};

export type NetWorthPlan = {
  id: string;
  type: "net-worth";
  name: string;
  targetAmount: number;
  currency: string;
};

export type SpendReductionPlan = {
  id: string;
  type: "spend-reduction";
  name: string;
  categoryId: string;
  reductionPercent: number;
  baselineAmount: number;
  currency: string;
};

export type FIREPlan = {
  id: string;
  type: "fi-fire";
  name: string;
  monthlySpend: number;
  withdrawalRate: number; // decimal, e.g. 0.04
  currency: string;
};

export type Plan =
  | SpendCeilingPlan
  | SavingsTargetPlan
  | NetWorthPlan
  | SpendReductionPlan
  | FIREPlan;

export type PlanType = Plan["type"];

interface PlanState {
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  updatePlan: (id: string, patch: Partial<Omit<Plan, "id" | "type">>) => void;
  removePlan: (id: string) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plans: [],
      addPlan: (plan) =>
        set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (id, patch) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? ({ ...p, ...patch } as Plan) : p,
          ),
        })),
      removePlan: (id) =>
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
    }),
    { name: "plan-storage", skipHydration: true },
  ),
);

export function useSpendCeilingPlansWithSpend() {
  const plans = usePlanStore((s) => s.plans);
  const transactions = useWalletStore((s) => s.transactions);
  const accounts = useWalletStore((s) => s.accounts);

  return useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    return plans
      .filter((p): p is SpendCeilingPlan => p.type === "spend-ceiling")
      .map((plan) => {
        const accountIdsForCurrency = new Set(
          accounts.filter((a) => a.currency === plan.currency).map((a) => a.id),
        );

        const spent = transactions
          .filter(
            (t) =>
              t.categoryId === plan.categoryId &&
              t.amount < 0 &&
              t.date.startsWith(thisMonthStr) &&
              accountIdsForCurrency.has(t.accountId),
          )
          .reduce((s, t) => s + Math.abs(t.amount), 0);

        const { status, percentUsed: percent, remaining, isOver } = analyzeSpend(spent, plan.limit);

        return { ...plan, spent, percent, remaining, isOver, status };
      });
  }, [plans, transactions, accounts]);
}
