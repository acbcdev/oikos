"use client";

import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NetWorthCard,
  ActiveGoalCard,
  BurnRateCard,
} from "@/components/dashboard/metric-cards";
import { BurnDistribution } from "@/components/dashboard/burn-distribution";
import { useWalletStore, useAvailableCurrencies } from "@/lib/store/wallet-store";
import { AddTransactionModal } from "@/components/dashboard/wallet/add-transaction-modal";
import { TimeframeToggle } from "@/components/dashboard/reports/timeframe-toggle";
import { NetWorthChart } from "@/components/dashboard/reports/net-worth-chart";
import {
  SavingsRateCard,
  HighestBurnCard,
  BestSavingMonthCard,
  IncomeVsSpendCard,
  MonthlyRunwayCard,
} from "@/components/dashboard/reports/report-metrics";

export function DashboardLayout() {
  useEffect(() => {
    useWalletStore.persist.rehydrate();
  }, []);

  const currencies = useAvailableCurrencies();
  const isMultiCurrency = currencies.length > 1;
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [addTxOpen, setAddTxOpen] = useState(false);

  const activeCurrency = isMultiCurrency
    ? (selectedCurrency ?? currencies[0] ?? null)
    : null;

  return (
    <>
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-center sticky top-0 z-20 bg-background">
        <div className="flex flex-col">
          <h2 className="text-foreground font-display text-4xl font-bold tracking-tight uppercase leading-none">
            Oikos
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="size-1.5 rounded-full animate-pulse bg-positive" />
            <p className="text-sm font-medium text-muted-foreground font-body">
              Pulse check on active goals and burn rate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMultiCurrency && (
            <div className="flex gap-1 bg-accent/60 rounded-xl p-1">
              {currencies.map((c) => (
                <Button
                  key={c}
                  variant={activeCurrency === c ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3 text-xs font-display font-bold uppercase tracking-wider"
                  onClick={() => setSelectedCurrency(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-lg"
          >
            <Bell size={24} />
          </Button>
          <TimeframeToggle />
          <Button size="xl" className="font-display font-bold tracking-wider uppercase px-8" onClick={() => setAddTxOpen(true)}>
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      </header>
      <AddTransactionModal open={addTxOpen} onOpenChange={setAddTxOpen} />

      {/* Dashboard grid */}
      <div className="p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <NetWorthCard currency={activeCurrency} />
          <ActiveGoalCard />
          <BurnRateCard currency={activeCurrency} />
        </div>
        <BurnDistribution currency={activeCurrency} />
        <NetWorthChart />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SavingsRateCard />
          <HighestBurnCard />
          <BestSavingMonthCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <IncomeVsSpendCard />
          </div>
          <MonthlyRunwayCard />
        </div>
      </div>
    </>
  );
}
