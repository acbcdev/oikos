import { catLabel } from "@/lib/data/categories";
import type { MonthlyNetWorth, Timeframe } from "@/lib/data/reports";
import { Dater } from "@/lib/utils/dater";
import { bestSaving, topBurn, txSlice } from "./metric-fns";
import type { MetricData, MetricOptions } from "./use-metrics";

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export function netWorth({ accounts = [] }: MetricData): number {
  return accounts.reduce((s, a) => s + a.balance, 0);
}

export function worthSparkline({
  transactions = [],
}: MetricData): Array<{ month: string; value: number }> {
  const now = Dater.now();
  return Array.from({ length: 6 }, (_, i) => {
    const d = now.addMonths(-(5 - i));
    const ms = d.month();
    const value = transactions
      .filter((t) => t.date.startsWith(ms))
      .reduce((s, t) => s + t.amount, 0);
    return { month: d.short(), value };
  });
}

export function worthChange({ transactions = [] }: MetricData): number {
  const now = Dater.now();
  const thisMs = now.month();
  const lastMs = now.addMonths(-1).month();
  const thisNet = transactions
    .filter((t) => t.date.startsWith(thisMs))
    .reduce((s, t) => s + t.amount, 0);
  const lastNet = transactions
    .filter((t) => t.date.startsWith(lastMs))
    .reduce((s, t) => s + t.amount, 0);
  return lastNet !== 0 ? ((thisNet - lastNet) / Math.abs(lastNet)) * 100 : 0;
}

export function burnTotal({ transactions = [] }: MetricData): number {
  const ago = Dater.now().addDays(-30).iso();
  return transactions
    .filter((t) => t.date >= ago && t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}

export function todayBurn({ transactions = [] }: MetricData): number {
  const today = Dater.now().iso();
  return transactions
    .filter((t) => t.date === today && t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}

export function burnSparkline({
  transactions = [],
}: MetricData): Array<{ day: string; value: number }> {
  const ago = Dater.now().addDays(-30).iso();
  const recent = transactions.filter((t) => t.date >= ago && t.amount < 0);
  const map = new Map<string, number>();
  recent.forEach((t) => {
    map.set(t.date, (map.get(t.date) ?? 0) + Math.abs(t.amount));
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, value]) => ({ day, value }));
}

export function catBreakdown({
  transactions = [],
}: MetricData): Array<{ label: string; amount: number; percent: number }> {
  const ago = Dater.now().addDays(-30).iso();
  const recent = transactions.filter((t) => t.date >= ago && t.amount < 0);
  const map = new Map<string, number>();
  recent.forEach((t) => {
    if (
      !t.categoryId ||
      t.categoryId === "transfer" ||
      t.categoryId === "income"
    )
      return;
    const name = catLabel(t.categoryId);
    map.set(name, (map.get(name) ?? 0) + Math.abs(t.amount));
  });
  const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([label, amount]) => ({
      label,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));
}

export function catSpend({ transactions = [] }: MetricData): number {
  const ago = Dater.now().addDays(-30).iso();
  return transactions
    .filter(
      (t) =>
        t.date >= ago &&
        t.amount < 0 &&
        t.categoryId &&
        t.categoryId !== "transfer" &&
        t.categoryId !== "income",
    )
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}

// ─── Reports ───────────────────────────────────────────────────────────────────

function chartMonths(
  timeframe: Timeframe,
): Array<{ year: number; month: number }> {
  const now = Dater.now();
  const curYear = now.year();
  const curMonth = now.monthIndex();

  let startYear: number, startMonth: number;
  switch (timeframe) {
    case "1M": {
      startYear = curYear;
      startMonth = curMonth;
      break;
    }
    case "3M": {
      const d = now.addMonths(-2);
      startYear = d.year();
      startMonth = d.monthIndex();
      break;
    }
    case "6M": {
      const d = now.addMonths(-5);
      startYear = d.year();
      startMonth = d.monthIndex();
      break;
    }
    case "1Y": {
      const d = now.addMonths(-11);
      startYear = d.year();
      startMonth = d.monthIndex();
      break;
    }
    case "YTD": {
      startYear = curYear;
      startMonth = 0;
      break;
    }
  }

  const months: Array<{ year: number; month: number }> = [];
  let y = startYear,
    m = startMonth;
  while (y < curYear || (y === curYear && m <= curMonth)) {
    months.push({ year: y, month: m });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return months;
}

export function chartData(
  { accounts = [], transactions = [] }: MetricData,
  { timeframe = "YTD" }: MetricOptions,
): MonthlyNetWorth[] {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  const now = Dater.now();
  const curYear = now.year();
  const curMonth = now.monthIndex();
  const currentNW = accounts.reduce((s, a) => s + a.balance, 0);
  const months = chartMonths(timeframe as Timeframe);

  const last3Net = [0, 1, 2].map((i) => {
    const ms = now.addMonths(-i).month();
    return tx
      .filter((t) => t.date.startsWith(ms))
      .reduce((s, t) => s + t.amount, 0);
  });
  const projected: MonthlyNetWorth = {
    month: now.addMonths(1).short(),
    value: Math.max(0, currentNW + last3Net.reduce((s, v) => s + v, 0) / 3),
    isProjected: true,
  };

  return [
    ...months
      .filter(({ year, month }) =>
        tx.some((t) => t.date.startsWith(Dater.ofYM(year, month).month())),
      )
      .map(({ year, month }) => {
        const endStr = `${Dater.ofYM(year, month).month()}-31`;
        const laterNet = tx
          .filter((t) => t.date > endStr)
          .reduce((s, t) => s + t.amount, 0);
        return {
          month: Dater.ofYM(year, month).short(),
          value: Math.max(0, currentNW - laterNet),
          ...(year === curYear && month === curMonth
            ? { isCurrent: true as const }
            : {}),
        };
      }),
    projected,
  ];
}

export function ytdChange({ accounts = [], transactions = [] }: MetricData): number {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  const now = Dater.now();
  const currentNW = accounts.reduce((s, a) => s + a.balance, 0);
  const ytdNet = tx
    .filter((t) => t.date.slice(0, 7) >= `${now.year()}-01`)
    .reduce((s, t) => s + t.amount, 0);
  const startNW = currentNW - ytdNet;
  return startNW > 0
    ? Math.round(((currentNW - startNW) / Math.abs(startNW)) * 1000) / 10
    : 0;
}

export function income(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): number {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  return txSlice(tx, opts.timeframe ?? "YTD")
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
}

export function expenses(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): number {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  return txSlice(tx, opts.timeframe ?? "YTD")
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}

export function savingsRate(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): number {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  const window = txSlice(tx, opts.timeframe ?? "YTD");
  const inc = window
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const exp = window
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  return inc > 0 ? Math.round(((inc - exp) / inc) * 1000) / 10 : 0;
}

export function savingsChange(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): number {
  const tf = opts.timeframe ?? "YTD";
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  const now = Dater.now();
  const months = chartMonths(tf);
  const windowLen = months.length;

  const window = txSlice(tx, tf);
  const inc = window
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const exp = window
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const current = inc > 0 ? Math.round(((inc - exp) / inc) * 1000) / 10 : 0;

  const { year: sy, month: sm } = months[0] ?? {
    year: now.year(),
    month: now.monthIndex(),
  };
  const prevEnd = Dater.ofYM(sy, sm).addMonths(-1);
  const prevEndStr = prevEnd.month();
  const prevStartStr = prevEnd.addMonths(-(windowLen - 1)).month();
  const prevWindow = tx.filter((t) => {
    const m = t.date.slice(0, 7);
    return m >= prevStartStr && m <= prevEndStr;
  });
  const pInc = prevWindow
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const pExp = prevWindow
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const prev = pInc > 0 ? Math.round(((pInc - pExp) / pInc) * 1000) / 10 : 0;

  return Math.round((current - prev) * 10) / 10;
}

export function topCategory(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): string {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  return topBurn(txSlice(tx, opts.timeframe ?? "YTD"))?.name ?? "—";
}

export function topAmount(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): number {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  return topBurn(txSlice(tx, opts.timeframe ?? "YTD"))?.amount ?? 0;
}

export function bestMonth(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): string {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  const now = Dater.now();
  const months = chartMonths(opts.timeframe ?? "YTD");
  return bestSaving(tx, months, now.year()).label;
}

export function bestSaved(
  { transactions = [] }: MetricData,
  opts: MetricOptions,
): number {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  const now = Dater.now();
  const months = chartMonths(opts.timeframe ?? "YTD");
  return Math.round(bestSaving(tx, months, now.year()).net);
}

export function runway(
  { accounts = [], transactions = [] }: MetricData,
  opts: MetricOptions,
): number {
  const tx = transactions.filter((t) => t.categoryId !== "transfer");
  const currentNW = accounts.reduce((s, a) => s + a.balance, 0);
  const months = chartMonths(opts.timeframe ?? "YTD");
  const window = txSlice(tx, opts.timeframe ?? "YTD");
  const exp = window
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const avg = months.length > 0 ? exp / months.length : 0;
  return avg > 0 ? Math.round(currentNW / avg) : 0;
}
