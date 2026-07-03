import type { AssetSearchResult } from "@/app/api/search/assets/route";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils/currency";
import { AssetLogo } from "../asset-logo";
import { assetTypeConfig } from "./schema";

interface SelectedAssetCardProps {
  asset: AssetSearchResult;
  fetchedCurrentPrice: number | null;
  onClear: () => void;
}

export function SelectedAssetCard({
  asset,
  fetchedCurrentPrice,
  onClear,
}: SelectedAssetCardProps) {
  const cfg = assetTypeConfig[asset.type as keyof typeof assetTypeConfig];

  return (
    <div className="flex items-center gap-3 px-3 py-3 border rounded-xl bg-secondary/40 border-neon/30 ring-1 ring-neon/10">
      <AssetLogo
        type={asset.type}
        ticker={asset.ticker}
        icon={cfg.icon}
        bg={cfg.bg}
        text={cfg.color}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold truncate font-display text-foreground">
            {asset.name}
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
          {asset.ticker}
          {asset.exchange && (
            <span className="opacity-60"> · {asset.exchange}</span>
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
        onClick={onClear}
        className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-neon transition-colors shrink-0 px-1.5"
      >
        Change
      </button>
    </div>
  );
}
