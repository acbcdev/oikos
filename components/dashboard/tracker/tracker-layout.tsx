"use client";

import { useEffect, useState } from "react";
import { Plus, Search, LayoutGrid, List, TrendingDown, Target, AlertTriangle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/data/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTrackerStore, useSpendMonitorsWithSpend, useSavingsGoals } from "@/lib/store/tracker-store";
import { SpendMonitorCard } from "./spend-monitor-card";
import { SavingsGoalCard } from "./savings-goal-card";
import { AddTrackerModal } from "./add-tracker-modal";
import { ContributeModal } from "./contribute-modal";
import type { SavingsGoal, Tracker } from "@/lib/store/tracker-store";

type ViewMode = "grid" | "list";

function CycleBar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysLeft = daysInMonth - dayOfMonth;
  const pct = (dayOfMonth / daysInMonth) * 100;

  const monthName = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const start = `${monthName} 01`;
  const end = `${monthName} ${daysInMonth}, ${year}`;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Cycle
      </span>
      <span className="text-[11px] font-medium text-foreground">
        {start} — {end}
      </span>
      <div className="relative h-1 w-24 overflow-hidden rounded-full bg-secondary/60">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">
        Day {dayOfMonth}/{daysInMonth} · {daysLeft}d left
      </span>
    </div>
  );
}

function SummaryCards({
  monitors,
  goals,
}: {
  monitors: ReturnType<typeof useSpendMonitorsWithSpend>;
  goals: SavingsGoal[];
}) {
  const totalLimit = monitors.reduce((s, m) => s + m.limit, 0);
  const totalSpent = monitors.reduce((s, m) => s + m.spent, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const atRisk = monitors.filter((m) => m.status === "at-risk" || m.status === "over");
  const mostBehindGoal = goals.reduce<SavingsGoal | null>((min, g) => {
    const pct = g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 1;
    if (!min) return g;
    const minPct = min.targetAmount > 0 ? min.currentAmount / min.targetAmount : 1;
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
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            / {formatCurrency(totalLimit)}{" "}
            <span className={cn("font-medium", totalSpent > totalLimit ? "text-destructive" : "text-muted-foreground")}>
              · {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}% used
            </span>
          </p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min((totalSpent / totalLimit) * 100, 100)}%` }}
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
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            / {formatCurrency(totalTarget)}{" "}
            <span className="font-medium text-muted-foreground">
              · {goals.length} active
            </span>
          </p>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
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
            <AlertTriangle size={13} className={atRisk.length > 0 ? "text-amber-400" : "text-muted-foreground"} />
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
            <p className="text-sm font-semibold text-foreground font-display">{atRisk[0].name}</p>
            <p className={cn("text-xs font-medium mt-0.5", atRisk[0].status === "over" ? "text-destructive" : "text-amber-400")}>
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
              {formatCurrency(mostBehindGoal.targetAmount - mostBehindGoal.currentAmount)} remaining ·{" "}
              {Math.round((mostBehindGoal.currentAmount / mostBehindGoal.targetAmount) * 100)}%
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

export function TrackerLayout() {
  const [hydrated, setHydrated] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Tracker | null>(null);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = useTrackerStore.persist.onFinishHydration(() => setHydrated(true));
    useTrackerStore.persist.rehydrate();
    return unsub;
  }, []);

  const monitors = useSpendMonitorsWithSpend();
  const goals = useSavingsGoals();
  const removeTracker = useTrackerStore((s) => s.removeTracker);

  const q = search.toLowerCase();
  const filteredMonitors = monitors.filter((m) => m.name.toLowerCase().includes(q));
  const filteredGoals = goals.filter((g) => g.name.toLowerCase().includes(q));

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-6 px-8 py-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-card/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      {/* page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground leading-none">
            Tracker
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Limits and targets — one system, one source of truth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CycleBar />
          <Button size="lg" onClick={() => setAddOpen(true)} className="gap-2 font-display font-bold tracking-wide uppercase text-xs">
            <Plus size={14} />
            New Tracker
          </Button>
        </div>
      </div>

      {/* summary cards */}
      <SummaryCards monitors={monitors} goals={goals} />

      {/* search + view bar */}
      <div className="flex items-center justify-between gap-4">
        {/* left: search */}
        <div className="group relative flex items-center flex-1 max-w-lg">
          <Search
            size={15}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors duration-150 group-focus-within:text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trackers..."
            className="h-12 w-full rounded-full border-border/30 bg-card/60 pl-12 pr-12 text-base placeholder:text-muted-foreground/35 transition-all duration-200 focus-visible:border-border/60 focus-visible:bg-card"
          />
          {!search && (
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rounded border border-border/25 bg-secondary/40 px-1.5 py-px text-[9px] font-mono text-muted-foreground/35 transition-opacity duration-150 group-focus-within:opacity-0">
              /
            </span>
          )}
        </div>

        {/* right: view toggle */}
        <div className="relative flex items-center rounded-full border border-border/30 bg-card/60 p-0.5">
          <div
            className={cn(
              "absolute left-0.5 top-0.5 bottom-0.5 w-7 rounded-full bg-secondary transition-transform duration-200 ease-out",
              view === "list" && "translate-x-7",
            )}
          />
          <button
            onClick={() => setView("grid")}
            className={cn(
              "relative z-10 flex size-7 items-center justify-center rounded-full transition-colors duration-150",
              view === "grid" ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground",
            )}
          >
            <LayoutGrid size={12} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "relative z-10 flex size-7 items-center justify-center rounded-full transition-colors duration-150",
              view === "list" ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground",
            )}
          >
            <List size={12} />
          </button>
        </div>
      </div>

      {/* limits section */}
      {filteredMonitors.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground font-display">
              Limits
            </span>
            <span className="text-xs text-muted-foreground">{filteredMonitors.length}</span>
            <span className="text-muted-foreground/40 mx-1">—</span>
            <span className="text-xs text-muted-foreground">Cap categorical spend, reset every cycle</span>
          </div>
          <div
            className={cn(
              view === "grid"
                ? "grid grid-cols-3 gap-3"
                : "flex flex-col gap-2",
            )}
          >
            {filteredMonitors.map((m) => (
              <SpendMonitorCard
                key={m.id}
                monitor={m}
                onEdit={() => setEditTarget(m)}
                onDelete={() => removeTracker(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* targets section */}
      {filteredGoals.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground font-display">
              Targets
            </span>
            <span className="text-xs text-muted-foreground">{filteredGoals.length}</span>
            <span className="text-muted-foreground/40 mx-1">—</span>
            <span className="text-xs text-muted-foreground">Save toward a target by a date</span>
          </div>
          <div
            className={cn(
              view === "grid"
                ? "grid grid-cols-3 gap-3"
                : "flex flex-col gap-2",
            )}
          >
            {filteredGoals.map((g) => (
              <SavingsGoalCard
                key={g.id}
                goal={g}
                onEdit={() => setEditTarget(g)}
                onDelete={() => removeTracker(g.id)}
                onContribute={() => setContributeGoal(g)}
              />
            ))}
          </div>
        </section>
      )}

      {/* empty state */}
      {filteredMonitors.length === 0 && filteredGoals.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-card border border-border/40">
            <Target size={20} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-display">No trackers found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Try a different search." : "Create your first tracker to get started."}
            </p>
          </div>
          {!search && (
            <Button onClick={() => setAddOpen(true)} variant="outline" size="sm">
              <Plus size={13} />
              New Tracker
            </Button>
          )}
        </div>
      )}

      <AddTrackerModal open={addOpen} onOpenChange={setAddOpen} />
      <AddTrackerModal
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        tracker={editTarget ?? undefined}
      />
      <ContributeModal
        open={!!contributeGoal}
        onOpenChange={(v) => { if (!v) setContributeGoal(null); }}
        goal={contributeGoal}
      />
    </div>
  );
}
