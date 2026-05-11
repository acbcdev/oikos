import { useMemo, useRef } from "react";
import { useWalletStore } from "@/lib/store/wallet-store";
import type { Account, Transaction } from "@/lib/data/wallet";
import type { Timeframe } from "@/lib/data/reports";

export interface MetricData {
  accounts: Account[];
  transactions: Transaction[];
}

export interface MetricOptions {
  currency?: string | null;
  timeframe?: Timeframe;
}

type MetricFn<R> = (data: MetricData, options: MetricOptions) => R;

export function useMetrics<T extends Record<string, unknown>>(
  callbacks: { [K in keyof T]: MetricFn<T[K]> },
  options: MetricOptions = {}
): T {
  const allAccounts = useWalletStore((s) => s.accounts);
  const allTransactions = useWalletStore((s) => s.transactions);
  const { currency = null, timeframe } = options;

  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;
  const optsRef = useRef(options);
  optsRef.current = options;

  return useMemo(() => {
    const accounts = currency
      ? allAccounts.filter((a) => a.currency === currency)
      : allAccounts;
    const filteredIds = currency ? new Set(accounts.map((a) => a.id)) : null;
    const transactions = currency
      ? allTransactions.filter((t) => filteredIds!.has(t.accountId))
      : allTransactions;

    const data: MetricData = { accounts, transactions };
    const result = {} as T;
    for (const key in cbRef.current) {
      result[key] = cbRef.current[key](data, optsRef.current);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAccounts, allTransactions, currency, timeframe]);
}
