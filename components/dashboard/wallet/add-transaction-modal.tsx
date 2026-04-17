"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useWalletStore } from "@/lib/store/wallet-store";
import type { Transaction } from "@/lib/data/wallet";
import { formatCurrency } from "@/lib/data/wallet";
import { formatInteger, stripNumberFormat } from "@/lib/utils/number-format";

type TransactionType = "expense" | "income" | "transfer";

const typeOptions: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
];

const categories = [
  "Shopping",
  "Food & Drink",
  "Transport",
  "Entertainment",
  "Transfer",
  "Income",
] as const;

const transactionSchema = z
  .object({
    type: z.enum(["expense", "income", "transfer"]),
    amount: z.string().min(1, "Amount is required"),
    fromAccount: z.string().min(1, "Select an account"),
    toAccount: z.string().optional(),
    category: z.string().min(1, "Select a category"),
    description: z.string().max(200, "Max 200 characters").optional(),
  })
  .refine(
    (data) =>
      data.type !== "transfer" ||
      (data.toAccount && data.toAccount !== data.fromAccount),
    {
      message: "Transfer accounts must be different",
      path: ["toAccount"],
    },
  );

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function AddTransactionModal({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}) {
  const accounts = useWalletStore((s) => s.accounts);
  const lastUsedAccountId = useWalletStore((s) => s.lastUsedAccountId);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const updateTransaction = useWalletStore((s) => s.updateTransaction);

  const defaultAccountId =
    (lastUsedAccountId && accounts.find((a) => a.id === lastUsedAccountId)
      ? lastUsedAccountId
      : accounts[0]?.id) ?? "";

  const inferType = (tx: Transaction): TransactionType => {
    if (tx.category === "Transfer") return "transfer";
    if (tx.amount > 0) return "income";
    return "expense";
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: inferType(transaction),
          amount: Math.abs(transaction.amount).toString(),
          fromAccount: transaction.accountId,
          toAccount: accounts.find((a) => a.id !== transaction.accountId)?.id ?? "",
          category: transaction.category,
          description: transaction.merchant,
        }
      : {
          type: "expense",
          amount: "",
          fromAccount: defaultAccountId,
          toAccount: accounts.find((a) => a.id !== defaultAccountId)?.id ?? "",
          category: categories[0],
          description: "",
        },
  });

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      form.reset({
        type: inferType(transaction),
        amount: Math.abs(transaction.amount).toString(),
        fromAccount: transaction.accountId,
        toAccount: accounts.find((a) => a.id !== transaction.accountId)?.id ?? "",
        category: transaction.category,
        description: transaction.merchant,
      });
    } else {
      const id =
        lastUsedAccountId && accounts.find((a) => a.id === lastUsedAccountId)
          ? lastUsedAccountId
          : (accounts[0]?.id ?? "");
      form.reset({
        type: "expense",
        amount: "",
        fromAccount: id,
        toAccount: accounts.find((a) => a.id !== id)?.id ?? "",
        category: categories[0],
        description: "",
      });
    }
  }, [open]);

  const type = form.watch("type");
  const fromAccount = form.watch("fromAccount");

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccount),
    [accounts, fromAccount],
  );

  const currencySymbol = useMemo(
    () =>
      selectedAccount
        ? (new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: selectedAccount.currency,
          })
            .formatToParts(0)
            .find((p) => p.type === "currency")?.value ?? "$")
        : "$",
    [selectedAccount],
  );

  const formatAmount = (raw: string) => formatInteger(raw);

  const onSubmit = (data: TransactionFormValues) => {
    try {
      const amount = parseInt(data.amount, 10);
      const signedAmount = data.type === "income" ? amount : -amount;
      const today = new Date().toISOString().slice(0, 10);

      const patch = {
        merchant:
          data.description ||
          (data.type === "transfer" ? "Account Transfer" : "Manual Entry"),
        category:
          data.type === "transfer"
            ? "Transfer"
            : data.type === "income"
              ? "Income"
              : (data.category as Transaction["category"]),
        subcategory: data.type === "transfer" ? "Transfer" : data.category,
        paymentMethod: `Card **** ${selectedAccount?.id.slice(-4) ?? "0000"}`,
        amount: signedAmount,
        accountId: data.fromAccount,
        status: "pending" as const,
      };

      if (transaction) {
        updateTransaction(transaction.id, patch);
        toast.success("Transaction updated");
      } else {
        addTransaction({
          ...patch,
          id: `txn-${Date.now()}`,
          date: today,
          referenceCode: `#TRX-${Date.now().toString(36).toUpperCase()}`,
        });
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
        <header className="px-8 pt-8 pb-4 flex justify-between items-center">
          <DialogTitle className="text-2xl font-bold text-foreground font-display tracking-tight">
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-8 pb-8 space-y-5"
          >
            {/* Type toggle */}
            <FormField
              control={form.control}
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
                        variant={
                          field.value === opt.value ? "default" : "ghost"
                        }
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

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-1 text-center py-2">
                  <FormLabel className="mx-auto">Transaction Amount</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-primary font-display">
                        {currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={formatAmount(field.value)}
                        onChange={(e) => {
                          field.onChange(e.target.value.replace(/\D/g, ""));
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const digits = stripNumberFormat(
                            e.clipboardData.getData("text"),
                          ).replace(/[.-]/g, "");
                          field.onChange(digits);
                        }}
                        className="bg-transparent border-none text-center text-6xl font-bold text-primary font-display placeholder:text-primary/20 outline-none w-full"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic fields */}
            <fieldset className="grid grid-cols-1 gap-4">
              <legend className="sr-only">Transaction details</legend>

              {type === "transfer" ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Account</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(v) => v && field.onChange(v)}
                            disabled={accounts.length === 0}
                          >
                            <SelectTrigger>
                              <span className="flex flex-1 text-left text-sm truncate">
                                {accounts.length === 0 ? "Add an account first" : (accounts.find((a) => a.id === field.value)?.name ?? "Select account")}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {accounts.map((acc) => (
                                  <SelectItem key={acc.id} value={acc.id}>
                                    <span className="flex flex-col">
                                      <span>{acc.name}</span>
                                      <span className="text-xs text-muted-foreground capitalize">{acc.type} · {formatCurrency(acc.balance, acc.currency)}</span>
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
                  <FormField
                    control={form.control}
                    name="toAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Account</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(v) => v && field.onChange(v)}
                            disabled={accounts.length === 0}
                          >
                            <SelectTrigger>
                              <span className="flex flex-1 text-left text-sm truncate">
                                {accounts.length === 0 ? "Add an account first" : (accounts.find((a) => a.id === field.value)?.name ?? "Select account")}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  <span className="flex flex-col">
                                    <span>{acc.name}</span>
                                    <span className="text-xs text-muted-foreground capitalize">{acc.type} · {formatCurrency(acc.balance, acc.currency)}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="fromAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Account</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) => v && field.onChange(v)}
                          disabled={accounts.length === 0}
                        >
                          <SelectTrigger>
                            <span className="flex flex-1 text-left text-sm truncate">
                              {accounts.length === 0 ? "Add an account first" : (accounts.find((a) => a.id === field.value)?.name ?? "Select account")}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>
                                <span className="flex flex-col">
                                  <span>{acc.name}</span>
                                  <span className="text-xs text-muted-foreground capitalize">{acc.type} · {formatCurrency(acc.balance, acc.currency)}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {type !== "transfer" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(v) => v && field.onChange(v)}
                          >
                            <SelectTrigger>
                              <span className="flex flex-1 text-left text-sm truncate">
                                {field.value || "Select category"}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg py-3 px-4 text-sm font-display text-muted-foreground">
                      <Calendar size={14} className="shrink-0" />
                      Today
                    </div>
                  </div>
                </div>
              )}

              {type === "transfer" && (
                <div className="space-y-2">
                  <label>Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value="Today"
                      className="w-full bg-white/5 border-none rounded-lg py-3 px-4 pr-10 text-foreground focus:ring-1 focus:ring-primary text-sm font-display outline-none"
                    />
                    <Calendar
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                </div>
              )}
            </fieldset>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a short note..."
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      rows={2}
                      className="w-full bg-white/5 border-none rounded-lg py-3 px-4 text-foreground placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary resize-none text-sm font-body min-h-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CTA */}
            <Button
              type="submit"
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
