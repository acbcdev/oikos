"use client";

import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Plus, Search, LayoutGrid, List, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { CATEGORIES } from "@/lib/data/categories";
import { useTrackerStore, useTrackerData } from "@/lib/store/tracker-store";
import { SpendMonitorCard } from "./spend-monitor-card";
import { SavingsGoalCard } from "./savings-goal-card";
import { AddTrackerModal } from "./add-tracker-modal";
import { ContributeModal } from "./contribute-modal";
import { CycleBar } from "./cycle-bar";
import { SummaryCards } from "./summary-cards";
import type { SavingsGoal, Tracker } from "@/lib/store/tracker-store";

type ViewMode = "grid" | "list";

export function TrackerLayout() {
  const [hydrated, setHydrated] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Tracker | null>(null);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(
    null,
  );
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");

  useHotkeys("n", () => setAddOpen(true), { preventDefault: true });

  useEffect(() => {
    const unsub = useTrackerStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    useTrackerStore.persist.rehydrate();
    return unsub;
  }, []);

  const { monitors, goals } = useTrackerData();
  const remove = useTrackerStore((s) => s.remove);
  const categories = CATEGORIES;
  const add = useTrackerStore((s) => s.add);
  const update = useTrackerStore((s) => s.update);

  const handleTrackerSubmit = useCallback(
    (tracker: Tracker) => {
      if (tracker.id.startsWith("tm-") || tracker.id.startsWith("sg-")) {
        add(tracker);
      } else {
        const { id, ...patch } = tracker;
        update(id, patch);
      }
    },
    [add, update],
  );

  const q = search.toLowerCase();
  const filteredMonitors = monitors.filter((m) =>
    m.name.toLowerCase().includes(q),
  );
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
          <Button
            size="lg"
            onClick={() => setAddOpen(true)}
            className="gap-2 font-display font-bold tracking-wide uppercase text-xs"
          >
            <Plus size={14} />
            New Tracker
            <Kbd>N</Kbd>
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
              view === "grid"
                ? "text-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground",
            )}
          >
            <LayoutGrid size={12} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "relative z-10 flex size-7 items-center justify-center rounded-full transition-colors duration-150",
              view === "list"
                ? "text-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground",
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
            <span className="text-xs text-muted-foreground">
              {filteredMonitors.length}
            </span>
            <span className="text-muted-foreground/40 mx-1">—</span>
            <span className="text-xs text-muted-foreground">
              Cap categorical spend, reset every cycle
            </span>
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
                onDelete={() => remove(m.id)}
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
            <span className="text-xs text-muted-foreground">
              {filteredGoals.length}
            </span>
            <span className="text-muted-foreground/40 mx-1">—</span>
            <span className="text-xs text-muted-foreground">
              Save toward a target by a date
            </span>
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
                onDelete={() => remove(g.id)}
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
            <p className="text-sm font-semibold text-foreground font-display">
              No trackers found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search
                ? "Try a different search."
                : "Create your first tracker to get started."}
            </p>
          </div>
          {!search && (
            <Button
              onClick={() => setAddOpen(true)}
              variant="outline"
              size="sm"
            >
              <Plus size={13} />
              New Tracker
            </Button>
          )}
        </div>
      )}

      <AddTrackerModal
        open={addOpen}
        onOpenChange={setAddOpen}
        categories={categories}
        onSubmit={handleTrackerSubmit}
      />
      <AddTrackerModal
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
        tracker={editTarget ?? undefined}
        categories={categories}
        onSubmit={handleTrackerSubmit}
      />
      <ContributeModal
        open={!!contributeGoal}
        onOpenChange={(v) => {
          if (!v) setContributeGoal(null);
        }}
        goal={contributeGoal}
      />
    </div>
  );
}
