"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { NumberInput } from "@/components/ui/number-input";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { formatCurrency } from "@/lib/data/wallet";
import type { Position } from "@/lib/data/portfolio";

interface ClosePositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: Position;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function ClosePositionModal({
  open,
  onOpenChange,
  position,
}: ClosePositionModalProps) {
  const updatePosition = useInvestmentStore((s) => s.updatePosition);
  const [sellPrice, setSellPrice] = useState(
    position.currentPrice.toString(),
  );
  const [sellDate, setSellDate] = useState<string>(todayISO());

  const totalValue =
    (parseFloat(sellPrice) || 0) * position.quantity;
  const gain =
    totalValue - position.buyPrice * position.quantity;
  const isGain = gain >= 0;

  function handleConfirm() {
    const price = parseFloat(sellPrice);
    if (!price || !sellDate) return;
    updatePosition(position.id, {
      soldAt: sellDate,
      soldPrice: price,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card border-white/5 p-0 gap-0">
        <div className="p-6 pb-5">
          <div className="flex items-center gap-3 mb-5">
            <span className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${isGain ? "bg-positive/10" : "bg-negative/10"}`}>
              {isGain
                ? <TrendingUp size={16} className="text-positive" />
                : <TrendingDown size={16} className="text-negative" />}
            </span>
            <div>
              <DialogTitle className="text-base font-display font-bold text-foreground">
                Close Position
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-display mt-0.5">
                {position.name}
                {position.ticker && ` · ${position.ticker}`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Sell Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-display font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Sell Price / Unit
              </label>
              <NumberInput
                size="lg"
                prefix={position.currency}
                min={0}
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                onValueChange={setSellPrice}
              />
            </div>

            {/* Sell Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-display font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Sale Date
              </label>
              <DatePicker
                value={sellDate}
                onChange={(v) => setSellDate(v)}
                className="w-full"
              />
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-secondary/40 px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-display">
                <span className="text-muted-foreground">Total proceeds</span>
                <span className="font-bold text-foreground tabular-nums">
                  {formatCurrency(totalValue, position.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-display">
                <span className="text-muted-foreground">Realized P&amp;L</span>
                <span
                  className={`font-bold tabular-nums ${isGain ? "text-positive" : "text-negative"}`}
                >
                  {isGain ? "+" : ""}
                  {formatCurrency(gain, position.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-4">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={isGain ? "default" : "destructive"}
            className={`flex-1 ${isGain ? "bg-positive text-black hover:bg-positive/90" : ""}`}
            onClick={handleConfirm}
            disabled={!sellPrice || !sellDate}
          >
            {isGain
              ? <TrendingUp size={14} />
              : <TrendingDown size={14} />}
            Confirm Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
