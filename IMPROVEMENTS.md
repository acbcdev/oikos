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
