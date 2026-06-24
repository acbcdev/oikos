"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryDef } from "@/lib/data/categories";
import type { Tracker } from "@/lib/store/tracker-store";

const EXPENSE_CATEGORY_IDS = [
  "food",
  "transport",
  "shopping",
  "entertainment",
  "transfer",
];
const CURRENCIES = ["USD", "COP", "EUR", "GBP"];
const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
] as const;

const monitorSchema = z.object({
  name: z.string().min(1, "Required"),
  categoryId: z.string().min(1, "Required"),
  currency: z.string().min(1),
  limit: z.string().min(1, "Required"),
  period: z.enum(["weekly", "monthly"]),
});

type MonitorForm = z.infer<typeof monitorSchema>;

const EMPTY: MonitorForm = {
  name: "",
  categoryId: "",
  currency: "USD",
  limit: "",
  period: "monthly",
};

interface SpendMonitorFormProps {
  open: boolean;
  tracker?: Tracker;
  categories: CategoryDef[];
  submitLabel: string;
  onSubmit: (tracker: Tracker) => void;
  onCancel: () => void;
}

export function SpendMonitorForm({
  open,
  tracker,
  categories,
  submitLabel,
  onSubmit,
  onCancel,
}: SpendMonitorFormProps) {
  const form = useForm<MonitorForm>({
    resolver: zodResolver(monitorSchema),
    defaultValues: EMPTY,
  });

  const expenseCategories = categories.filter((c) =>
    EXPENSE_CATEGORY_IDS.includes(c.id),
  );

  useEffect(() => {
    if (!open) return;
    if (tracker?.type === "spend-monitor") {
      form.reset({
        name: tracker.name,
        categoryId: tracker.categoryId,
        currency: tracker.currency,
        limit: String(tracker.limit),
        period: tracker.period,
      });
    } else {
      form.reset(EMPTY);
    }
  }, [open, tracker]);

  const submit = (data: MonitorForm) => {
    onSubmit({
      id: tracker?.id || `tm-${Date.now()}`,
      type: "spend-monitor",
      name: data.name.trim(),
      categoryId: data.categoryId,
      currency: data.currency,
      limit: parseFloat(data.limit),
      period: data.period,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="px-8 pb-8 space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  size="lg"
                  placeholder="e.g. Food & Dining"
                  autoFocus
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger size="lg">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger size="lg" className="capitalize">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PERIODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limit</FormLabel>
                <FormControl>
                  <NumberInput
                    size="lg"
                    placeholder="0.00"
                    onValueChange={field.onChange}
                    {...field}
                  />
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger size="lg">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
