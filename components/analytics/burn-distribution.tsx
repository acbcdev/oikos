"use client";

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import type { ChartConfig } from "@/components/ui/chart";
import { fmt } from "@/lib/utils/currency";

const BurnDistributionChart = dynamic(
  () => import("@/components/analytics/burn-distribution-chart"),
  { ssr: false },
);

const CATEGORY_STYLE: Record<
  string,
  { color: string; type: string; bgBarClass: string; textClass: string }
> = {
  "Food & Drink": {
    color: "var(--color-primary)",
    type: "Variable",
    bgBarClass: "bg-primary",
    textClass: "text-primary",
  },
  Transport: {
    color: "#60a5fa",
    type: "Transport",
    bgBarClass: "bg-blue-400",
    textClass: "text-blue-400",
  },
  Shopping: {
    color: "#c084fc",
    type: "Variable",
    bgBarClass: "bg-purple-400",
    textClass: "text-purple-400",
  },
  Entertainment: {
    color: "#f472b6",
    type: "Leisure",
    bgBarClass: "bg-pink-400",
    textClass: "text-pink-400",
  },
};

const FALLBACK_COLORS = ["#94a3b8", "#64748b", "#475569", "#334155"];

interface BurnDistributionProps {
  categoryBreakdown: Array<{ label: string; amount: number; percent: number }>;
  totalCategorySpend: number;
  displayCurrency: string;
}

export function BurnDistribution({
  categoryBreakdown,
  totalCategorySpend,
  displayCurrency,
}: BurnDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const isEmpty = categoryBreakdown.length === 0;

  const categories = isEmpty
    ? []
    : categoryBreakdown.map((cat, i) => {
        const style = CATEGORY_STYLE[cat.label] ?? {
          color: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          type: "Other",
          bgBarClass: "bg-slate-400",
          textClass: "text-slate-400",
        };
        return { ...cat, ...style };
      });

  const chartConfig = Object.fromEntries(
    categories.map((c) => [
      c.label.toLowerCase(),
      { label: c.label, color: c.color },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card className="p-8 flex-1 min-h-120 flex flex-col relative overflow-hidden rounded-2xl glass-card">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-foreground font-display text-2xl font-bold uppercase tracking-wider">
            Burn Distribution
          </h3>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Categorical breakdown for the last 30 days
          </p>
        </div>
        <Button
          variant="ghost"
          className="gap-3 px-5 py-2.5 h-auto text-xs font-display font-bold uppercase tracking-widest"
        >
          View Detailed Ledger
          <ArrowRight size={14} />
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No expenses in the last 30 days
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Donut chart */}
          <div className="relative flex flex-col items-center w-full lg:w-auto shrink-0">
            <BurnDistributionChart
              categories={categories}
              chartConfig={chartConfig}
              displayCurrency={displayCurrency}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />

            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <span className="text-foreground font-display text-3xl font-bold tracking-tighter">
                {fmt(totalCategorySpend, displayCurrency)}
              </span>
              <span className="text-muted-foreground font-display text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
                Total Spend
              </span>
            </div>
          </div>

          {/* Legend + bars */}
          <div className="flex-1 w-full flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat, i) => (
                <button
                  key={cat.label}
                  type="button"
                  aria-label={`${cat.label}: ${cat.percent}%`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-default border border-transparent hover:bg-accent/40 hover:border-white/8 bg-transparent text-left w-full"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex(undefined)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`font-display font-bold text-sm ${cat.textClass}`}
                      >
                        {cat.label}
                      </span>
                      <span
                        className={`font-display text-xs font-bold ${cat.textClass} opacity-70`}
                      >
                        {fmt(cat.amount, displayCurrency)}
                      </span>
                    </div>
                    <span className="text-muted-foreground font-body text-[10px] uppercase tracking-tight">
                      {cat.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex justify-between font-display text-[10px] font-bold uppercase tracking-widest">
                    <span className={cat.textClass}>{cat.label}</span>
                    <span className={`${cat.textClass} opacity-60`}>
                      {cat.percent}% · {fmt(cat.amount, displayCurrency)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${cat.percent}%`,
                        background: cat.color,
                        boxShadow: `0 0 8px ${cat.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
