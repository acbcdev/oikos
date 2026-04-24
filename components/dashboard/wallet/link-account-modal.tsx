"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, PiggyBank, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
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

const ACCOUNT_TYPES = [
  {
    label: "Checking",
    value: "checking" as const,
    icon: CreditCard,
    description: "Day-to-day spending",
  },
  {
    label: "Savings",
    value: "savings" as const,
    icon: PiggyBank,
    description: "Long-term savings",
  },
  {
    label: "Investment",
    value: "investment" as const,
    icon: TrendingUp,
    description: "Stocks & funds",
  },
];

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
  accountType: z.enum(["checking", "savings", "investment"]),
  currency: z.string().min(1, "Select a currency"),
  balance: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function LinkAccountModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addAccount = useWalletStore((s) => s.addAccount);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      accountType: "checking",
      currency: "USD",
      balance: "",
    },
  });

  const currency = form.watch("currency");
  const selectedType = form.watch("accountType");

  const currencySymbol =
    new Intl.NumberFormat("en-US", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? "$";

  const ActiveIcon = ACCOUNT_TYPES.find((t) => t.value === selectedType)?.icon ?? CreditCard;

  const onSubmit = (data: AccountFormValues) => {
    const acc: Account = {
      id: `acc-${Date.now()}`,
      name: data.name.trim(),
      institution: data.name.trim(),
      type: data.accountType,
      currency: data.currency,
      balance: data.balance ? parseFloat(data.balance) : 0,
    };

    addAccount(acc);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="sm:max-w-xl bg-card border-white/5 p-0 gap-0"
      >
        <header className="px-8 pt-8 pb-6 flex items-center gap-3">
          <span className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <ActiveIcon size={16} className="text-primary-foreground" />
          </span>
          <DialogTitle className="text-xl font-bold text-foreground font-display tracking-tight">
            Link New Account
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
                      size="lg"
                      placeholder="e.g. Main Checking"
                      autoFocus
                      autoComplete="off"
                      {...field}
                      className="w-full"
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
                    <div className="grid grid-cols-3 gap-2">
                      {ACCOUNT_TYPES.map(({ label, value, icon: Icon, description }) => {
                        const isSelected = field.value === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => field.onChange(value)}
                            className={cn(
                              "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all",
                              isSelected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border bg-secondary/40 text-muted-foreground hover:border-border/60 hover:bg-secondary/60 hover:text-foreground",
                            )}
                          >
                            <Icon
                              size={16}
                              className={isSelected ? "text-primary" : "text-muted-foreground"}
                            />
                            <div>
                              <p className="text-xs font-semibold font-display">{label}</p>
                              <p className="text-[10px] opacity-60 leading-tight">{description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                        <SelectTrigger size="lg">
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
                    <FormLabel>Initial Balance</FormLabel>
                    <FormControl>
                      <NumberInput
                        size="lg"
                        prefix={currencySymbol}
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <footer className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="xl"
                onClick={() => onOpenChange(false)}
                className="flex-1 font-display font-bold tracking-wider uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="xl"
                className="flex-1 font-display font-bold tracking-wider uppercase"
              >
                Save Account
              </Button>
            </footer>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
