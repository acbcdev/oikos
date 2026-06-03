"use client";

import { useState, useRef } from "react";
import { BarChart3, TrendingUp, Bitcoin, Loader2 } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils/currency";
import type { AssetSearchResult } from "@/app/api/search/assets/route";

const typeConfig = {
  stock: {
    icon: BarChart3,
    label: "Stock",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
  etf: {
    icon: TrendingUp,
    label: "ETF",
    color: "text-purple-400",
    bg: "bg-purple-500/15",
  },
  crypto: {
    icon: Bitcoin,
    label: "Crypto",
    color: "text-primary",
    bg: "bg-primary/15",
  },
};

interface AssetSearchComboboxProps {
  onSelect: (asset: AssetSearchResult) => void;
}

export function AssetSearchCombobox({ onSelect }: AssetSearchComboboxProps) {
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // Map ticker → full result so we can look up on selection
  const resultMap = useRef(new Map<string, AssetSearchResult>());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(
          `/api/search/assets?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        const fetched: AssetSearchResult[] = data.results ?? [];
        resultMap.current.clear();
        fetched.forEach((r) => resultMap.current.set(r.ticker, r));
        setResults(fetched);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleValueChange(ticker: string | null) {
    if (!ticker) return;
    const asset = resultMap.current.get(ticker);
    if (asset) onSelect(asset);
  }

  return (
    <Combobox
      onValueChange={handleValueChange}
      // Disable built-in client filtering — results come from API already filtered
      filter={() => true}
    >
      <ComboboxInput
        onChange={handleInputChange}
        placeholder="Search stocks, ETFs, crypto..."
        showTrigger={false}
        showClear
        autoFocus
        className="w-full rounded-xl min-h-11.5 border border-transparent bg-secondary/60 focus-within:ring-2 focus-within:ring-primary/50 [&_input]:text-sm [&_input]:font-body [&_input]:placeholder:text-muted-foreground"
      >
        {loading && (
          <Loader2
            size={15}
            className="absolute -translate-y-1/2 pointer-events-none right-9 top-1/2 text-muted-foreground animate-spin"
          />
        )}
      </ComboboxInput>

      {(loading || hasSearched) && (
        <ComboboxContent
          align="center"
          className="bg-[rgba(14,20,34,0.98)] min-w-(--anchor-width)!"
        >
          <ComboboxList>
            {hasSearched && results.length === 0 && (
              <p className="py-6 text-sm text-center text-muted-foreground font-body">
                {loading
                  ? "Searching..."
                  : "No results — try a different name or ticker"}
              </p>
            )}

            {results.map((asset) => {
              const cfg = typeConfig[asset.type];
              const Icon = cfg.icon;
              return (
                <ComboboxItem
                  key={`${asset.ticker}-${asset.type}`}
                  value={asset.ticker}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                >
                  <span
                    className={cn(
                      "size-9 rounded-lg flex items-center justify-center shrink-0",
                      cfg.bg,
                    )}
                  >
                    <Icon size={15} className={cfg.color} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-display text-foreground">
                        {asset.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
                          cfg.bg,
                          cfg.color,
                        )}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {asset.ticker}
                      {asset.exchange && (
                        <span className="opacity-60"> · {asset.exchange}</span>
                      )}
                    </p>
                  </div>

                  {asset.price !== undefined && (
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-sm font-bold font-display text-foreground">
                        {fmt(asset.price)}
                      </span>
                      {asset.changePercent !== undefined && (
                        <span
                          className={cn(
                            "text-xs font-body",
                            asset.changePercent >= 0
                              ? "text-positive"
                              : "text-negative",
                          )}
                        >
                          {asset.changePercent >= 0 ? "+" : ""}
                          {asset.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </ComboboxItem>
              );
            })}
          </ComboboxList>
        </ComboboxContent>
      )}
    </Combobox>
  );
}
