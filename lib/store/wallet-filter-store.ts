import { create } from "zustand";

export type TxType = "income" | "expense" | "transfer";
export type DatePreset = "7d" | "30d" | "month" | "year";

interface WalletFilterState {
  selectedAccountIds: string[];
  selectedCategories: string[];
  selectedTypes: TxType[];
  datePreset: DatePreset | null;
  dateFrom: string | null;
  dateTo: string | null;
  presetLabel: string | null;
}

interface WalletFilterActions {
  toggleAccount: (id: string) => void;
  toggleCategory: (cat: string) => void;
  toggleType: (type: TxType) => void;
  setDatePreset: (preset: DatePreset | null) => void;
  setCustomDateRange: (from: string | null, to: string | null, label?: string) => void;
  clearAll: () => void;
}

const initialState: WalletFilterState = {
  selectedAccountIds: [],
  selectedCategories: [],
  selectedTypes: [],
  datePreset: null,
  dateFrom: null,
  dateTo: null,
  presetLabel: null,
};

export const useWalletFilterStore = create<WalletFilterState & WalletFilterActions>()(
  (set) => ({
    ...initialState,
    toggleAccount: (id) =>
      set((s) => ({
        selectedAccountIds: s.selectedAccountIds.includes(id)
          ? s.selectedAccountIds.filter((x) => x !== id)
          : [...s.selectedAccountIds, id],
      })),
    toggleCategory: (cat) =>
      set((s) => ({
        selectedCategories: s.selectedCategories.includes(cat)
          ? s.selectedCategories.filter((x) => x !== cat)
          : [...s.selectedCategories, cat],
      })),
    toggleType: (type) =>
      set((s) => ({
        selectedTypes: s.selectedTypes.includes(type)
          ? s.selectedTypes.filter((x) => x !== type)
          : [...s.selectedTypes, type],
      })),
    setDatePreset: (preset) =>
      set({ datePreset: preset, dateFrom: null, dateTo: null }),
    setCustomDateRange: (from, to, label) =>
      set({ dateFrom: from, dateTo: to, datePreset: null, presetLabel: label ?? null }),
    clearAll: () => set(initialState),
  }),
);

export function useActiveFilterCount(): number {
  return useWalletFilterStore(
    (s) =>
      s.selectedAccountIds.length +
      s.selectedCategories.length +
      s.selectedTypes.length +
      (s.datePreset || s.dateFrom || s.dateTo ? 1 : 0),
  );
}
