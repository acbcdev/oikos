import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type AssetType, type Portfolio, type Position, computePnL } from "@/lib/data/portfolio";

interface InvestmentState {
  portfolios: Portfolio[];
  positions: Position[];
  lastUsedPortfolioId: string | null;
  addPortfolio: (p: Portfolio) => void;
  updatePortfolio: (id: string, patch: Partial<Omit<Portfolio, "id">>) => void;
  removePortfolio: (id: string) => void;
  addPosition: (p: Position) => void;
  updatePosition: (id: string, patch: Partial<Omit<Position, "id">>) => void;
  removePosition: (id: string) => void;
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set) => ({
      portfolios: [],
      positions: [],
      lastUsedPortfolioId: null,
      addPortfolio: (p) =>
        set((state) => ({ portfolios: [...state.portfolios, p] })),
      updatePortfolio: (id, patch) =>
        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      removePortfolio: (id) =>
        set((state) => ({
          portfolios: state.portfolios.filter((p) => p.id !== id),
          positions: state.positions.filter((p) => p.portfolioId !== id),
        })),
      addPosition: (p) =>
        set((state) => ({
          positions: [...state.positions, p],
          lastUsedPortfolioId: p.portfolioId,
        })),
      updatePosition: (id, patch) =>
        set((state) => ({
          positions: state.positions.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      removePosition: (id) =>
        set((state) => ({
          positions: state.positions.filter((p) => p.id !== id),
        })),
    }),
    { name: "investment-storage", skipHydration: true },
  ),
);

export interface PortfolioMetrics {
  totalValue: number;
  totalCostBasis: number;
  totalGain: number;
  totalGainPct: number;
  byType: Record<AssetType, { value: number; pct: number }>;
}

export function usePortfolioMetrics(portfolioId?: string): PortfolioMetrics {
  const allPositions = useInvestmentStore((s) => s.positions);
  const positions = portfolioId
    ? allPositions.filter((p) => p.portfolioId === portfolioId)
    : allPositions;

  return useMemo(() => {
    // Only count open positions in live metrics
    const open = positions.filter((p) => !p.soldAt);

    let totalValue = 0;
    let totalCostBasis = 0;

    const typeValues: Record<AssetType, number> = {
      stock: 0,
      etf: 0,
      crypto: 0,
      "real-estate": 0,
      bond: 0,
    };

    for (const p of open) {
      const { currentValue, costBasis } = computePnL(p);
      totalValue += currentValue;
      totalCostBasis += costBasis;
      typeValues[p.type] += currentValue;
    }

    const totalGain = totalValue - totalCostBasis;
    const totalGainPct =
      totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;

    const byType = Object.fromEntries(
      Object.entries(typeValues).map(([type, value]) => [
        type,
        {
          value,
          pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
        },
      ]),
    ) as Record<AssetType, { value: number; pct: number }>;

    return { totalValue, totalCostBasis, totalGain, totalGainPct, byType };
  }, [positions]);
}
