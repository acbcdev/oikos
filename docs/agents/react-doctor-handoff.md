# React Doctor — handoff

Scan: 2026-07-02. Score **54/100 — Critical**. 68 issues (`npx react-doctor@latest --verbose`).

Re-run before/after fixes: `npx react-doctor@latest --verbose --scope changed`

## Security (3) — fix first

- [ ] `package.json` — `next@16.1.6` has CVE-2026-23870 (RSC DoS). Bump `next@16.2.6+`.
- [ ] `pnpm-workspace.yaml` — add `minimumReleaseAge: 10080`
- [ ] `pnpm-workspace.yaml` — add `trustPolicy: no-downgrade`

## Bugs (16)

- [ ] `components/portfolio/positions-pane.tsx:184` — stale deps (`refresh, allPositions`)
- [ ] `components/wallet/transaction-form/index.tsx:102` — stale deps; also both files' `eslint-disable` comments say `react-hooks/exhaustive-deps`, must add `react-doctor/exhaustive-deps` too
- [ ] `components/tracker/savings-goal-form.tsx:188` — `new Date()` in JSX, hydration mismatch
- [ ] `components/wallet/transaction-form/date-field.tsx:32` — same
- [ ] `components/portfolio/asset-logo.tsx:29` — `<img>` → `next/image`
- [ ] `components/portfolio/position-row.tsx:109` — button missing `type`
- [ ] `components/portfolio/positions-pane.tsx:68` — button missing `type`
- [ ] `components/portfolio/positions-pane.tsx:259` — button missing `type`
- [ ] `components/tracker/tracker-layout.tsx:134` — button missing `type`
- [ ] `components/tracker/tracker-layout.tsx:145` — button missing `type`
- [ ] `components/portfolio/add-position-modal.tsx:146` — event logic in effect, move to handler
- [ ] `components/portfolio/create-portfolio-modal.tsx:51` — same
- [ ] `components/ui/calendar.tsx:201` — same
- [ ] `components/wallet/edit-account-modal.tsx:79` — same
- [ ] `hooks/use-mobile.ts:16` — state init from mount effect, pass initial value directly / `useSyncExternalStore`
- [ ] `components/wallet/wallet-layout.tsx:23` — 7 separate `useState` → `useReducer`

## Performance (25)

- [ ] `components/analytics/burn-distribution-chart.tsx:3` — recharts eager load → `next/dynamic`
- [ ] `components/analytics/reports/net-worth-bar-chart.tsx:3` — same
- [ ] `components/analytics/sparkline-area-chart.tsx:3` — same
- [ ] `components/ui/chart.tsx:4` — same
- [ ] `components/ui/chart.tsx:53` — unstable context value, wrap in `useMemo`
- [ ] `components/ui/form.tsx:34` — same
- [ ] `components/ui/form.tsx:68` — same
- [ ] `components/wallet/transactions-toolbar.tsx:85` — `array.find()` in loop → build `Map`
- [ ] `components/wallet/transactions-toolbar.tsx:93` — same
- [ ] `components/wallet/date-range-picker.tsx:110` — `useState(getFullYear())` no lazy init
- [ ] `components/portfolio/asset-search-combobox.tsx:47` — `useRef(new Map())` no lazy init
- [ ] `components/wallet/edit-account-modal.tsx:98` — `Intl.NumberFormat` rebuilt per call
- [ ] `components/wallet/link-account-modal.tsx:103` — same
- [ ] `lib/utils/currency.ts:2` — same
- [ ] `lib/utils/currency.ts:15` — same
- [ ] `lib/utils/number-format.ts:26` — same
- [ ] `lib/utils/number-format.ts:41` — same
- [ ] `components/ui/chart.tsx:131` — `useMemo` before early return, move JSX to memo'd child
- [ ] `components/portfolio/positions-pane.tsx:208` — `[...arr].sort()` → `toSorted()`
- [ ] `components/ui/chart.tsx:182` — chained `.filter().map()` → single pass
- [ ] `components/ui/chart.tsx:280` — same
- [ ] `components/wallet/transactions-pane.tsx:93` — same
- [ ] `lib/hooks/metric-fns.ts:44` — same
- [ ] `lib/hooks/metrics.ts:187` — same
- [ ] `lib/store/tracker-store.ts:206` — same

## Accessibility (8)

- [ ] `components/portfolio/close-position-modal.tsx:87` — label missing `htmlFor`
- [ ] `components/portfolio/close-position-modal.tsx:108` — same
- [ ] `components/ui/label.tsx:9` — same
- [ ] `components/ui/date-picker.tsx:78` — control missing accessible label
- [ ] `components/wallet/edit-account-modal.tsx:225` — same
- [ ] `components/wallet/transaction-form/amount-field.tsx:33` — same
- [ ] `components/ui/input-group.tsx:54` — click handler missing keyboard handler
- [ ] `components/wallet/transaction-form/amount-field.tsx:38` — remove `autoFocus`

## Maintainability (16)

- [ ] `lib/data/date-presets.ts:76` — unused export `formatDateTriggerLabel`
- [ ] `lib/services/spend-analysis.ts:59` — unused export
- [ ] `components/wallet/edit-account-modal.tsx:102` — `formatBalance` rebuilt every render, hoist to module scope
- [ ] `components/portfolio/add-position-modal.tsx:92` — 506-line component, split up
- [ ] `components/ui/chart.tsx:28` — React 19: `forwardRef`/`useContext` → `use()`
- [ ] `components/ui/form.tsx:41` — same
- [ ] `components/ui/sidebar.tsx:48` — same
- [ ] `components/analytics/metric-cards.tsx:119` — multiple components in one file
- [ ] `components/analytics/metric-cards.tsx:236` — same
- [ ] `components/ui/input-group.tsx:46` — same
- [ ] `components/ui/input-group.tsx:109` — same
- [ ] `components/ui/badge.tsx:52` — non-component export in component file, breaks Fast Refresh
- [ ] `components/ui/button.tsx:61` — same
- [ ] `components/ui/input.tsx:39` — same
- [ ] `components/ui/tabs.tsx:82` — same
- [ ] `components/wallet/date-range-picker.tsx:20` — same

## Order

Security → Bugs → Performance → Accessibility → Maintainability. Verify each false-positive-prone rule against its recipe URL before fixing (see original scan output).
