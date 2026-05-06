"use client";

import { useMemo } from "react";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useInvestmentStore, usePortfolioMetrics } from "@/lib/store/investment-store";
import { formatCurrency, formatCurrencySplit } from "@/lib/data/wallet";
import { PortfolioCard } from "./portfolio-card";

interface PortfoliosPaneProps {
  selectedPortfolioId: string | null;
  onSelectPortfolio: (id: string | null) => void;
  onCreatePortfolio: () => void;
}

export function PortfoliosPane({
  selectedPortfolioId,
  onSelectPortfolio,
  onCreatePortfolio,
}: PortfoliosPaneProps) {
  const portfolios = useInvestmentStore((s) => s.portfolios);
  const globalMetrics = usePortfolioMetrics();
  const isGain = globalMetrics.totalGain >= 0;

  // Stable selector — no derived array in selector
  const allPositions = useInvestmentStore((s) => s.positions);
  const displayCurrency = useMemo(
    () => allPositions.find((p) => !p.soldAt)?.currency ?? "USD",
    [allPositions],
  );

  const { whole, decimal } = formatCurrencySplit(globalMetrics.totalValue, displayCurrency);

  return (
    <section>
      <header className="mb-6">
        <p className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em] font-bold">
          Portfolio Value
        </p>

        <div className="flex items-baseline gap-3 mt-2">
          <h2 className="font-display font-bold text-foreground tabular-nums leading-none">
            <span className="text-5xl">{whole}</span>
            <span className="text-3xl text-muted-foreground">{decimal}</span>
          </h2>
          {globalMetrics.totalCostBasis > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-display font-bold ${
                isGain ? "text-positive" : "text-negative"
              }`}
            >
              {isGain ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isGain ? "+" : ""}
              {formatCurrency(globalMetrics.totalGain, displayCurrency)}{" "}
              <span className="opacity-70 text-xs">
                ({isGain ? "+" : ""}
                {globalMetrics.totalGainPct.toFixed(2)}%)
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs font-display text-muted-foreground uppercase tracking-wider font-bold">
            {portfolios.length} Portfolio{portfolios.length !== 1 ? "s" : ""}
          </p>
          <Button size="xl" onClick={onCreatePortfolio}>
            <Plus size={16} />
            Create Portfolio
            <Kbd>C</Kbd>
          </Button>
        </div>
      </header>

      <ScrollArea className="w-full rounded-md">
        <div className="flex items-stretch gap-4 pb-4">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="w-[calc((100%-2*1rem)/3)] shrink-0">
              <PortfolioCard
                portfolio={portfolio}
                isSelected={selectedPortfolioId === portfolio.id}
                onSelect={() =>
                  onSelectPortfolio(
                    selectedPortfolioId === portfolio.id ? null : portfolio.id,
                  )
                }
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
