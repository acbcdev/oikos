import { create } from "zustand";
import type { Timeframe } from "@/lib/data/reports";

interface DashboardStore {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  timeframe: "YTD",
  setTimeframe: (timeframe) => set({ timeframe }),
}));
