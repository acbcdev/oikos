"use client";

import { Cell, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { fmt } from "@/lib/utils/currency";

export interface BurnCategory {
  label: string;
  amount: number;
  percent: number;
  color: string;
  type: string;
  bgBarClass: string;
  textClass: string;
}

function renderActiveShape(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle,
    endAngle,
    fill,
  } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={(innerRadius as number) - 4}
        outerRadius={(outerRadius as number) + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={1}
      />
    </g>
  );
}

interface BurnDistributionChartProps {
  categories: BurnCategory[];
  chartConfig: ChartConfig;
  displayCurrency: string;
  activeIndex: number | undefined;
  setActiveIndex: (index: number | undefined) => void;
}

export default function BurnDistributionChart({
  categories,
  chartConfig,
  displayCurrency,
  activeIndex,
  setActiveIndex,
}: BurnDistributionChartProps) {
  const chartData = categories.map((c) => ({
    name: c.label,
    value: c.percent,
  }));

  return (
    <ChartContainer config={chartConfig} className="w-70 h-70">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={82}
          outerRadius={112}
          paddingAngle={chartData.length > 1 ? 3 : 0}
          dataKey="value"
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(undefined)}
          strokeWidth={0}
        >
          {chartData.map((_, index) => (
            <Cell
              key={categories[index].label}
              fill={categories[index].color}
              opacity={
                activeIndex === undefined || activeIndex === index ? 1 : 0.25
              }
              style={{
                transition: "opacity 0.2s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </Pie>
        <ChartTooltip
          wrapperStyle={{ zIndex: 100 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const entry = payload[0];
            const cat = categories.find((c) => c.label === entry.name);
            if (!cat) return null;
            return (
              <div className="bg-card border border-border/50 px-3 py-2 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <span className="font-display font-bold text-xs text-foreground">
                    {cat.label}
                  </span>
                </div>
                <div
                  className="font-display font-bold text-sm"
                  style={{ color: cat.color }}
                >
                  {fmt(cat.amount, displayCurrency)}
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    {cat.percent}%
                  </span>
                </div>
              </div>
            );
          }}
        />
      </PieChart>
    </ChartContainer>
  );
}
