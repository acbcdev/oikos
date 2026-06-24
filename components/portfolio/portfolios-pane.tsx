"use client";

import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { useMetrics } from "@/lib/hooks/use-metrics";
import { totalValue, totalGain, totalGainPct, costBasis, realizedGain, realizedValue, byType } from "@/lib/hooks/metrics-portfolio";
import { fmt, fmtSplit } from "@/lib/utils/currency";
import { AllocationBar } from "./allocation-bar";
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
  const allPositions = useInvestmentStore((s) => s.positions);

  const displayPositions = useMemo(
    () => selectedPortfolioId ? allPositions.filter((p) => p.portfolioId === selectedPortfolioId) : allPositions,
    [allPositions, selectedPortfolioId],
  );
  const displayCurrency = useMemo(
    () => allPositions.find((p) => !p.soldAt)?.currency ?? "USD",
    [allPositions],
  );

  const metrics = useMetrics(
    { data: { positions: displayPositions } },
    { totalValue, totalGain, totalGainPct, totalCostBasis: costBasis, realizedGain, realizedValue, byType },
  );
  const { totalValue: globalTotalValue } = useMetrics(
    { data: { positions: allPositions } },
    { totalValue },
  );

  const isGain = metrics.totalGain >= 0;
  const isRealizedGain = metrics.realizedGain >= 0;

  const selectedPortfolioName = selectedPortfolioId
    ? (portfolios.find((p) => p.id === selectedPortfolioId)?.name ??
      "Portfolio")
    : null;

  const { whole, decimal } = fmtSplit(metrics.totalValue, displayCurrency);

  return (
    <section>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <p className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em] font-bold">
            {selectedPortfolioName
              ? `${selectedPortfolioName} · Value`
              : "Total Portfolio Value"}
          </p>

          <div className="flex items-baseline gap-3 mt-2">
            <h2 className="font-display font-bold text-foreground tabular-nums leading-none">
              <span className="text-5xl">{whole}</span>
              <span className="text-3xl text-muted-foreground">{decimal}</span>
            </h2>
            {metrics.totalCostBasis > 0 && (
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-display font-bold ${
                  isGain ? "text-positive" : "text-negative"
                }`}
              >
                {isGain ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isGain ? "+" : ""}
                {fmt(metrics.totalGain, displayCurrency)}{" "}
                <span className="opacity-70 text-xs">
                  ({isGain ? "+" : ""}
                  {metrics.totalGainPct.toFixed(2)}%)
                </span>
              </span>
            )}
          </div>

          {(metrics.realizedGain !== 0 || metrics.totalCostBasis > 0) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-xs font-display text-muted-foreground tabular-nums">
              {metrics.realizedGain !== 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="uppercase tracking-wider font-bold opacity-70">Realized</span>
                  <span
                    className={`font-bold ${isRealizedGain ? "text-positive" : "text-negative"}`}
                  >
                    {isRealizedGain ? "+" : ""}
                    {fmt(metrics.realizedGain, displayCurrency)}
                  </span>
                  <span className="opacity-70">
                    from {fmt(metrics.realizedValue, displayCurrency)} in sales
                  </span>
                </span>
              )}
              {metrics.totalCostBasis > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="uppercase tracking-wider font-bold opacity-70">Invested</span>
                  {fmt(metrics.totalCostBasis, displayCurrency)} → {fmt(metrics.totalValue, displayCurrency)}
                </span>
              )}
              <span className="uppercase tracking-wider font-bold opacity-70">
                {selectedPortfolioId
                  ? `${globalTotalValue > 0 ? `${fmt(globalTotalValue, displayCurrency)} total · ` : ""}${portfolios.length} Portfolio${portfolios.length !== 1 ? "s" : ""}`
                  : `${portfolios.length} Portfolio${portfolios.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          )}

          <AllocationBar byType={metrics.byType} currency={displayCurrency} />
        </div>

        <Button size="xl" onClick={onCreatePortfolio} className="shrink-0">
          <Plus size={16} />
          Create Portfolio
          <Kbd>C</Kbd>
        </Button>
      </header>

      <ScrollArea className="w-full rounded-md">
        <div className="flex items-stretch gap-4 pb-4">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="w-[calc((100%-2*1rem)/3)] shrink-0"
            >
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
