import { useMemo, useRef } from "react";
import type { Timeframe } from "@/lib/data/reports";
import type { Account, Transaction } from "@/lib/data/wallet";
import type { Position } from "@/lib/data/portfolio";

export interface MetricData {
  accounts?: Account[];
  transactions?: Transaction[];
  positions?: Position[];
}

export interface MetricOptions {
  currency?: string | null;
  timeframe?: Timeframe;
}

type MetricFn<R> = (data: MetricData, options: MetricOptions) => R;

interface UseMetricsInput {
  data: MetricData;
  currency?: string | null;
  timeframe?: Timeframe;
}

export function useMetrics<T extends Record<string, unknown>>(
  { data: { accounts = [], transactions = [], positions = [] }, currency, timeframe }: UseMetricsInput,
  callbacks: { [K in keyof T]: MetricFn<T[K]> },
): T {
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  return useMemo(() => {
    const filteredAccounts = currency
      ? accounts.filter((a) => a.currency === currency)
      : accounts;
    const filteredIds = currency ? new Set(filteredAccounts.map((a) => a.id)) : null;
    const filteredTransactions = currency
      ? transactions.filter((t) => filteredIds?.has(t.accountId))
      : transactions;

    const filtered: MetricData = { accounts: filteredAccounts, transactions: filteredTransactions, positions };
    const opts: MetricOptions = { currency: currency ?? null, timeframe };
    const result = {} as T;
    for (const key in cbRef.current) {
      result[key] = cbRef.current[key](filtered, opts);
    }
    return result;
  }, [accounts, transactions, positions, currency, timeframe]);
}
