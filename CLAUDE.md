# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server (port 3000)
pnpm build        # production build
pnpm lint         # ESLint with Next.js core-web-vitals + typescript rules
pnpm tsc --noEmit # type-check without emitting
```

> **Never run `pnpm build` after making changes** — dev server is sufficient for verification.

If `pnpm dev` fails with a lock error, run:
```bash
pkill -f "next dev"; rm -rf .next/dev/lock
```

## Stack

- **Next.js 16** (App Router, React Server Components, Turbopack)
- **Tailwind CSS v4** — config lives entirely in `app/globals.css` via `@theme inline {}`, no `tailwind.config.js`
- **shadcn/ui** with `base-nova` style — uses `@base-ui/react` primitives instead of Radix
- **lucide-react** for all icons
- Package manager: **pnpm**

## Architecture

### Routing
Multi-route app. `app/layout.tsx` owns `SidebarProvider` + `AppSidebar` (shared across all routes). Each page renders only its `SidebarInset`.

| Route | Page |
|---|---|
| `/` | `app/page.tsx` — Wealth Velocity dashboard |
| `/wallet` | `app/wallet/page.tsx` — Accounts + Transactions 2-pane layout |
| `/reports` | `app/reports/page.tsx` — Financial Trajectory charts + metrics |

### Component model
```
app/
  layout.tsx          # fonts, dark class, TooltipProvider, SidebarProvider + AppSidebar
  page.tsx            # SidebarInset shell, composes dashboard sections
  wallet/page.tsx     # SidebarInset shell, wallet 2-pane layout
  globals.css         # ALL design tokens + component layer styles

lib/
  data/wallet.ts      # Account, Transaction interfaces + fake data + formatCurrency
  data/reports.ts     # MonthlyNetWorth, reportMetrics, Timeframe types + fake data

components/
  dashboard/          # feature components (not reusable primitives)
    app-sidebar.tsx   # "use client" — shadcn Sidebar with usePathname + Link
    metric-cards.tsx  # Server Components: NetWorthCard, ActiveGoalCard, BurnRateCard
    burn-distribution.tsx # "use client" — SVG donut chart + legend
    reports/
      timeframe-toggle.tsx     # "use client" — 1M/3M/6M/1Y/YTD toggle buttons
      net-worth-chart.tsx      # "use client" — recharts BarChart, monthly net worth
      report-metrics.tsx       # "use client" — SavingsRateCard, HighestBurnCard, ProjectedFICard
    wallet/
      wallet-layout.tsx        # "use client" — 2-pane flex container
      accounts-pane.tsx        # "use client" — liquid total + account cards
      account-card.tsx         # account card with institution badge
      transactions-pane.tsx    # "use client" — search + transaction groups
      transaction-row.tsx      # "use client" — expandable transaction row
      add-transaction-modal.tsx # "use client" — shadcn Dialog modal (Expense/Income/Transfer)
  ui/                 # shadcn primitives (never edit manually, use CLI)
```

## Code Standards

See [`CODE_STANDARS.md`](./CODE_STANDARS.md) for coding conventions: design tokens, shadcn base-nova rules, buttons, modals, and server vs client components.
