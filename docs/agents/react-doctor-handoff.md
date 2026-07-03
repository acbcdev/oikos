# React Doctor — handoff

Scan: 2026-07-02. Score **54/100 — Critical**. 68 issues (`npx react-doctor@latest --verbose`).

Re-run before/after fixes: `npx react-doctor@latest --verbose --scope changed`

## Security (3) — fix first

- [x] `package.json` — `next@16.1.6` has CVE-2026-23870 (RSC DoS). Bumped to `next@16.2.6`. Typecheck + `next build` pass.
- [x] `pnpm-workspace.yaml` — added `minimumReleaseAge: 10080`
- [x] `pnpm-workspace.yaml` — added `trustPolicy: no-downgrade` + `trustPolicyIgnoreAfter: 129600` (90d — scopes downgrade checks to the actual attack window; without it, old stable transitive deps like `undici-types@6.21.0`/`semver@6.3.1`/`reselect@5.1.1` false-positive as "takeovers" just for predating npm provenance). Verified each flagged package's maintainers/publish history before adding the exception — no takeover indicators.
  - Side effect: `prettier@^3.9.4` failed `minimumReleaseAge` (published 2 days old, no older patch in range). Relaxed to `^3.8.4` (mature).

## Bugs (16) — done, `--category bugs` scan is clean

- [x] `components/portfolio/positions-pane.tsx:184` — stale deps intentional; `eslint-disable-next-line react-hooks/exhaustive-deps` only silenced eslint's own rule, not react-doctor's separate oxlint-based engine. Both tools require their disable comment on their own literal target line, which can't both be the line directly above — solved with `// react-doctor-disable-next-line react-doctor/exhaustive-deps` above the closing `}, [deps])` and a trailing `// eslint-disable-line react-hooks/exhaustive-deps` on that same line.
- [x] `components/wallet/transaction-form/index.tsx:102` — same fix.
- [x] `components/tracker/savings-goal-form.tsx:188` — `minDate={new Date()}` in JSX. Deferred to `useState(undefined) + useEffect(() => setMinDeadline(new Date()), [])` so the deadline min-bound only exists client-side. That trips both `react-doctor/no-initialize-state` and eslint's `react-hooks/set-state-in-effect` — suppressed both (same adjacent-comment + trailing-comment technique as above): a lazy `useState` initializer would run `new Date()` during SSR too and reintroduce the exact mismatch being fixed.
- [x] `components/wallet/transaction-form/date-field.tsx:32` — `maxDate={new Date()}` was redundant: `DatePicker` already defaults `maxDate` to `new Date()` when the prop is omitted. Deleted the prop, zero behavior change.
- [x] `components/portfolio/asset-logo.tsx:29` — kept `<img>` (user call: native `loading="lazy"`/`decoding="async"` over `next/image`'s optimization pipeline for small third-party ticker logos). Suppressed both rules with justification.
- [x] `components/portfolio/position-row.tsx:109` — `type="button"`
- [x] `components/portfolio/positions-pane.tsx:68` — `type="button"`
- [x] `components/portfolio/positions-pane.tsx:259` — `type="button"`
- [x] `components/tracker/tracker-layout.tsx:134` — `type="button"`
- [x] `components/tracker/tracker-layout.tsx:145` — `type="button"`
- [x] `components/portfolio/add-position-modal.tsx:146` — merged the `form.reset` effect into the file's existing "prevOpen state during render" block next to it; deleted the effect and the now-unused `useEffect` import.
- [x] `components/portfolio/create-portfolio-modal.tsx:51` — added the same prevOpen-during-render pattern (didn't have one yet).
- [x] `components/ui/calendar.tsx:201` — false positive per the rule's own carve-out: `modifiers.focused` is react-day-picker's internal roving-tabindex state, not a local event this component owns a handler for. Suppressed with justification, comment placed immediately above the flagged line (no equivalent eslint rule installed here, so no dual-comment dance needed).
- [x] `components/wallet/edit-account-modal.tsx:79` — same prevOpen pattern as create-portfolio-modal.
- [x] `hooks/use-mobile.ts:16` — rewrote with `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`, dropped the mount effect entirely.
- [x] `components/wallet/wallet-layout.tsx:23` — grouped the 7 filter-related `useState`s (already commented as one block) into one `useReducer` with an object-map dispatch (no `switch`, per feedback); `hydrated`/`linkModalOpen` stayed as their own `useState` since they're unrelated to the filter state.

**Suppression-comment gotcha worth remembering**: `react-doctor-disable-next-line` and eslint's `-next-line` directives each require their comment on the literal line directly preceding the target — only one comment can occupy that line, so stacking both `-next-line` directives fails one of them (confirmed via `npx react-doctor@latest why <file>:<line>`, which also surfaces adjacency-gap errors). Fix: react-doctor's comment goes on the line directly above the target, eslint's goes as a _trailing_ `eslint-disable-line` comment on the target line itself — both are then simultaneously adjacent to what they need to suppress.

Verified via `npx react-doctor@latest why <file>:<line>` before/after each fix, a final `--category bugs` JSON scan (0 diagnostics), `pnpm lint` and `pnpm typecheck` (both clean), and a full `--scope changed --verbose` scan (86/100, 0 errors, the 5 remaining warnings are pre-existing Performance/Accessibility/Maintainability items already tracked below, not new regressions).

## Performance (25) — 18 fixed, 4 false-positive, 3 deferred

- [x] `components/wallet/transactions-toolbar.tsx:85` — `array.find()` in loop → build `Map` (`accountById`)
- [x] `components/wallet/transactions-toolbar.tsx:93` — same, `categoryById`
- [x] `components/wallet/date-range-picker.tsx:110` — `useState(getFullYear())` → `useState(() => getFullYear())`
- [x] `components/portfolio/asset-search-combobox.tsx:47` — `useRef(new Map())` → `useState(() => new Map())` (lazy init, no ref-null-`!` dance per feedback)
- [x] `components/wallet/edit-account-modal.tsx:98` — `Intl.NumberFormat` rebuilt per render → new shared `currencySymbol()` helper in `lib/utils/currency.ts` (module-level cache keyed by currency, no hook)
- [x] `components/wallet/link-account-modal.tsx:103` — same fix, same helper (deduped identical logic across both files)
- [x] `lib/utils/currency.ts:2` — `fmt`/`fmtSplit` now share a module-level `Map<currency, Intl.NumberFormat>` cache instead of constructing per call
- [x] `lib/utils/currency.ts:15` — same
- [x] `lib/utils/number-format.ts:26` — `Intl.NumberFormat` hoisted to module-scope `integerFormatter` constant
- [x] `lib/utils/number-format.ts:41` — same
- [x] `components/ui/chart.tsx:131` — extracted `ChartTooltipLabel` as a `React.memo`'d child rendered after the early return, instead of `useMemo`'ing JSX before it
- [x] `components/portfolio/positions-pane.tsx:208` — `[...arr].sort()` → `arr.toSorted()`
- [x] `components/ui/chart.tsx:182` — chained `.filter().map()` → single-pass `reduce`, preserves post-filter `index` via `acc.length`
- [x] `components/ui/chart.tsx:280` — chained `.filter().map()` → single-pass `flatMap`
- [x] `components/wallet/transactions-pane.tsx:93` — `.map().filter()` → single-pass `flatMap`
- [x] `lib/hooks/metric-fns.ts:44` — `.filter().forEach()` → single `for...of`
- [x] `lib/hooks/metrics.ts:187` — `.filter().map()` → single-pass `flatMap`
- [x] `lib/store/tracker-store.ts:206` — `.filter().map()` building a `Set` → single `for...of` loop adding directly to the `Set`

**False positives (candidates for `.react-doctor/false-positives.md`)** — recharts is only ever reached through an existing `next/dynamic({ ssr: false })` boundary at each file's sole consumer, so the static per-file import scan can't see that it's already lazy-loaded:

- [ ] `components/analytics/burn-distribution-chart.tsx:3` — sole consumer `components/analytics/burn-distribution.tsx` already wraps it in `dynamic(..., { ssr: false })`
- [ ] `components/analytics/reports/net-worth-bar-chart.tsx:3` — same, consumer `net-worth-chart.tsx`
- [ ] `components/analytics/sparkline-area-chart.tsx:3` — same, consumer `metric-cards.tsx`
- [ ] `components/ui/chart.tsx:4` — every runtime importer of this shared primitives file is itself one of the three dynamically-loaded chart components above (other importers only pull the `ChartConfig` _type_, which is erased at build)

**Deferred** — `jsx-no-constructed-context-values` (unstable context value, `<X.Provider value={{...}}>`):

- [ ] `components/ui/chart.tsx:53`
- [ ] `components/ui/form.tsx:34`
- [ ] `components/ui/form.tsx:68`

User call: don't add `useMemo` for context-value identity stability without React Compiler enabled (confirmed off — no `reactCompiler` in `next.config.ts`, no `babel-plugin-react-compiler` dep). Revisit once the compiler is turned on project-wide, or if the user wants the manual `useMemo` now.

## Accessibility (8)

- [x] `components/portfolio/close-position-modal.tsx:87` — label missing `htmlFor`. Added `id="sellPrice"`/`htmlFor`; `NumberInput` already spreads `id` onto its `<input>`.
- [x] `components/portfolio/close-position-modal.tsx:108` — same. Added `id="sellDate"`/`htmlFor`; added `id` passthrough to `DatePicker` (new prop, forwarded to its trigger `<button>` — `button` is a labelable element).
  - Side effect surfaced by rescan: `components/ui/date-picker.tsx:81` — `control-has-associated-label` false positive. `PopoverTrigger`'s `render={<button .../>}` supplies only the element type/attrs; Base UI injects `PopoverTrigger`'s own `children` (the `CalendarIcon` + text span) into it at runtime, so the button always has real visible text — the static scanner just can't see across that injection. Same false-positive class as the recharts dynamic-import findings above. Suppressed with `react-doctor-disable-next-line` + justification (same precedent as `calendar.tsx:201`).
- [x] `components/ui/date-picker.tsx:78` — control missing accessible label. Same finding as the `:81` side effect noted above (line shifted by the `id` prop edits) — already fixed/suppressed there.
- [x] `components/wallet/edit-account-modal.tsx:225` — same. Both this and `amount-field.tsx:33` wrap the real `<input>` inside a custom `<div>` (currency-prefix layout), so it's never `FormControl`'s direct child — left the shared `components/ui/form.tsx` untouched (user call) and instead wired `useId()` at the call site: explicit `htmlFor={balanceInputId}` on `FormLabel` (already passes through via its existing `{...props}` spread — no form.tsx change needed) + matching `id` on the `<input>`. Scanner still flagged it after that: it can't cross-reference a dynamic `useId()` string between two separate JSX elements, only same-element signals — added `aria-label="Balance"` directly on the input to close the gap (redundant with the label click-to-focus behavior, which still works natively).
- [x] `components/wallet/transaction-form/amount-field.tsx:33` — same fix, `useId()` + `htmlFor`/`id` + `aria-label="Transaction Amount"`.
- [x] `components/ui/input-group.tsx:54` — click handler missing keyboard handler. False positive/non-issue: the div's `onClick` just refocuses the already-independently-tab-reachable `<input>` inside it (click-target padding, like clicking a `<label>`), already had a biome-ignore with that exact justification — react-doctor's separate engine needed its own suppression (`react-doctor/click-events-have-key-events`), added with justification.
- [x] `components/wallet/transaction-form/amount-field.tsx:38` — remove `autoFocus`. Deleted the prop and its now-orphaned `biome-ignore` comment.

## Maintainability (16) — 8 fixed, 8 accepted as shadcn convention

- [x] `lib/data/date-presets.ts:76` — unused export `formatDateTriggerLabel`. Deleted (only consumer was the re-export below, itself unused).
- [x] `lib/services/spend-analysis.ts:59` — unused export `aggregateStatus`. Deleted, no callers.
- [x] `components/wallet/edit-account-modal.tsx:102` — `formatBalance` rebuilt every render. Hoisted to module scope (pure fn, no closure over component state).
- [x] `components/wallet/date-range-picker.tsx:20` — non-component export (`formatDateTriggerLabel` re-export) breaking Fast Refresh. Removed — nothing imported it.
- [x] `components/portfolio/add-position-modal.tsx:92` — 506-line component (433 by the scanner's own count). Split into `add-position-modal/{index.tsx,schema.ts,selected-asset-card.tsx,asset-type-selector.tsx,identity-fields.tsx,details-fields.tsx}`; import path unchanged (`./add-position-modal` resolves to the new `index.tsx`). First pass only pulled out two small leaf pieces and left `index.tsx` at 481 lines, which the scanner still flagged as a giant component (433 lines) — went back and pulled the two remaining field groups (portfolio/type/search/name/ticker → `identity-fields.tsx`, quantity/price/currency/date/notes → `details-fields.tsx`) out too. `index.tsx` now 212 lines, `no-giant-component` clear.
- [x] `components/ui/chart.tsx:28` — React 19: `useContext` → `use()`. No `forwardRef` found in any of the three files; just the context read.
- [x] `components/ui/form.tsx:41` — same.
- [x] `components/ui/sidebar.tsx:48` — same.

**Accepted as shadcn convention (not fixing)** — these fight the shadcn/ui component model itself rather than a real defect:

- [ ] `components/ui/badge.tsx:52` — non-component export (`badgeVariants`) alongside component. Splitting breaks re-running `shadcn add` to pull upstream updates; Fast Refresh cost is a single extra remount on edit.
- [ ] `components/ui/button.tsx:61` — same (`buttonVariants`)
- [ ] `components/ui/input.tsx:39` — same
- [ ] `components/ui/tabs.tsx:82` — same
- [ ] `components/analytics/metric-cards.tsx:119` — multiple components in one file, same grouping pattern already used unflagged in `form.tsx`
- [ ] `components/analytics/metric-cards.tsx:236` — same
- [ ] `components/ui/input-group.tsx:46` — same
- [ ] `components/ui/input-group.tsx:109` — same

## Order

Security → Bugs → Performance → Accessibility → Maintainability. Verify each false-positive-prone rule against its recipe URL before fixing (see original scan output).
