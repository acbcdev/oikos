export function fmt(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function fmtSplit(
  value: number,
  currency = "USD",
): { whole: string; decimal: string } {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const parts = formatter.formatToParts(Math.abs(value));
  const sign = value < 0 ? "-" : "";
  const decimalIdx = parts.findIndex((p) => p.type === "decimal");

  if (decimalIdx >= 0) {
    return {
      whole:
        sign +
        parts
          .slice(0, decimalIdx)
          .map((p) => p.value)
          .join(""),
      decimal: parts
        .slice(decimalIdx)
        .map((p) => p.value)
        .join(""),
    };
  }

  return {
    whole: sign + parts.map((p) => p.value).join(""),
    decimal: "",
  };
}

export function compact(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m : m.toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return `$${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return `$${value}`;
}
