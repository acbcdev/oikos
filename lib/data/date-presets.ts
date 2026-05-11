import { Dater } from "@/lib/utils/dater";

export type ViewMode = "custom" | "weeks" | "months" | "years";

export type Preset = {
  label: string;
  computeFn: () => { from: string | null; to: string | null };
};

function getToday() {
  const iso = Dater.now().iso();
  return { from: iso, to: iso };
}

function getThisWeek() {
  const now = Dater.now();
  return { from: now.weekStart().iso(), to: now.weekEnd().iso() };
}

function getThisMonth() {
  const now = Dater.now();
  return { from: now.monthStart().iso(), to: now.monthEnd().iso() };
}

function getThisYear() {
  const y = Dater.now().year();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

function getLastDays(n: number) {
  const now = Dater.now();
  return { from: now.addDays(-n).iso(), to: now.iso() };
}

function getLast12Months() {
  const now = Dater.now();
  return { from: now.addYears(-1).iso(), to: now.iso() };
}

export const PRESETS_ROW1: Preset[] = [
  { label: "This week", computeFn: getThisWeek },
  { label: "This month", computeFn: getThisMonth },
  { label: "This year", computeFn: getThisYear },
  { label: "Today", computeFn: getToday },
];

export const PRESETS_ROW2: Preset[] = [
  { label: "7 days", computeFn: () => getLastDays(7) },
  { label: "30 days", computeFn: () => getLastDays(30) },
  { label: "90 days", computeFn: () => getLastDays(90) },
  { label: "12 months", computeFn: getLast12Months },
  { label: "All", computeFn: () => ({ from: null, to: null }) },
];

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const TABS: { id: ViewMode; label: string }[] = [
  { id: "custom", label: "Custom" },
  { id: "months", label: "Months" },
  { id: "years", label: "Years" },
];

export function formatDateTriggerLabel(
  dateFrom: string | null,
  dateTo: string | null,
  presetLabel: string | null,
): string {
  if (presetLabel) return presetLabel;
  if (!dateFrom && !dateTo) return "Date";
  const fmt = (iso: string) => Dater.from(iso).label();
  if (dateFrom && dateTo && dateFrom !== dateTo)
    return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
  if (dateFrom) return fmt(dateFrom);
  if (dateTo) return fmt(dateTo);
  return "Date";
}
