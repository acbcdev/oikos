import type { Control } from "react-hook-form";
import type { AssetSearchResult } from "@/app/api/search/assets/route";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { Portfolio } from "@/lib/data/portfolio";
import { AssetSearchCombobox } from "../asset-search-combobox";
import { AssetTypeSelector } from "./asset-type-selector";
import type { FormValues } from "./schema";
import { SelectedAssetCard } from "./selected-asset-card";

interface IdentityFieldsProps {
  control: Control<FormValues>;
  portfolios: Portfolio[];
  watchedType: FormValues["type"];
  isSearchable: boolean;
  isEditing: boolean;
  selectedAsset: AssetSearchResult | null;
  comboboxKey: number;
  fetchedCurrentPrice: number | null;
  onAssetSelect: (asset: AssetSearchResult) => void;
  onClearSelection: () => void;
}

export function IdentityFields({
  control,
  portfolios,
  watchedType,
  isSearchable,
  isEditing,
  selectedAsset,
  comboboxKey,
  fetchedCurrentPrice,
  onAssetSelect,
  onClearSelection,
}: IdentityFieldsProps) {
  return (
    <>
      {/* Portfolio */}
      <FormField
        control={control}
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
                      field.value ? "text-foreground" : "text-muted-foreground"
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
                    <SelectItem key={p.id} value={p.id} className="font-body">
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
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
              Asset Type
            </FormLabel>
            <AssetTypeSelector value={field.value} onChange={field.onChange} />
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
            <SelectedAssetCard
              asset={selectedAsset}
              fetchedCurrentPrice={fetchedCurrentPrice}
              onClear={onClearSelection}
            />
          ) : (
            <AssetSearchCombobox key={comboboxKey} onSelect={onAssetSelect} />
          )}
          <FormMessage className="text-xs text-negative" />
        </FormItem>
      )}

      {/* Name — manual entry for real-estate/bond, or edit mode */}
      {(!isSearchable || isEditing) && (
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold tracking-widest uppercase font-display text-muted-foreground">
                {watchedType === "real-estate" ? "Property Name" : "Asset Name"}
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
          control={control}
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
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  );
}
