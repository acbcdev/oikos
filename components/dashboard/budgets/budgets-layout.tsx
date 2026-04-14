"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/data/wallet";
import { useBudgetStore, useBudgetsWithSpend } from "@/lib/store/budget-store";
import { useWalletStore } from "@/lib/store/wallet-store";
import { BudgetCard } from "./budget-card";
import { AddBudgetModal } from "./add-budget-modal";

export function BudgetsLayout() {
  useEffect(() => {
    useBudgetStore.persist.rehydrate();
    useWalletStore.persist.rehydrate();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const budgets = useBudgetsWithSpend();

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <>
      <header className="px-10 py-10 flex justify-between items-end sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/10">
        <div>
          <h2 className="text-foreground font-display text-4xl font-bold tracking-tight uppercase leading-none">
            Budgets
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md font-body">
            Strict enforcement of spending limits. Keep your burn rate in check
            to hit your aggressive savings goals.
          </p>
        </div>

        {budgets.length > 0 && (
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] mb-1 font-display">
                Total Limit
              </p>
              <p className="font-display font-bold text-3xl text-foreground tracking-tight tabular-nums">
                {formatCurrency(totalLimit)}
              </p>
            </div>
            <div className="h-10 w-px bg-border/30" />
            <div className="text-right">
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] mb-1 font-display">
                Total Burn
              </p>
              <p className="font-display font-bold text-3xl text-foreground tracking-tight tabular-nums">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="h-10 w-px bg-border/30" />
            <Button
              onClick={() => setModalOpen(true)}
              className="shadow-neon"
            >
              <Plus size={16} />
              New Budget
            </Button>
          </div>
        )}
      </header>

      <div className="p-10 max-w-7xl mx-auto w-full flex-1">
        {budgets.length === 0 ? (
          <Empty className="min-h-[calc(100vh-14rem)]">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-16 rounded-2xl [&_svg:not([class*='size-'])]:size-8">
                <PieChart />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-display font-bold">
                No budgets yet
              </EmptyTitle>
              <EmptyDescription className="text-base">
                Set monthly spending limits per category to stay on track.
              </EmptyDescription>
            </EmptyHeader>
            <Button size="xl" onClick={() => setModalOpen(true)}>
              <Plus size={14} />
              Create First Budget
            </Button>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}

            <button
              onClick={() => setModalOpen(true)}
              className="bg-transparent border-2 border-dashed border-border/30 rounded-xl p-8 h-70 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-secondary/30 transition-all group cursor-pointer"
            >
              <span className="size-16 rounded-2xl bg-primary flex items-center justify-center mb-6 group-hover:shadow-neon group-hover:scale-110 transition-all">
                <Plus size={32} className="text-primary-foreground" />
              </span>
              <span className="font-display font-bold text-foreground tracking-[0.15em] uppercase text-xs">
                Create New Budget
              </span>
            </button>
          </div>
        )}
      </div>

      <AddBudgetModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
