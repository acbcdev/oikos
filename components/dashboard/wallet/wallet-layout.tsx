"use client";

import { useEffect, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { LinkAccountModal } from "./link-account-modal";

export function WalletLayout() {
  useEffect(() => {
    useWalletStore.persist.rehydrate();
  }, []);

  const hasAccounts = useWalletStore((s) => s.accounts.length > 0);
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  return (
    <main className="flex flex-col px-8 py-8 gap-8 min-h-screen">
      {hasAccounts ? (
        <>
          <AccountsPane onAddAccount={() => setLinkModalOpen(true)} />
          <TransactionsPane />
        </>
      ) : (
        <Empty className="flex-1 min-h-[calc(100vh-10rem)]">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-2xl [&_svg:not([class*='size-'])]:size-8">
              <Wallet />
            </EmptyMedia>
            <EmptyTitle className="text-2xl font-display font-bold">No accounts linked</EmptyTitle>
            <EmptyDescription className="text-base">
              Connect your first account to start tracking your finances.
            </EmptyDescription>
          </EmptyHeader>
          <Button size={"xl"} onClick={() => setLinkModalOpen(true)}>
            <Plus size={14} />
            Add Account
          </Button>
        </Empty>
      )}

      <LinkAccountModal open={linkModalOpen} onOpenChange={setLinkModalOpen} />
    </main>
  );
}
