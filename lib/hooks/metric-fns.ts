import type { Transaction } from "@/lib/data/wallet";
import { catLabel } from "@/lib/data/categories";
import { Dater } from "@/lib/utils/dater";
import type { Timeframe } from "@/lib/data/reports";

export function txSlice(tx: Transaction[], timeframe: Timeframe): Transaction[] {
  const now = Dater.now();
  const curYear = now.year();
  const curMonth = now.monthIndex();

  let startStr: string;
  switch (timeframe) {
    case "1M": startStr = now.month(); break;
    case "3M": startStr = now.addMonths(-2).month(); break;
    case "6M": startStr = now.addMonths(-5).month(); break;
    case "1Y": startStr = now.addMonths(-11).month(); break;
    case "YTD": startStr = `${curYear}-01`; break;
  }

  const endStr = Dater.ofYM(curYear, curMonth).month();
  return tx.filter((t) => {
    const m = t.date.slice(0, 7);
    return m >= startStr && m <= endStr;
  });
}

export function topBurn(tx: Transaction[]): { name: string; amount: number } | null {
  const map = new Map<string, number>();
  tx
    .filter((t) => t.amount < 0 && t.categoryId)
    .forEach((t) => {
      const name = catLabel(t.categoryId);
      map.set(name, (map.get(name) ?? 0) + Math.abs(t.amount));
    });
  const top = Array.from(map.entries()).sort(([, a], [, b]) => b - a)[0];
  return top ? { name: top[0], amount: Math.round(top[1]) } : null;
}

export function bestSaving(
  tx: Transaction[],
  chartMonths: Array<{ year: number; month: number }>,
  curYear: number,
): { label: string; net: number } {
  const months = chartMonths.map(({ year, month }) => {
    const d = Dater.ofYM(year, month);
    const ms = d.month();
    const net = tx.filter((t) => t.date.startsWith(ms)).reduce((s, t) => s + t.amount, 0);
    return { label: `${d.short()} ${year !== curYear ? year : ""}`.trim(), net };
  });
  return months.reduce(
    (best, cur) => (cur.net > best.net ? cur : best),
    { label: "—", net: 0 },
  );
}
