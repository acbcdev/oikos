import {
  toISO,
  parseISO,
  getWeekRange,
  startOfMonth,
  endOfMonth,
} from "@/lib/utils/date-helpers";

export type ViewMode = "custom" | "weeks" | "months" | "years";

export type Preset = {
  label: string;
  computeFn: () => { from: string | null; to: string | null };
};

function getToday() {
  const iso = toISO(new Date());
  return { from: iso, to: iso };
}

function getThisWeek() {
  const r = getWeekRange(new Date());
  return { from: toISO(r.from), to: toISO(r.to) };
}

function getThisMonth() {
  const t = new Date();
  return {
    from: toISO(startOfMonth(t.getFullYear(), t.getMonth())),
    to: toISO(endOfMonth(t.getFullYear(), t.getMonth())),
  };
}

function getThisYear() {
  const y = new Date().getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

function getLastDays(n: number) {
  const t = new Date();
  const from = new Date(t);
  from.setDate(t.getDate() - n);
  return { from: toISO(from), to: toISO(t) };
}

function getLast12Months() {
  const t = new Date();
  const from = new Date(t);
  from.setFullYear(t.getFullYear() - 1);
  return { from: toISO(from), to: toISO(t) };
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
  const fmt = (iso: string) =>
    parseISO(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
  if (dateFrom && dateTo && dateFrom !== dateTo)
    return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
  if (dateFrom) return fmt(dateFrom);
  if (dateTo) return fmt(dateTo);
  return "Date";
}
