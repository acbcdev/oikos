/**
 * Strip formatting chars, keep digits / decimal point / minus.
 * Handles comma-separated values like "1,234.56" → "1234.56"
 */
export function stripNumberFormat(val: string): string {
  return val.replace(/[^0-9.-]/g, "");
}

/**
 * Live format while typing. Preserves trailing "." and trailing decimal
 * zeros so the user isn't interrupted mid-entry.
 * "1234"    → "1,234"
 * "1234."   → "1,234."
 * "1234.50" → "1,234.50"
 */
export function formatLive(raw: string): string {
  if (!raw) return "";
  const negative = raw.startsWith("-");
  const abs = negative ? raw.slice(1) : raw;
  const dotIndex = abs.indexOf(".");
  const intStr = dotIndex >= 0 ? abs.slice(0, dotIndex) : abs;
  const decStr = dotIndex >= 0 ? abs.slice(dotIndex) : ""; // includes the dot
  const intNum = parseInt(intStr || "0", 10);
  const formattedInt = isNaN(intNum)
    ? intStr
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        intNum,
      );
  return (negative ? "-" : "") + formattedInt + decStr;
}

/**
 * Integer-only variant used by the transaction modal.
 * "1234" → "1,234"
 */
export function formatInteger(val: string): string {
  if (!val) return "";
  const num = parseInt(val, 10);
  return isNaN(num)
    ? ""
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);
}
