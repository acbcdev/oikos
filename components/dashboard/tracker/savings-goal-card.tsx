"use client";

import { Plane, Shield, Laptop, Home, Target, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/data/wallet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SavingsGoal } from "@/lib/store/tracker-store";

const GOAL_ICON: Record<string, React.ElementType> = {
  vacation: Plane,
  emergency: Shield,
  laptop: Laptop,
  home: Home,
};

function inferIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  if (lower.includes("vacation") || lower.includes("trip") || lower.includes("travel"))
    return Plane;
  if (lower.includes("emergency") || lower.includes("fund") || lower.includes("safety"))
    return Shield;
  if (lower.includes("laptop") || lower.includes("mac") || lower.includes("computer"))
    return Laptop;
  if (lower.includes("home") || lower.includes("house")) return Home;
  return Target;
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatLastContrib(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit?: () => void;
  onDelete?: () => void;
  onContribute?: () => void;
}

export function SavingsGoalCard({ goal, onEdit, onDelete, onContribute }: SavingsGoalCardProps) {
  const Icon = inferIcon(goal.name);
  const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const clampedPct = Math.min(pct, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const isComplete = goal.currentAmount >= goal.targetAmount;

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-border/40 bg-card p-5 transition-all duration-200 hover:border-border/70 hover:bg-card/80">
      {/* header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/80">
            <Icon size={16} className="text-foreground/70" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground font-display">
              {goal.name}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {goal.deadline ? `Target · By ${formatDeadline(goal.deadline)}` : "Savings Goal"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", isComplete ? "bg-primary" : "bg-emerald-400")} />
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isComplete ? "text-primary" : "text-emerald-400")}>
              {isComplete ? "Complete" : "On Track"}
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
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 size={12} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* amount */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-bold tabular-nums leading-none text-foreground">
          {formatCurrency(goal.currentAmount, goal.currency)}
        </span>
        <span className="text-sm text-muted-foreground">
          / {formatCurrency(goal.targetAmount, goal.currency)}{" "}
          <span className="text-[10px] uppercase tracking-wider">{goal.currency}</span>
        </span>
      </div>

      {/* progress bar */}
      <div className="space-y-1.5">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${clampedPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {remaining > 0 ? `${formatCurrency(remaining, goal.currency)} to go` : "Goal reached"}
          </span>
          <span className="text-[11px] text-muted-foreground">{Math.round(clampedPct)}%</span>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-border/30 pt-3">
        <span className="text-[11px] text-muted-foreground">
          {goal.lastContributedAt
            ? `Last · ${formatLastContrib(goal.lastContributedAt)}`
            : "No contributions yet"}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-6 gap-1 rounded-lg border-border/60 px-2 text-[11px] font-semibold hover:border-primary/60 hover:text-primary"
          onClick={onContribute}
        >
          <Plus size={10} />
          Contribute
        </Button>
      </div>
    </div>
  );
}
