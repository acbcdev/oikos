# UI Conventions

## Design tokens

All tokens in `app/globals.css` under `@theme inline {}` — available as Tailwind utilities:

| Token                                                  | Value                     |
| ------------------------------------------------------ | ------------------------- |
| `bg-neon` / `text-neon`                                | `#D4FF00`                 |
| `bg-surface` / `bg-surface-light` / `bg-surface-hover` | dark card backgrounds     |
| `bg-bg-dark`                                           | `#0B0F19` page background |
| `text-positive` / `text-negative`                      | `#00FF9D` / `#FF3366`     |
| `shadow-neon`, `shadow-glass`, `shadow-card`           | custom shadows            |
| `font-display` / `font-body`                           | Space Grotesk / Outfit    |

Component layer classes (`.metric-card`, `.net-worth-card`, `.donut-segment`, `.account-card`, `.transaction-row`, `.transaction-detail`) live in `@layer components {}` in `globals.css` — use for glassmorphism card styles.

## shadcn base-nova

Style uses `@base-ui/react/use-render` — **no `asChild` prop**. Use `render` instead:

```tsx
// ✅
<SidebarMenuButton render={<a href="#" />}>...</SidebarMenuButton>

// ❌ won't compile
<SidebarMenuButton asChild><a href="#">...</a></SidebarMenuButton>
```

Add components:

```bash
pnpm dlx shadcn@latest add <component>
```

## Buttons

Always `<Button>` from `@/components/ui/button`. Raw `<button>` only for structural click wrappers where Button semantics don't apply (e.g. transaction row toggle).
