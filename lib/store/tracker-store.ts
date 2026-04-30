import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useWalletStore } from "./wallet-store";

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
  trackers: Tracker[];
  addTracker: (t: Tracker) => void;
  updateTracker: (id: string, patch: Partial<Omit<SpendMonitor, "id" | "type">> | Partial<Omit<SavingsGoal, "id" | "type">>) => void;
  removeTracker: (id: string) => void;
  addContribution: (goalId: string, contribution: Contribution) => void;
}

const SEED_TRACKERS: Tracker[] = [
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
      trackers: SEED_TRACKERS,
      addTracker: (t) => set((s) => ({ trackers: [...s.trackers, t] })),
      updateTracker: (id, patch) =>
        set((s) => ({
          trackers: s.trackers.map((t) =>
            t.id === id ? ({ ...t, ...patch } as Tracker) : t,
          ),
        })),
      removeTracker: (id) =>
        set((s) => ({ trackers: s.trackers.filter((t) => t.id !== id) })),
      addContribution: (goalId, contribution) =>
        set((s) => ({
          trackers: s.trackers.map((t) => {
            if (t.id !== goalId || t.type !== "savings-goal") return t;
            return {
              ...t,
              currentAmount: t.currentAmount + contribution.amount,
              lastContributedAt: contribution.date,
              contributions: [...t.contributions, contribution],
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

export function useSpendMonitorsWithSpend(): SpendMonitorWithDerived[] {
  const trackers = useTrackerStore((s) => s.trackers);
  const transactions = useWalletStore((s) => s.transactions);
  const accounts = useWalletStore((s) => s.accounts);

  return useMemo(() => {
    const now = new Date();
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());

    return trackers
      .filter((t): t is SpendMonitor => t.type === "spend-monitor")
      .map((monitor) => {
        const accountIdsForCurrency = new Set(
          accounts.filter((a) => a.currency === monitor.currency).map((a) => a.id),
        );

        const spent = transactions
          .filter((t) => {
            if (t.categoryId !== monitor.categoryId) return false;
            if (t.amount >= 0) return false;
            if (!accountIdsForCurrency.has(t.accountId)) return false;
            if (monitor.period === "monthly") return t.date.startsWith(thisMonthStr);
            return new Date(t.date) >= thisWeekStart;
          })
          .reduce((s, t) => s + Math.abs(t.amount), 0);

        const pct = monitor.limit > 0 ? (spent / monitor.limit) * 100 : 0;
        const remaining = monitor.limit - spent;
        const isOver = spent > monitor.limit;
        const status: "on-track" | "at-risk" | "over" =
          isOver ? "over" : pct >= 80 ? "at-risk" : "on-track";

        return { ...monitor, spent, pct, remaining, isOver, status };
      });
  }, [trackers, transactions, accounts]);
}

export function useSavingsGoals(): SavingsGoal[] {
  const trackers = useTrackerStore((s) => s.trackers);
  return useMemo(
    () => trackers.filter((t): t is SavingsGoal => t.type === "savings-goal"),
    [trackers],
  );
}
