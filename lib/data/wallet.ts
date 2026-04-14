export interface Account {
  id: string;
  name: string;
  institution: string;
  type: "checking" | "savings" | "brokerage";
  currency: string;
  balance: number;
  apy?: number;
  dailyChange?: number;
  monthlyChange?: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  category:
    | "Food & Drink"
    | "Transport"
    | "Shopping"
    | "Entertainment"
    | "Transfer"
    | "Income";
  subcategory: string;
  paymentMethod: string;
  amount: number;
  date: string;
  referenceCode: string;
  location?: string;
  accountId: string;
  status?: "pending" | "completed";
}

export interface TransactionGroup {
  label: string;
  transactions: Transaction[];
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencySplit(
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
