export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseISO(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

export function getWeekRange(date: Date): { from: Date; to: Date } {
  const day = date.getDay(); // 0=Sun … 6=Sat
  const offset = day === 0 ? -6 : 1 - day; // steps to Monday
  const from = new Date(date);
  from.setDate(date.getDate() + offset);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  return { from, to };
}

export function startOfMonth(y: number, m: number): Date {
  return new Date(y, m, 1);
}

export function endOfMonth(y: number, m: number): Date {
  return new Date(y, m + 1, 0); // day 0 = last day of previous month
}
