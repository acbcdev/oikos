"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCompactCurrency, type MonthlyNetWorth } from "@/lib/data/reports";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { useReportData } from "@/lib/store/wallet-store";

const chartConfig = {
  value: {
    label: "Net Worth",
    color: "var(--color-chart-5)",
  },
} satisfies ChartConfig;

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: MonthlyNetWorth }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  if (data.isProjected) return null;

  return (
    <div className="bg-card border border-border px-3 py-1.5 rounded-lg shadow-xl">
      <span className="text-foreground font-display font-bold text-xs">
        {formatCompactCurrency(data.value)}
      </span>
    </div>
  );
}

export function NetWorthChart() {
  const { timeframe } = useDashboardStore();
  const { chartData, totalNetWorth, ytdChange } = useReportData(timeframe);

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
          {ytdChange >= 0 ? "+" : ""}{ytdChange}% YTD
        </Badge>
      </div>

      {/* Chart */}
      <div className="flex-1 mt-auto pt-8 relative z-10">
        <ChartContainer config={chartConfig} className="w-full h-full min-h-[280px]">
          <BarChart
            data={chartData}
            margin={{ top: 40, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="16%"
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-muted-foreground)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
              dy={12}
            />
            <YAxis hide />
            {[0.25, 0.5, 0.75].map((y) => (
              <ReferenceLine
                key={y}
                y={100000 + y * 50000}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="0"
              />
            ))}
            <ChartTooltip
              content={<CustomTooltip />}
              cursor={false}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={
                    entry.isCurrent
                      ? "var(--color-primary)"
                      : entry.isProjected
                        ? "transparent"
                        : "var(--color-accent)"
                  }
                  stroke={
                    entry.isProjected
                      ? "rgba(255,255,255,0.1)"
                      : entry.isCurrent
                        ? "rgba(212,255,0,0.5)"
                        : "rgba(255,255,255,0.05)"
                  }
                  strokeWidth={entry.isProjected ? 2 : 1}
                  strokeDasharray={entry.isProjected ? "6 4" : "0"}
                  opacity={entry.isProjected ? 0.4 : 1}
                  style={
                    entry.isCurrent
                      ? { filter: "drop-shadow(0 0 12px rgba(212,255,0,0.3))" }
                      : undefined
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Decorative glow */}
      <div className="absolute -right-24 -top-24 size-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </Card>
  );
}
