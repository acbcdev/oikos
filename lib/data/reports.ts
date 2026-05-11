export interface MonthlyNetWorth {
  month: string;
  value: number;
  isCurrent?: boolean;
  isProjected?: boolean;
}

export type Timeframe = "1M" | "3M" | "6M" | "1Y" | "YTD";
