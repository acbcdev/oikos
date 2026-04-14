"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  useBudgetStore,
  type Budget,
  type BudgetCategory,
} from "@/lib/store/budget-store";
import { useAvailableCurrencies } from "@/lib/store/wallet-store";

const BUDGET_CATEGORIES: BudgetCategory[] = [
  "Food & Drink",
  "Transport",
  "Shopping",
  "Entertainment",
];

const budgetSchema = z.object({
  currency: z.string().min(1, "Select a currency"),
  category: z.enum(["Food & Drink", "Transport", "Shopping", "Entertainment"]),
  limit: z.string().min(1, "Amount is required"),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

function getCurrencySymbol(currency: string): string {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value ?? "$";
}

export function AddBudgetModal({
  open,
  onOpenChange,
  budget,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
}) {
  const addBudget = useBudgetStore((s) => s.addBudget);
  const updateBudget = useBudgetStore((s) => s.updateBudget);
  const currencies = useAvailableCurrencies();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      currency: currencies[0] ?? "",
      category: "Food & Drink",
      limit: "",
    },
  });

  const watchedCurrency = form.watch("currency");
  const currencySymbol = watchedCurrency
    ? getCurrencySymbol(watchedCurrency)
    : "$";

  useEffect(() => {
    if (!open) return;
    if (budget) {
      form.reset({
        currency: budget.currency,
        category: budget.category,
        limit: budget.limit.toString(),
      });
    } else {
      form.reset({
        currency: currencies[0] ?? "",
        category: "Food & Drink",
        limit: "",
      });
    }
  }, [open]);

  // When currencies load after hydration, ensure currency field has a valid value
  useEffect(() => {
    if (currencies.length > 0 && !form.getValues("currency")) {
      form.setValue("currency", currencies[0]);
    }
  }, [currencies]);

  const formatAmount = (raw: string) => {
    if (!raw) return "";
    const num = parseInt(raw, 10);
    return isNaN(num)
      ? ""
      : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
          num,
        );
  };

  const onSubmit = (data: BudgetFormValues) => {
    const limit = parseInt(data.limit, 10);
    if (budget) {
      updateBudget(budget.id, {
        category: data.category,
        limit,
        currency: data.currency,
      });
    } else {
      addBudget({
        id: `budget-${Date.now()}`,
        category: data.category,
        limit,
        currency: data.currency,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-card border-white/5 p-0 gap-0"
      >
        <header className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground font-display tracking-tight">
            {budget ? "Edit Budget" : "New Budget"}
          </DialogTitle>
        </header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-8 pb-8 space-y-5"
          >
            {/* Monthly limit */}
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem className="space-y-1 text-center py-2">
                  <FormLabel className="mx-auto">Monthly Limit</FormLabel>
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
                          const digits = e.target.value.replace(/\D/g, "");
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

            {/* Currency selector — only shown when multiple currencies exist */}
            {currencies.length > 1 && (
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || currencies[0]}
                        onValueChange={(v) => v && field.onChange(v)}
                      >
                        <SelectTrigger>
                          <span className="flex flex-1 text-left text-sm truncate">
                            {field.value || "Select currency"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
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

            {/* Category */}
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
                        {BUDGET_CATEGORIES.map((cat) => (
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

            <Button type="submit" size={"xl"} className="w-full">
              {budget ? <Pencil size={18} /> : <Plus size={18} />}
              {budget ? "Save Changes" : "Create Budget"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
