"use client";

import { useState, useMemo, useCallback } from "react";
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
import {
  useGroupedTransactions,
  useWalletStore,
} from "@/lib/store/wallet-store";
import { toast } from "sonner";
import { TransactionRow } from "./transaction-row";
import { TransactionModal } from "./transaction-modal";
import type { TxType } from "./wallet-layout";
import type { Account, Transaction } from "@/lib/data/wallet";

function txTypeFromCategoryId(categoryId: string): TxType {
  if (categoryId === "income") return "income";
  if (categoryId === "transfer") return "transfer";
  return "expense";
}

interface TransactionsPaneProps {
  query: string;
  selectedAccountIds: string[];
  selectedCategories: string[];
  selectedTypes: TxType[];
  dateFrom: string | null;
  dateTo: string | null;
  accounts: Account[];
  onDeleteRequest: (id: string) => void;
}

export function TransactionsPane({
  query,
  selectedAccountIds,
  selectedCategories,
  selectedTypes,
  dateFrom,
  dateTo,
  accounts,
  onDeleteRequest: onDeleteRequestProp,
}: TransactionsPaneProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  const transactionGroups = useGroupedTransactions();
  const updateTransaction = useWalletStore((s) => s.updateTransaction);

  const handleDeleteRequest = useCallback((id: string) => setDeleteId(id), []);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    onDeleteRequestProp(deleteId);
    toast.success("Transaction deleted");
    setDeleteId(null);
  };

  const handleSubmit = useCallback(
    (tx: Transaction) => {
      const { id, ...patch } = tx;
      updateTransaction(id, patch);
    },
    [updateTransaction],
  );

  const totalFilterCount =
    selectedAccountIds.length +
    selectedCategories.length +
    selectedTypes.length +
    (dateFrom || dateTo ? 1 : 0);

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
          if (q && !t.description.toLowerCase().includes(q) && !t.categoryId.toLowerCase().includes(q))
            return false;
          if (selectedAccountIds.length > 0 && !selectedAccountIds.includes(t.accountId))
            return false;
          if (selectedCategories.length > 0 && !selectedCategories.includes(t.categoryId))
            return false;
          if (selectedTypes.length > 0 && !selectedTypes.includes(txTypeFromCategoryId(t.categoryId)))
            return false;
          if (dateFrom && t.date < dateFrom) return false;
          if (dateTo && t.date > dateTo) return false;
          return true;
        }),
      }))
      .filter((g) => g.transactions.length > 0);
  }, [query, transactionGroups, selectedAccountIds, selectedCategories, selectedTypes, dateFrom, dateTo]);

  return (
    <section className="pb-8">
      <div className="px-1">
        {filteredGroups.map((group) => (
          <section key={group.label} className="mt-4" aria-label={group.label}>
            <header className="flex items-center gap-4 mb-4">
              <h3 className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em] font-bold whitespace-nowrap">
                {group.label}
              </h3>
              <hr className="flex-1 border-border/30" />
            </header>
            <ul className="flex flex-col gap-3 pb-4">
              {group.transactions.map((txn) => (
                <li key={txn.id}>
                  <TransactionRow
                    transaction={txn}
                    onDeleteRequest={handleDeleteRequest}
                    accounts={accounts}
                    onEdit={setEditTarget}
                  />
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

      <TransactionModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        transaction={editTarget ?? undefined}
        accounts={accounts}
        lastUsedAccountId={null}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
