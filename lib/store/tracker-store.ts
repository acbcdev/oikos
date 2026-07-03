import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useWalletStore } from "./wallet-store";
import { analyzeSpend } from "@/lib/services/spend-analysis";
import { Dater } from "@/lib/utils/dater";

export type SpendMonitor = {
  id: string;
  type: "spend-monitor";
  name: string;
  categoryId: string;
  currency: string;
  limit: number;
  period: "weekly" | "monthly";
};

export type Contribution = {
  id: string;
  amount: number;
  date: string;
  note?: string;
};

export type SavingsGoal = {
  id: string;
  type: "savings-goal";
  name: string;
  currency: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  lastContributedAt: string | null;
  contributions: Contribution[];
};

export type Tracker = SpendMonitor | SavingsGoal;

interface TrackerState {
  monitors: SpendMonitor[];
  goals: SavingsGoal[];
  add: (item: Tracker) => void;
  update: (
    id: string,
    patch:
      | Partial<Omit<SpendMonitor, "id" | "type">>
      | Partial<Omit<SavingsGoal, "id" | "type">>,
  ) => void;
  remove: (id: string) => void;
  addContribution: (goalId: string, contribution: Contribution) => void;
}

const SEED_MONITORS: SpendMonitor[] = [
  {
    id: "tm-food",
    type: "spend-monitor",
    name: "Food & Dining",
    categoryId: "food",
    currency: "USD",
    limit: 800,
    period: "monthly",
  },
  {
    id: "tm-transport",
    type: "spend-monitor",
    name: "Transport",
    categoryId: "transport",
    currency: "USD",
    limit: 300,
    period: "monthly",
  },
  {
    id: "tm-subscriptions",
    type: "spend-monitor",
    name: "Subscriptions",
    categoryId: "entertainment",
    currency: "USD",
    limit: 120,
    period: "monthly",
  },
  {
    id: "tm-shopping",
    type: "spend-monitor",
    name: "Shopping",
    categoryId: "shopping",
    currency: "USD",
    limit: 500,
    period: "monthly",
  },
];

const SEED_GOALS: SavingsGoal[] = [
  {
    id: "sg-vacation",
    type: "savings-goal",
    name: "Vacation Fund",
    currency: "USD",
    targetAmount: 5000,
    currentAmount: 2500,
    deadline: "2026-12-15",
    lastContributedAt: "2026-04-01",
    contributions: [
      { id: "c1", amount: 500, date: "2026-01-15", note: "January savings" },
      { id: "c2", amount: 1000, date: "2026-02-01" },
      { id: "c3", amount: 1000, date: "2026-03-01" },
    ],
  },
  {
    id: "sg-emergency",
    type: "savings-goal",
    name: "Emergency Fund",
    currency: "USD",
    targetAmount: 10000,
    currentAmount: 4200,
    deadline: "2027-06-01",
    lastContributedAt: "2026-03-28",
    contributions: [
      { id: "c4", amount: 700, date: "2026-01-01" },
      { id: "c5", amount: 700, date: "2026-02-01" },
      { id: "c6", amount: 700, date: "2026-03-01" },
    ],
  },
  {
    id: "sg-laptop",
    type: "savings-goal",
    name: "New Laptop",
    currency: "USD",
    targetAmount: 2500,
    currentAmount: 850,
    deadline: "2026-09-01",
    lastContributedAt: "2026-04-10",
    contributions: [
      { id: "c7", amount: 250, date: "2026-02-15" },
      { id: "c8", amount: 350, date: "2026-03-20" },
      { id: "c9", amount: 250, date: "2026-04-10" },
    ],
  },
];

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      monitors: SEED_MONITORS,
      goals: SEED_GOALS,
      add: (item) =>
        set((s) =>
          item.type === "spend-monitor"
            ? { monitors: [...s.monitors, item] }
            : { goals: [...s.goals, item] },
        ),
      update: (id, patch) =>
        set((s) => ({
          monitors: s.monitors.map((m) =>
            m.id === id ? ({ ...m, ...patch } as SpendMonitor) : m,
          ),
          goals: s.goals.map((g) =>
            g.id === id ? ({ ...g, ...patch } as SavingsGoal) : g,
          ),
        })),
      remove: (id) =>
        set((s) => ({
          monitors: s.monitors.filter((m) => m.id !== id),
          goals: s.goals.filter((g) => g.id !== id),
        })),
      addContribution: (goalId, contribution) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            return {
              ...g,
              currentAmount: g.currentAmount + contribution.amount,
              lastContributedAt: contribution.date,
              contributions: [...g.contributions, contribution],
            };
          }),
        })),
    }),
    { name: "tracker-storage", skipHydration: true },
  ),
);

export type SpendMonitorWithDerived = SpendMonitor & {
  spent: number;
  pct: number;
  remaining: number;
  isOver: boolean;
  status: "on-track" | "at-risk" | "over";
};

export function useTrackerData(): {
  monitors: SpendMonitorWithDerived[];
  goals: SavingsGoal[];
} {
  const monitors = useTrackerStore((s) => s.monitors);
  const goals = useTrackerStore((s) => s.goals);
  const transactions = useWalletStore((s) => s.transactions);
  const accounts = useWalletStore((s) => s.accounts);

  const enrichedMonitors = useMemo(() => {
    const now = Dater.now();
    const thisMonthStr = now.month();
    const thisWeekStart = now.weekStart().iso();

    return monitors.map((monitor) => {
      const accountIdsForCurrency = new Set<string>();
      for (const a of accounts) {
        if (a.currency === monitor.currency) accountIdsForCurrency.add(a.id);
      }

      const spent = transactions
        .filter((t) => {
          if (t.categoryId !== monitor.categoryId) return false;
          if (t.amount >= 0) return false;
          if (!accountIdsForCurrency.has(t.accountId)) return false;
          if (monitor.period === "monthly")
            return t.date.startsWith(thisMonthStr);
          return t.date >= thisWeekStart;
        })
        .reduce((s, t) => s + Math.abs(t.amount), 0);

      const {
        status,
        percentUsed: pct,
        remaining,
        isOver,
      } = analyzeSpend(spent, monitor.limit);

      return { ...monitor, spent, pct, remaining, isOver, status };
    });
  }, [monitors, transactions, accounts]);

  return { monitors: enrichedMonitors, goals };
}
