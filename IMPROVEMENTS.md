# Architecture Improvements

Deepening opportunities to increase leverage and locality. Each candidate increases what callers get from a module while concentrating knowledge in one place.

---

## 1. Extract Calculation Layer (Wallet Metrics)

**Files:** `lib/store/wallet-store.ts`, `lib/store/tracker-store.ts`, `lib/store/plan-store.ts`

**Problem:**
Metrics calculations embedded in store closures:

- `useDashboardMetrics()` ~110 LOC
- `useReportData()` ~165 LOC
- `useSpendMonitorsWithSpend()` duplicated in tracker-store + plan-store

Pure logic (month enumeration, NW reconstruction, category summation) hidden in closures — untestable without full Zustand context. Logic duplicated across stores.

**Solution:**
Extract `lib/calculations/metrics.ts` with pure functions:

```typescript
computeMonthlyNetWorth(transactions, accounts, startDate);
groupTransactionsByCategory(transactions, categories);
sumByPeriod(transactions, period);
computeDashboardMetrics(transactions, accounts, categories);
computeSpendByCategory(transactions, categoryId, period);
```

Zustand hooks become thin wrappers: select state + call pure functions.

**Benefits:**

- **Locality:** All metric logic centralized; bugs surface in one module
- **Leverage:** Calculations reused across stores; no duplication
- **Testability:** Pure functions testable independently, no Zustand wiring needed

**Difficulty:** High (requires extracting 275 LOC of complex logic)

---

## 2. Create Metrics Facade (Unified Spend Contract) ✅ DONE

**Files:** `lib/store/wallet-store.ts`, `lib/store/tracker-store.ts`, `lib/store/plan-store.ts`, `components/dashboard/metric-cards.tsx`

**Problem:**
"Is spend high?" logic scattered in three places with different thresholds:

- `metric-cards.tsx` (BurnRateCard): hardcoded 1000 fallback, compares to monitor limits
- `tracker-store.ts` (useSpendMonitorsWithSpend): marks monitor as "at-risk"
- `plan-store.ts` (useSpendCeilingPlansWithSpend): same pattern, different data

No single source of truth. Each caller independently compares spend to limits.

**Solution (COMPLETED):**
Created `lib/services/spend-analysis.ts` with:

- `analyzeSpend(actual, limit)` — pure function returning SpendAnalysis with status ("on-track" | "at-risk" | "over"), percentUsed, remaining, isOver
- `isHighSpend(actual, limit)` — boolean for dashboard status (high = actual > limit, or > 1000 if no limit)
- `aggregateStatus(...statuses)` — combine multiple statuses into worst case

**Changes Made:**

- Created `lib/services/spend-analysis.ts` with facade functions
- `tracker-store.ts` (useSpendMonitorsWithSpend) — now calls analyzeSpend instead of inline logic
- `plan-store.ts` (useSpendCeilingPlansWithSpend) — now calls analyzeSpend for status consistency
- `metric-cards.tsx` (BurnRateCard) — now calls isHighSpend instead of inline comparison

**Benefits (REALIZED):**

- **Locality:** All spend comparison logic lives in one module (spend-analysis.ts)
- **Leverage:** Consistent status across tracker, plan, and dashboard
- **Testability:** Pure functions in spend-analysis.ts testable independently

**Status:** ✅ Complete | Type-check passing

---

## 3. Eliminate Shallow Stores ✅ DONE

**Files:** `lib/store/dashboard-store.ts`, `lib/store/wallet-filter-store.ts`

**Problem:**

- `dashboard-store.ts` — 12 LOC pass-through holding only `timeframe: "YTD"` + setter. Deletion test: would just pass `timeframe` as prop.
- `wallet-filter-store.ts` — 76 LOC of toggle state + strings with zero derived logic. Components re-implement filtering in useMemo anyway (transactions-pane.tsx:52-83).

Abstraction adds zero behavior.

**Solution (COMPLETED):**

- Moved `timeframe` to `dashboard-layout.tsx` local state: `useState("YTD")`
- Moved filter state (query, selectedAccountIds, selectedCategories, selectedTypes, dateFrom, dateTo) to `wallet-layout.tsx` as local state
- Passed state + handlers as props through component tree
- Deleted both store files (88 LOC removed)

**Changes Made:**

- `dashboard-layout.tsx` — added timeframe state, passed as props to TimeframeToggle, NetWorthChart, report metric cards
- `timeframe-toggle.tsx` — now accepts timeframe and setTimeframe as props
- `net-worth-chart.tsx` — now accepts timeframe prop
- `report-metrics.tsx` — all 5 cards now accept timeframe prop
- `wallet-layout.tsx` — added full filter state with toggle/set handlers, passed to children
- `transactions-toolbar.tsx` — now accepts all filter state + handlers as props
- `transactions-pane.tsx` — now accepts filter state as props
- `accounts-pane.tsx` — now accepts selectedAccountIds + toggleAccount as props
- `account-card.tsx` — now accepts isSelected + toggleAccount as props
- `account-card.stories.tsx` — updated with required props

**Benefits (REALIZED):**

- **Locality:** Filter logic lives in wallet-layout.tsx; no scattered store/component split
- **Leverage:** Removed 88 LOC dead abstraction
- **Testability:** Filter behavior now testable as component concern

**Status:** ✅ Complete | Dev server running | Type-check passing

---

## 4. Decouple Modals from Stores (Props-Based Form Hydration) ✅ DONE

**Files:** `components/dashboard/wallet/add-transaction-modal.tsx`, `components/dashboard/tracker/add-tracker-modal.tsx`, `components/dashboard/wallet/wallet-layout.tsx`, `components/dashboard/tracker/tracker-layout.tsx`, `components/dashboard/wallet/transactions-toolbar.tsx`, `components/dashboard/wallet/transactions-pane.tsx`, `components/dashboard/wallet/transaction-row.tsx`

**Problem:**
Modals directly import + read from stores to hydrate form dropdowns:

```typescript
const categories = useWalletStore((s) => s.categories);
const addTracker = useTrackerStore((s) => s.addTracker);
```

Tight coupling: modal internals bound to store field names. Form submission logic split between modal (form wiring) and store (persistence). No seam; renaming store fields breaks modals.

**Solution (COMPLETED):**
Props-based decoupling: parent components own form state + submission callbacks. Modals are pure consumers of props.

**Changes Made:**

- `add-transaction-modal.tsx` — removed all store imports; now accepts `accounts: Account[]`, `lastUsedAccountId: string | null`, `onSubmit: (tx: Transaction) => void` as props
- `add-tracker-modal.tsx` — removed all store imports; now accepts `categories: Category[]`, `onSubmit: (tracker: Tracker) => void` as props
- `wallet-layout.tsx` — added local state: `lastUsedAccountId`, `accounts`, `addTransaction`, `updateTransaction`, `removeTransaction`; added `handleTransactionSubmit` callback; passes accounts + onSubmit to modals
- `dashboard-layout.tsx` — added local state: `lastUsedAccountId`; passes to AddTransactionModal via accounts list
- `tracker-layout.tsx` — added local state: `categories`, `addTracker`, `updateTracker`; added `handleTrackerSubmit` callback; passes categories + onSubmit to modals
- `transactions-toolbar.tsx` — removed store import for accounts; now accepts accounts, onSubmit as props; passes to AddTransactionModal
- `transactions-pane.tsx` — now accepts accounts, onSubmit, onDeleteRequest as props; passes to children
- `transaction-row.tsx` — now accepts accounts, onSubmit as props; no store reads
- `wallet-layout.tsx` — now passes accounts + removal handler down through pane → row hierarchy (2-level prop drilling max)

Form state ownership: parent layout owns `lastUsedAccountId`, detects add vs edit by ID prefix ("txn-\*" = new), dispatches to store via `onSubmit` callback.

**Benefits (REALIZED):**

- **Locality:** Form hydration logic lives in parent layout; modal is dumb form consumer. Changes to form defaults or submission only touch layout, not modal.
- **Leverage:** Modals decouple from store field names. Store refactors don't ripple to components.
- **Testability:** Modals testable with props injection; no store wiring needed.

**Status:** ✅ Complete | Type-check passing

---

## 5. Reconcile Plan + Tracker (Dead Code or Merge)

**Files:** `lib/store/plan-store.ts`, `app/plan/page.tsx`, `lib/store/tracker-store.ts`, `lib/data/plan.ts`

**Problem:**
Plan store defines 5 types: `SpendCeilingPlan`, `SavingsTargetPlan`, `NetWorthPlan`, `FIREPlan`, `SpendReductionPlan`. But:

- Plan page is empty stub — no UI rendering plans
- `useSpendCeilingPlansWithSpend()` written but never called — dead code
- Both `SpendCeilingPlan` and `SpendMonitor` model same thing: categorical spend limits with period

120 LOC of maintenance burden, zero user value.

**Solution (Option A — Activate Plan):**
Build Plan page UI. Wire `useSpendCeilingPlansWithSpend()`. Distinguish Plan (user-authored budgets) from Tracker (system-driven monitors). Add plan form, plan list, plan status indicators to dashboard.

**Solution (Option B — Merge):**
Remove `SpendCeilingPlan` from plan-store entirely. Keep only Plan types Tracker can't express (`FIREPlan`, `NetWorthPlan`). Fold spend-limit modeling into Tracker.

**Benefits (A):**

- **Locality:** Two concepts live separately; easier to reason about semantics
- **Leverage:** Plan becomes full feature, not partial

**Benefits (B):**

- **Locality:** Single source of truth for spend limits (Tracker only)
- **Leverage:** Remove ~40 LOC duplication; simpler data model

**Difficulty (A):** High (full UI feature build)
**Difficulty (B):** High (merge two similar domains, data migration)

---

## 6. Decouple Derived Hooks (Granular Subscriptions)

**Files:** `lib/store/wallet-store.ts` (useDashboardMetrics, useReportData)

**Problem:**
`useDashboardMetrics()` returns 10 fields: `totalNetWorth`, `monthlyBurn`, `categoryBreakdown`, `savingsRate`, `runway`, `sparkline`, `ytdChange`, `topCategory`, etc. Components subscribing to only one metric (e.g., BurnRateCard just needs `monthlyBurn`) still re-render when `categoryBreakdown` changes.

Monolithic derived hook = high re-render fan-out.

**Solution:**
Split into granular hooks:

```typescript
useTotalNetWorth() → number
useMonthlyBurn() → number
useSavingsRate() → number
useNetWorthChart() → ChartData[]
useCategoryBreakdown() → { category, amount }[]
useRunwayMonths() → number
```

Each hook calculates only its concern.

**Benefits:**

- **Locality:** Each metric calculation independent; bugs surface in one hook
- **Leverage:** Components subscribe to only what they need; lower re-render fan-out
- **Testability:** Easier to test one metric in isolation

**Difficulty:** Medium (refactor derived hooks, update all callers)

---

## Summary

| Candidate                       | Friction              | Difficulty | Priority |
| ------------------------------- | --------------------- | ---------- | -------- |
| **3. Eliminate Shallow Stores** | 88 LOC pass-through   | Low        | HIGH     |
| **2. Metrics Facade**           | Duplicated logic      | Medium     | HIGH     |
| **4. Form Hydration**           | Modal/store coupling  | Medium     | MEDIUM   |
| **6. Granular Hooks**           | Over-subscription     | Medium     | MEDIUM   |
| **1. Extract Calculations**     | Untestable closures   | High       | MEDIUM   |
| **5. Reconcile Plan/Tracker**   | Dead code/duplication | High       | DECIDE   |

**Next:** Pick a candidate. Grilling conversation will walk design tree — what sits behind seam, what tests survive, how dependencies flow.
