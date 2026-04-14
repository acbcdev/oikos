"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string; // ISO date YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  maxDate = new Date(),
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected = value ? new Date(value + "T00:00:00") : undefined;

  const formatted = selected
    ? selected.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(date.toLocaleDateString("en-CA")); // YYYY-MM-DD
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            className={cn(
              "w-full flex items-center gap-3 bg-secondary/60 rounded-xl px-4 py-3 min-h-11.5 text-sm font-body text-left outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            )}
          />
        }
      >
        <CalendarIcon size={15} className="text-muted-foreground shrink-0" />
        <span className={formatted ? "text-foreground" : "text-muted-foreground"}>
          {formatted ?? placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card border-white/10" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={(date) => {
            if (maxDate && date > maxDate) return true;
            if (minDate && date < minDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
