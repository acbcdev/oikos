import { BarChart3, Bitcoin, TrendingUp } from "lucide-react";
import { z } from "zod";
import type { AssetType } from "@/lib/data/portfolio";

export const assetTypeConfig = {
  stock: {
    icon: BarChart3,
    label: "Stock",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
  etf: {
    icon: TrendingUp,
    label: "ETF",
    color: "text-purple-400",
    bg: "bg-purple-500/15",
  },
  crypto: {
    icon: Bitcoin,
    label: "Crypto",
    color: "text-primary",
    bg: "bg-primary/15",
  },
} as const;

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "COP",
  "ARS",
  "BTC",
  "ETH",
] as const;

export const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "real-estate", label: "Real Estate" },
  { value: "bond", label: "Bond" },
];

export const schema = z.object({
  portfolioId: z.string().min(1, "Select a portfolio"),
  type: z.enum(["stock", "etf", "crypto", "real-estate", "bond"]),
  name: z.string().min(1, "Name is required"),
  ticker: z.string().optional(),
  quantity: z.string().min(1, "Required"),
  buyPrice: z.string().min(1, "Required"),
  currency: z.string().min(1, "Required"),
  purchaseDate: z.string().min(1, "Required"),
  notes: z.string().max(300).optional(),
});

export type FormValues = z.infer<typeof schema>;

export const SEARCHABLE_TYPES: AssetType[] = ["stock", "etf", "crypto"];
