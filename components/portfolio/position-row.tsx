"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { computePnL } from "@/lib/data/portfolio";
import { fmt } from "@/lib/utils/currency";
import { hasLivePrice } from "@/lib/services/prices";
import type { AssetType, Position } from "@/lib/data/portfolio";
import { AssetLogo } from "./asset-logo";
import { AddPositionModal } from "./add-position-modal";
import { ClosePositionModal } from "./close-position-modal";

const assetTypeConfig: Record<
  AssetType,
  { icon: React.ElementType; bg: string; text: string; bar: string }
> = {
  stock: {
    icon: BarChart3,
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    bar: "bg-blue-400",
  },
  etf: {
    icon: TrendingUp,
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    bar: "bg-purple-400",
  },
  crypto: {
    icon: Bitcoin,
    bg: "bg-primary/15",
    text: "text-primary",
    bar: "bg-primary",
  },
  "real-estate": {
    icon: Building2,
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    bar: "bg-orange-400",
  },
  bond: {
    icon: Landmark,
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    bar: "bg-chart-2",
  },
};

const assetTypeLabel: Record<AssetType, string> = {
  stock: "Stock",
  etf: "ETF",
  crypto: "Crypto",
  "real-estate": "Real Estate",
  bond: "Bond",
};

export function PositionRow({
  position,
  portfolioValue,
  refreshing,
  onRefresh,
}: {
  position: Position;
  portfolioValue?: number;
  refreshing: boolean;
  onRefresh: (position: Position) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const removePosition = useInvestmentStore((s) => s.removePosition);

  const cfg = assetTypeConfig[position.type];
  const { gain, gainPct, costBasis, currentValue, isRealized } =
    computePnL(position);
  const isGain = gain >= 0;
  const weight =
    !isRealized && portfolioValue && portfolioValue > 0
      ? (currentValue / portfolioValue) * 100
      : null;

  return (
    <>
      <Card className="rounded-2xl  py-0 ring-0 bg-linear-to-br from-[rgba(28,37,59,0.4)] to-[rgba(19,26,42,0.6)]  ">
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center flex-1 min-w-0 gap-4 text-left cursor-pointer"
            aria-expanded={expanded}
          >
            <AssetLogo
              type={position.type}
              ticker={position.ticker}
              icon={cfg.icon}
              bg={cfg.bg}
              text={cfg.text}
            />

            <hgroup className="min-w-0 max-w-[14rem] sm:max-w-xs">
              <h4 className="text-[15px] font-display font-bold text-foreground truncate">
                {position.name}
              </h4>
              <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mt-0.5 truncate">
                {assetTypeLabel[position.type]}
                {position.ticker && ` · ${position.ticker}`}
                {" · "}
                {position.quantity} units
              </p>
            </hgroup>

            {weight !== null && (
              <div className="hidden flex-1 min-w-0 max-w-xs flex-col gap-1.5 md:flex">
                <div className="flex items-center justify-between text-[10px] font-display uppercase tracking-[0.15em] text-muted-foreground">
                  <span className="opacity-70">Weight</span>
                  <span className="tabular-nums text-foreground/80">
                    {weight.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/50">
                  <div
                    className={`h-full rounded-full ${cfg.bar}`}
                    style={{ width: `${Math.min(weight, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </button>

          <output
            className={`text-right shrink-0 ${refreshing ? "animate-pulse opacity-60" : ""}`}
          >
            <p className="text-[15px] font-display font-bold tabular-nums text-foreground">
              {fmt(currentValue, position.currency)}
            </p>
            <p
              className={`text-xs font-display font-bold tabular-nums mt-0.5 ${
                isGain ? "text-positive" : "text-negative"
              }`}
            >
              {isGain ? "+" : ""}
              {fmt(gain, position.currency)} ({isGain ? "+" : ""}
              {gainPct.toFixed(2)}%)
            </p>
          </output>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Position actions"
                />
              }
            >
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {hasLivePrice(position) && (
                  <DropdownMenuItem
                    onClick={() => onRefresh(position)}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      size={13}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil size={13} />
                  Edit
                </DropdownMenuItem>
                {!position.soldAt && (
                  <DropdownMenuItem onClick={() => setCloseOpen(true)}>
                    <CircleX size={13} />
                    Close
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => removePosition(position.id)}
                >
                  <Trash2 size={13} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
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
                  {fmt(costBasis, position.currency)}
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
                  {fmt(gain, position.currency)} ({isGain ? "+" : ""}
                  {gainPct.toFixed(2)}%)
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {isRealized ? "Sell Price / Unit" : "Current Price / Unit"}
                </dt>
                <dd className="text-sm font-bold font-display text-foreground tabular-nums">
                  {fmt(
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
                  {fmt(position.buyPrice, position.currency)}
                </dd>
              </div>

              {weight !== null && (
                <div>
                  <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Portfolio Weight
                  </dt>
                  <dd className="text-sm font-bold font-display text-foreground tabular-nums">
                    {weight.toFixed(1)}%
                  </dd>
                </div>
              )}

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

            {hasLivePrice(position) && (
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 mt-4"
                onClick={() => onRefresh(position)}
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
