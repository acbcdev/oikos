"use client";

import { useMemo, useState, useCallback } from "react";
import { Landmark, PiggyBank, TrendingUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { fmtSplit, fmt } from "@/lib/utils/currency";
import { useWalletStore } from "@/lib/store/wallet-store";
import { AccountCard } from "./account-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const institutionIcons: Record<string, React.ElementType> = {
  checking: Landmark,
  savings: PiggyBank,
  brokerage: TrendingUp,
};

interface AccountsPaneProps {
  onAddAccount: () => void;
  selectedAccountIds: string[];
  toggleAccount: (id: string) => void;
}

export function AccountsPane({
  onAddAccount,
  selectedAccountIds,
  toggleAccount,
}: AccountsPaneProps) {
  const accounts = useWalletStore((s) => s.accounts);
  const removeAccount = useWalletStore((s) => s.removeAccount);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteRequest = useCallback((id: string) => setDeleteId(id), []);

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    removeAccount(deleteId);
    toast.success("Account deleted");
    setDeleteId(null);
  };

  const liquidByCurrency = useMemo(() => {
    const map = new Map<string, number>();
    accounts.forEach((a) => {
      map.set(a.currency, (map.get(a.currency) ?? 0) + a.balance);
    });
    return [...map.entries()].map(([currency, total]) => ({ currency, total }));
  }, [accounts]);

  const isMultiCurrency = liquidByCurrency.length > 1;
  const uniqueInstitutions = new Set(accounts.map((a) => a.type));

  return (
    <section className="mt-4">
      <header className="mb-6">
        <p className="text-xs font-display text-muted-foreground uppercase tracking-[0.2em] font-bold">
          Liquid Assets
        </p>

        {isMultiCurrency ? (
          <div className="flex flex-col gap-1 mt-2">
            {liquidByCurrency.map(({ currency, total }) => (
              <div key={currency} className="flex items-baseline gap-2">
                <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest w-10">
                  {currency}
                </span>
                <span className="font-display font-bold text-foreground text-2xl tabular-nums leading-none">
                  {fmt(total, currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-baseline gap-3 mt-2">
            {liquidByCurrency.length > 0 ? (
              (() => {
                const { whole, decimal } = fmtSplit(
                  liquidByCurrency[0].total,
                  liquidByCurrency[0].currency,
                );
                return (
                  <h2 className="font-display font-bold text-foreground tabular-nums leading-none">
                    <span className="text-5xl">{whole}</span>
                    <span className="text-3xl text-muted-foreground">
                      {decimal}
                    </span>
                  </h2>
                );
              })()
            ) : (
              <h2 className="font-display font-bold text-foreground tabular-nums leading-none">
                <span className="text-5xl">$0</span>
                <span className="text-3xl text-muted-foreground">.00</span>
              </h2>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              {[...uniqueInstitutions].map((type) => {
                const Icon = institutionIcons[type];
                return (
                  <Badge key={type} variant="secondary">
                    <Icon size={10} />
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs font-display text-muted-foreground uppercase tracking-wider font-bold">
              {accounts.length} Connected Institutions
            </p>
          </div>
          <Button size="xl" onClick={onAddAccount}>
            <Plus size={16} />
            Add Account
            <Kbd>C</Kbd>
          </Button>
        </div>
      </header>

      <ScrollArea className="w-full rounded-md">
        <div className="flex items-stretch gap-4 pb-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="w-[calc((100%-2*1rem)/3)] shrink-0"
            >
              <AccountCard
                account={account}
                onDeleteRequest={handleDeleteRequest}
                isSelected={selectedAccountIds.includes(account.id)}
                toggleAccount={toggleAccount}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              All associated data will be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
