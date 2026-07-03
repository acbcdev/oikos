import { useCallback, useState } from "react";
import type { Position } from "@/lib/data/portfolio";
import { hasLivePrice, refreshPositionPrice } from "@/lib/services/prices";
import { useInvestmentStore } from "@/lib/store/investment-store";

// Owns price fetching so components stay presentational — call one at the
// top (e.g. PositionsPane) and pass `refresh`/`refreshingIds` down as props.
export function usePriceRefresh() {
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  const updatePosition = useInvestmentStore((s) => s.updatePosition);

  const refresh = useCallback(
    async (positions: Position[]) => {
      const targets = positions.filter((p) => hasLivePrice(p) && !p.soldAt);
      if (targets.length === 0) return;

      setRefreshingIds(new Set(targets.map((p) => p.id)));
      await Promise.allSettled(
        targets.map(async (p) => {
          try {
            const price = await refreshPositionPrice(p);
            if (price !== null) updatePosition(p.id, { currentPrice: price });
          } catch {
            // Silently fail — next refresh retries
          }
        }),
      );
      setRefreshingIds(new Set());
    },
    [updatePosition],
  );

  return { refresh, refreshingIds };
}
