"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Bitcoin, Pencil, Plus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import type { AssetSearchResult } from "@/app/api/search/assets/route";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetType, Position } from "@/lib/data/portfolio";
import { fetchCryptoPrice, fetchStockPrice } from "@/lib/services/prices";
import { useInvestmentStore } from "@/lib/store/investment-store";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils/currency";
import { AssetLogo } from "./asset-logo";
import { AssetSearchCombobox } from "./asset-search-combobox";

const assetTypeConfig = {
  stock: {
    icon: BarChart3,
    label: "Stock",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
  etf: {
    icon: TrendingUp,
    label: "ETF",
    color: "text-purple-400",
    bg: "bg-purple-500/15",
  },
  crypto: {
    icon: Bitcoin,
    label: "Crypto",
    color: "text-primary",
    bg: "bg-primary/15",
  },
} as const;

const CURRENCIES = ["USD", "EUR", "GBP", "COP", "ARS", "BTC", "ETH"] as const;

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "real-estate", label: "Real Estate" },
  { value: "bond", label: "Bond" },
];

const schema = z.object({
  portfolioId: z.string().min(1, "Select a portfolio"),
  type: z.enum(["stock", "etf", "crypto", "real-estate", "bond"]),
  name: z.string().min(1, "Name is required"),
  ticker: z.string().optional(),
  quantity: z.string().min(1, "Required"),
  buyPrice: z.string().min(1, "Required"),
  currency: z.string().min(1, "Required"),
  purchaseDate: z.string().min(1, "Required"),
  notes: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

const SEARCHABLE_TYPES: AssetType[] = ["stock", "etf", "crypto"];

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
    }
  }

  useEffect(() => {
    if (open) {
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
  }, [
    open,
    position,
    defaultPortfolioId,
    lastUsedPortfolioId,
    portfolios,
    form,
  ]);

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
            {/* Portfolio */}
            <FormField
              control={form.control}
              name="portfolioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                    Portfolio
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-secondary/60 border-0 rounded-xl px-4 py-3 min-h-11.5 h-auto text-sm font-body">
                        <span
                          className={
                            field.value
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {portfolios.find((p) => p.id === field.value)?.name ??
                            "Select portfolio..."}
                        </span>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {portfolios.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="font-body"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-negative" />
                </FormItem>
              )}
            />

            {/* Asset type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                    Asset Type
                  </FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {ASSET_TYPES.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-colors ${
                          field.value === value
                            ? "bg-neon text-black"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {/* Asset search — stock/etf/crypto only, new position only */}
            {isSearchable && !isEditing && (
              <FormItem>
                <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                  Search Asset
                </FormLabel>

                {selectedAsset ? (
                  (() => {
                    const cfg =
                      assetTypeConfig[
                        selectedAsset.type as keyof typeof assetTypeConfig
                      ];
                    return (
                      <div className="flex items-center gap-3 px-3 py-3 border rounded-xl bg-secondary/40 border-neon/30 ring-1 ring-neon/10">
                        <AssetLogo
                          type={selectedAsset.type}
                          ticker={selectedAsset.ticker}
                          icon={cfg.icon}
                          bg={cfg.bg}
                          text={cfg.color}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold truncate font-display text-foreground">
                              {selectedAsset.name}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
                                cfg.bg,
                                cfg.color,
                              )}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-body mt-0.5">
                            {selectedAsset.ticker}
                            {selectedAsset.exchange && (
                              <span className="opacity-60">
                                {" "}
                                · {selectedAsset.exchange}
                              </span>
                            )}
                          </p>
                        </div>
                        {fetchedCurrentPrice !== null && (
                          <span className="text-sm font-bold font-display text-foreground shrink-0">
                            {fmt(fetchedCurrentPrice)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-neon transition-colors shrink-0 px-1.5"
                        >
                          Change
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <AssetSearchCombobox
                    key={comboboxKey}
                    onSelect={handleAssetSelect}
                  />
                )}
                <FormMessage className="text-xs text-negative" />
              </FormItem>
            )}

            {/* Name — manual entry for real-estate/bond, or edit mode */}
            {(!isSearchable || isEditing) && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                      {watchedType === "real-estate"
                        ? "Property Name"
                        : "Asset Name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        size="lg"
                        autoComplete="off"
                        placeholder={
                          watchedType === "real-estate"
                            ? "Apartment Medellín"
                            : "US Treasury 2030"
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-negative" />
                  </FormItem>
                )}
              />
            )}

            {/* Ticker — edit mode only (read from combobox on new) */}
            {isSearchable && isEditing && (
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                      Ticker Symbol
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        size="lg"
                        placeholder={watchedType === "crypto" ? "BTC" : "AAPL"}
                        className="uppercase"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Quantity + Buy Price + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="buyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                      {watchedType === "real-estate"
                        ? "Purchase Value"
                        : "Buy Price"}
                    </FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        size="lg"
                        min={0}
                        placeholder="150.00"
                        onValueChange={(v) => field.onChange(v)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-negative" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                      {watchedType === "real-estate" ? "Units" : "Quantity"}
                    </FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        size="lg"
                        min={0}
                        placeholder="10"
                        onValueChange={(v) => field.onChange(v)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-negative" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                      Currency
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger size="lg" className="w-full">
                          <SelectValue placeholder="USD" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c} className="font-body">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Purchase date */}
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                    Purchase Date
                  </FormLabel>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick a date"
                  />
                  <FormMessage className="text-xs text-negative" />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                    Notes{" "}
                    <span className="font-normal tracking-normal normal-case text-muted-foreground/50">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={2}
                      placeholder="Any notes about this position..."
                      className="w-full px-4 py-3 text-sm outline-none resize-none bg-secondary/60 rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-negative" />
                </FormItem>
              )}
            />

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
