import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Account,
  type Category,
  type Transaction,
  type TransactionGroup,
  DEFAULT_CATEGORIES,
} from "@/lib/data/wallet";
import type { Timeframe, MonthlyNetWorth } from "@/lib/data/reports";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function toMonthStr(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

interface WalletState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  lastUsedAccountId: string | null;
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
  addCategory: (cat: Category) => void;
  removeCategory: (id: string) => void;
};

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set) => ({
      accounts: [],
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      lastUsedAccountId: null,
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
          lastUsedAccountId: tx.accountId,
          accounts: state.accounts.map((a) => {
            if (a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount };
            if (tx.toAccountId && a.id === tx.toAccountId) return { ...a, balance: a.balance + Math.abs(tx.amount) };
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
            lastUsedAccountId: updated.accountId,
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
      addCategory: (cat) =>
        set((state) => ({ categories: [...state.categories, cat] })),
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
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
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);

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

export function useDashboardMetrics(filterCurrency: string | null = null) {
  const allAccounts = useWalletStore((s) => s.accounts);
  const allTransactions = useWalletStore((s) => s.transactions);
  const allCategories = useWalletStore((s) => s.categories);

  return useMemo(() => {
    const catName = (id: string) => allCategories.find((c) => c.id === id)?.name ?? id;

    const accounts = filterCurrency
      ? allAccounts.filter((a) => a.currency === filterCurrency)
      : allAccounts;
    const filteredIds = filterCurrency
      ? new Set(accounts.map((a) => a.id))
      : null;
    const transactions = filterCurrency
      ? allTransactions.filter((t) => filteredIds!.has(t.accountId))
      : allTransactions;

    const displayCurrency =
      filterCurrency ?? accounts[0]?.currency ?? "USD";

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthStr = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonthDate.toISOString().slice(0, 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

    // Net worth
    const totalNetWorth = accounts.reduce((s, a) => s + a.balance, 0);

    // Monthly sparkline (last 6 months net change)
    const netWorthSparkline = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const value = transactions
        .filter((t) => t.date.startsWith(monthStr))
        .reduce((s, t) => s + t.amount, 0);
      return { month: d.toLocaleString("en-US", { month: "short" }), value };
    });

    // Month over month % change
    const thisMonthNet = transactions
      .filter((t) => t.date.startsWith(thisMonthStr))
      .reduce((s, t) => s + t.amount, 0);
    const lastMonthNet = transactions
      .filter((t) => t.date.startsWith(lastMonthStr))
      .reduce((s, t) => s + t.amount, 0);
    const netWorthChangePct =
      lastMonthNet !== 0
        ? ((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100
        : 0;

    // 30-day burn (expenses only)
    const recentExpenses = transactions.filter(
      (t) => t.date >= thirtyDaysAgoStr && t.amount < 0,
    );
    const burnTotal = recentExpenses.reduce(
      (s, t) => s + Math.abs(t.amount),
      0,
    );

    // Today's burn
    const todayBurn = transactions
      .filter((t) => t.date === todayStr && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    // Daily burn sparkline
    const dailyMap = new Map<string, number>();
    recentExpenses.forEach((t) => {
      dailyMap.set(t.date, (dailyMap.get(t.date) ?? 0) + Math.abs(t.amount));
    });
    const burnSparkline = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({ day, value }));

    // Category breakdown (30-day expenses, excluding Transfer/Income)
    const catMap = new Map<string, number>();
    recentExpenses.forEach((t) => {
      if (!t.categoryId || t.categoryId === "transfer" || t.categoryId === "income") return;
      const name = catName(t.categoryId);
      catMap.set(name, (catMap.get(name) ?? 0) + Math.abs(t.amount));
    });
    const totalCategorySpend = Array.from(catMap.values()).reduce(
      (s, v) => s + v,
      0,
    );
    const categoryBreakdown = Array.from(catMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([label, amount]) => ({
        label,
        amount,
        percent:
          totalCategorySpend > 0
            ? Math.round((amount / totalCategorySpend) * 100)
            : 0,
      }));

    return {
      totalNetWorth,
      netWorthSparkline,
      netWorthChangePct,
      burnTotal,
      todayBurn,
      burnSparkline,
      categoryBreakdown,
      totalCategorySpend,
      displayCurrency,
    };
  }, [allAccounts, allTransactions, allCategories, filterCurrency]);
}

export function useReportData(timeframe: Timeframe, filterCurrency: string | null = null) {
  const allAccounts = useWalletStore((s) => s.accounts);
  const allTransactions = useWalletStore((s) => s.transactions);
  const allCategories = useWalletStore((s) => s.categories);

  return useMemo(() => {
    const catName = (id: string) => allCategories.find((c) => c.id === id)?.name ?? id;

    const accounts = filterCurrency
      ? allAccounts.filter((a) => a.currency === filterCurrency)
      : allAccounts;
    const filteredIds = filterCurrency ? new Set(accounts.map((a) => a.id)) : null;
    const allTx = filterCurrency
      ? allTransactions.filter((t) => filteredIds!.has(t.accountId))
      : allTransactions;

    // Exclude transfers — they don't affect net worth
    const tx = allTx.filter((t) => t.categoryId !== "transfer");

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-based
    const currentNW = accounts.reduce((s, a) => s + a.balance, 0);

    // --- Chart: determine start month per timeframe ---
    let startYear: number, startMonth: number;
    switch (timeframe) {
      case "1M": { startYear = curYear; startMonth = curMonth; break; }
      case "3M": { const d = new Date(curYear, curMonth - 2, 1); startYear = d.getFullYear(); startMonth = d.getMonth(); break; }
      case "6M": { const d = new Date(curYear, curMonth - 5, 1); startYear = d.getFullYear(); startMonth = d.getMonth(); break; }
      case "1Y": { const d = new Date(curYear, curMonth - 11, 1); startYear = d.getFullYear(); startMonth = d.getMonth(); break; }
      case "YTD": { startYear = curYear; startMonth = 0; break; }
    }

    // Enumerate months start → current
    const chartMonths: Array<{ year: number; month: number }> = [];
    { let y = startYear, m = startMonth;
      while (y < curYear || (y === curYear && m <= curMonth)) {
        chartMonths.push({ year: y, month: m });
        m++; if (m > 11) { m = 0; y++; }
      }
    }

    // Avg monthly net of last 3 months for projected bar
    const last3Net = [0, 1, 2].map((i) => {
      const d = new Date(curYear, curMonth - i, 1);
      const ms = toMonthStr(d.getFullYear(), d.getMonth());
      return tx.filter((t) => t.date.startsWith(ms)).reduce((s, t) => s + t.amount, 0);
    });
    const avgMonthlyNet = last3Net.reduce((s, v) => s + v, 0) / 3;

    const projDate = new Date(curYear, curMonth + 1, 1);
    const projectedBar: MonthlyNetWorth = {
      month: MONTHS_SHORT[projDate.getMonth()],
      value: Math.max(0, currentNW + avgMonthlyNet),
      isProjected: true,
    };

    // Reconstruct monthly NW by working backwards from current balance
    // nwAtEndOfMonth = currentNW - sum(all tx AFTER that month)
    const chartData: MonthlyNetWorth[] = [
      ...chartMonths
        .filter(({ year, month }) => {
          const ms = toMonthStr(year, month);
          return tx.some((t) => t.date.startsWith(ms));
        })
        .map(({ year, month }) => {
          const isCurrent = year === curYear && month === curMonth;
          const endStr = `${year}-${String(month + 1).padStart(2, "0")}-31`;
          const laterNet = tx.filter((t) => t.date > endStr).reduce((s, t) => s + t.amount, 0);
          return {
            month: MONTHS_SHORT[month],
            value: Math.max(0, currentNW - laterNet),
            ...(isCurrent ? { isCurrent: true as const } : {}),
          };
        }),
      projectedBar,
    ];

    // --- Metrics: transactions within the timeframe window ---
    const tfStartStr = toMonthStr(startYear, startMonth);
    const tfEndStr = toMonthStr(curYear, curMonth);
    const txWindow = tx.filter((t) => {
      const m = t.date.slice(0, 7);
      return m >= tfStartStr && m <= tfEndStr;
    });

    const income = txWindow.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expensesAbs = txWindow.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const avgSavingsRate = income > 0
      ? Math.round(((income - expensesAbs) / income) * 1000) / 10
      : 0;

    // Savings rate change vs previous equivalent window
    const windowLen = chartMonths.length;
    const prevEndDate = new Date(startYear, startMonth, 0);
    const prevEndStr = toMonthStr(prevEndDate.getFullYear(), prevEndDate.getMonth());
    const prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth() - windowLen + 1, 1);
    const prevStartStr = toMonthStr(prevStartDate.getFullYear(), prevStartDate.getMonth());
    const txPrev = tx.filter((t) => {
      const m = t.date.slice(0, 7);
      return m >= prevStartStr && m <= prevEndStr;
    });
    const prevIncome = txPrev.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const prevExpAbs = txPrev.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const prevSavingsRate = prevIncome > 0
      ? Math.round(((prevIncome - prevExpAbs) / prevIncome) * 1000) / 10
      : 0;
    const savingsRateChange = Math.round((avgSavingsRate - prevSavingsRate) * 10) / 10;

    // Highest burn category in window
    const catMap = new Map<string, number>();
    txWindow.filter((t) => t.amount < 0 && t.categoryId).forEach((t) => {
      const name = catName(t.categoryId);
      catMap.set(name, (catMap.get(name) ?? 0) + Math.abs(t.amount));
    });
    const topCat = Array.from(catMap.entries()).sort(([, a], [, b]) => b - a)[0];
    const highestBurnCategory = topCat?.[0] ?? "—";
    const highestBurnAmount = topCat ? Math.round(topCat[1]) : 0;

    // YTD % change: compare currentNW vs NW at Jan 1
    const ytdStartStr = `${curYear}-01`;
    const ytdNet = tx.filter((t) => t.date.slice(0, 7) >= ytdStartStr).reduce((s, t) => s + t.amount, 0);
    const ytdStartNW = currentNW - ytdNet;
    const ytdChange = ytdStartNW > 0
      ? Math.round(((currentNW - ytdStartNW) / Math.abs(ytdStartNW)) * 1000) / 10
      : 0;

    // Best saving month — month with highest net (income - expenses) in window
    const monthlyNets = chartMonths.map(({ year, month }) => {
      const ms = toMonthStr(year, month);
      const net = tx.filter((t) => t.date.startsWith(ms)).reduce((s, t) => s + t.amount, 0);
      return { label: `${MONTHS_SHORT[month]} ${year !== curYear ? year : ""}`.trim(), net };
    });
    const bestMonth = monthlyNets.reduce(
      (best, cur) => (cur.net > best.net ? cur : best),
      { label: "—", net: 0 },
    );

    // Monthly runway — how many months can you live on current NW at avg burn rate
    const avgMonthlyExpenses = windowLen > 0 ? expensesAbs / windowLen : 0;
    const monthlyRunway = avgMonthlyExpenses > 0
      ? Math.round(currentNW / avgMonthlyExpenses)
      : 0;

    return {
      chartData,
      totalNetWorth: currentNW,
      ytdChange,
      avgSavingsRate,
      savingsRateChange,
      highestBurnCategory,
      highestBurnAmount,
      totalIncome: income,
      totalExpenses: expensesAbs,
      bestSavingMonth: bestMonth.label,
      bestSavingAmount: Math.round(bestMonth.net),
      monthlyRunway,
    };
  }, [allAccounts, allTransactions, allCategories, timeframe, filterCurrency]);
}
