# Code Standards

## Design Tokens

All custom tokens are defined in `app/globals.css` under `@theme inline {}` and available as Tailwind utilities:

- `bg-neon` / `text-neon` → `#D4FF00`
- `bg-surface` / `bg-surface-light` / `bg-surface-hover` → dark card backgrounds
- `bg-bg-dark` → `#0B0F19` page background
- `text-positive` → `#00FF9D`, `text-negative` → `#FF3366`
- `shadow-neon`, `shadow-glass`, `shadow-card` — custom shadows
- `font-display` → Space Grotesk, `font-body` → Outfit

Component layer classes (`.metric-card`, `.net-worth-card`, `.donut-segment`, `.account-card`, `.transaction-row`, `.transaction-detail`) are in `@layer components {}` in `globals.css` — use these for glassmorphism card styles.

## shadcn base-nova Specifics

This style uses `@base-ui/react/use-render` instead of Radix. Key difference: **no `asChild` prop** on shadcn components. Use the `render` prop instead:

```tsx
// ✅ correct
<SidebarMenuButton render={<a href="#" />}>...</SidebarMenuButton>

// ❌ won't compile
<SidebarMenuButton asChild><a href="#">...</a></SidebarMenuButton>
```

### Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

## Buttons

Always use `<Button>` from `@/components/ui/button` — never use raw `<button>` elements. The only exception is structural click wrappers (e.g. the transaction row toggle) where `Button` semantics don't apply.

## Modals / Dialogs

Use shadcn `Dialog` from `@/components/ui/dialog` (base-nova style with `@base-ui/react/dialog`). Pattern:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md bg-card border-white/5 p-0 gap-0">
    <DialogTitle>...</DialogTitle>
    {/* body */}
  </DialogContent>
</Dialog>
```

Trigger via controlled state (`open` / `onOpenChange`) rather than `DialogTrigger` when the trigger button lives in a different component tree.

## Server vs Client Components

Components with event handlers, hover state, or interactivity **must** declare `"use client"`. The dashboard metric cards are Server Components; `app-sidebar.tsx` and `burn-distribution.tsx` are Client Components.
