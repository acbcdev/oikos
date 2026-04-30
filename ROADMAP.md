# Oikos — Feature Roadmap

> **Architecture note:** A backend is planned. Keep store logic abstracted behind
> service functions so swapping Zustand persist for API calls is a one-layer change.

---

## Phase 1 — Close open loops (quick wins)

### 1.1 Budget edit / delete ✅ done

### 1.2 Wire up "Add Transaction" on Analytics header ✅ done

### 1.3 Transaction filters in Wallet ✅ done

---

## Phase 2 — Tracker system

> **Design decision:** Drop percentage-allocation "Plan" concept entirely — too abstract.
> The core planning feature is **Tracker**: custom monitors the user creates to watch
> spending behavior and savings goals.
>
> Route: `/tracker`. Store: `lib/store/tracker-store.ts`.
> `app/plan/` → renamed to `app/tracker/`.
> `lib/store/plan-store.ts` → renamed to `lib/store/tracker-store.ts`.
> `/budgets` deprecated — deleted once this phase ships.

### 2.1 Tracker types ✅ done

### 2.2 Data model ✅ done

### 2.3 Tracker CRUD

- ✅ `/tracker` route, `AddTrackerModal`, `SpendMonitorCard`, `SavingsGoalCard`, edit/delete, `tracker-store.ts`
- ❌ Mini spend-over-time chart (`SpendMonitorCard`)
- ❌ Contribution history mini chart (`SavingsGoalCard`)

### 2.4 Dashboard integration ✅ done

---

## Phase 3 — Notifications panel

> Scope: passive alerts only. No push notifications. No service worker.
> A badge + dropdown panel listing triggered events.

### 3.1 Alert triggers

| Event             | Condition                                   |
| ----------------- | ------------------------------------------- |
| Budget warning    | Spend reaches 80% of limit                  |
| Budget exceeded   | Spend goes over limit                       |
| Goal milestone    | Goal progress hits 25 / 50 / 75 / 100%      |
| Large transaction | Single transaction > configurable threshold |
| Goal off-track    | Projected completion > deadline by 30+ days |

### 3.2 Implementation

- `notification-store.ts` — list of alerts with `read` flag, `createdAt`, `type`, `entityId`
- Alerts generated reactively when store mutations cross thresholds (Zustand middleware)
- Bell icon in header shows unread count badge
- Click opens a dropdown panel (shadcn `Popover`) with grouped alerts
- Mark all as read action

### 3.3 Backend consideration

- When backend arrives, notifications should be server-side events, not client-computed
- Keep alert generation logic in a pure function so it can move to an API route

---

## Phase 4 — Recurring transactions

> Scope: **flag + display only**. No auto-creation of transactions on due date.
> That requires a backend scheduler — defer to Phase 5.

### 4.1 Flag recurring

- Add `recurring: boolean` and `recurrenceLabel: string` fields to `Transaction`
- Toggle in `AddTransactionModal` and the edit flow
- Recurring badge on `TransactionRow`

### 4.2 Display

- Recurring transactions section in `TransactionsPane` (separate from one-off list)
- Summary card: total committed recurring spend per month
- Analytics dashboard: show recurring vs variable split in `BurnDistribution`

---

## Phase 5 — Backend migration (offline-first)

> The app must work 100% without internet. The backend is a sync target, not the
> source of truth. When online, changes sync. When offline, the app queues them.
> This is a real architectural commitment — plan the service layer from Phase 1
> with this in mind.

### 5.1 Preparation (do before Phase 3 — non-negotiable)

- Wrap all store mutations in service functions (`lib/services/wallet.ts`, etc.)
- Components call services only — never stores or fetch directly
- Services today: write to store. Services tomorrow: write to store + enqueue sync op.
- This abstraction is what makes offline-first possible without rewriting components.

### 5.2 Local storage upgrade: localStorage → IndexedDB

- Zustand `persist` with `localStorage` is fragile for a real app (5MB cap, sync API)
- Migrate to `idb-keyval` or `Dexie.js` as the persistence adapter
- Dexie is preferred if queries get complex (filter transactions by date range, etc.)
- Zustand stores remain the in-memory state — IndexedDB is just the persistence layer

### 5.3 Sync queue

- Every mutation (create/update/delete) writes a sync operation to a queue in IndexedDB
- Queue entry: `{ id, entity, operation, payload, createdAt, status: pending | synced | failed }`
- A background sync process drains the queue when online
- Use the `navigator.onLine` + `online`/`offline` events to trigger sync
- Service Worker with Background Sync API for syncing after the tab is closed

### 5.4 Conflict resolution strategy

- **Last-write-wins** for most entities (transactions, budgets, goals)
- Server timestamp wins over client timestamp on conflict
- Soft deletes only (`deletedAt` field) — never hard delete locally until server confirms
- Flag: `_synced: boolean` on every entity so UI can show unsynced indicators

### 5.5 Backend shape (TBD — but design toward it)

- REST or tRPC — decide when starting Phase 5
- Auth layer: session-based or JWT (TBD)
- Server is append-only event log ideally — easier conflict resolution
- Each user's data is isolated (single-tenant per user)

---

## Phase 6 — Investment portfolio tracking

> Portfolio is a **separate view** from net worth — it tracks positions and P&L,
> not cash flow. It does not feed into the net worth calculation in Analytics.
> This keeps the data models clean: Wallet = liquidity, Portfolio = capital allocation.

### 6.1 Data model ✅ done

### 6.2 Price input strategy

- **Buy price** — always manual, entered at position creation, represents cost basis
- **Current price** — default is manual update (user refreshes it anytime)
- **Live prices (optional)** — per position, user can toggle `livePrice: true`
  - Stocks/ETFs: Yahoo Finance v8 (`query1.finance.yahoo.com`) — direct browser fetch, no proxy needed
  - Crypto: CoinGecko `/simple/price` — proxied through `app/api/price/crypto/route.ts` to hide API key
  - Real estate / bonds: manual only (no live price source)
  - Live fetch is client-side, on-demand — no background scheduler until backend exists
- **Ticker → CoinGecko ID map** lives in `lib/data/crypto-ids.ts` — extend as needed
- `lib/services/prices.ts` — `fetchStockPrice`, `fetchCryptoPrice`, `refreshPositionPrice`
- `COINGECKO_API_KEY` must be set in `.env.local` (free Demo key from coingecko.com)

### 6.3 `/portfolio` route ✅ done

### 6.4 Create / Edit Portfolio modal ✅ done

### 6.5 Add Position modal ✅ done

### 6.6 Sidebar entry ✅ done

### 6.7 Notifications integration (Phase 3 extension)

| Event                       | Condition                                               |
| --------------------------- | ------------------------------------------------------- |
| Position up significantly   | P&L > +20% since purchase                               |
| Position down significantly | P&L < -15% since purchase                               |
| Stale price warning         | Current price not updated in 7+ days (manual positions) |

---

## Phase 7 — Theme system

> Foundation phase. The current design is the default "Oikos" theme. This phase
> introduces a base theme contract so any brand aesthetic from [getdesign.md](https://getdesign.md/)
> (Stripe, Linear, Notion, etc.) can be dropped in as a DESIGN.md and applied
> without touching component code.

### 7.1 Base theme contract

- All design tokens live in `app/globals.css` under `@theme inline {}` (already the case)
- Extract every color, radius, shadow, font, and spacing token into a named set
- Define the contract: a theme is a CSS file that overrides the token set — nothing else
- Default theme file: `themes/oikos.css` (mirrors current `globals.css` tokens exactly)

### 7.2 Theme loader

- `lib/theme.ts` — `applyTheme(name: string)` swaps the active theme `<link>` tag or injects a `<style>` block
- Theme preference persisted in `localStorage` (key: `oikos-theme`)
- On mount, read preference and apply before first paint (avoid flash)
- `useTheme()` hook exposes `{ theme, setTheme, themes }` — same pattern as `next-themes` but lighter

### 7.3 Theme files (getdesign.md-driven)

> Each theme is a `themes/<name>.css` that overrides the Oikos token set.
> Token values are derived from the brand's DESIGN.md from getdesign.md.

| Theme slug | Brand inspiration | Notes |
| ---------- | ----------------- | ----- |
| `oikos` | Default | Current dark palette — ships as baseline |
| `linear` | Linear.app | High-contrast dark, sharp radius, mono accents |
| `stripe` | Stripe | Purple gradient accent, weight-300 elegance |
| `notion` | Notion | Neutral off-white, minimal chrome, serif hints |

> Add more by dropping a DESIGN.md into context and generating a new `.css` override file.

### 7.4 Theme picker UI

- Settings panel or popover (header icon) with theme swatches
- Each swatch shows the primary background + accent color of the theme
- Active theme highlighted
- Picker is the only UI surface — no per-component theme logic anywhere

### 7.5 Constraints

- Themes override tokens only — zero conditional logic in components
- Dark-only for now (light mode deferred — see below)
- No runtime CSS-in-JS — static `.css` files only

---

## Deferred / out of scope for now

- Export to CSV
- Category management (categories are hardcoded — acceptable for now)
- Multi-user / household sharing
- Light mode
- Mobile-first layout (current design is desktop)
