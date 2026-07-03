import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Portfolio, Position } from "@/lib/data/portfolio";

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
