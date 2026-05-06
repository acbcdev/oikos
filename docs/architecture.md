# Architecture

## Routes

| Route | Page | Feature |
|---|---|---|
| `/` | `app/page.tsx` | Dashboard — metric cards + burn distribution |
| `/wallet` | `app/wallet/page.tsx` | Accounts + Transactions 2-pane layout |
| `/tracker` | `app/tracker/page.tsx` | Spend monitors + savings goals |
| `/plan` | `app/plan/page.tsx` | Budget planning |
| `/portfolio` | `app/portfolio/page.tsx` | Investment portfolios + positions |
| `/analytics` | `app/analytics/page.tsx` | Financial trajectory charts + metrics |

## Layout

`app/layout.tsx` owns `SidebarProvider` + `AppSidebar` (shared). Each page renders only its `SidebarInset`.

## Component model

```
app/                    # routes only — no logic
lib/
  data/                 # interfaces + fake/seed data
  store/                # Zustand stores (one per domain)
  services/             # external API calls (e.g. prices.ts)
  utils/                # pure helpers
components/
  dashboard/            # feature components (not reusable primitives)
    tracker/
    wallet/
    portfolio/
    reports/
  ui/                   # shadcn primitives — never edit manually, use CLI
```

## State

Zustand stores in `lib/store/`. One store per domain:
- `wallet-store.ts` — accounts + transactions
- `tracker-store.ts` — spend monitors + savings goals
- `investment-store.ts` — portfolios + positions
- `wallet-filter-store.ts` — wallet filter/search UI state
- `dashboard-store.ts` — dashboard-level derived state
- `plan-store.ts` — budget plan
