export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: "checking" | "savings" | "investment";
  currency: string;
  balance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string;
  description: string;
  categoryId: string;
  amount: number;
  date: string;
}

export interface TransactionGroup {
  label: string;
  transactions: Transaction[];
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Food & Dining", icon: "UtensilsCrossed", color: "primary", isCustom: false },
  { id: "transport", name: "Transport", icon: "Car", color: "blue", isCustom: false },
  { id: "shopping", name: "Shopping", icon: "ShoppingBag", color: "purple", isCustom: false },
  { id: "entertainment", name: "Entertainment", icon: "Tv", color: "pink", isCustom: false },
  { id: "income", name: "Income", icon: "ArrowDownLeft", color: "green", isCustom: false },
  { id: "transfer", name: "Transfer", icon: "ArrowLeftRight", color: "orange", isCustom: false },
];

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
