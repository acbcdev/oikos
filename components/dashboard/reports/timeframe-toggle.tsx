"use client";

import { Button } from "@/components/ui/button";
import type { Timeframe } from "@/lib/data/reports";

const timeframes: Timeframe[] = ["1M", "3M", "6M", "1Y", "YTD"];

interface TimeframeToggleProps {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
}

export function TimeframeToggle({ timeframe: active, setTimeframe: setActive }: TimeframeToggleProps) {
  return (
    <div className="flex p-1.5 bg-card border border-border/50 rounded-xl">
      {timeframes.map((tf) => (
        <Button
          key={tf}
          variant={active === tf ? "default" : "ghost"}
          size="sm"
          onClick={() => setActive(tf)}
          className="px-5 text-[11px] font-display font-bold uppercase tracking-widest"
        >
          {tf}
        </Button>
      ))}
    </div>
  );
}
