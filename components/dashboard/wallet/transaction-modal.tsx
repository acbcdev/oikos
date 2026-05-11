"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { Control } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/data/categories";
import type { Account, Transaction } from "@/lib/data/wallet";
import { fmt } from "@/lib/utils/currency";
import { formatInteger, stripNumberFormat } from "@/lib/utils/number-format";

// ─── Schema ──────────────────────────────────────────────────────────────────

type TransactionType = "expense" | "income" | "transfer";

const typeOptions: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
];

const todayISO = () => new Date().toLocaleDateString("en-CA");

const transactionSchema = z
  .object({
    type: z.enum(["expense", "income", "transfer"]),
    amount: z.string().min(1, "Amount is required"),
    date: z.string().min(1, "Select a date"),
    fromAccount: z.string().min(1, "Select an account"),
    toAccount: z.string().optional(),
    categoryId: z.string().min(1, "Select a category"),
    description: z.string().max(200, "Max 200 characters").optional(),
  })
  .refine(
    (data) =>
      data.type !== "transfer" ||
      (data.toAccount && data.toAccount !== data.fromAccount),
    { message: "Transfer accounts must be different", path: ["toAccount"] },
  );

type FormValues = z.infer<typeof transactionSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeToggle({ control }: { control: Control<FormValues> }) {
  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <fieldset
            className="grid p-2 bg-white/5 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${typeOptions.length}, 1fr)`,
            }}
          >
            <legend className="sr-only">Transaction type</legend>
            {typeOptions.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={field.value === opt.value ? "default" : "ghost"}
                onClick={() => field.onChange(opt.value)}
                className={`py-2.5 h-auto text-sm font-bold font-display rounded-md border-0 ${
                  field.value === opt.value
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
              >
                {opt.label}
              </Button>
            ))}
          </fieldset>
        </FormItem>
      )}
    />
  );
}

function AmountField({
  control,
  currencySymbol,
}: {
  control: Control<FormValues>;
  currencySymbol: string;
}) {
  return (
    <FormField
      control={control}
      name="amount"
      render={({ field }) => (
        <FormItem className="space-y-1 text-center py-2 ">
          <FormLabel className="mx-auto">Transaction Amount *</FormLabel>
          <FormControl>
            <div className="flex items-center justify-center gap-2 bg-secondary/60 rounded-xl px-2 mt-2 py-1">
              <span className="text-4xl font-bold text-primary font-display">
                {currencySymbol}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                // biome-ignore lint/a11y/noAutofocus: <valid use-case>
                autoFocus
                value={formatInteger(field.value)}
                onChange={(e) =>
                  field.onChange(e.target.value.replace(/\D/g, ""))
                }
                onPaste={(e) => {
                  e.preventDefault();
                  const digits = stripNumberFormat(
                    e.clipboardData.getData("text"),
                  ).replace(/[.-]/g, "");
                  field.onChange(digits);
                }}
                className=" text-center text-6xl font-bold text-primary font-display placeholder:text-primary/20 outline-none w-full"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function AccountSelect({
  control,
  name,
  label,
  accounts,
}: {
  control: Control<FormValues>;
  name: "fromAccount" | "toAccount";
  label: string;
  accounts: Account[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => v && field.onChange(v)}
              disabled={accounts.length === 0}
            >
              <SelectTrigger>
                <span className="flex flex-1 text-left text-sm truncate">
                  {accounts.length === 0
                    ? "Add an account first"
                    : (accounts.find((a) => a.id === field.value)?.name ??
                      "Select account")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <span className="flex flex-col">
                        <span>{acc.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {acc.type} ·{" "}
                          {fmt(acc.balance, acc.currency)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function AccountFields({
  control,
  accounts,
  type,
}: {
  control: Control<FormValues>;
  accounts: Account[];
  type: TransactionType;
}) {
  return (
    <fieldset className="grid grid-cols-1 gap-4">
      <legend className="sr-only">Account</legend>
      {type === "transfer" ? (
        <div className="grid grid-cols-2 gap-4">
          <AccountSelect
            control={control}
            name="fromAccount"
            label="From Account *"
            accounts={accounts}
          />
          <AccountSelect
            control={control}
            name="toAccount"
            label="To Account *"
            accounts={accounts}
          />
        </div>
      ) : (
        <AccountSelect
          control={control}
          name="fromAccount"
          label="Account *"
          accounts={accounts}
        />
      )}
    </fieldset>
  );
}

function CategoryField({ control }: { control: Control<FormValues> }) {
  return (
    <FormField
      control={control}
      name="categoryId"
      render={({ field }) => {
        const selected = CATEGORIES.find((c) => c.id === field.value);
        const SelectedIcon = selected?.icon;
        return (
          <FormItem>
            <FormLabel>Category *</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(v) => v && field.onChange(v)}
              >
                <SelectTrigger>
                  {selected && SelectedIcon ? (
                    <span className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className="size-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${selected.color}20` }}
                      >
                        <SelectedIcon
                          size={13}
                          style={{ color: selected.color }}
                        />
                      </span>
                      <span className="text-sm truncate">{selected.name}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Select category
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectGroup>
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-3">
                            <span
                              className="size-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${cat.color}20` }}
                            >
                              <Icon size={15} style={{ color: cat.color }} />
                            </span>
                            <span className="flex flex-col">
                              <span className="text-sm font-semibold">
                                {cat.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {cat.desc}
                              </span>
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

function DateField({
  control,
  required = true,
}: {
  control: Control<FormValues>;
  required?: boolean;
}) {
  return (
    <FormField
      control={control}
      name="date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Date {required && "*"}</FormLabel>
          <FormControl>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              maxDate={new Date()}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DescriptionField({ control }: { control: Control<FormValues> }) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add a short note..."
              value={field.value ?? ""}
              onChange={field.onChange}
              rows={4}
              className="w-full bg-secondary/60 border-none rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/30 resize-none text-sm font-body min-h-20"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

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
  const defaultAccountId =
    (lastUsedAccountId && accounts.find((a) => a.id === lastUsedAccountId)
      ? lastUsedAccountId
      : accounts[0]?.id) ?? "";

  const inferType = (tx: Transaction): TransactionType => {
    if (tx.categoryId === "transfer") return "transfer";
    if (tx.amount > 0) return "income";
    return "expense";
  };

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
  }, [open]);

  const type = form.watch("type");
  const fromAccount = form.watch("fromAccount");

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

  const onSubmit = (data: FormValues) => {
    try {
      const amount = parseInt(data.amount, 10);
      const signedAmount = data.type === "income" ? amount : -amount;
      const categoryId =
        data.type === "transfer" ? "transfer" : data.categoryId;

      const txData = {
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
      form.reset();
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-8 pb-8 space-y-5"
          >
            <TypeToggle control={form.control} />
            <AmountField
              control={form.control}
              currencySymbol={currencySymbol}
            />
            <AccountFields
              control={form.control}
              accounts={accounts}
              type={type}
            />

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
              disabled={form.formState.isSubmitting}
              className="w-full font-display font-bold tracking-wider uppercase mt-2"
            >
              {transaction ? <Pencil size={18} /> : <Plus size={18} />}
              {transaction ? "Save Changes" : "Add Transaction"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
