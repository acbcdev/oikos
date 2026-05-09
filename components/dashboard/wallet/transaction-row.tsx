"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  Building2,
  Car,
  Clock,
  MoreHorizontal,
  Pencil,
  ShoppingBag,
  Trash2,
  Tv,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Account, Transaction } from "@/lib/data/wallet";
import { formatCurrency } from "@/lib/data/wallet";

const categoryConfig: Record<
  string,
  {
    icon: React.ElementType;
    bg: string;
    text: string;
    dot: string;
    label: string;
  }
> = {
  food: {
    icon: UtensilsCrossed,
    bg: "bg-primary/15",
    text: "text-primary",
    dot: "bg-primary",
    label: "Food & Dining",
  },
  transport: {
    icon: Car,
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    dot: "bg-blue-400",
    label: "Transport",
  },
  shopping: {
    icon: ShoppingBag,
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    dot: "bg-purple-400",
    label: "Shopping",
  },
  entertainment: {
    icon: Tv,
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    dot: "bg-pink-400",
    label: "Entertainment",
  },
  transfer: {
    icon: ArrowLeftRight,
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    dot: "bg-orange-400",
    label: "Transfer",
  },
  income: {
    icon: ArrowDownLeft,
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    dot: "bg-chart-2",
    label: "Income",
  },
};

interface TransactionRowProps {
  transaction: Transaction;
  onDeleteRequest: (id: string) => void;
  accounts: Account[];
  onEdit: (tx: Transaction) => void;
}

export function TransactionRow({
  transaction,
  onDeleteRequest,
  accounts,
  onEdit,
}: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const config = categoryConfig[transaction.categoryId] ?? categoryConfig.food;
  const Icon = config.icon;
  const isCredit = transaction.amount > 0;
  const account = accounts.find((a) => a.id === transaction.accountId);

  const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card
      role="button"
      tabIndex={0}
      className="rounded-2xl py-0 bg-linear-to-br from-[rgba(28,37,59,0.4)] to-[rgba(19,26,42,0.6)] transition-all duration-200 ease-in-out hover:from-[rgba(37,46,68,0.5)] hover:to-[rgba(22,30,48,0.7)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      aria-expanded={expanded}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <span
          className={`size-11 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}
          aria-hidden="true"
        >
          <Icon size={18} className={config.text} />
        </span>

        <div className="flex-1 min-w-0">
          <h4
            className="text-[14px] font-display font-bold text-foreground truncate leading-tight"
            title={transaction.description}
          >
            {transaction.description || "—"}
          </h4>
          <span
            className={`inline-flex items-center gap-1.5 mt-0.5 text-[11px] font-display font-semibold tracking-wide ${config.text}`}
          >
            <span className={`size-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </span>
        </div>

        <output className="text-right shrink-0">
          <p
            className={`text-[15px] font-display font-bold tabular-nums ${isCredit ? "text-positive" : "text-foreground"}`}
          >
            {isCredit ? "+" : "−"}
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
                onClick={(e) => e.stopPropagation()}
              />
            }
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
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
        <CardContent className="px-5 pb-4 pt-0">
          <div className="border-t border-white/5 pt-3 flex flex-wrap gap-x-6 gap-y-2">
            {account && (
              <div className="flex items-center gap-2">
                <Building2
                  size={12}
                  className="text-muted-foreground/60 shrink-0"
                />
                <span className="text-[11px] font-display font-semibold text-muted-foreground">
                  {account.name}
                  <span className="text-muted-foreground/50 font-normal ml-1">
                    · {account.institution}
                  </span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-muted-foreground/60 shrink-0" />
              <span className="text-[11px] font-display font-semibold text-muted-foreground">
                {formattedDate}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
