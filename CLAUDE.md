# CLAUDE.md

Personal finance tracker (Next.js 16, App Router, Tailwind v4, shadcn base-nova).

## Commands

```bash
pnpm dev          # dev server — port 3000
pnpm lint         # ESLint
pnpm tsc --noEmit # type-check
```

> **Never run `pnpm build`** — dev server is sufficient for verification.

If `pnpm dev` fails with a lock error:
```bash
pkill -f "next dev"; rm -rf .next/dev/lock
```

## Stack

- **Next.js 16** — App Router, React Server Components, Turbopack
- **Tailwind CSS v4** — config in `app/globals.css` via `@theme inline {}`, no `tailwind.config.js`
- **shadcn/ui** `base-nova` style — uses `@base-ui/react` primitives, **not Radix**
- **lucide-react** for icons
- **Zustand** for client state

## Docs

- [Architecture — routes, component model, stores](docs/architecture.md)
- [UI Conventions — tokens, shadcn base-nova, buttons, modals, RSC rules](docs/ui-conventions.md)
