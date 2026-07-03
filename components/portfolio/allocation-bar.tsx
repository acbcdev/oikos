import type { AssetType } from "@/lib/data/portfolio";
import { fmt } from "@/lib/utils/currency";

const config: Record<AssetType, { label: string; bar: string; dot: string }> = {
  stock: { label: "Stock", bar: "bg-blue-400", dot: "bg-blue-400" },
  etf: { label: "ETF", bar: "bg-purple-400", dot: "bg-purple-400" },
  crypto: { label: "Crypto", bar: "bg-primary", dot: "bg-primary" },
  "real-estate": {
    label: "Real Estate",
    bar: "bg-orange-400",
    dot: "bg-orange-400",
  },
  bond: { label: "Bond", bar: "bg-chart-2", dot: "bg-chart-2" },
};

interface AllocationBarProps {
  byType: Record<AssetType, { value: number; pct: number }>;
  currency: string;
}

export function AllocationBar({ byType, currency }: AllocationBarProps) {
  const slices = (
    Object.entries(byType) as [AssetType, { value: number; pct: number }][]
  )
    .filter(([, { value }]) => value > 0)
    .sort((a, b) => b[1].value - a[1].value);

  if (slices.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
      <div className="flex h-1.5 w-40 overflow-hidden rounded-full bg-secondary/40 shrink-0">
        {slices.map(([type, { pct }]) => (
          <div
            key={type}
            className={config[type].bar}
            style={{ width: `${pct}%` }}
            aria-label={`${config[type].label} ${pct.toFixed(1)}%`}
          />
        ))}
      </div>

      {slices.map(([type, { value, pct }]) => (
        <span key={type} className="inline-flex items-center gap-1.5">
          <span
            className={`size-1.5 rounded-full ${config[type].dot}`}
            aria-hidden="true"
          />
          <span className="text-[11px] font-display font-bold text-foreground uppercase tracking-wider">
            {config[type].label}
          </span>
          <span className="text-[11px] font-display text-muted-foreground tabular-nums">
            {pct.toFixed(1)}% · {fmt(value, currency)}
          </span>
        </span>
      ))}
    </div>
  );
}
