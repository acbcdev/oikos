"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  Building2,
  Landmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  CircleX,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { computePnL } from "@/lib/data/portfolio";
import { formatCurrency } from "@/lib/data/wallet";
import { refreshPositionPrice } from "@/lib/services/prices";
import type { AssetType, Position } from "@/lib/data/portfolio";
import { AddPositionModal } from "./add-position-modal";
import { ClosePositionModal } from "./close-position-modal";

const assetTypeConfig: Record<
  AssetType,
  { icon: React.ElementType; bg: string; text: string }
> = {
  stock: { icon: BarChart3, bg: "bg-blue-500/15", text: "text-blue-400" },
  etf: { icon: TrendingUp, bg: "bg-purple-500/15", text: "text-purple-400" },
  crypto: { icon: Bitcoin, bg: "bg-primary/15", text: "text-primary" },
  "real-estate": {
    icon: Building2,
    bg: "bg-orange-500/15",
    text: "text-orange-400",
  },
  bond: { icon: Landmark, bg: "bg-chart-2/15", text: "text-chart-2" },
};

const assetTypeLabel: Record<AssetType, string> = {
  stock: "Stock",
  etf: "ETF",
  crypto: "Crypto",
  "real-estate": "Real Estate",
  bond: "Bond",
};

export function PositionRow({ position }: { position: Position }) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const removePosition = useInvestmentStore((s) => s.removePosition);
  const updatePosition = useInvestmentStore((s) => s.updatePosition);

  const cfg = assetTypeConfig[position.type];
  const Icon = cfg.icon;
  const { gain, gainPct, costBasis, currentValue, isRealized } =
    computePnL(position);
  const isGain = gain >= 0;

  async function handleRefreshPrice() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const price = await refreshPositionPrice(position);
      if (price !== null) {
        updatePosition(position.id, { currentPrice: price });
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <Card className="rounded-2xl  py-0 ring-0 bg-linear-to-br from-[rgba(28,37,59,0.4)] to-[rgba(19,26,42,0.6)]  ">
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center flex-1 min-w-0 gap-4 text-left cursor-pointer"
            aria-expanded={expanded}
          >
            <span
              className={`size-12 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}
              aria-hidden="true"
            >
              <Icon size={20} className={cfg.text} />
            </span>

            <hgroup className="flex-1 min-w-0">
              <h4 className="text-[15px] font-display font-bold text-foreground truncate">
                {position.name}
              </h4>
              <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mt-0.5">
                {assetTypeLabel[position.type]}
                {position.ticker && ` · ${position.ticker}`}
                {" · "}
                {position.quantity} units
              </p>
            </hgroup>
          </button>

          <output className="text-right shrink-0">
            <p className="text-[15px] font-display font-bold tabular-nums text-foreground">
              {formatCurrency(currentValue, position.currency)}
            </p>
            <p
              className={`text-xs font-display font-bold tabular-nums mt-0.5 ${
                isGain ? "text-positive" : "text-negative"
              }`}
            >
              {isGain ? "+" : ""}
              {gain.toFixed(2)} ({isGain ? "+" : ""}
              {gainPct.toFixed(2)}%)
            </p>
          </output>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="shrink-0" />
              }
            >
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {position.livePrice && (
                <>
                  <DropdownMenuItem
                    onClick={handleRefreshPrice}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      size={13}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh Price
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil size={13} />
                Edit
              </DropdownMenuItem>
              {!position.soldAt && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCloseOpen(true)}>
                    <CircleX size={13} />
                    Close Position
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => removePosition(position.id)}
              >
                <Trash2 size={13} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {expanded && (
          <CardContent className="px-5 pt-1 pb-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Cost Basis
                </dt>
                <dd className="text-sm font-bold font-display text-foreground tabular-nums">
                  {formatCurrency(costBasis, position.currency)}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {isRealized ? "Realized Gain/Loss" : "Unrealized Gain/Loss"}
                </dt>
                <dd
                  className={`text-sm font-display font-bold tabular-nums ${
                    isGain ? "text-positive" : "text-negative"
                  }`}
                >
                  {isGain ? "+" : ""}
                  {formatCurrency(gain, position.currency)} ({isGain ? "+" : ""}
                  {gainPct.toFixed(2)}%)
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {isRealized ? "Sell Price / Unit" : "Current Price / Unit"}
                </dt>
                <dd className="text-sm font-bold font-display text-foreground tabular-nums">
                  {formatCurrency(
                    isRealized
                      ? (position.soldPrice ?? 0)
                      : position.currentPrice,
                    position.currency,
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Buy Price / Unit
                </dt>
                <dd className="text-sm font-bold font-display text-foreground tabular-nums">
                  {formatCurrency(position.buyPrice, position.currency)}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Purchase Date
                </dt>
                <dd className="text-sm font-bold font-display text-foreground">
                  {new Date(
                    position.purchaseDate + "T00:00:00",
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </dd>
              </div>

              {isRealized && position.soldAt && (
                <div>
                  <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Sold Date
                  </dt>
                  <dd className="text-sm font-bold font-display text-foreground">
                    {new Date(position.soldAt + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </dd>
                </div>
              )}

              {position.notes && (
                <div className="col-span-2">
                  <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Notes
                  </dt>
                  <dd className="text-xs leading-relaxed font-body text-muted-foreground">
                    {position.notes}
                  </dd>
                </div>
              )}
            </dl>

            {position.livePrice && (
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 mt-4"
                onClick={handleRefreshPrice}
                disabled={refreshing}
              >
                <RefreshCw
                  size={13}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh Live Price"}
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      <AddPositionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        position={position}
      />
      <ClosePositionModal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        position={position}
      />
    </>
  );
}
