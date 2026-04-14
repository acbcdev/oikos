"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/data/wallet";
import { useBudgetStore, type Budget } from "@/lib/store/budget-store";
import { AddBudgetModal } from "./add-budget-modal";

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; subtitle: string }
> = {
  "Food & Drink": { icon: UtensilsCrossed, subtitle: "Personal Dining" },
  Transport: { icon: Car, subtitle: "Commute & Gas" },
  Shopping: { icon: ShoppingBag, subtitle: "Purchases" },
  Entertainment: { icon: Tv, subtitle: "Leisure & Social" },
};

function getDaysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

interface BudgetCardProps {
  budget: Budget & {
    spent: number;
    percent: number;
    remaining: number;
    isOver: boolean;
    currency: string;
  };
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const removeBudget = useBudgetStore((s) => s.removeBudget);

  const cfg = CATEGORY_CONFIG[budget.category] ?? {
    icon: ShoppingBag,
    subtitle: "Other",
  };
  const Icon = cfg.icon;
  const barWidth = Math.min(budget.percent, 100);
  const isDanger = budget.isOver || budget.percent >= 90;
  const daysLeft = getDaysLeftInMonth();

  return (
    <>
      <Card
        className={`rounded-3xl py-0 h-70 relative overflow-hidden group bg-card border-border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:border-[rgba(212,255,0,0.3)] ${
          isDanger ? "border-negative/30" : ""
        }`}
      >
        <CardHeader className="p-8 pb-0 relative z-10">
          {/* Row 1: icon + name | menu */}
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="flex items-center gap-4 min-w-0">
              <span
                className={`size-12 shrink-0 rounded-xl flex items-center justify-center border ${
                  isDanger
                    ? "bg-negative/10 border-negative/20 text-negative"
                    : "bg-secondary border-border/30 text-muted-foreground group-hover:text-primary transition-colors"
                }`}
              >
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-xl text-foreground truncate">
                  {budget.category}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-tighter">
                  {cfg.subtitle}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    size="icon-sm"
                    className="shrink-0"
                  />
                }
              >
                <MoreHorizontal size={15} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil size={13} />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => removeBudget(budget.id)}
                >
                  <Trash2 size={13} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: amounts */}
          <div className="mt-4">
            <p
              className={`font-display font-bold text-2xl leading-none ${isDanger ? "text-negative" : "text-foreground"}`}
            >
              {formatCurrency(budget.spent, budget.currency)}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold tracking-[0.15em] uppercase mt-1">
              / {formatCurrency(budget.limit, budget.currency)}
            </p>
          </div>
        </CardHeader>

        <CardFooter className="p-8 pt-0 mt-auto relative z-10 border-t-0 bg-transparent flex-col items-stretch">
          <div className="flex justify-between text-[11px] mb-3 font-bold uppercase tracking-[0.15em]">
            <span className={isDanger ? "text-negative" : "text-muted-foreground"}>
              {budget.isOver
                ? `${Math.round(budget.percent)}% Over Limit`
                : `${Math.round(budget.percent)}% Spent`}
            </span>
            <span className={isDanger ? "text-muted-foreground" : "text-primary"}>
              {daysLeft}d left
            </span>
          </div>
          <div className="h-3 rounded-full bg-border/30 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all ${
                isDanger ? "bg-negative" : "bg-primary shadow-neon"
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          <p
            className={`text-[10px] font-display font-bold uppercase tracking-widest mt-3 ${
              budget.isOver
                ? "text-negative"
                : budget.remaining < budget.limit * 0.25
                  ? "text-orange-400"
                  : "text-muted-foreground"
            }`}
          >
            {budget.isOver
              ? `Over by ${formatCurrency(Math.abs(budget.remaining), budget.currency)}`
              : `${formatCurrency(budget.remaining, budget.currency)} remaining`}
          </p>
        </CardFooter>

        {isDanger && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-negative/5 blur-3xl rounded-full" />
        )}
      </Card>

      <AddBudgetModal open={editOpen} onOpenChange={setEditOpen} budget={budget} />
    </>
  );
}
