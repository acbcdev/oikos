"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Luggage,
  CalendarDays,
  PiggyBank,
  CircleCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useTrackerStore, useTrackerData } from "@/lib/store/tracker-store";
import { isHighSpend } from "@/lib/services/spend-analysis";
import { fmt, fmtSplit } from "@/lib/utils/currency";

const SparklineAreaChart = dynamic(
  () => import("@/components/analytics/sparkline-area-chart"),
  { ssr: false },
);

const netWorthChartConfig = {
  value: { label: "Net Worth", color: "var(--color-positive)" },
} satisfies ChartConfig;

const burnChartConfig = {
  value: { label: "Daily Burn", color: "var(--color-destructive)" },
} satisfies ChartConfig;

// ─── Net Worth ─────────────────────────────────────────────────────────────────

interface NetWorthCardProps {
  totalNetWorth: number;
  netWorthSparkline: Array<{ month: string; value: number }>;
  netWorthChangePct: number;
  displayCurrency: string;
}

export function NetWorthCard({
  totalNetWorth,
  netWorthSparkline,
  netWorthChangePct,
  displayCurrency,
}: NetWorthCardProps) {
  useEffect(() => {
    useWalletStore.persist.rehydrate();
  }, []);

  const isUp = netWorthChangePct >= 0;
  const { whole, decimal } = fmtSplit(totalNetWorth, displayCurrency);

  return (
    <Card className="rounded-2xl py-0 h-56 relative overflow-hidden group glass-card">
      <CardHeader className="p-6 pb-0 relative z-10">
        <span className="text-muted-foreground font-display text-[10px] font-bold uppercase tracking-[0.2em]">
          Total Net Worth
        </span>
        <CardAction>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-positive/10 border border-positive/20">
            <Landmark size={18} className="text-positive" />
          </div>
        </CardAction>
      </CardHeader>

      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30 pointer-events-none">
        <SparklineAreaChart
          data={netWorthSparkline}
          config={netWorthChartConfig}
          colorVar="var(--color-positive)"
          gradientId="netWorthGrad"
        />
      </div>

      <CardContent className="px-6 pb-4 relative z-10 mt-auto">
        <div className="text-foreground font-display text-5xl font-bold tracking-tighter mb-2 flex items-end gap-1">
          {whole}
          {decimal && (
            <span className="text-foreground/35 text-2xl font-normal mb-1">
              {decimal}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider flex items-center gap-1 border-0 ${
              isUp
                ? "bg-positive/10 text-positive"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {isUp ? "+" : ""}
            {netWorthChangePct.toFixed(1)}%
          </Badge>
          <span className="text-muted-foreground font-body text-xs">
            vs last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Active Goal ───────────────────────────────────────────────────────────────

export function ActiveGoalCard() {
  useEffect(() => {
    useTrackerStore.persist.rehydrate();
  }, []);

  const goals = useTrackerStore((s) => s.goals);

  const goal = goals.reduce<(typeof goals)[number] | null>((worst, g) => {
    const pct = g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 1;
    if (!worst) return g;
    const worstPct =
      worst.targetAmount > 0 ? worst.currentAmount / worst.targetAmount : 1;
    return pct < worstPct ? g : worst;
  }, null);

  if (!goal) {
    return (
      <Card className="rounded-2xl py-0 h-56 relative overflow-hidden group glass-card">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-sm">No savings goals yet</p>
        </CardContent>
      </Card>
    );
  }

  const percent = Math.round(
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
  );
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Card className="rounded-2xl py-0 h-56 relative overflow-hidden group glass-card">
      <CardHeader className="p-6 pb-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20">
            <Luggage size={18} className="text-primary" />
          </div>
          <div>
            <span className="block text-muted-foreground font-display text-[9px] font-bold uppercase tracking-[0.18em] leading-none mb-1">
              Active Goal
            </span>
            <h3 className="text-foreground font-display text-lg font-bold leading-none truncate max-w-[140px]">
              {goal.name}
            </h3>
          </div>
        </div>
        <CardAction>
          <div className="text-right">
            <div className="text-foreground font-display text-2xl font-bold tracking-tight">
              {fmt(goal.currentAmount, goal.currency)}
            </div>
            <div className="text-muted-foreground font-display text-[9px] font-bold uppercase tracking-tight">
              of {fmt(goal.targetAmount, goal.currency)}
            </div>
          </div>
        </CardAction>
      </CardHeader>

      <CardFooter className="p-6 pt-0 mt-auto relative z-10 border-t-0 bg-transparent flex-col items-stretch">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={12} className="text-primary" />
            <span className="text-muted-foreground font-body text-[10px] uppercase tracking-wide">
              {goal.deadline
                ? new Date(goal.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No deadline"}
            </span>
          </div>
          <span className="text-primary font-display font-bold text-base">
            {percent}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden bg-white/5">
          <div
            className="h-full rounded-full relative transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(percent, 100)}%`,
              background:
                "linear-gradient(90deg, var(--color-primary) 0%, #e8ff4d 100%)",
              boxShadow: "0 0 12px rgba(212,255,0,0.4)",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-primary/5 border-primary/15">
            <PiggyBank size={12} className="text-primary" />
            <span className="text-primary font-display text-[9px] font-bold uppercase tracking-widest">
              {fmt(remaining, goal.currency)} left
            </span>
          </div>
          <div className="flex items-center gap-1 text-positive font-display text-[9px] font-bold uppercase tracking-widest">
            <CircleCheck size={12} />
            {percent >= 100 ? "Complete" : "In Progress"}
          </div>
        </div>
      </CardFooter>

      <div className="absolute -right-4 -bottom-4 opacity-[0.025] rotate-12 pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-500">
        <Luggage size={110} className="text-foreground" />
      </div>
    </Card>
  );
}

// ─── 30-Day Burn ───────────────────────────────────────────────────────────────

interface BurnRateCardProps {
  burnTotal: number;
  todayBurn: number;
  burnSparkline: Array<{ day: string; value: number }>;
  displayCurrency: string;
}

export function BurnRateCard({
  burnTotal,
  todayBurn,
  burnSparkline,
  displayCurrency,
}: BurnRateCardProps) {
  const { monitors } = useTrackerData();
  const { whole, decimal } = fmtSplit(burnTotal, displayCurrency);

  const totalLimit = monitors.reduce((s, m) => s + m.limit, 0);
  const isHighRate = isHighSpend(burnTotal, totalLimit);

  return (
    <Card className="rounded-2xl py-0 h-56 relative overflow-hidden group glass-card">
      <CardHeader className="p-6 pb-0 relative z-10">
        <span className="text-muted-foreground font-display text-[10px] font-bold uppercase tracking-[0.2em]">
          30-Day Burn
        </span>
        <CardAction>
          <Badge
            className={`px-2.5 py-0.5 rounded-full font-display text-[9px] font-bold uppercase tracking-wider border-0 ${
              isHighRate
                ? "bg-destructive/15 text-destructive"
                : "bg-positive/10 text-positive"
            }`}
          >
            {isHighRate ? "High Rate" : "On Track"}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="px-6 relative z-10">
        <div className="text-foreground font-display text-4xl font-bold tracking-tighter mb-1 flex items-end gap-1">
          {whole}
          {decimal && (
            <span className="text-muted-foreground text-xl font-normal mb-0.5">
              {decimal}
            </span>
          )}
        </div>
        <p className="text-muted-foreground font-body text-xs flex items-center gap-1.5">
          {todayBurn > 0 ? (
            <>
              <TrendingDown size={12} className="text-destructive" />+
              {fmt(todayBurn, displayCurrency)} tracked today
            </>
          ) : (
            <>
              <TrendingUp size={12} className="text-positive" />
              No spend today
            </>
          )}
        </p>
      </CardContent>

      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none">
        <SparklineAreaChart
          data={burnSparkline}
          config={burnChartConfig}
          colorVar="var(--color-destructive)"
          gradientId="burnGrad"
          gradientOpacity={0.3}
          isAnimationActive
          animationDuration={1200}
          tooltip
        />
      </div>
    </Card>
  );
}
