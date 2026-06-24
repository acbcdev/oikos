export function CycleBar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysLeft = daysInMonth - dayOfMonth;
  const pct = (dayOfMonth / daysInMonth) * 100;

  const monthName = now
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  const start = `${monthName} 01`;
  const end = `${monthName} ${daysInMonth}, ${year}`;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Cycle
      </span>
      <span className="text-[11px] font-medium text-foreground">
        {start} — {end}
      </span>
      <div className="relative h-1 w-24 overflow-hidden rounded-full bg-secondary/60">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">
        Day {dayOfMonth}/{daysInMonth} · {daysLeft}d left
      </span>
    </div>
  );
}
