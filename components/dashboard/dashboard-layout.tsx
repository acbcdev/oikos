"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NetWorthCard,
  ActiveGoalCard,
  BurnRateCard,
} from "@/components/dashboard/metric-cards";
import { BurnDistribution } from "@/components/dashboard/burn-distribution";
import { useWalletStore, useAvailableCurrencies } from "@/lib/store/wallet-store";
import { useMetrics } from "@/lib/hooks/use-metrics";
import {
  netWorth, worthSparkline, worthChange,
  burnTotal, todayBurn, burnSparkline,
  catBreakdown, catSpend,
  chartData, ytdChange, income, expenses,
  savingsRate, savingsChange, topCategory, topAmount,
  bestMonth, bestSaved, runway,
} from "@/lib/hooks/metrics";
import { TransactionModal } from "@/components/dashboard/wallet/transaction-modal";
import { TimeframeToggle } from "@/components/dashboard/reports/timeframe-toggle";
import { NetWorthChart } from "@/components/dashboard/reports/net-worth-chart";
import {
  SavingsRateCard,
  HighestBurnCard,
  BestSavingMonthCard,
  IncomeVsSpendCard,
  MonthlyRunwayCard,
} from "@/components/dashboard/reports/report-metrics";
import type { Timeframe } from "@/lib/data/reports";
import type { Transaction } from "@/lib/data/wallet";

export function DashboardLayout() {
  useEffect(() => {
    useWalletStore.persist.rehydrate();
  }, []);

  const currencies = useAvailableCurrencies();
  const isMultiCurrency = currencies.length > 1;
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("YTD");
  const [lastUsedAccountId, setLastUsedAccountId] = useState<string | null>(null);

  const accounts = useWalletStore((s) => s.accounts);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const updateTransaction = useWalletStore((s) => s.updateTransaction);

  const handleTransactionSubmit = useCallback(
    (tx: Transaction) => {
      if (tx.id.startsWith("txn-")) {
        // New transaction (ID starts with "txn-")
        addTransaction(tx);
      } else {
        // Update existing transaction
        const { id, ...patch } = tx;
        updateTransaction(id, patch);
      }
      setLastUsedAccountId(tx.accountId);
    },
    [addTransaction, updateTransaction],
  );

  const activeCurrency = isMultiCurrency
    ? (selectedCurrency ?? currencies[0] ?? null)
    : null;

  const dash = useMetrics(
    { netWorth, worthSparkline, worthChange, burnTotal, todayBurn, burnSparkline, catBreakdown, catSpend },
    { currency: activeCurrency },
  );

  const report = useMetrics(
    { chartData, ytdChange, income, expenses, savingsRate, savingsChange, topCategory, topAmount, bestMonth, bestSaved, runway },
    { timeframe },
  );

  const displayCurrency = activeCurrency ?? accounts[0]?.currency ?? "USD";

  return (
    <>
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-center sticky top-0 z-20 bg-background">
        <div className="flex flex-col">
          <h2 className="text-foreground font-display text-4xl font-bold tracking-tight uppercase leading-none">
            Analytics
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
            aria-label="Notifications"
          >
            <Bell size={24} />
          </Button>
          <TimeframeToggle timeframe={timeframe} setTimeframe={setTimeframe} />
          <Button size="xl" className="font-display font-bold tracking-wider uppercase px-8" onClick={() => setAddTxOpen(true)}>
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      </header>
      <TransactionModal
        open={addTxOpen}
        onOpenChange={setAddTxOpen}
        accounts={accounts}
        lastUsedAccountId={lastUsedAccountId}
        onSubmit={handleTransactionSubmit}
      />

      {/* Dashboard grid */}
      <div className="p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <NetWorthCard
            totalNetWorth={dash.netWorth}
            netWorthSparkline={dash.worthSparkline}
            netWorthChangePct={dash.worthChange}
            displayCurrency={displayCurrency}
          />
          <ActiveGoalCard />
          <BurnRateCard
            burnTotal={dash.burnTotal}
            todayBurn={dash.todayBurn}
            burnSparkline={dash.burnSparkline}
            displayCurrency={displayCurrency}
          />
        </div>
        <BurnDistribution
          categoryBreakdown={dash.catBreakdown}
          totalCategorySpend={dash.catSpend}
          displayCurrency={displayCurrency}
        />
        <NetWorthChart
          chartData={report.chartData}
          totalNetWorth={dash.netWorth}
          ytdChange={report.ytdChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SavingsRateCard avgSavingsRate={report.savingsRate} savingsRateChange={report.savingsChange} />
          <HighestBurnCard highestBurnCategory={report.topCategory} highestBurnAmount={report.topAmount} />
          <BestSavingMonthCard bestSavingMonth={report.bestMonth} bestSavingAmount={report.bestSaved} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <IncomeVsSpendCard totalIncome={report.income} totalExpenses={report.expenses} />
          </div>
          <MonthlyRunwayCard monthlyRunway={report.runway} />
        </div>
      </div>
    </>
  );
}
