"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MonthlyNetWorth } from "@/lib/data/reports";

const NetWorthBarChart = dynamic(
  () => import("@/components/analytics/reports/net-worth-bar-chart"),
  { ssr: false },
);

interface NetWorthChartProps {
  chartData: MonthlyNetWorth[];
  totalNetWorth: number;
  ytdChange: number;
}

export function NetWorthChart({
  chartData,
  totalNetWorth,
  ytdChange,
}: NetWorthChartProps) {
  const hasData = chartData.some((d) => !d.isProjected);

  return (
    <Card className="p-10 flex flex-col flex-1 min-h-[480px] rounded-3xl relative overflow-hidden bg-card border-border/50 shadow-card">
      {/* Header */}
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div>
          <h3 className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-display font-bold mb-3">
            Total Net Worth
          </h3>
          <div className="text-foreground font-display text-6xl font-bold tracking-tighter leading-none">
            ${totalNetWorth.toLocaleString()}
          </div>
        </div>
        <Badge className="px-5 py-2 rounded-full text-xs font-display font-bold tracking-wider border-0 bg-positive/10 text-positive border-positive/20 gap-1">
          <ArrowUpRight size={14} />
          {ytdChange >= 0 ? "+" : ""}
          {ytdChange}% YTD
        </Badge>
      </div>

      {/* Chart */}
      <div className="flex-1 mt-auto pt-8 relative z-10">
        {!hasData ? (
          <div className="w-full min-h-[280px] flex items-center justify-center">
            <p className="text-muted-foreground text-sm font-display">
              No data for this period
            </p>
          </div>
        ) : (
          <NetWorthBarChart chartData={chartData} />
        )}
      </div>

      {/* Decorative glow */}
      <div className="absolute -right-24 -top-24 size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </Card>
  );
}
