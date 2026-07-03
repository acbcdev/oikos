export type AssetType = "stock" | "etf" | "crypto" | "real-estate" | "bond";

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO datetime
}

export interface Position {
  id: string;
  portfolioId: string;
  name: string;
  ticker?: string;
  type: AssetType;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: string; // ISO date YYYY-MM-DD
  notes?: string;
  // Set when a position is closed/sold — moves it to "Previous Sales" tab
  soldAt?: string; // ISO date YYYY-MM-DD
  soldPrice?: number; // price per unit at time of sale
}

export function computePnL(position: Position): {
  costBasis: number;
  currentValue: number;
  gain: number;
  gainPct: number;
  isRealized: boolean;
} {
  const costBasis = position.buyPrice * position.quantity;
  const isSold = !!position.soldAt && position.soldPrice !== undefined;
  const currentValue = isSold
    ? position.soldPrice! * position.quantity
    : position.currentPrice * position.quantity;
  const gain = currentValue - costBasis;
  const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;
  return { costBasis, currentValue, gain, gainPct, isRealized: isSold };
}
