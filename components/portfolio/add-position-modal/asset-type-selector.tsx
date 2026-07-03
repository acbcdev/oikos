import type { AssetType } from "@/lib/data/portfolio";
import { ASSET_TYPES } from "./schema";

interface AssetTypeSelectorProps {
  value: AssetType;
  onChange: (value: AssetType) => void;
}

export function AssetTypeSelector({ value, onChange }: AssetTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ASSET_TYPES.map(({ value: optionValue, label }) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-colors ${
            value === optionValue
              ? "bg-neon text-black"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
