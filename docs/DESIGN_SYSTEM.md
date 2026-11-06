# Portfolio design system

This is the system the site actually uses. (`DESIGN.md` at the repo root is a
reference study of another brand, not this one.) Tokens live in
`src/index.css` (`:root`) and `src/components/theme.css` (light/dark semantic
layer).

## Identity

An emerald and mint technology palette, used as accents on deep ink and warm
paper surfaces, with coral as the single warm accent. There are no gradients
beyond subtle surface washes and no decorative AI imagery. The Voice Studio
stays dark in both themes, as a "product inside the portfolio".

## Color

| Token | Value | Use |
| --- | --- | --- |
| `--ink` / `--ink-soft` | `#0b2528` / `#123438` | Dark surfaces, primary text on light |
| `--paper` / `--white` | `#f3f0e9` / `#fffdfa` | Light surfaces, text on dark |
| `--mint` | `#67e0c1` | Accent on **dark** surfaces, primary button fill |
| `--mint-deep` | `#0f806d` | Accent on **light** surfaces only. It fails AA on dark surfaces (2.5–3.2:1). |
| `--coral` | `#ff9c77` | Results, status dots, the one warm highlight |
| `--theme-page/surface/surface-raised` | per theme | Section, card and inset backgrounds |
| `--theme-text` / `--theme-muted` | per theme | Body and secondary text, both ≥ 4.5:1 |
| `--theme-accent` | `#0c7363` light / `#72e1c3` dark | Links and eyebrows. Always ≥ 4.5:1 on that theme's surfaces. |
| `--theme-line` | per theme | Borders and dividers |

**Rule:** new components take their colour from the `--theme-*` tokens, so
they work in both themes without per-theme overrides. Reach for `--mint` or
`--mint-deep` directly only on surfaces whose colour does not change with the
theme.

## Type scale

Inter (self-hosted, metric-matched fallback).

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 12px | Meta, chips |
| `--text-sm` | 14px | Card body, links in cards |
| `--text-base` | 16px | Body (the minimum for paragraphs on phones) |
| `--text-lg` | 18px | Lead text, compact card titles |
| `--text-xl` | 22px | Card titles |
| `--text-2xl` | 28–40px fluid | Sub-section titles |
| `--text-display` | 36–76px fluid | Section headlines (weight 620, tracking −0.055em) |

Eyebrows are 0.73rem, weight 800, 0.17em tracking, uppercase.

## Spacing, radius, elevation

- **Spacing:** `--space-1…9` = 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Sections
  use `--space-9` vertically on desktop and `--space-8` on phones.
- **Radius:** `--radius-sm` 8 (chips, inputs) · `--radius-md` 12 (icon tiles,
  buttons in panels) · `--radius-lg` 18 (cards) · `--radius-xl` 24 (feature
  panels) · `--radius-pill`.
- **Elevation:** `--elevation-1` for resting cards, `--elevation-2` for
  raised/hovered panels. Avoid heavier shadows.

## Interaction

- **Touch targets:** `--touch-target` is 44px for primary controls. Nothing
  interactive may be smaller than 24 × 24 (WCAG 2.2 AA).
- **Focus:** a 2px mint (dark) or theme-accent (light) outline with a 2–4px
  offset. Never remove it without replacing it.
- **Motion:** `--duration-fast` (180ms) for colour and border changes,
  `--duration-base` (320ms) with `--ease-out` for movement. Every movement
  has a `prefers-reduced-motion: reduce` fallback. Content never depends on an
  animation to become visible.
- **Hover lift:** cards may translate −2px. Reduced motion disables the lift.

## Components

- **Buttons:** `button-primary` (mint fill), `button-secondary` (outline),
  `button-dark` (ink fill, form submit). One primary per group.
- **Cards:** a theme surface, a `--theme-line` border, `--radius-lg`,
  `--elevation-1`, and `--space-5` padding (`--space-4` on phones).
- **Segmented tabs:** a full-width two-up control. Each tab has a label plus a
  truthful count. ARIA `tablist`/`tab`/`tabpanel` with roving `tabIndex`,
  Arrow, Home and End keys. Inactive panels are `hidden`, not unmounted, so
  prerendered HTML keeps their content.
- **Inputs:** labels are always visible and errors are linked with
  `aria-describedby`. Never collect more than name, email, subject and
  message.

## Breakpoints

| Width | Layout |
| --- | --- |
| ≤ 560 | Single column, compact cards, two-up contact paths |
| ≤ 640 | Phone chrome (Alex full-height sheet, vertical workflow chains) |
| ≤ 767 | Hero identity row; section headings stack |
| ≤ 860 | Mobile navigation |
| ≤ 1100 | Services two-up |
| > 1100 | Full desktop grids |

## Where styles live

Each component imports its own stylesheet. Cross-cutting fixes from the UX
audit live in `src/components/refinements.css`. It is imported last in
`main.jsx` and every block names its audit finding, so it can be folded into
the owning stylesheet later without guesswork.
