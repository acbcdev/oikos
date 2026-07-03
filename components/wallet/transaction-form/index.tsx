"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CATEGORIES } from "@/lib/data/categories";
import type { Account, Transaction } from "@/lib/data/wallet";
import { AccountFields } from "./account-fields";
import { AmountField } from "./amount-field";
import { CategoryField } from "./category-field";
import { DateField } from "./date-field";
import { DescriptionField } from "./description-field";
import {
  type FormValues,
  inferType,
  todayISO,
  transactionSchema,
} from "./schema";
import { TypeToggle } from "./type-toggle";

interface TransactionFormProps {
  open: boolean;
  accounts: Account[];
  lastUsedAccountId: string | null;
  transaction?: Transaction;
  onSubmit: (data: FormValues) => void;
}

export function TransactionForm({
  open,
  accounts,
  lastUsedAccountId,
  transaction,
  onSubmit,
}: TransactionFormProps) {
  const defaultAccountId =
    (lastUsedAccountId && accounts.find((a) => a.id === lastUsedAccountId)
      ? lastUsedAccountId
      : accounts[0]?.id) ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: inferType(transaction),
          amount: Math.abs(transaction.amount).toString(),
          date: transaction.date,
          fromAccount: transaction.accountId,
          toAccount:
            transaction.toAccountId ??
            accounts.find((a) => a.id !== transaction.accountId)?.id ??
            "",
          categoryId: transaction.categoryId,
          description: transaction.description,
        }
      : {
          type: "expense",
          amount: "",
          date: todayISO(),
          fromAccount: defaultAccountId,
          toAccount: accounts.find((a) => a.id !== defaultAccountId)?.id ?? "",
          categoryId: CATEGORIES[0]?.id ?? "",
          description: "",
        },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — resets only on open
  useEffect(() => {
    if (!open) return;
    if (transaction) {
      form.reset({
        type: inferType(transaction),
        amount: Math.abs(transaction.amount).toString(),
        date: transaction.date,
        fromAccount: transaction.accountId,
        toAccount:
          transaction.toAccountId ??
          accounts.find((a) => a.id !== transaction.accountId)?.id ??
          "",
        categoryId: transaction.categoryId,
        description: transaction.description,
      });
    } else {
      const id =
        lastUsedAccountId && accounts.find((a) => a.id === lastUsedAccountId)
          ? lastUsedAccountId
          : (accounts[0]?.id ?? "");
      form.reset({
        type: "expense",
        amount: "",
        date: todayISO(),
        fromAccount: id,
        toAccount: accounts.find((a) => a.id !== id)?.id ?? "",
        categoryId: CATEGORIES[0]?.id ?? "",
        description: "",
      });
    }
    // react-doctor-disable-next-line react-doctor/exhaustive-deps
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional, resets only on open

  const type = useWatch({
    control: form.control,
    name: "type",
    defaultValue: "expense",
  });
  const fromAccount = useWatch({
    control: form.control,
    name: "fromAccount",
    defaultValue: defaultAccountId,
  });

  const currencySymbol = useMemo(() => {
    const account = accounts.find((a) => a.id === fromAccount);
    if (!account) return "$";
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: account.currency,
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? "$"
    );
  }, [accounts, fromAccount]);

  const { isSubmitting } = form.formState;

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="px-8 pb-8 space-y-5"
      >
        <TypeToggle control={form.control} />
        <AmountField control={form.control} currencySymbol={currencySymbol} />
        <AccountFields control={form.control} accounts={accounts} type={type} />

        {(type === "expense" || type === "income") && (
          <div className="space-y-4">
            <CategoryField control={form.control} />
            <DateField control={form.control} />
          </div>
        )}

        {type === "transfer" && (
          <DateField control={form.control} required={false} />
        )}

        <DescriptionField control={form.control} />

        <Button
          type="submit"
          size="xl"
          disabled={isSubmitting}
          className="w-full font-display font-bold tracking-wider uppercase mt-2"
        >
          {transaction ? <Pencil size={18} /> : <Plus size={18} />}
          {transaction ? "Save Changes" : "Add Transaction"}
        </Button>
      </form>
    </Form>
  );
}
