/**
 * Spend analysis facade.
 * Single source of truth for spend vs limit comparison logic.
 */

export type SpendStatus = "on-track" | "at-risk" | "over";

export interface SpendAnalysis {
  status: SpendStatus;
  percentUsed: number;
  remaining: number;
  isOver: boolean;
}

/**
 * Analyze spend against a limit and return unified status.
 * Status thresholds:
 * - on-track: 0-79% of limit
 * - at-risk: 80-99% of limit
 * - over: >= 100% of limit
 */
export function analyzeSpend(actual: number, limit: number): SpendAnalysis {
  const percentUsed = limit > 0 ? (actual / limit) * 100 : 0;
  const remaining = limit - actual;
  const isOver = actual > limit;

  let status: SpendStatus;
  if (isOver) {
    status = "over";
  } else if (percentUsed >= 80) {
    status = "at-risk";
  } else {
    status = "on-track";
  }

  return {
    status,
    percentUsed,
    remaining,
    isOver,
  };
}

/**
 * Determine if a spend amount is "high" compared to a limit.
 * Used for dashboard status indicators.
 *
 * - If limit is set: high = actual > limit
 * - If no limit: high = actual > 1000 (fallback threshold)
 */
export function isHighSpend(actual: number, limit: number): boolean {
  return limit > 0 ? actual > limit : actual > 1000;
}
