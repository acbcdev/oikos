"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<TxType[]>([]);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [presetLabel, setPresetLabel] = useState<string | null>(null);

  const toggleAccount = useCallback((id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]
    );
  }, []);

  const toggleType = useCallback((type: TxType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]
    );
  }, []);

  const setCustomDateRange = useCallback(
    (from: string | null, to: string | null, label?: string) => {
      setDateFrom(from);
      setDateTo(to);
      setPresetLabel(label ?? null);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedAccountIds([]);
    setSelectedCategories([]);
    setSelectedTypes([]);
    setDateFrom(null);
    setDateTo(null);
    setPresetLabel(null);
  }, []);

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
            <AccountsPane onAddAccount={() => setLinkModalOpen(true)} selectedAccountIds={selectedAccountIds} toggleAccount={toggleAccount} />
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
