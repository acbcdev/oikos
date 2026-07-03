"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import type { Tracker } from "@/lib/store/tracker-store";

const CURRENCIES = ["USD", "COP", "EUR", "GBP"];

function defaultDeadline(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("en-CA");
}

const goalSchema = z.object({
  name: z.string().min(1, "Required"),
  currency: z.string().min(1),
  targetAmount: z.string().min(1, "Required"),
  deadline: z.string().optional(),
});

type GoalForm = z.infer<typeof goalSchema>;

const empty = (): GoalForm => ({
  name: "",
  currency: "USD",
  targetAmount: "",
  deadline: defaultDeadline(),
});

interface SavingsGoalFormProps {
  open: boolean;
  tracker?: Tracker;
  submitLabel: string;
  onSubmit: (tracker: Tracker) => void;
  onCancel: () => void;
}

export function SavingsGoalForm({
  open,
  tracker,
  submitLabel,
  onSubmit,
  onCancel,
}: SavingsGoalFormProps) {
  const form = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: empty(),
  });

  // Deadline can't be in the past. Deliberately NOT a lazy useState initializer —
  // that would run new Date() on the server too and reintroduce the exact hydration
  // mismatch this defers past mount to avoid.
  const [minDeadline, setMinDeadline] = useState<Date | undefined>(undefined);
  // react-doctor-disable-next-line react-doctor/no-initialize-state
  useEffect(() => setMinDeadline(new Date()), []); // eslint-disable-line react-hooks/set-state-in-effect -- mount-only, client-only value, see comment above

  useEffect(() => {
    if (!open) return;
    if (tracker?.type === "savings-goal") {
      form.reset({
        name: tracker.name,
        currency: tracker.currency,
        targetAmount: String(tracker.targetAmount),
        deadline: tracker.deadline ?? defaultDeadline(),
      });
    } else {
      form.reset(empty());
    }
  }, [open, tracker, form]);

  const submit = useCallback(
    (data: GoalForm) => {
      onSubmit({
        id: tracker?.id || `sg-${Date.now()}`,
        type: "savings-goal",
        name: data.name.trim(),
        currency: data.currency,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount:
          tracker?.type === "savings-goal" ? tracker.currentAmount : 0,
        deadline: data.deadline || undefined,
        lastContributedAt:
          tracker?.type === "savings-goal" ? tracker.lastContributedAt : null,
        contributions:
          tracker?.type === "savings-goal" ? tracker.contributions : [],
      });
    },
    [onSubmit, tracker],
  );

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
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input
                  size="lg"
                  placeholder="e.g. Vacation Fund"
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
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target</FormLabel>
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

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline (optional)</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick a deadline"
                  minDate={minDeadline}
                  maxDate={null}
                  side="top"
                />
              </FormControl>
            </FormItem>
          )}
        />

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
