"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  ArrowLeftRight,
  ArrowDownLeft,
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
import { AddTransactionModal } from "./add-transaction-modal";

const categoryConfig: Record<
  string,
  { icon: React.ElementType; bg: string; text: string; dot: string }
> = {
  food: {
    icon: UtensilsCrossed,
    bg: "bg-primary/15",
    text: "text-primary",
    dot: "bg-primary",
  },
  transport: {
    icon: Car,
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  shopping: {
    icon: ShoppingBag,
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  entertainment: {
    icon: Tv,
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    dot: "bg-pink-400",
  },
  transfer: {
    icon: ArrowLeftRight,
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  income: {
    icon: ArrowDownLeft,
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    dot: "bg-chart-2",
  },
};

export function TransactionRow({
  transaction,
  onDeleteRequest,
}: {
  transaction: Transaction;
  onDeleteRequest: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const config = categoryConfig[transaction.categoryId] ?? categoryConfig["food"];
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
              <h4 className="text-[15px] font-display font-bold text-foreground truncate" title={transaction.description}>
                {transaction.description}
              </h4>
            </hgroup>
          </button>

          <output className="text-right shrink-0">
            <p
              className={`text-[15px] font-display font-bold tabular-nums ${isCredit ? "text-positive" : "text-foreground"}`}
            >
              {isCredit ? "+" : "-"}
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
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
                onClick={() => onDeleteRequest(transaction.id)}
              >
                <Trash2 size={13} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {expanded && (
          <CardContent className="px-5 pb-5 pt-1">
            <dl>
              <dt className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                Category
              </dt>
              <dd>
                <span className="inline-flex items-center gap-2 text-xs font-display font-bold text-foreground bg-secondary rounded-full px-3 py-1.5">
                  <span className={`size-2 rounded-full ${config.dot}`} />
                  {transaction.categoryId}
                </span>
              </dd>
            </dl>
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
