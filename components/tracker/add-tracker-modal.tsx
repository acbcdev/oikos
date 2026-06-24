"use client";

import { PiggyBank, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CategoryDef } from "@/lib/data/categories";
import type { Tracker } from "@/lib/store/tracker-store";
import { cn } from "@/lib/utils";
import { SavingsGoalForm } from "./savings-goal-form";
import { SpendMonitorForm } from "./spend-monitor-form";

type TrackerType = "spend-monitor" | "savings-goal";

interface AddTrackerModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tracker?: Tracker;
  categories: CategoryDef[];
  onSubmit: (tracker: Tracker) => void;
}

export function AddTrackerModal({
  open,
  onOpenChange,
  tracker,
  categories,
  onSubmit,
}: AddTrackerModalProps) {
  const isEdit = !!tracker;
  const [type, setType] = useState<TrackerType>("spend-monitor");

  useEffect(() => {
    if (open) setType(tracker?.type ?? "spend-monitor");
  }, [open, tracker]);

  const close = () => onOpenChange(false);

  const submit = (t: Tracker) => {
    onSubmit(t);
    close();
  };

  const labels = isEdit
    ? {
        title: type === "spend-monitor" ? "Edit Limit" : "Edit Target",
        subtitle: tracker?.name ?? "",
        submit: "Save Changes",
      }
    : {
        title: "New Tracker",
        subtitle: "Monitor spending or save toward a goal.",
        submit: type === "spend-monitor" ? "Create Limit" : "Create Goal",
      };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        showCloseButton
        className="sm:max-w-lg bg-card border-white/5 p-0 gap-0"
      >
        <header className="px-8 pt-8 pb-6">
          <DialogTitle className="text-xl font-bold text-foreground font-display tracking-tight">
            {labels.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {labels.subtitle}
          </p>
        </header>

        {/* type selector — hidden in edit mode (type is fixed) */}
        {!isEdit && (
          <div className="px-8 pb-5">
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  value: "spend-monitor" as TrackerType,
                  icon: TrendingDown,
                  label: "Limit",
                  desc: "Cap category spend",
                },
                {
                  value: "savings-goal" as TrackerType,
                  icon: PiggyBank,
                  label: "Target",
                  desc: "Save toward a goal",
                },
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
                      <p className="text-xs font-bold font-display uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="text-[10px] opacity-60">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {type === "spend-monitor" ? (
          <SpendMonitorForm
            open={open}
            tracker={tracker}
            categories={categories}
            submitLabel={labels.submit}
            onSubmit={submit}
            onCancel={close}
          />
        ) : (
          <SavingsGoalForm
            open={open}
            tracker={tracker}
            submitLabel={labels.submit}
            onSubmit={submit}
            onCancel={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
