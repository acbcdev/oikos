"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DayPicker } from "react-day-picker";

interface DatePickerProps {
  // value
  value?: string; // ISO date YYYY-MM-DD
  onChange: (value: string) => void;
  // trigger
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // bounds
  maxDate?: Date | null; // null = no upper bound; undefined = today (default)
  minDate?: Date;
  // popover positioning
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  // calendar
  captionLayout?: React.ComponentProps<typeof DayPicker>["captionLayout"];
  showOutsideDays?: boolean;
  numberOfMonths?: number;
}

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Pick a date",
  disabled,
  className,
  maxDate,
  minDate,
  side = "bottom",
  align = "start",
  sideOffset,
  alignOffset,
  captionLayout,
  showOutsideDays,
  numberOfMonths,
}: DatePickerProps) {
  const effectiveMaxDate =
    maxDate === undefined ? new Date() : (maxDate ?? null);
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
          // react-doctor-disable-next-line react-doctor/control-has-associated-label
          <button
            type="button"
            id={id}
            className={cn(
              "w-full flex items-center gap-3 bg-secondary/60 rounded-xl px-4 py-3 min-h-11.5 text-sm font-body text-left outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            )}
          />
        }
      >
        <CalendarIcon size={15} className="text-muted-foreground shrink-0" />
        <span
          className={formatted ? "text-foreground" : "text-muted-foreground"}
        >
          {formatted ?? placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border-white/10"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          captionLayout={captionLayout}
          showOutsideDays={showOutsideDays}
          numberOfMonths={numberOfMonths}
          disabled={(date) => {
            if (effectiveMaxDate && date > effectiveMaxDate) return true;
            if (minDate && date < minDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
