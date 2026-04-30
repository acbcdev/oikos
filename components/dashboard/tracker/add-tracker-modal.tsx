"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TrendingDown, PiggyBank } from "lucide-react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useTrackerStore, type Tracker } from "@/lib/store/tracker-store";

function defaultDeadline(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("en-CA");
}

const EXPENSE_CATEGORY_IDS = ["food", "transport", "shopping", "entertainment", "transfer"];
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

const goalSchema = z.object({
  name: z.string().min(1, "Required"),
  currency: z.string().min(1),
  targetAmount: z.string().min(1, "Required"),
  deadline: z.string().optional(),
});

type MonitorForm = z.infer<typeof monitorSchema>;
type GoalForm = z.infer<typeof goalSchema>;
type TrackerType = "spend-monitor" | "savings-goal";

interface AddTrackerModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tracker?: Tracker;
}

export function AddTrackerModal({ open, onOpenChange, tracker }: AddTrackerModalProps) {
  const isEdit = !!tracker;
  const [type, setType] = useState<TrackerType>("spend-monitor");

  const labels = isEdit
    ? {
        title: type === "spend-monitor" ? "Edit Limit" : "Edit Target",
        subtitle: tracker?.name ?? "",
        submitMonitor: "Save Changes",
        submitGoal: "Save Changes",
      }
    : {
        title: "New Tracker",
        subtitle: "Monitor spending or save toward a goal.",
        submitMonitor: "Create Limit",
        submitGoal: "Create Goal",
      };

  const addTracker = useTrackerStore((s) => s.addTracker);
  const updateTracker = useTrackerStore((s) => s.updateTracker);
  const categories = useWalletStore((s) => s.categories);

  const expenseCategories = categories.filter((c) => EXPENSE_CATEGORY_IDS.includes(c.id));

  const monitorForm = useForm<MonitorForm>({
    resolver: zodResolver(monitorSchema),
    defaultValues: { name: "", categoryId: "", currency: "USD", limit: "", period: "monthly" },
  });

  const goalForm = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: { name: "", currency: "USD", targetAmount: "", deadline: defaultDeadline() },
  });

  useEffect(() => {
    if (!open) return;
    if (tracker) {
      setType(tracker.type);
      if (tracker.type === "spend-monitor") {
        monitorForm.reset({
          name: tracker.name,
          categoryId: tracker.categoryId,
          currency: tracker.currency,
          limit: String(tracker.limit),
          period: tracker.period,
        });
      } else {
        goalForm.reset({
          name: tracker.name,
          currency: tracker.currency,
          targetAmount: String(tracker.targetAmount),
          deadline: tracker.deadline ?? defaultDeadline(),
        });
      }
    } else {
      setType("spend-monitor");
      monitorForm.reset({ name: "", categoryId: "", currency: "USD", limit: "", period: "monthly" });
      goalForm.reset({ name: "", currency: "USD", targetAmount: "", deadline: defaultDeadline() });
    }
  }, [open, tracker]);

  const handleClose = () => {
    onOpenChange(false);
    monitorForm.reset();
    goalForm.reset();
  };

  const onSubmitMonitor = (data: MonitorForm) => {
    if (isEdit && tracker) {
      updateTracker(tracker.id, {
        name: data.name.trim(),
        categoryId: data.categoryId,
        currency: data.currency,
        limit: parseFloat(data.limit),
        period: data.period,
      });
    } else {
      const t: Tracker = {
        id: `tm-${Date.now()}`,
        type: "spend-monitor",
        name: data.name.trim(),
        categoryId: data.categoryId,
        currency: data.currency,
        limit: parseFloat(data.limit),
        period: data.period,
      };
      addTracker(t);
    }
    handleClose();
  };

  const onSubmitGoal = (data: GoalForm) => {
    if (isEdit && tracker) {
      updateTracker(tracker.id, {
        name: data.name.trim(),
        currency: data.currency,
        targetAmount: parseFloat(data.targetAmount),
        deadline: data.deadline || undefined,
      });
    } else {
      const t: Tracker = {
        id: `sg-${Date.now()}`,
        type: "savings-goal",
        name: data.name.trim(),
        currency: data.currency,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: 0,
        deadline: data.deadline || undefined,
        lastContributedAt: null,
        contributions: [],
      };
      addTracker(t);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showCloseButton className="sm:max-w-lg bg-card border-white/5 p-0 gap-0">
        <header className="px-8 pt-8 pb-6">
          <DialogTitle className="text-xl font-bold text-foreground font-display tracking-tight">
            {labels.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">{labels.subtitle}</p>
        </header>

        {/* type selector — hidden in edit mode (type is fixed) */}
        {!isEdit && (
          <div className="px-8 pb-5">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "spend-monitor" as TrackerType, icon: TrendingDown, label: "Limit", desc: "Cap category spend" },
                { value: "savings-goal" as TrackerType, icon: PiggyBank, label: "Target", desc: "Save toward a goal" },
              ].map(({ value, icon: Icon, label, desc }) => {
                const selected = type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                      selected
                        ? "border-primary/60 bg-primary/8 text-foreground"
                        : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <Icon size={15} className={selected ? "text-primary" : ""} />
                    <div>
                      <p className="text-xs font-bold font-display uppercase tracking-wider">{label}</p>
                      <p className="text-[10px] opacity-60">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* monitor form */}
        {type === "spend-monitor" && (
          <Form {...monitorForm}>
            <form
              onSubmit={monitorForm.handleSubmit(onSubmitMonitor)}
              className="px-8 pb-8 space-y-4"
            >
              <FormField
                control={monitorForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input size="lg" placeholder="e.g. Food & Dining" autoFocus autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={monitorForm.control}
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
                  control={monitorForm.control}
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
                  control={monitorForm.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limit</FormLabel>
                      <FormControl>
                        <NumberInput size="lg" placeholder="0.00" onValueChange={field.onChange} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={monitorForm.control}
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
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {labels.submitMonitor}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* goal form */}
        {type === "savings-goal" && (
          <Form {...goalForm}>
            <form
              onSubmit={goalForm.handleSubmit(onSubmitGoal)}
              className="px-8 pb-8 space-y-4"
            >
              <FormField
                control={goalForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl>
                      <Input size="lg" placeholder="e.g. Vacation Fund" autoFocus autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={goalForm.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target</FormLabel>
                      <FormControl>
                        <NumberInput size="lg" placeholder="0.00" onValueChange={field.onChange} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={goalForm.control}
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
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={goalForm.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (optional)</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Pick a deadline"
                        minDate={new Date()}
                        maxDate={null}
                        side="top"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {labels.submitGoal}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
