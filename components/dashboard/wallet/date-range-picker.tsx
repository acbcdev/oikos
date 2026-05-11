"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Dater } from "@/lib/utils/dater";
import {
  type ViewMode,
  type Preset,
  PRESETS_ROW1,
  PRESETS_ROW2,
  MONTH_NAMES,
  TABS,
} from "@/lib/data/date-presets";
import { Button } from "@/components/ui/button";

export { formatDateTriggerLabel } from "@/lib/data/date-presets";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DateRangePickerProps {
  dateFrom: string | null;
  dateTo: string | null;
  onRangeChange: (
    from: string | null,
    to: string | null,
    label?: string,
  ) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GridCell({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "py-3 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-colors",
        isActive
          ? "bg-neon text-black"
          : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      {label}
    </button>
  );
}

function PresetBtn({
  preset,
  dateFrom,
  dateTo,
  onRangeChange,
}: {
  preset: Preset;
  dateFrom: string | null;
  dateTo: string | null;
  onRangeChange: (
    from: string | null,
    to: string | null,
    label?: string,
  ) => void;
}) {
  const r = preset.computeFn();
  const active =
    r.from === null && r.to === null
      ? !dateFrom && !dateTo
      : dateFrom === r.from && dateTo === r.to;

  return (
    <button
      type="button"
      onClick={() => onRangeChange(r.from, r.to, preset.label)}
      className={cn(
        "px-2.5 py-1 rounded-md text-xs font-display font-bold uppercase tracking-wider transition-colors",
        active
          ? "bg-neon text-black"
          : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      {preset.label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DateRangePicker({
  dateFrom,
  dateTo,
  onRangeChange,
}: DateRangePickerProps) {
  const today = new Date();
  const [mode, setMode] = useState<ViewMode>("custom");
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewDecadeStart, setViewDecadeStart] = useState(
    Math.floor(today.getFullYear() / 10) * 10,
  );

  const dateRange: DateRange | undefined =
    dateFrom || dateTo
      ? {
          from: dateFrom ? Dater.from(dateFrom).toDate() : undefined,
          to: dateTo ? Dater.from(dateTo).toDate() : undefined,
        }
      : undefined;

  // Navigation
  function handlePrev() {
    if (mode === "custom" || mode === "weeks")
      setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    else if (mode === "months") setViewYear((y) => y - 1);
    else setViewDecadeStart((d) => d - 10);
  }

  function handleNext() {
    if (mode === "custom" || mode === "weeks")
      setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    else if (mode === "months") setViewYear((y) => y + 1);
    else setViewDecadeStart((d) => d + 10);
  }

  function getNavLabel(): string {
    if (mode === "custom" || mode === "weeks")
      return Dater.of(viewMonth).fmt();
    if (mode === "months") return String(viewYear);
    return `${viewDecadeStart} – ${viewDecadeStart + 9}`;
  }

  // Selection handlers
  function handleCustomSelect(range: DateRange | undefined) {
    onRangeChange(
      range?.from ? Dater.of(range.from).iso() : null,
      range?.to ? Dater.of(range.to).iso() : null,
    );
  }

  function handleWeekSelect(range: DateRange | undefined) {
    const anchor = range?.from;
    if (!anchor) {
      onRangeChange(null, null);
      return;
    }
    const d = Dater.of(anchor);
    onRangeChange(d.weekStart().iso(), d.weekEnd().iso());
  }

  function handleMonthClick(monthIdx: number) {
    const d = Dater.ofYM(viewYear, monthIdx);
    onRangeChange(d.monthStart().iso(), d.monthEnd().iso(), `${MONTH_NAMES[monthIdx]} ${viewYear}`);
  }

  function handleYearClick(year: number) {
    onRangeChange(`${year}-01-01`, `${year}-12-31`, String(year));
  }

  // Active state
  const isMonthActive = (i: number) => {
    const d = Dater.ofYM(viewYear, i);
    return dateFrom === d.monthStart().iso() && dateTo === d.monthEnd().iso();
  };
  const isYearActive = (y: number) =>
    dateFrom === `${y}-01-01` && dateTo === `${y}-12-31`;

  const sharedPresetProps = { dateFrom, dateTo, onRangeChange };

  return (
    <div className="flex flex-col w-full">
      {/* Mode tabs */}
      <Tabs value={mode} onValueChange={(v: string) => setMode(v as ViewMode)}>
        <TabsList className="w-full h-8 mb-3 bg-transparent rounded-lg p-0.5">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex-1 h-full text-[11px] font-display font-bold uppercase tracking-widest"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Navigation header */}
        <div className="flex items-center justify-between pb-3">
          <Button
            type="button"
            onClick={handlePrev}
            size={"icon"}
            variant={"ghost"}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-semibold font-display text-foreground">
            {getNavLabel()}
          </span>
          <Button
            type="button"
            onClick={handleNext}
            size={"icon"}
            variant={"ghost"}
          >
            <ChevronRight size={14} />
          </Button>
        </div>

        <TabsContent value="custom">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleCustomSelect}
            month={viewMonth}
            onMonthChange={setViewMonth}
            hideNavigation
            weekStartsOn={1}
            className="w-full"
            classNames={{ month_caption: "hidden" }}
          />
        </TabsContent>

        <TabsContent value="months">
          <div className="grid w-full grid-cols-3 gap-2 p-1">
            {MONTH_NAMES.map((name, idx) => (
              <GridCell
                key={name}
                label={name}
                isActive={isMonthActive(idx)}
                onClick={() => handleMonthClick(idx)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="years">
          <div className="grid w-full grid-cols-3 gap-2 p-1">
            {Array.from({ length: 10 }, (_, i) => viewDecadeStart + i).map(
              (year) => (
                <GridCell
                  key={year}
                  label={String(year)}
                  isActive={isYearActive(year)}
                  onClick={() => handleYearClick(year)}
                />
              ),
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick presets */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS_ROW1.map((p) => (
            <PresetBtn key={p.label} preset={p} {...sharedPresetProps} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS_ROW2.map((p) => (
            <PresetBtn key={p.label} preset={p} {...sharedPresetProps} />
          ))}
        </div>
      </div>
    </div>
  );
}
