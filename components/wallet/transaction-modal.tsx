"use client";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Account, Transaction } from "@/lib/data/wallet";
import { TransactionForm } from "./transaction-form";
import type { FormValues } from "./transaction-form/schema";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  accounts: Account[];
  lastUsedAccountId: string | null;
  onSubmit: (tx: Transaction) => void;
}

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  accounts,
  lastUsedAccountId,
  onSubmit: onSubmitProp,
}: TransactionModalProps) {
  const onSubmit = (data: FormValues) => {
    try {
      const amount = parseInt(data.amount, 10);
      const signedAmount = data.type === "income" ? amount : -amount;
      const categoryId =
        data.type === "transfer" ? "transfer" : data.categoryId;

      const txData = {
        type: data.type,
        description:
          data.description ||
          (data.type === "transfer" ? "Account Transfer" : "Manual Entry"),
        categoryId,
        amount: signedAmount,
        accountId: data.fromAccount,
        toAccountId: data.type === "transfer" ? data.toAccount : undefined,
        date: data.date,
      };

      if (transaction) {
        onSubmitProp({ ...transaction, ...txData });
        toast.success("Transaction updated");
      } else {
        onSubmitProp({ id: `txn-${Date.now()}`, ...txData } as Transaction);
        toast.success("Transaction added");
      }

      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl bg-card border-white/5 p-0 gap-0"
      >
        <header className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground font-display tracking-tight">
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </header>
        <TransactionForm
          open={open}
          accounts={accounts}
          lastUsedAccountId={lastUsedAccountId}
          transaction={transaction}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
