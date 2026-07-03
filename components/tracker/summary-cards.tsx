import { AlertTriangle, Target, TrendingDown, Trophy } from "lucide-react";
import type { SavingsGoal, useTrackerData } from "@/lib/store/tracker-store";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils/currency";

export function SummaryCards({
  monitors,
  goals,
}: {
  monitors: ReturnType<typeof useTrackerData>["monitors"];
  goals: SavingsGoal[];
}) {
  const totalLimit = monitors.reduce((s, m) => s + m.limit, 0);
  const totalSpent = monitors.reduce((s, m) => s + m.spent, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const atRisk = monitors.filter(
    (m) => m.status === "at-risk" || m.status === "over",
  );
  const mostBehindGoal = goals.reduce<SavingsGoal | null>((min, g) => {
    const pct = g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 1;
    if (!min) return g;
    const minPct =
      min.targetAmount > 0 ? min.currentAmount / min.targetAmount : 1;
    return pct < minPct ? g : min;
  }, null);

  return (
    <div className="grid grid-cols-4 gap-3">
      {/* planned spend */}
      <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingDown size={13} className="text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Planned Spend
          </span>
        </div>
        <div>
          <p className="font-display text-2xl font-bold tabular-nums text-foreground">
            {fmt(totalSpent)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            / {fmt(totalLimit)}{" "}
            <span
              className={cn(
                "font-medium",
                totalSpent > totalLimit
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              ·{" "}
              {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}
              % used
            </span>
          </p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min((totalSpent / totalLimit) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* toward goals */}
      <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target size={13} className="text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Toward Goals
          </span>
        </div>
        <div>
          <p className="font-display text-2xl font-bold tabular-nums text-foreground">
            {fmt(totalSaved)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            / {fmt(totalTarget)}{" "}
            <span className="font-medium text-muted-foreground">
              · {goals.length} active
            </span>
          </p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{
              width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* needs attention */}
      <div
        className={cn(
          "rounded-2xl border p-5 space-y-2.5 transition-colors",
          atRisk.length > 0
            ? "border-amber-500/25 bg-amber-500/5"
            : "border-border/40 bg-card",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={13}
              className={
                atRisk.length > 0 ? "text-amber-400" : "text-muted-foreground"
              }
            />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Needs Attention
            </span>
          </div>
          {atRisk.length > 0 && (
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              {atRisk.length} total
            </span>
          )}
        </div>
        {atRisk.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-foreground font-display">
              {atRisk[0].name}
            </p>
            <p
              className={cn(
                "text-xs font-medium mt-0.5",
                atRisk[0].status === "over"
                  ? "text-destructive"
                  : "text-amber-400",
              )}
            >
              {Math.round(atRisk[0].pct)}% used
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">All limits on track</p>
        )}
      </div>

      {/* next milestone */}
      <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Next Milestone
          </span>
        </div>
        {mostBehindGoal ? (
          <div>
            <p className="text-sm font-semibold text-foreground font-display">
              {mostBehindGoal.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {fmt(mostBehindGoal.targetAmount - mostBehindGoal.currentAmount)}{" "}
              remaining ·{" "}
              {Math.round(
                (mostBehindGoal.currentAmount / mostBehindGoal.targetAmount) *
                  100,
              )}
              %
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min((mostBehindGoal.currentAmount / mostBehindGoal.targetAmount) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No goals set</p>
        )}
      </div>
    </div>
  );
}
