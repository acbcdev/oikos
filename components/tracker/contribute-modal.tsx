"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PiggyBank } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTrackerStore, type SavingsGoal } from "@/lib/store/tracker-store";

const schema = z.object({
  amount: z.string().min(1, "Required"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  goal: SavingsGoal | null;
}

export function ContributeModal({ open, onOpenChange, goal }: ContributeModalProps) {
  const addContribution = useTrackerStore((s) => s.addContribution);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", note: "" },
  });

  if (!goal) return null;

  const onSubmit = (data: FormValues) => {
    addContribution(goal.id, {
      id: `contrib-${Date.now()}`,
      amount: parseFloat(data.amount),
      date: new Date().toISOString().split("T")[0],
      note: data.note || undefined,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md bg-card border-white/5 p-0 gap-0">
        <header className="px-8 pt-8 pb-6 flex items-center gap-3">
          <span className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <PiggyBank size={15} className="text-primary-foreground" />
          </span>
          <div>
            <DialogTitle className="text-xl font-bold text-foreground font-display tracking-tight">
              Contribute
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{goal.name}</p>
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ({goal.currency})</FormLabel>
                  <FormControl>
                    <NumberInput
                      size="lg"
                      placeholder="0.00"
                      autoFocus
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Input
                      size="lg"
                      placeholder="e.g. Monthly transfer"
                      autoComplete="off"
                      {...field}
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
                onClick={() => { onOpenChange(false); form.reset(); }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Contribution
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
