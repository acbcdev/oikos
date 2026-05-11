# KISS Violations

## Session 1 — Shared utilities

- [ x ] `toMonthStr` defined in `wallet-store.ts:13` but not used — stores inline same date logic in `tracker-store.ts:175`
- [ x ] `DEFAULT_CATEGORIES` (`lib/data/wallet.ts:33`) duplicates `CATEGORIES` (`lib/data/categories.ts:35`) — two category systems, different shapes
- [x] Currency formatters split across `lib/data/wallet.ts:46`, `lib/data/reports.ts:10`, and inline `toLocaleString()` in `asset-search-combobox.tsx:166`

## Session 2 — Spend calculation

- [x] Spend filter logic in `tracker-store.ts:182-194` — was duplicated with deleted plan-store, now single source
- [x] `SpendAnalysis` returns `actual`, `limit`, `percentUsed`, `remaining`, `isOver` — all derivable from the two inputs `analyzeSpend()` already receives (`spend-analysis.ts:24`)
- [x] `Tracker` union type forces type predicate cast on every read — `tracker-store.ts:7`

## Session 3 — Hook & component complexity

- [x] `useDashboardMetrics()` computes 9+ unrelated metrics in one 110-line `useMemo` — `wallet-store.ts:168`
- [x] `useReportData()` duplicates net worth + category logic from `useDashboardMetrics()` — only diff is timeframe — `wallet-store.ts:283`
- [ ] `transaction-modal.tsx` is 300+ lines: form state, validation, 3 transaction types, layout all in one component
- [x] `hooks/use-mobile.ts` — has caller in `sidebar.tsx:69`, not dead code

## Deleted dead code

- [x] `plan-store.ts` — deleted. `SpendCeilingPlan`, `SavingsTargetPlan`, etc. had zero callers. `tracker-store.ts` covers the live use case.
