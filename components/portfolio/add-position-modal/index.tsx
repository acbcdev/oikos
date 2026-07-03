"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { AssetSearchResult } from "@/app/api/search/assets/route";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import type { Position } from "@/lib/data/portfolio";
import { fetchCryptoPrice, fetchStockPrice } from "@/lib/services/prices";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { DetailsFields } from "./details-fields";
import { IdentityFields } from "./identity-fields";
import { type FormValues, SEARCHABLE_TYPES, schema } from "./schema";

interface AddPositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: Position;
  defaultPortfolioId?: string;
}

export function AddPositionModal({
  open,
  onOpenChange,
  position,
  defaultPortfolioId,
}: AddPositionModalProps) {
  const portfolios = useInvestmentStore((s) => s.portfolios);
  const lastUsedPortfolioId = useInvestmentStore((s) => s.lastUsedPortfolioId);
  const addPosition = useInvestmentStore((s) => s.addPosition);
  const updatePosition = useInvestmentStore((s) => s.updatePosition);
  const isEditing = !!position;

  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(
    null,
  );
  const [comboboxKey, setComboboxKey] = useState(0);
  const [fetchedCurrentPrice, setFetchedCurrentPrice] = useState<number | null>(
    null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      portfolioId:
        defaultPortfolioId ?? lastUsedPortfolioId ?? portfolios[0]?.id ?? "",
      type: "stock",
      name: "",
      ticker: "",
      quantity: "",
      buyPrice: "",
      currency: "USD",
      purchaseDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const watchedType = useWatch({
    control: form.control,
    name: "type",
    defaultValue: "stock",
  });
  const isSearchable = SEARCHABLE_TYPES.includes(watchedType);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedAsset(null);
      setComboboxKey((k) => k + 1);
      setFetchedCurrentPrice(position?.currentPrice ?? null);
      form.reset({
        portfolioId:
          position?.portfolioId ??
          defaultPortfolioId ??
          lastUsedPortfolioId ??
          portfolios[0]?.id ??
          "",
        type: position?.type ?? "stock",
        name: position?.name ?? "",
        ticker: position?.ticker ?? "",
        quantity: position ? String(position.quantity) : "",
        buyPrice: position ? String(position.buyPrice) : "",
        currency: position?.currency ?? "USD",
        purchaseDate:
          position?.purchaseDate ?? new Date().toISOString().split("T")[0],
        notes: position?.notes ?? "",
      });
    }
  }

  async function handleAssetSelect(asset: AssetSearchResult) {
    setSelectedAsset(asset);
    form.setValue("name", asset.name, { shouldValidate: true });
    form.setValue("ticker", asset.ticker, { shouldValidate: true });
    form.setValue("type", asset.type, { shouldValidate: true });

    // Seed buy price immediately from search result (instant UX)
    if (asset.price !== undefined) {
      form.setValue("buyPrice", String(asset.price), { shouldValidate: true });
      setFetchedCurrentPrice(asset.price);
    }

    // Move focus forward so Enter continues the form, not the search
    form.setFocus("buyPrice");

    // Then fetch a fresher quote in the background
    try {
      const price =
        asset.type === "crypto"
          ? await fetchCryptoPrice(asset.ticker)
          : await fetchStockPrice(asset.ticker);
      setFetchedCurrentPrice(price);
      // Only overwrite buyPrice if it wasn't seeded from the search result
      if (asset.price === undefined) {
        form.setValue("buyPrice", String(price), { shouldValidate: true });
      }
    } catch {
      // Keep whatever was seeded — user can edit buyPrice manually
    }
  }

  function clearSelection() {
    setSelectedAsset(null);
    setComboboxKey((k) => k + 1);
    form.setValue("name", "");
    form.setValue("ticker", "");
    form.setValue("buyPrice", "");
    setFetchedCurrentPrice(null);
  }

  function onSubmit(values: FormValues) {
    const payload: Omit<Position, "id"> = {
      portfolioId: values.portfolioId,
      type: values.type,
      name: values.name,
      ticker: values.ticker || undefined,
      quantity: parseFloat(values.quantity),
      buyPrice: parseFloat(values.buyPrice),
      currentPrice: fetchedCurrentPrice ?? parseFloat(values.buyPrice),
      currency: values.currency,
      purchaseDate: values.purchaseDate,
      notes: values.notes || undefined,
    };

    if (isEditing) {
      updatePosition(position.id, payload);
    } else {
      addPosition({ id: crypto.randomUUID(), ...payload });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-white/5 p-0 gap-0 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/5 bg-card">
          <span className="flex items-center justify-center size-9 rounded-xl bg-primary/15 shrink-0">
            {isEditing ? (
              <Pencil size={16} className="text-primary" />
            ) : (
              <Plus size={16} className="text-primary" />
            )}
          </span>
          <DialogTitle className="text-lg font-bold font-display text-foreground">
            {isEditing ? "Edit Position" : "Add Position"}
          </DialogTitle>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-4"
          >
            <IdentityFields
              control={form.control}
              portfolios={portfolios}
              watchedType={watchedType}
              isSearchable={isSearchable}
              isEditing={isEditing}
              selectedAsset={selectedAsset}
              comboboxKey={comboboxKey}
              fetchedCurrentPrice={fetchedCurrentPrice}
              onAssetSelect={handleAssetSelect}
              onClearSelection={clearSelection}
            />

            <DetailsFields control={form.control} watchedType={watchedType} />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? "Save Changes" : "Add Position"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
