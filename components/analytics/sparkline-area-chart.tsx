"use client";

import { Area, AreaChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface SparklineAreaChartProps {
  data: Array<Record<string, unknown>>;
  config: ChartConfig;
  colorVar: string;
  gradientId: string;
  gradientOpacity?: number;
  isAnimationActive?: boolean;
  animationDuration?: number;
  tooltip?: boolean;
}

export default function SparklineAreaChart({
  data,
  config,
  colorVar,
  gradientId,
  gradientOpacity = 0.4,
  isAnimationActive = false,
  animationDuration,
  tooltip = false,
}: SparklineAreaChartProps) {
  return (
    <ChartContainer config={config} className="w-full h-full">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={colorVar}
              stopOpacity={gradientOpacity}
            />
            <stop offset="95%" stopColor={colorVar} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={colorVar}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={isAnimationActive}
          animationDuration={animationDuration}
        />
        {tooltip && (
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value) => [`$${value}`, "Daily"]}
              />
            }
            cursor={false}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}
