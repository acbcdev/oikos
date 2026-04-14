"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  ArrowLeftRight,
  ArrowDownLeft,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction } from "@/lib/data/wallet";
import { formatCurrency } from "@/lib/data/wallet";
import { useWalletStore } from "@/lib/store/wallet-store";
import { AddTransactionModal } from "./add-transaction-modal";

const categoryConfig: Record<
  Transaction["category"],
  { icon: React.ElementType; bg: string; text: string; dot: string }
> = {
  "Food & Drink": {
    icon: UtensilsCrossed,
    bg: "bg-primary/15",
    text: "text-primary",
    dot: "bg-primary",
  },
  Transport: {
    icon: Car,
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  Shopping: {
    icon: ShoppingBag,
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  Entertainment: {
    icon: Tv,
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    dot: "bg-pink-400",
  },
  Transfer: {
    icon: ArrowLeftRight,
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  Income: {
    icon: ArrowDownLeft,
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    dot: "bg-chart-2",
  },
};

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const removeTransaction = useWalletStore((s) => s.removeTransaction);
  const config = categoryConfig[transaction.category];
  const Icon = config.icon;
  const isCredit = transaction.amount > 0;

  return (
    <>
      <Card className="rounded-2xl py-0 bg-linear-to-br from-[rgba(28,37,59,0.4)] to-[rgba(19,26,42,0.6)] transition-all duration-200 ease-in-out hover:from-[rgba(37,46,68,0.5)] hover:to-[rgba(22,30,48,0.7)]">
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer text-left"
            aria-expanded={expanded}
          >
            <span
              className={`size-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
              aria-hidden="true"
            >
              <Icon size={20} className={config.text} />
            </span>

            <hgroup className="flex-1 min-w-0">
              <h4 className="text-[15px] font-display font-bold text-foreground truncate">
                {transaction.merchant}
              </h4>
              <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mt-0.5">
                {transaction.subcategory} &middot; {transaction.paymentMethod}
              </p>
            </hgroup>
          </button>

          <output className="text-right shrink-0">
            <p
              className={`text-[15px] font-display font-bold tabular-nums ${isCredit ? "text-positive" : "text-foreground"}`}
            >
              {isCredit ? "+" : "-"}
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
            {transaction.status === "pending" && (
              <p className="text-[10px] font-display uppercase tracking-wider text-muted-foreground mt-0.5">
                Pending
              </p>
            )}
          </output>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                />
              }
            >
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil size={13} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => removeTransaction(transaction.id)}
              >
                <Trash2 size={13} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {expanded && (
          <CardContent className="px-5 pb-5 pt-1">
            <div className="flex items-start gap-4">
              <dl className="flex-1 space-y-3">
                <div>
                  <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                    Transaction Category
                  </dt>
                  <dd>
                    <span className="inline-flex items-center gap-2 text-xs font-display font-bold text-foreground bg-secondary rounded-full px-3 py-1.5">
                      <span className={`size-2 rounded-full ${config.dot}`} />
                      {transaction.category === "Food & Drink"
                        ? "Food & Dining"
                        : transaction.category}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Reference Code
                  </dt>
                  <dd className="text-xs font-display font-bold text-foreground">
                    {transaction.referenceCode}
                  </dd>
                </div>
              </dl>

              {transaction.location && (
                <Card className="rounded-xl py-0 bg-[rgba(19,26,42,0.8)]">
                  <CardContent className="px-4 py-3 flex items-center gap-2">
                    <MapPin
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                    <p className="text-xs font-display font-bold text-foreground uppercase tracking-wider leading-tight">
                      {transaction.location}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <AddTransactionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        transaction={transaction}
      />
    </>
  );
}
