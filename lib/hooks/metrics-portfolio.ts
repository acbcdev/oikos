import type { AssetType } from "@/lib/data/portfolio";
import { computePnL } from "@/lib/data/portfolio";
import type { MetricData } from "./use-metrics";

export function totalValue({ positions = [] }: MetricData): number {
  return positions
    .filter((p) => !p.soldAt)
    .reduce((s, p) => s + computePnL(p).currentValue, 0);
}

export function costBasis({ positions = [] }: MetricData): number {
  return positions
    .filter((p) => !p.soldAt)
    .reduce((s, p) => s + computePnL(p).costBasis, 0);
}

export function totalGain({ positions = [] }: MetricData): number {
  const open = positions.filter((p) => !p.soldAt);
  const value = open.reduce((s, p) => s + computePnL(p).currentValue, 0);
  const basis = open.reduce((s, p) => s + computePnL(p).costBasis, 0);
  return value - basis;
}

export function totalGainPct({ positions = [] }: MetricData): number {
  const open = positions.filter((p) => !p.soldAt);
  const value = open.reduce((s, p) => s + computePnL(p).currentValue, 0);
  const basis = open.reduce((s, p) => s + computePnL(p).costBasis, 0);
  return basis > 0 ? ((value - basis) / basis) * 100 : 0;
}

export function realizedGain({ positions = [] }: MetricData): number {
  return positions
    .filter((p) => !!p.soldAt)
    .reduce((s, p) => s + computePnL(p).gain, 0);
}

export function realizedValue({ positions = [] }: MetricData): number {
  return positions
    .filter((p) => !!p.soldAt)
    .reduce((s, p) => s + computePnL(p).currentValue, 0);
}

export function byType({ positions = [] }: MetricData): Record<AssetType, { value: number; pct: number }> {
  const open = positions.filter((p) => !p.soldAt);
  const typeValues: Record<AssetType, number> = { stock: 0, etf: 0, crypto: 0, "real-estate": 0, bond: 0 };
  const total = open.reduce((s, p) => {
    const v = computePnL(p).currentValue;
    typeValues[p.type] += v;
    return s + v;
  }, 0);
  return Object.fromEntries(
    Object.entries(typeValues).map(([type, value]) => [
      type,
      { value, pct: total > 0 ? (value / total) * 100 : 0 },
    ]),
  ) as Record<AssetType, { value: number; pct: number }>;
}
