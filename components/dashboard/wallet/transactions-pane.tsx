"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  CalendarDays,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useGroupedTransactions,
  useWalletStore,
} from "@/lib/store/wallet-store";
import { DEFAULT_CATEGORIES } from "@/lib/data/wallet";
import { toast } from "sonner";
import {
  useWalletFilterStore,
  type TxType,
} from "@/lib/store/wallet-filter-store";
import { TransactionRow } from "./transaction-row";
import { AddTransactionModal } from "./add-transaction-modal";
import { DateRangePicker } from "./date-range-picker";

const EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter(
  (c) => c.id !== "income" && c.id !== "transfer",
);

const TX_TYPES: { value: TxType; label: string }[] = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

function txTypeFromCategoryId(categoryId: string): TxType {
  if (categoryId === "income") return "income";
  if (categoryId === "transfer") return "transfer";
  return "expense";
}

export function TransactionsPane() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const transactionGroups = useGroupedTransactions();
  const accounts = useWalletStore((s) => s.accounts);
  const removeTransaction = useWalletStore((s) => s.removeTransaction);

  const handleDeleteRequest = useCallback((id: string) => setDeleteId(id), []);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    removeTransaction(deleteId);
    toast.success("Transaction deleted");
    setDeleteId(null);
  };

  const {
    selectedAccountIds,
    selectedCategories,
    selectedTypes,
    dateFrom,
    dateTo,
    presetLabel,
    toggleCategory,
    toggleType,
    setCustomDateRange,
    clearAll,
  } = useWalletFilterStore();

  // Filter count excludes date (date has its own button indicator)
  const typeFilterCount = useWalletFilterStore(
    (s) =>
      s.selectedAccountIds.length +
      s.selectedCategories.length +
      s.selectedTypes.length,
  );
  const hasDateFilter = dateFrom !== null || dateTo !== null;

  const filteredGroups = useMemo(() => {
    const hasFilters =
      query.trim() ||
      selectedAccountIds.length > 0 ||
      selectedCategories.length > 0 ||
      selectedTypes.length > 0 ||
      dateFrom ||
      dateTo;

    if (!hasFilters) return transactionGroups;

    const q = query.toLowerCase().trim();

    return transactionGroups
      .map((group) => ({
        ...group,
        transactions: group.transactions.filter((t) => {
          if (
            q &&
            !t.description.toLowerCase().includes(q) &&
            !t.categoryId.toLowerCase().includes(q)
          )
            return false;
          if (
            selectedAccountIds.length > 0 &&
            !selectedAccountIds.includes(t.accountId)
          )
            return false;
          if (
            selectedCategories.length > 0 &&
            !selectedCategories.includes(t.categoryId)
          )
            return false;
          if (
            selectedTypes.length > 0 &&
            !selectedTypes.includes(txTypeFromCategoryId(t.categoryId))
          )
            return false;
          if (dateFrom && t.date < dateFrom) return false;
          if (dateTo && t.date > dateTo) return false;
          return true;
        }),
      }))
      .filter((g) => g.transactions.length > 0);
  }, [
    query,
    transactionGroups,
    selectedAccountIds,
    selectedCategories,
    selectedTypes,
    dateFrom,
    dateTo,
  ]);

  // Build chip list
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const id of selectedAccountIds) {
    const acc = accounts.find((a) => a.id === id);
    chips.push({
      key: `account:${id}`,
      label: acc?.institution ?? id,
      onRemove: () => useWalletFilterStore.getState().toggleAccount(id),
    });
  }
  for (const catId of selectedCategories) {
    const catName = DEFAULT_CATEGORIES.find((c) => c.id === catId)?.name ?? catId;
    chips.push({
      key: `cat:${catId}`,
      label: catName,
      onRemove: () => toggleCategory(catId),
    });
  }
  for (const type of selectedTypes) {
    chips.push({
      key: `type:${type}`,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      onRemove: () => toggleType(type),
    });
  }
  if (hasDateFilter) {
    chips.push({
      key: "date:range",
      label: presetLabel ?? [dateFrom, dateTo].filter(Boolean).join(" → "),
      onRemove: () => setCustomDateRange(null, null),
    });
  }

  const totalFilterCount = typeFilterCount + (hasDateFilter ? 1 : 0);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold tracking-wider uppercase font-display text-foreground">
          Transactions
        </h3>
      </div>

      <search className="flex items-center gap-3 mb-3">
        <label className="flex items-center flex-1 gap-3 px-4 py-3 bg-secondary/60 rounded-xl">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search across all accounts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent outline-none font-body text-foreground placeholder:text-muted-foreground"
          />
        </label>

        {/* Type / Category filter */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="secondary"
                size="icon-lg"
                className={cn(
                  "size-12 shrink-0 focus-visible:ring-0 focus-visible:outline-none",
                  typeFilterCount > 0 && "text-neon",
                )}
              />
            }
          >
            <SlidersHorizontal size={18} />
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="gap-0 p-4 w-72 bg-card border-white/10"
          >
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                Type
              </p>
              <div className="flex flex-wrap gap-2">
                {TX_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleType(value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-colors",
                      selectedTypes.includes(value)
                        ? "bg-neon text-black"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-colors",
                      selectedCategories.includes(cat.id)
                        ? "bg-neon text-black"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {typeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="w-full pt-3 text-xs font-bold tracking-wider uppercase transition-colors border-t font-display text-muted-foreground hover:text-foreground border-white/5"
              >
                Clear all filters
              </button>
            )}
          </PopoverContent>
        </Popover>

        {/* Date range picker */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="secondary"
                size="icon-lg"
                className={cn(
                  "size-12 shrink-0 focus-visible:ring-0 focus-visible:outline-none",
                  hasDateFilter && "text-neon",
                )}
              />
            }
          >
            <CalendarDays size={18} />
          </PopoverTrigger>

          <PopoverContent
            side="left"
            className="gap-0 p-4 w-90 bg-card border-white/10"
          >
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onRangeChange={setCustomDateRange}
            />
          </PopoverContent>
        </Popover>

        <Button onClick={() => setModalOpen(true)} size="xl">
          <ArrowUpRight size={16} />
          Add Transaction
        </Button>
      </search>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon/10 text-neon text-xs font-display font-bold uppercase tracking-wider"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="transition-colors hover:text-white"
                aria-label={`Remove ${chip.label} filter`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {chips.length >= 2 && (
            <button
              onClick={clearAll}
              className="text-xs font-bold tracking-wider uppercase transition-colors font-display text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <AddTransactionModal open={modalOpen} onOpenChange={setModalOpen} />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div>
        {filteredGroups.map((group) => (
          <section key={group.label} className="mt-4" aria-label={group.label}>
            <header className="flex items-center gap-4 mb-4">
              <h3 className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em] font-bold whitespace-nowrap">
                {group.label}
              </h3>
              <hr className="flex-1 border-border/30" />
            </header>
            <ul className="flex flex-col gap-3">
              {group.transactions.map((txn) => (
                <li key={txn.id}>
                  <TransactionRow transaction={txn} onDeleteRequest={handleDeleteRequest} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {filteredGroups.length === 0 && (
          <p className="py-8 text-sm text-center text-muted-foreground">
            {query.trim() || totalFilterCount > 0
              ? "No transactions match the current filters"
              : "No transactions yet"}
          </p>
        )}
      </div>
    </section>
  );
}
