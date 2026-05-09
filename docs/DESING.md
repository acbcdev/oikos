---
name: Neon Pro Evolution v2.1
colors:
  surface: "#121508"
  surface-dim: "#121508"
  surface-bright: "#383b2b"
  surface-container-lowest: "#0d0f04"
  surface-container-low: "#1a1d10"
  surface-container: "#1e2113"
  surface-container-high: "#292b1d"
  surface-container-highest: "#333627"
  on-surface: "#e2e4cf"
  on-surface-variant: "#c5c9ac"
  inverse-surface: "#e2e4cf"
  inverse-on-surface: "#2f3223"
  outline: "#8f9378"
  outline-variant: "#444932"
  surface-tint: "#b0d500"
  primary: "#ffffff"
  on-primary: "#2a3400"
  primary-container: "#caf300"
  on-primary-container: "#596c00"
  inverse-primary: "#536600"
  secondary: "#bdc6e3"
  on-secondary: "#273047"
  secondary-container: "#3d465e"
  on-secondary-container: "#acb5d1"
  tertiary: "#ffffff"
  on-tertiary: "#1b343d"
  tertiary-container: "#cde7f3"
  on-tertiary-container: "#506873"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#caf300"
  primary-fixed-dim: "#b0d500"
  on-primary-fixed: "#171e00"
  on-primary-fixed-variant: "#3e4c00"
  secondary-fixed: "#d9e2ff"
  secondary-fixed-dim: "#bdc6e3"
  on-secondary-fixed: "#121b31"
  on-secondary-fixed-variant: "#3d465e"
  tertiary-fixed: "#cde7f3"
  tertiary-fixed-dim: "#b1cad7"
  on-tertiary-fixed: "#041e28"
  on-tertiary-fixed-variant: "#324a54"
  background: "#0B0F19"
  on-background: "#e2e4cf"
  surface-variant: "#333627"
  foreground: "#FFFFFF"
  card: "#131A2A"
  muted: "#1C253B"
  muted-foreground: "#8A94A6"
  accent: "#252E44"
  border: "#2A3441"
  destructive: "#FF3366"
  positive: "#00FF9D"
  sidebar: "#131A2A"
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: "700"
    lineHeight: "1.2"
  numeral-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.5"
  body-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.4"
  ui-bold:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: "600"
    lineHeight: "1"
  label-caps:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: 0.05em
spacing:
  sidebar-width: 250px
  gutter: 1rem
  container-padding: 2rem
  stack-xs: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

# DESIGN.md

## 1. Color Palette (CSS Variables)

```css
:root {
  /* surfaces */
  --background: #0b0f19; /* background-dark  */
  --foreground: #ffffff;

  --card: #131a2a; /* surface          */
  --card-foreground: #ffffff;

  --popover: #131a2a; /* surface          */
  --popover-foreground: #ffffff;

  /* brand */
  --primary: #d4ff00; /* primary neon     */
  --primary-foreground: #000000;

  /* elevated surfaces */
  --secondary: #1c253b; /* surface-light    */
  --secondary-foreground: #ffffff;

  --muted: #1c253b; /* surface-light    */
  --muted-foreground: #8a94a6; /* muted text    */

  --accent: #252e44; /* surface-hover    */
  --accent-foreground: #ffffff;

  /* states */
  --destructive: #ff3366; /* negative         */

  /* borders & inputs */
  --border: #2a3441; /* border-color     */
  --input: #2a3441;

  --ring: #d4ff00; /* primary neon     */

  /* charts → neon palette */
  --chart-1: #d4ff00; /* primary          */
  --chart-2: #00ff9d; /* positive         */
  --chart-3: #ff3366; /* negative         */
  --chart-4: #8a94a6; /* muted            */
  --chart-5: #252e44; /* surface-hover    */

  /* sidebar */
  --sidebar: #131a2a; /* surface          */
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #d4ff00; /* primary neon     */
  --sidebar-primary-foreground: #000000;
  --sidebar-accent: #1c253b; /* surface-light    */
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #2a3441; /* border-color     */
  --sidebar-ring: #d4ff00;
}
```

## 2. Creative North Star: "Cyber-Industrial Precision"

A stark, high-contrast financial interface designed for aggressive performance tracking. It utilizes a "Terminal-meets-Finance" aesthetic with deep voids, razor-sharp typography, and tactical neon highlights.

## 3. Typography

- **Headings & Numerals:** `Space Grotesk` (Weight: 700)
- **Body & UI Text:** `Outfit` (Weight: 400, 600)

## 4. UI Components & Patterns

- **Hard Edges:** Minimum border radius (`4px`). No soft shadows.
- **Borders:** Universal `1px solid #2A3441` for all card boundaries.
- **Navigation:** Fixed 250px sidebar with high-contrast active states.
