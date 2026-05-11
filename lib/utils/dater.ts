import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export class Dater {
  private readonly _d: Date;

  private constructor(date: Date) {
    this._d = date;
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  static from(iso: string): Dater {
    return new Dater(parseISO(iso));
  }

  static now(): Dater {
    return new Dater(new Date());
  }

  static of(date: Date): Dater {
    return new Dater(date);
  }

  /** Year + 0-based month index. */
  static ofYM(year: number, month: number): Dater {
    return new Dater(new Date(year, month, 1));
  }

  // ─── Serialise ────────────────────────────────────────────────────────────

  /** "2025-05-09" */
  iso(): string {
    return format(this._d, "yyyy-MM-dd");
  }

  /** "2025-05" */
  month(): string {
    return format(this._d, "yyyy-MM");
  }

  /** "May 2025" */
  fmt(): string {
    return format(this._d, "MMMM yyyy");
  }

  /** "May" */
  short(): string {
    return format(this._d, "MMM");
  }

  /** "9 May" */
  label(): string {
    return format(this._d, "d MMM");
  }

  day(): number {
    return this._d.getDate();
  }

  year(): number {
    return this._d.getFullYear();
  }

  monthIndex(): number {
    return this._d.getMonth();
  }

  toDate(): Date {
    return new Date(this._d);
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  addDays(n: number): Dater {
    return new Dater(addDays(this._d, n));
  }

  addMonths(n: number): Dater {
    return new Dater(addMonths(this._d, n));
  }

  addYears(n: number): Dater {
    return new Dater(addYears(this._d, n));
  }

  monthStart(): Dater {
    return new Dater(startOfMonth(this._d));
  }

  monthEnd(): Dater {
    return new Dater(endOfMonth(this._d));
  }

  weekStart(): Dater {
    return new Dater(startOfWeek(this._d, { weekStartsOn: 1 }));
  }

  weekEnd(): Dater {
    return new Dater(endOfWeek(this._d, { weekStartsOn: 1 }));
  }

  // ─── Comparison ───────────────────────────────────────────────────────────

  after(other: string | Dater): boolean {
    const t = typeof other === "string" ? Dater.from(other)._d : other._d;
    return this._d > t;
  }

  before(other: string | Dater): boolean {
    const t = typeof other === "string" ? Dater.from(other)._d : other._d;
    return this._d < t;
  }

  inMonth(key: string): boolean {
    return this.month() === key;
  }

  sameMonth(other: string | Dater): boolean {
    const t = typeof other === "string" ? Dater.from(other)._d : other._d;
    return isSameMonth(this._d, t);
  }

  // ─── Static shortcuts ─────────────────────────────────────────────────────

  static monthOf(iso: string): string {
    return Dater.from(iso).month();
  }

  static monthNow(): string {
    return Dater.now().month();
  }
}
