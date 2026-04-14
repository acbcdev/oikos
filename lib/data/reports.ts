export interface MonthlyNetWorth {
  month: string;
  value: number;
  isCurrent?: boolean;
  isProjected?: boolean;
}

export type Timeframe = "1M" | "3M" | "6M" | "1Y" | "YTD";

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m : m.toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `$${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return `$${value}`;
}
