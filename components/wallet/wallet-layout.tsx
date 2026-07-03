"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useWalletStore } from "@/lib/store/wallet-store";
import { AccountsPane } from "./accounts-pane";
import { TransactionsPane } from "./transactions-pane";
import { TransactionsToolbar } from "./transactions-toolbar";
import { LinkAccountModal } from "./link-account-modal";

export type TxType = "income" | "expense" | "transfer";

interface FilterState {
  query: string;
  selectedAccountIds: string[];
  selectedCategories: string[];
  selectedTypes: TxType[];
  dateFrom: string | null;
  dateTo: string | null;
  presetLabel: string | null;
}

const initialFilterState: FilterState = {
  query: "",
  selectedAccountIds: [],
  selectedCategories: [],
  selectedTypes: [],
  dateFrom: null,
  dateTo: null,
  presetLabel: null,
};

type FilterAction =
  | { type: "setQuery"; query: string }
  | { type: "toggleAccount"; id: string }
  | { type: "toggleCategory"; category: string }
  | { type: "toggleType"; txType: TxType }
  | {
      type: "setDateRange";
      from: string | null;
      to: string | null;
      label: string | null;
    }
  | { type: "clear" };

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}

const filterHandlers: {
  [K in FilterAction["type"]]: (
    state: FilterState,
    action: Extract<FilterAction, { type: K }>,
  ) => FilterState;
} = {
  setQuery: (state, action) => ({ ...state, query: action.query }),
  toggleAccount: (state, action) => ({
    ...state,
    selectedAccountIds: toggle(state.selectedAccountIds, action.id),
  }),
  toggleCategory: (state, action) => ({
    ...state,
    selectedCategories: toggle(state.selectedCategories, action.category),
  }),
  toggleType: (state, action) => ({
    ...state,
    selectedTypes: toggle(state.selectedTypes, action.txType),
  }),
  setDateRange: (state, action) => ({
    ...state,
    dateFrom: action.from,
    dateTo: action.to,
    presetLabel: action.label,
  }),
  clear: () => initialFilterState,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  const handler = filterHandlers[action.type] as (
    state: FilterState,
    action: FilterAction,
  ) => FilterState;
  return handler(state, action);
}

export function WalletLayout() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useWalletStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    useWalletStore.persist.rehydrate();
    return unsub;
  }, []);

  const hasAccounts = useWalletStore((s) => s.accounts.length > 0);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const accounts = useWalletStore((s) => s.accounts);
  const removeTransaction = useWalletStore((s) => s.removeTransaction);

  const handleDeleteRequest = useCallback(
    (id: string) => {
      removeTransaction(id);
    },
    [removeTransaction],
  );

  // Filter state
  const [filters, dispatchFilter] = useReducer(
    filterReducer,
    initialFilterState,
  );
  const {
    query,
    selectedAccountIds,
    selectedCategories,
    selectedTypes,
    dateFrom,
    dateTo,
    presetLabel,
  } = filters;

  const setQuery = useCallback(
    (query: string) => dispatchFilter({ type: "setQuery", query }),
    [],
  );
  const toggleAccount = useCallback(
    (id: string) => dispatchFilter({ type: "toggleAccount", id }),
    [],
  );
  const toggleCategory = useCallback(
    (category: string) => dispatchFilter({ type: "toggleCategory", category }),
    [],
  );
  const toggleType = useCallback(
    (txType: TxType) => dispatchFilter({ type: "toggleType", txType }),
    [],
  );
  const setCustomDateRange = useCallback(
    (from: string | null, to: string | null, label?: string) =>
      dispatchFilter({ type: "setDateRange", from, to, label: label ?? null }),
    [],
  );
  const clearFilters = useCallback(() => dispatchFilter({ type: "clear" }), []);

  useHotkeys("c", () => setLinkModalOpen(true), { preventDefault: true });

  if (!hydrated) {
    return (
      <main className="flex flex-col px-8 py-8 gap-8">
        <div className="h-48 rounded-3xl bg-white/5" />
        <div className="h-96 rounded-3xl bg-white/5" />
      </main>
    );
  }

  return (
    <main className="flex flex-col px-8 pt-8 gap-8">
      {hasAccounts ? (
        <>
          <div className="sticky top-0 z-20 bg-background pb-4">
            <AccountsPane
              onAddAccount={() => setLinkModalOpen(true)}
              selectedAccountIds={selectedAccountIds}
              toggleAccount={toggleAccount}
            />
            <TransactionsToolbar
              query={query}
              setQuery={setQuery}
              selectedAccountIds={selectedAccountIds}
              selectedCategories={selectedCategories}
              selectedTypes={selectedTypes}
              dateFrom={dateFrom}
              dateTo={dateTo}
              presetLabel={presetLabel}
              toggleCategory={toggleCategory}
              toggleType={toggleType}
              setCustomDateRange={setCustomDateRange}
              toggleAccount={toggleAccount}
              clearAll={clearFilters}
              accounts={accounts}
            />
          </div>

          <TransactionsPane
            query={query}
            selectedAccountIds={selectedAccountIds}
            selectedCategories={selectedCategories}
            selectedTypes={selectedTypes}
            dateFrom={dateFrom}
            dateTo={dateTo}
            accounts={accounts}
            onDeleteRequest={handleDeleteRequest}
          />
        </>
      ) : (
        <Empty className="flex-1 min-h-[calc(100vh-10rem)]">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-16 rounded-2xl [&_svg:not([class*='size-'])]:size-8"
            >
              <Wallet />
            </EmptyMedia>
            <EmptyTitle className="text-2xl font-display font-bold">
              No accounts linked
            </EmptyTitle>
            <EmptyDescription className="text-base">
              Connect your first account to start tracking your finances.
            </EmptyDescription>
          </EmptyHeader>
          <Button size={"xl"} onClick={() => setLinkModalOpen(true)}>
            <Plus size={14} />
            Add Account
            <Kbd>C</Kbd>
          </Button>
        </Empty>
      )}

      <LinkAccountModal open={linkModalOpen} onOpenChange={setLinkModalOpen} />
    </main>
  );
}
