"use client";

import {
  BarChart3,
  Bitcoin,
  Building2,
  Landmark,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AssetType, Portfolio } from "@/lib/data/portfolio";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { useMetrics } from "@/lib/hooks/use-metrics";
import { totalValue, totalGain, totalGainPct, costBasis } from "@/lib/hooks/metrics-portfolio";
import { cn } from "@/lib/utils";
import { fmt, fmtSplit } from "@/lib/utils/currency";
import { CreatePortfolioModal } from "./create-portfolio-modal";

const assetTypeConfig: Record<
  AssetType,
  { icon: React.ElementType; label: string; color: string }
> = {
  stock: { icon: BarChart3, label: "Stock", color: "text-blue-400" },
  etf: { icon: TrendingUp, label: "ETF", color: "text-purple-400" },
  crypto: { icon: Bitcoin, label: "Crypto", color: "text-primary" },
  "real-estate": {
    icon: Building2,
    label: "Real Estate",
    color: "text-orange-400",
  },
  bond: { icon: Landmark, label: "Bond", color: "text-chart-2" },
};

interface PortfolioCardProps {
  portfolio: Portfolio;
  isSelected: boolean;
  onSelect: () => void;
}

export function PortfolioCard({
  portfolio,
  isSelected,
  onSelect,
}: PortfolioCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const removePortfolio = useInvestmentStore((s) => s.removePortfolio);
  const allPositions = useInvestmentStore((s) => s.positions);
  const positions = useMemo(
    () => allPositions.filter((p) => p.portfolioId === portfolio.id && !p.soldAt),
    [allPositions, portfolio.id],
  );
  const metrics = useMetrics(
    { data: { positions } },
    { totalValue, totalGain, totalGainPct, totalCostBasis: costBasis },
  );

  const activeTypes = [...new Set(positions.map((p) => p.type))];
  const currency = positions[0]?.currency ?? "USD";
  const isGain = metrics.totalGain >= 0;

  const { whole, decimal } = fmtSplit(metrics.totalValue, currency);

  return (
    <>
      <Card
        className={cn(
          "rounded-2xl py-0 h-full bg-linear-to-br from-[rgba(28,37,59,0.5)] to-[rgba(19,26,42,0.7)] backdrop-blur-md transition-all duration-250 ease-in-out hover:from-[rgba(37,46,68,0.6)] hover:to-[rgba(22,30,48,0.8)] cursor-pointer",
          isSelected && "ring-2 ring-neon ring-inset",
        )}
        onClick={onSelect}
      >
        <CardHeader className="p-6 pb-0">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-secondary/80 flex items-center justify-center shrink-0">
              <TrendingUp size={13} className="text-muted-foreground" />
            </span>
            <CardTitle className="font-display text-lg tracking-tight font-bold text-foreground leading-none">
              {portfolio.name}
            </CardTitle>
          </div>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                render={<Button variant="ghost" size="icon-sm" />}
              >
                <MoreVertical size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-white/10 min-w-35"
              >
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil size={14} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {confirmDelete ? (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => removePortfolio(portfolio.id)}
                  >
                    <Trash2 size={14} />
                    Confirm Delete
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className="px-6 pt-4">
          <p className="font-display font-bold text-foreground tabular-nums leading-none">
            <data value={metrics.totalValue}>
              <span className="text-3xl">{whole}</span>
              <span className="text-lg text-muted-foreground">{decimal}</span>
              <span className="text-xs font-display font-bold text-muted-foreground/60 uppercase tracking-widest ml-2">
                {currency}
              </span>
            </data>
          </p>
        </CardContent>

        <CardFooter className="px-6 pb-6 border-t-0 bg-transparent flex-wrap gap-2 mt-2">
          {/* P&L badge */}
          {metrics.totalCostBasis > 0 && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-display font-bold px-3 py-1.5 rounded-lg ${
                isGain
                  ? "text-positive bg-positive/10"
                  : "text-negative bg-negative/10"
              }`}
            >
              {isGain ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {isGain ? "+" : ""}
              {fmt(metrics.totalGain, currency)}{" "}
              <span className="opacity-70">
                ({isGain ? "+" : ""}
                {metrics.totalGainPct.toFixed(2)}%)
              </span>
            </span>
          )}

          {/* Position count */}
          <span className="inline-flex items-center gap-1.5 text-xs font-display text-muted-foreground">
            {positions.length} position{positions.length !== 1 ? "s" : ""}
          </span>

          {/* Asset type badges */}
          {activeTypes.map((type) => {
            const cfg = assetTypeConfig[type];
            const Icon = cfg.icon;
            return (
              <span
                key={type}
                className={`inline-flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-secondary/80 ${cfg.color}`}
              >
                <Icon size={9} />
                {cfg.label}
              </span>
            );
          })}
        </CardFooter>
      </Card>

      <CreatePortfolioModal
        open={editOpen}
        onOpenChange={setEditOpen}
        portfolio={portfolio}
      />
    </>
  );
}
