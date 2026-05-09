# BuildTrack Design System

A consistent, theme-aware component library for BuildTrack. All components support light/dark mode via `useColorScheme()` and reference the centralised theme at `@/constants/theme`.

---

## Component Inventory

### Layout

| Component | File | Description |
|-----------|------|-------------|
| `Card` | `Card.tsx` | Rounded surface with shadow and border |
| `Divider` | `Divider.tsx` | Horizontal or vertical separator |
| `SectionHeader` | `SectionHeader.tsx` | Title + subtitle + action link with optional count badge |
| `ListItem` | `ListItem.tsx` | Icon + title/subtitle + chevron, with press support |
| `EmptyState` | `EmptyState.tsx` | Icon + title + description + optional CTA button |
| `Skeleton` | `Skeleton.tsx` | Animated pulse placeholder, supports count |
| `BottomSheet` | `BottomSheet.tsx` | Modal with drag-to-dismiss and backdrop |

### Inputs

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `Button.tsx` | Variants: primary, secondary, outline, ghost, danger. Loading, icons |
| `Input` | `Input.tsx` | Text input with label, error state, icon support |
| `SearchInput` | `SearchInput.tsx` | Animated search field with clear button |
| `SocialAuthButton` | `SocialAuthButton.tsx` | Google/Apple/Facebook auth buttons |

### Feedback

| Component | File | Description |
|-----------|------|-------------|
| `Badge` | `Badge.tsx` | Variants: default, primary, success, warning, danger, info. Optional dot |
| `PriorityBadge` | `PriorityBadge.tsx` | low / medium / high / urgent |
| `StatusBadge` | `StatusBadge.tsx` | Active, completed, planning, pending, etc. |
| `Toast` | `Toast.tsx` | Slide-up auto-dismiss toast with type-based styling |
| `FAB` | `FAB.tsx` | Floating action button with scale press animation |

### Data Display

| Component | File | Description |
|-----------|------|-------------|
| `Avatar` | `Avatar.tsx` | Image or gradient placeholder with initials, online indicator |
| `AvatarStack` | `AvatarStack.tsx` | Overlapping avatars with overflow counter |
| `ProgressBar` | `ProgressBar.tsx` | Animated horizontal bar with optional label |
| `ProgressRing` | `ProgressRing.tsx` | Animated SVG ring with center label |
| `StatCard` | `StatCard.tsx` | Icon + label + large value |
| `PasswordStrengthBar` | `PasswordStrengthBar.tsx` | Segmented strength indicator |

### Charts (`@/components/charts`)

| Component | File | Description |
|-----------|------|-------------|
| `DonutChart` | `DonutChart.tsx` | Segmented ring with animated draw, legend, center label |
| `BarChart` | `BarChart.tsx` | Vertical or horizontal animated bars |
| `LineChart` | `LineChart.tsx` | SVG line chart with area fill, grid, points |

---

## Theme Tokens

All components consume these tokens from `@/constants/theme`:

- **COLORS** — Primary scale, semantic (success/warning/danger/info), light/dark surfaces
- **SPACING** — xs(4), sm(8), md(16), lg(24), xl(32)
- **RADIUS** — sm(8), md(12), lg(16), xl(24), full(9999)
- **TYPOGRAPHY** — display, h1–h3, body, caption, small, overline
- **SHADOWS** — sm, md, lg, xl (platform-aware)
- **ANIMATION** — fast(150ms), normal(250ms), slow(400ms), spring, bounce

---

## Usage

```tsx
import { Button, Card, Badge, Avatar, SectionHeader } from '@/components/ui';
import { DonutChart } from '@/components/charts';
```

---

## Adding a New Component

1. Create `components/ui/YourComponent.tsx`
2. Export from `components/ui/index.ts`
3. Use `useColorScheme()` + `COLORS` for theming
4. Reference `TYPOGRAPHY` for text sizing
5. Use `RADIUS` for border radii
6. Add to this README
