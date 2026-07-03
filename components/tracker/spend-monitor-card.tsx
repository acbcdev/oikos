"use client";

import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  Infinity,
  Home,
  Laptop,
  Briefcase,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SpendMonitorWithDerived } from "@/lib/store/tracker-store";

const CATEGORY_ICON: Record<string, React.ElementType> = {
  food: UtensilsCrossed,
  transport: Car,
  shopping: ShoppingBag,
  entertainment: Tv,
  rental: Home,
  freelance: Laptop,
  salary: Briefcase,
};

const STATUS_CONFIG = {
  "on-track": {
    dot: "bg-emerald-400",
    label: "On Track",
    text: "text-emerald-400",
  },
  "at-risk": { dot: "bg-amber-400", label: "At Risk", text: "text-amber-400" },
  over: { dot: "bg-destructive", label: "Over", text: "text-destructive" },
};

interface SpendMonitorCardProps {
  monitor: SpendMonitorWithDerived;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SpendMonitorCard({
  monitor,
  onEdit,
  onDelete,
}: SpendMonitorCardProps) {
  const Icon = CATEGORY_ICON[monitor.categoryId] ?? Infinity;
  const s = STATUS_CONFIG[monitor.status];
  const clampedPct = Math.min(monitor.pct, 100);

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200",
        monitor.status === "over"
          ? "border-destructive/25 bg-destructive/5 hover:border-destructive/40"
          : "border-border/40 bg-card hover:border-border/70 hover:bg-card/80",
      )}
    >
      {/* header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              monitor.status === "over"
                ? "bg-destructive/15"
                : "bg-secondary/80",
            )}
          >
            <Icon
              size={16}
              className={
                monitor.status === "over"
                  ? "text-destructive"
                  : "text-foreground/70"
              }
            />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground font-display">
              {monitor.name}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Limit · {monitor.period}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", s.dot)} />
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                s.text,
              )}
            >
              {s.label}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                />
              }
            >
              <MoreHorizontal size={13} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil size={12} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={12} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* amount */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-2xl font-bold tabular-nums leading-none",
            monitor.status === "over" ? "text-destructive" : "text-foreground",
          )}
        >
          {fmt(monitor.spent, monitor.currency)}
        </span>
        <span className="text-sm text-muted-foreground">
          / {fmt(monitor.limit, monitor.currency)}{" "}
          <span className="text-[10px] uppercase tracking-wider">
            {monitor.currency}
          </span>
        </span>
      </div>

      {/* progress bar */}
      <div className="space-y-1.5">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
              monitor.status === "over"
                ? "bg-destructive"
                : monitor.status === "at-risk"
                  ? "bg-amber-400"
                  : "bg-primary",
            )}
            style={{ width: `${clampedPct}%` }}
          />
          {/* over-budget striped overlay */}
          {monitor.status === "over" && (
            <div
              className="absolute left-0 top-0 h-full w-full rounded-full opacity-30"
              style={{
                background:
                  "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 6px)",
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-[11px] font-medium",
              monitor.isOver ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {monitor.isOver ? (
              <>
                <span className="mr-0.5">▲</span>
                {fmt(Math.abs(monitor.remaining), monitor.currency)} over (
                {Math.round(monitor.pct)}%)
              </>
            ) : (
              <>{fmt(monitor.remaining, monitor.currency)} left</>
            )}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {Math.round(clampedPct)}%
          </span>
        </div>
      </div>
    </div>
  );
}
