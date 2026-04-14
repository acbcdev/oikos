# Neon Tracker — Feature Roadmap

> **Architecture note:** A backend is planned. Keep store logic abstracted behind
> service functions so swapping Zustand persist for API calls is a one-layer change.

---

## Phase 1 — Close open loops (quick wins)

Features that are partially built or broken right now.

### 1.1 Budget edit / delete

- Edit budget name, category, and limit inline or via modal
- Delete budget with confirmation
- `BudgetCard` needs an actions menu (edit / delete)
- `budget-store.ts` needs `updateBudget` and `removeBudget` methods

### 1.2 Wire up "Add Transaction" on Analytics header

- The `+ Add Transaction` button on the dashboard header currently does nothing
- Should open the same `AddTransactionModal` used in Wallet
- Requires lifting modal state or using a shared store flag (`dashboard-store.ts`)

### 1.3 Transaction filters in Wallet

- Filter bar above the transactions list
- Filter dimensions: **category**, **account**, **date range**, **type** (income / expense / transfer)
- Filters are additive (AND logic)
- Active filters show as dismissible chips
- No backend needed — filter against in-memory store

---

## Phase 2 — Goals system

> **Design decision:** Goals and Budgets are siblings, not the same thing.
> Budgets = monthly spending ceilings per category.
> Goals = outcome targets with a deadline (save X, reach net worth Y, cut spend Z%).
> They share UI patterns but live in separate data models.
> Consider merging them under a single `/plan` route with tabs.

### 2.1 Goal types

| Type                | Description                             | Key fields                              |
| ------------------- | --------------------------------------- | --------------------------------------- |
| Savings target      | Save $X by a deadline                   | target amount, current amount, deadline |
| Net worth milestone | Reach total net worth of $X             | target amount, calculated from accounts |
| Spend reduction     | Cut category spend by X% vs last period | category, reduction %, baseline         |
| FI/FIRE target      | Hit financial independence number       | FI number, monthly spend, SWR rate      |

### 2.2 Goals CRUD

- `/goals` route (or merge into `/budgets` as a tab — decide during implementation)
- Create goal modal: type selector → conditional form fields
- Goal card: progress bar, projected completion date, status badge
- Edit and delete actions on goal card
- `goal-store.ts` with Zustand persist (same pattern as `budget-store.ts`)

### 2.3 Goal ↔ Dashboard integration

- `ActiveGoalCard` on Analytics page should pull from real goal store
- Show the most at-risk goal (furthest from on-track), not just the first one
- FI/FIRE goal feeds `ProjectedFICard` in report-metrics

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

### 6.1 Data model

> **Design decision:** Positions are owned by user-created **Portfolios**, not grouped by a
> fixed asset type. A user can create "Crypto Portfolio", "Tech Stocks", "Dividend", or any
> custom grouping. Asset type (`AssetType`) is still a field on each position for filtering
> and price-fetching logic, but the primary grouping in the UI is portfolio.

```ts
type AssetType = "stock" | "etf" | "crypto" | "real-estate" | "bond";

interface Portfolio {
  id: string;
  name: string;        // "Crypto Portfolio" / "Tech Stocks" / "Dividend"
  description?: string;
}

interface Position {
  id: string;
  portfolioId: string; // belongs to a Portfolio
  name: string;        // "Apple Inc." / "Bitcoin" / "Apartment Medellín"
  ticker?: string;     // "AAPL", "BTC" — optional (real estate has none)
  type: AssetType;
  quantity: number;    // shares, tokens, units, or 1 for real estate
  buyPrice: number;    // cost basis per unit — user-entered
  currentPrice: number;
  currency: string;    // "USD", "COP", etc.
  purchaseDate: string; // ISO date
  livePrice?: boolean; // whether this position fetches live prices
  notes?: string;
}
```

- `investment-store.ts` — Zustand persist, holds `portfolios[]` and `positions[]`
- Portfolio CRUD: `addPortfolio`, `updatePortfolio`, `removePortfolio` (cascades to positions)
- Real estate positions use `quantity: 1` and `buyPrice` = purchase value
- P&L is always computed: `(currentPrice - buyPrice) * quantity`

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

### 6.3 `/portfolio` route — UI sections

> **Layout:** Same vertical 2-section pattern as `/wallet`.
> Top = portfolios pane (like AccountsPane). Bottom = positions pane (like TransactionsPane).
> No donut chart — allocation is communicated through the portfolio cards and grouping.

#### Portfolios pane (mirrors AccountsPane)

- Header: total value across all portfolios (per currency, no conversion) + global P&L
- "Create Portfolio" button in header (mirrors "Add Account")
- Horizontal scroll of **portfolio cards** (mirrors account cards)
  - Each card: portfolio name, total value, P&L absolute + %, position count, asset type badges
  - Click a card to filter the positions pane to that portfolio
  - Active card highlighted with neon indicator
- Default state: "All Portfolios" — shows all positions

#### Positions pane (mirrors TransactionsPane)

- **Tabs:** "Current Positions" | "Previous Sales"
  - Current: positions where `soldAt` is not set
  - Previous Sales: positions where `soldAt` is set (closed/sold)
- Positions grouped by portfolio (collapsible sections, each with sub-totals)
- Filtered by selected portfolio card (or all if none selected)
- **Unified search bar:** single input that filters by name, ticker symbol, or asset type
- Expandable rows — same pattern as `TransactionRow`
  - Row: asset type badge, name, ticker, current price, P&L color-coded
  - Expanded: purchase date, quantity, cost basis, current value, unrealized gain/loss, notes
  - Edit / delete actions inside expanded row
  - Refresh price button inside expanded row (only when `livePrice: true`)
  - For sold positions: shows sell date, sell price, realized gain/loss instead
- "Add Position" button in pane header (pre-fills portfolio if one is selected)

#### Empty states

- No portfolios: centered CTA (same pattern as wallet empty state)
- Portfolio selected but no positions: inline empty state inside positions pane

### 6.4 Create / Edit Portfolio modal

- Fields: name, description (optional)
- On delete: confirmation dialog, cascades to all positions in that portfolio

### 6.5 Add Position modal

- Portfolio selector (pre-filled if opened from a specific portfolio)
- Type selector (Stock / ETF / Crypto / Real estate / Bond)
- Conditional fields:
  - Stock/ETF/Crypto: ticker, quantity, buy price, date
  - Real estate: name, address (optional), purchase value, current value, date
  - Bond: issuer, face value, coupon rate, maturity date
- Toggle: "Fetch live price" (only for Stock/ETF/Crypto)
- Currency selector

### 6.6 Sidebar entry

- Add `{ icon: TrendingUp, label: "Portfolio", href: "/portfolio" }` to `navItems`
- Same nav pattern as existing items

### 6.7 Notifications integration (Phase 3 extension)

| Event                       | Condition                                               |
| --------------------------- | ------------------------------------------------------- |
| Position up significantly   | P&L > +20% since purchase                               |
| Position down significantly | P&L < -15% since purchase                               |
| Stale price warning         | Current price not updated in 7+ days (manual positions) |

---

## Deferred / out of scope for now

- Export to CSV
- Category management (categories are hardcoded — acceptable for now)
- Multi-user / household sharing
- Light mode
- Mobile-first layout (current design is desktop)
