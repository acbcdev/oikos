"use client";

import { PiggyBank, Flame, Trophy, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { useReportData } from "@/lib/store/wallet-store";
import { formatCompactCurrency } from "@/lib/data/reports";

export function SavingsRateCard() {
  const { timeframe } = useDashboardStore();
  const { avgSavingsRate, savingsRateChange } = useReportData(timeframe);
  const isPositive = savingsRateChange >= 0;

  return (
    <Card className="p-8 rounded-3xl flex flex-col justify-between shadow-card h-52 bg-card border-border/50 group transition-all duration-300 hover:-translate-y-1 hover:bg-secondary hover:border-border">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">
          Avg Savings Rate
        </span>
        <div className="bg-secondary p-2.5 rounded-xl border border-white/5">
          <PiggyBank size={22} className="text-primary" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <span className="text-foreground font-display text-4xl font-bold tracking-tighter">
            {avgSavingsRate}%
          </span>
          <span className={`text-sm font-display font-bold ${isPositive ? "text-positive" : "text-destructive"}`}>
            {isPositive ? "+" : ""}{savingsRateChange}%
          </span>
        </div>
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide">
          vs previous period
        </p>
      </div>
    </Card>
  );
}

export function HighestBurnCard() {
  const { timeframe } = useDashboardStore();
  const { highestBurnCategory, highestBurnAmount } = useReportData(timeframe);

  return (
    <Card className="p-8 rounded-3xl flex flex-col justify-between shadow-card h-52 bg-card border-border/50 group transition-all duration-300 hover:-translate-y-1 hover:bg-secondary hover:border-border">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">
          Highest Burn Category
        </span>
        <div className="bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
          <Flame size={22} className="text-destructive" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-foreground font-display text-2xl font-bold tracking-tight">
          {highestBurnCategory}
        </div>
        <div className="text-destructive font-display font-bold text-lg">
          ${highestBurnAmount}
          <span className="text-muted-foreground font-normal text-sm uppercase tracking-widest ml-1">
            /period
          </span>
        </div>
      </div>
    </Card>
  );
}

export function BestSavingMonthCard() {
  const { timeframe } = useDashboardStore();
  const { bestSavingMonth, bestSavingAmount } = useReportData(timeframe);

  return (
    <Card className="p-8 rounded-3xl flex flex-col justify-between shadow-card h-52 bg-card border-border/50 group transition-all duration-300 hover:-translate-y-1 hover:bg-secondary hover:border-border">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">
          Best Saving Month
        </span>
        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
          <Trophy size={22} className="text-primary" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-foreground font-display text-4xl font-bold tracking-tighter">
          {bestSavingMonth || "—"}
        </div>
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide">
          Saved{" "}
          <span className="text-positive font-bold">
            +${bestSavingAmount.toLocaleString()}
          </span>{" "}
          net
        </p>
      </div>
    </Card>
  );
}

export function IncomeVsSpendCard() {
  const { timeframe } = useDashboardStore();
  const { totalIncome, totalExpenses } = useReportData(timeframe);
  const total = totalIncome + totalExpenses;
  const incomePercent = total > 0 ? (totalIncome / total) * 100 : 50;
  const expensePercent = 100 - incomePercent;

  return (
    <Card className="p-8 rounded-3xl flex flex-col justify-between shadow-card h-52 bg-card border-border/50 group transition-all duration-300 hover:-translate-y-1 hover:bg-secondary hover:border-border">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">
          Income vs Spend
        </span>
        <div className="bg-secondary p-2.5 rounded-xl border border-white/5">
          <TrendingUp size={22} className="text-primary" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Bar */}
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div
            className="bg-positive rounded-l-full transition-all duration-500"
            style={{ width: `${incomePercent}%` }}
          />
          <div
            className="bg-destructive rounded-r-full transition-all duration-500"
            style={{ width: `${expensePercent}%` }}
          />
        </div>

        {/* Numbers */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-[10px] font-display font-bold uppercase tracking-widest mb-0.5">
              Income
            </span>
            <span className="text-positive font-display text-2xl font-bold tracking-tighter">
              {formatCompactCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] font-display font-bold uppercase tracking-widest mb-0.5">
              Spend
            </span>
            <span className="text-destructive font-display text-2xl font-bold tracking-tighter">
              {formatCompactCurrency(totalExpenses)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MonthlyRunwayCard() {
  const { timeframe } = useDashboardStore();
  const { monthlyRunway } = useReportData(timeframe);

  const years = Math.floor(monthlyRunway / 12);
  const months = monthlyRunway % 12;
  const label = monthlyRunway === 0
    ? "—"
    : years > 0
      ? `${years}y ${months}m`
      : `${months}m`;

  return (
    <Card className="p-8 rounded-3xl flex flex-col justify-between shadow-card h-52 bg-card border-border/50 group transition-all duration-300 hover:-translate-y-1 hover:bg-secondary hover:border-border">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-display font-bold tracking-[0.2em] uppercase">
          Monthly Runway
        </span>
        <div className="bg-secondary p-2.5 rounded-xl border border-white/5">
          <Clock size={22} className="text-primary" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-foreground font-display text-4xl font-bold tracking-tighter">
          {label}
        </div>
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide">
          at current burn rate
        </p>
      </div>
    </Card>
  );
}
