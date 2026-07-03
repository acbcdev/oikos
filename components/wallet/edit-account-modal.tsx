"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useWalletStore } from "@/lib/store/wallet-store";
import type { Account } from "@/lib/data/wallet";

const accountTypes = ["Checking", "Savings", "Brokerage"] as const;

const currencies = [
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "JPY", label: "JPY - Japanese Yen" },
  { code: "COP", label: "COP - Colombian Peso" },
];

const accountSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  accountType: z.enum(["Checking", "Savings", "Brokerage"]),
  currency: z.string().min(1, "Select a currency"),
  balance: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

function capitalizeFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function EditAccountModal({
  account,
  open,
  onOpenChange,
}: {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateAccount = useWalletStore((s) => s.updateAccount);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account.name,
      accountType: capitalizeFirst(
        account.type,
      ) as (typeof accountTypes)[number],
      currency: account.currency,
      balance: String(account.balance),
    },
  });

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      form.reset({
        name: account.name,
        accountType: capitalizeFirst(
          account.type,
        ) as (typeof accountTypes)[number],
        currency: account.currency,
        balance: String(account.balance),
      });
    }
  }

  const currency = useWatch({
    control: form.control,
    name: "currency",
    defaultValue: account.currency,
  });

  const currencySymbol =
    new Intl.NumberFormat("en-US", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? "$";

  const formatBalance = (raw: string) => {
    if (!raw) return "";
    const num = parseInt(raw, 10);
    return isNaN(num) ? "" : num.toLocaleString("en-US");
  };

  const onSubmit = (data: AccountFormValues) => {
    updateAccount(account.id, {
      name: data.name.trim(),
      institution: data.name.trim(),
      type: data.accountType.toLowerCase() as Account["type"],
      currency: data.currency,
      balance: data.balance ? parseInt(data.balance, 10) : 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="sm:max-w-xl bg-card border-white/5 p-0 gap-0"
      >
        <header className="px-8 pt-8 pb-6 flex items-center gap-3">
          <span className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Pencil size={16} className="text-primary-foreground" />
          </span>
          <DialogTitle className="text-xl font-bold text-foreground font-display tracking-tight">
            Edit Account
          </DialogTitle>
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-8 pb-8 space-y-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g. Main Checking"
                      {...field}
                      className="w-full bg-white/5 border-none rounded-lg py-3 px-4 h-auto text-foreground placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary text-sm font-body"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance</FormLabel>
                  <FormControl>
                    <div className="flex items-center bg-white/5 rounded-lg px-4 py-3 focus-within:ring-1 focus-within:ring-primary">
                      <span className="text-sm font-display font-bold text-muted-foreground mr-2">
                        {currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0.00"
                        value={formatBalance(field.value ?? "")}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          field.onChange(digits);
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const digits = e.clipboardData
                            .getData("text")
                            .replace(/[.,]/g, "")
                            .replace(/\D/g, "");
                          field.onChange(digits);
                        }}
                        className="bg-transparent border-none text-foreground text-sm font-body outline-none w-full placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <footer className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 font-display font-bold tracking-wider uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 font-display font-bold tracking-wider uppercase"
              >
                Save Changes
              </Button>
            </footer>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
