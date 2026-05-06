"use client";

import { useState, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import {
  useInvestmentStore,
  usePortfolioMetrics,
} from "@/lib/store/investment-store";
import { formatCurrency } from "@/lib/data/wallet";
import { PositionRow } from "./position-row";
import { AddPositionModal } from "./add-position-modal";

type GroupedPosition = ReturnType<
  typeof useInvestmentStore.getState
>["positions"][number];

function PortfolioGroup({
  portfolioId,
  label,
  positions,
}: {
  portfolioId: string;
  label: string;
  positions: GroupedPosition[];
}) {
  const [open, setOpen] = useState(true);
  const metrics = usePortfolioMetrics(portfolioId);
  const allPositions = useInvestmentStore((s) => s.positions);
  const currency =
    allPositions.find((p) => p.portfolioId === portfolioId && !p.soldAt)
      ?.currency ?? "USD";
  const isGain = metrics.totalGain >= 0;

  return (
    <div className="rounded-2xl bg-linear-to-br from-[rgba(28,37,59,0.35)] to-[rgba(19,26,42,0.5)] border border-white/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-5 py-4 transition-colors cursor-pointer hover:bg-white/3"
      >
        <div className="flex items-center min-w-0 gap-3">
          <span
            className={cn(
              "w-1 h-5 rounded-full shrink-0",
              isGain ? "bg-positive" : "bg-negative",
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 text-left">
            <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-[0.15em] truncate">
              {label}
            </h3>
            {metrics.totalValue > 0 && (
              <p className="text-xs font-display text-muted-foreground tabular-nums mt-0.5">
                {formatCurrency(metrics.totalValue, currency)}
                <span className="ml-2 tracking-normal normal-case text-muted-foreground/50">
                  · {positions.length} position
                  {positions.length !== 1 ? "s" : ""}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4 shrink-0">
          {metrics.totalCostBasis > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-display font-bold px-2.5 py-1 rounded-lg",
                isGain
                  ? "text-positive bg-positive/10"
                  : "text-negative bg-negative/10",
              )}
            >
              {isGain ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isGain ? "+" : ""}
              {formatCurrency(metrics.totalGain, currency)}{" "}
              <span className="opacity-70">
                ({isGain ? "+" : ""}
                {metrics.totalGainPct.toFixed(2)}%)
              </span>
            </span>
          )}
          <ChevronDown
            size={15}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
        </div>
      </button>

      {/* Positions */}
      {open && (
        <ul className="flex flex-col gap-3 px-4 pt-2 pb-4">
          {positions.map((pos) => (
            <li key={pos.id}>
              <PositionRow position={pos} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TABS = ["Current Positions", "Previous Sales"] as const;
type Tab = (typeof TABS)[number];

interface PositionsPaneProps {
  selectedPortfolioId: string | null;
}

export function PositionsPane({ selectedPortfolioId }: PositionsPaneProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Current Positions");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useHotkeys("n", () => setModalOpen(true), { preventDefault: true });

  const portfolios = useInvestmentStore((s) => s.portfolios);
  const allPositions = useInvestmentStore((s) => s.positions);

  const filteredPositions = useMemo(() => {
    const isCurrent = activeTab === "Current Positions";
    const q = query.toLowerCase().trim();

    return allPositions.filter((p) => {
      if (isCurrent && p.soldAt) return false;
      if (!isCurrent && !p.soldAt) return false;
      if (selectedPortfolioId && p.portfolioId !== selectedPortfolioId)
        return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.ticker?.toLowerCase().includes(q) &&
        !p.type.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [allPositions, activeTab, selectedPortfolioId, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredPositions>();
    for (const pos of filteredPositions) {
      const list = map.get(pos.portfolioId) ?? [];
      list.push(pos);
      map.set(pos.portfolioId, list);
    }
    return [...map.entries()]
      .map(([portfolioId, positions]) => {
        const portfolio = portfolios.find((p) => p.id === portfolioId);
        return {
          portfolioId,
          label: portfolio?.name ?? portfolioId,
          createdAt: portfolio?.createdAt ?? "",
          portfolioIndex: portfolios.findIndex((p) => p.id === portfolioId),
          positions,
        };
      })
      .sort((a, b) => {
        if (a.createdAt && b.createdAt)
          return a.createdAt.localeCompare(b.createdAt);
        return a.portfolioIndex - b.portfolioIndex;
      });
  }, [filteredPositions, portfolios]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold tracking-wider uppercase font-display text-foreground">
          Positions
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 mb-4 bg-secondary/40 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-colors",
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search + Add button */}
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center flex-1 gap-3 px-4 py-3 bg-secondary/60 rounded-xl">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by name, ticker, or type"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent outline-none font-body text-foreground placeholder:text-muted-foreground"
          />
        </label>

        <Button onClick={() => setModalOpen(true)} size="xl">
          <Plus size={16} />
          Add Position
          <Kbd>N</Kbd>
        </Button>
      </div>

      <AddPositionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultPortfolioId={selectedPortfolioId ?? undefined}
      />

      <div className="flex flex-col gap-4">
        {grouped.map(({ portfolioId, label, positions }) => (
          <PortfolioGroup
            key={portfolioId}
            portfolioId={portfolioId}
            label={label}
            positions={positions}
          />
        ))}

        {filteredPositions.length === 0 && (
          <p className="py-8 text-sm text-center text-muted-foreground">
            {query.trim()
              ? "No positions match your search"
              : activeTab === "Previous Sales"
                ? "No closed positions yet"
                : selectedPortfolioId
                  ? "No positions in this portfolio"
                  : "No open positions yet"}
          </p>
        )}
      </div>
    </section>
  );
}
