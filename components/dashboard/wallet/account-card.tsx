"use client";

import { useState } from "react";
import {
  Landmark,
  PiggyBank,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Percent,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Account } from "@/lib/data/wallet";
import { formatCurrencySplit, formatCurrency } from "@/lib/data/wallet";
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/lib/store/wallet-store";
import { useWalletFilterStore } from "@/lib/store/wallet-filter-store";
import { EditAccountModal } from "./edit-account-modal";

const typeIcons: Record<Account["type"], React.ElementType> = {
  checking: Landmark,
  savings: PiggyBank,
  brokerage: TrendingUp,
};

const typeLabels: Record<Account["type"], string> = {
  checking: "Main Checking",
  savings: "Savings",
  brokerage: "Brokerage",
};

export function AccountCard({ account }: { account: Account }) {
  const Icon = typeIcons[account.type];
  const { whole, decimal } = formatCurrencySplit(account.balance, account.currency);
  const removeAccount = useWalletStore((s) => s.removeAccount);
  const [editOpen, setEditOpen] = useState(false);
  const isSelected = useWalletFilterStore((s) => s.selectedAccountIds.includes(account.id));
  const toggleAccount = useWalletFilterStore((s) => s.toggleAccount);

  return (
    <>
      <Card
        className={cn(
          "rounded-2xl py-0 h-full bg-linear-to-br from-[rgba(28,37,59,0.5)] to-[rgba(19,26,42,0.7)] backdrop-blur-md transition-all duration-250 ease-in-out hover:from-[rgba(37,46,68,0.6)] hover:to-[rgba(22,30,48,0.8)] cursor-pointer",
          isSelected && "ring-2 ring-neon ring-inset",
        )}
        onClick={() => toggleAccount(account.id)}
      >
        <CardHeader className="p-6 pb-0">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-md bg-secondary/80 flex items-center justify-center shrink-0">
              <Icon size={13} className="text-muted-foreground" />
            </span>
            <CardTitle className="font-display text-xl tracking-tight font-bold text-foreground leading-none">
              {account.institution}
            </CardTitle>
          </div>
          <CardAction>
            <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                    />
                  }
                >
                  <MoreVertical size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-white/10 min-w-35"
                >
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil size={14} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => removeAccount(account.id)}
                    variant="destructive"
                  >
                    <Trash2 size={14} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="px-6 pt-4">
          <p className="font-display font-bold text-foreground tabular-nums leading-none">
            <data value={account.balance}>
              <span className="text-3xl">{whole}</span>
              <span className="text-lg text-muted-foreground">{decimal}</span>
              <span className="text-xs font-display font-bold text-muted-foreground/60 uppercase tracking-widest ml-2">{account.currency}</span>
            </data>
          </p>
        </CardContent>

        <CardFooter className="px-6 pb-8 border-t-0 bg-transparent flex-wrap gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-display text-muted-foreground">
            {typeLabels[account.type]}
          </span>
          {account.monthlyChange !== undefined && (
            <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-positive bg-positive/10 px-3 py-1.5 rounded-lg">
              <ArrowUp size={12} />+{formatCurrency(account.monthlyChange)}
              <span className="text-positive/70 font-body font-normal ml-1">
                This Month
              </span>
            </span>
          )}
          {account.apy !== undefined && (
            <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-positive bg-positive/10 px-3 py-1.5 rounded-lg">
              <Percent size={12} />
              {account.apy}% APY
            </span>
          )}
          {account.dailyChange !== undefined && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-display font-bold px-3 py-1.5 rounded-lg ${
                account.dailyChange >= 0
                  ? "text-positive bg-positive/10"
                  : "text-negative bg-negative/10"
              }`}
            >
              <ArrowDown size={12} />
              {formatCurrency(account.dailyChange)} today
            </span>
          )}
        </CardFooter>
      </Card>

      <EditAccountModal
        account={account}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
