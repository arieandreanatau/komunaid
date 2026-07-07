# UI Specification — KomunaID

## Responsive Breakpoints

| Name                  | Width       | Columns | Gutter |
| --------------------- | ----------- | ------- | ------ |
| xs (mobile)           | 0–639px     | 1       | 16px   |
| sm (mobile landscape) | 640–767px   | 2       | 16px   |
| md (tablet)           | 768–1023px  | 4       | 24px   |
| lg (desktop)          | 1024–1279px | 8       | 24px   |
| xl (wide desktop)     | 1280px+     | 12      | 32px   |

## Layout Grid

### Container

```css
.container-komuna {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px; /* mobile */
}
@media (min-width: 640px) {
  padding: 0 24px;
}
@media (min-width: 1024px) {
  padding: 0 32px;
}
```

### Page Layouts

#### Public Pages

```
Full width header
┌─────────────────────────────────────┐
│           max-w-7xl (1280px)        │
│     padding: 0 16/24/32px          │
│                                     │
│  Content area                       │
│                                     │
└─────────────────────────────────────┘
Full width footer
```

#### Dashboard Layout (sidebar + content)

```
┌──────┬──────────────────────────────┐
│      │  Header (full width)         │
│ Side │──────────────────────────────│
│ bar  │                              │
│      │  Content (max-w-7xl)         │
│ w-64 │                              │
│      │                              │
│      │                              │
└──────┴──────────────────────────────┘
Sidebar: 256px fixed, collapsible on mobile
```

#### Admin Layout (dark sidebar + content)

```
┌──────┬──────────────────────────────┐
│      │  Header (full width, admin)  │
│ Side │──────────────────────────────│
│ bar  │                              │
│ dark │  Content (max-w-7xl)         │
│ w-64 │                              │
│      │                              │
│      │                              │
└──────┴──────────────────────────────┘
Sidebar: 256px fixed, always visible
```

---

## Typography Scale

| Token       | Size | Weight | Line Height | Use                    |
| ----------- | ---- | ------ | ----------- | ---------------------- |
| `text-4xl`  | 36px | 800    | 40px        | Hero headlines         |
| `text-3xl`  | 30px | 700    | 36px        | Page titles            |
| `text-2xl`  | 24px | 700    | 32px        | Section headers        |
| `text-xl`   | 20px | 600    | 28px        | Card titles, subtitles |
| `text-lg`   | 18px | 600    | 28px        | Large body text        |
| `text-base` | 16px | 400    | 24px        | Body text (default)    |
| `text-sm`   | 14px | 400    | 20px        | Secondary text, labels |
| `text-xs`   | 12px | 400    | 16px        | Captions, badges       |

---

## Spacing System

Base unit: 4px. All spacing multiples of 4.

| Token           | Value | Usage                      |
| --------------- | ----- | -------------------------- |
| `p-0` / `m-0`   | 0px   | Reset                      |
| `p-1` / `m-1`   | 4px   | Tight spacing              |
| `p-2` / `m-2`   | 8px   | Icon gaps, small padding   |
| `p-3` / `m-3`   | 12px  | Input padding vertical     |
| `p-4` / `m-4`   | 16px  | Card padding, section gaps |
| `p-5` / `m-5`   | 20px  | Modal padding              |
| `p-6` / `m-6`   | 24px  | Card padding (default)     |
| `p-8` / `m-8`   | 32px  | Section spacing            |
| `p-10` / `m-10` | 40px  | Large section spacing      |
| `p-12` / `m-12` | 48px  | Page section spacing       |
| `p-16` / `m-16` | 64px  | Hero section spacing       |
| `p-20` / `m-20` | 80px  | Large hero spacing         |
| `p-24` / `m-24` | 96px  | Extra large spacing        |

---

## Component Specifications

### Button

#### Variants

| Variant       | Background      | Text      | Border   | Hover             |
| ------------- | --------------- | --------- | -------- | ----------------- |
| `default`     | Royal #1D4ED8   | White     | None     | Royal-600 #1740B5 |
| `destructive` | Red-500 #EF4444 | White     | None     | Red-600 #DC2626   |
| `outline`     | White           | Gray-700  | Gray-300 | Gray-50 bg        |
| `secondary`   | Gray-100        | Gray-900  | None     | Gray-200          |
| `ghost`       | Transparent     | Gray-700  | None     | Gray-100          |
| `link`        | Transparent     | Royal-500 | None     | Underline         |
| `teal`        | Teal #11A79B    | White     | None     | Teal-600 #0E8A80  |

#### Sizes

| Size      | Height | Padding         | Font |
| --------- | ------ | --------------- | ---- |
| `sm`      | 32px   | 12px horizontal | 12px |
| `default` | 40px   | 16px horizontal | 14px |
| `lg`      | 48px   | 32px horizontal | 16px |
| `icon`    | 40px   | —               | —    |

#### States

- Default: Normal appearance
- Hover: Darken background
- Active: Slightly darker
- Focus: 2px ring (royal-500, offset 2px)
- Disabled: opacity 50%, cursor not-allowed
- Loading: Spinner replaces text, button disabled

---

### Input

#### Default

```
Height: 40px
Padding: 12px horizontal
Border: 1px solid Gray-300
Border radius: 8px (rounded-lg)
Font: 14px, Regular
Background: White
```

#### States

| State    | Border    | Ring                |
| -------- | --------- | ------------------- |
| Default  | Gray-300  | None                |
| Focus    | Royal-500 | 0 0 0 3px Royal-100 |
| Error    | Red-500   | 0 0 0 3px Red-100   |
| Disabled | Gray-200  | None, bg Gray-50    |

#### Labels

- Position: Above input
- Font: 14px, Medium (500)
- Color: Gray-700
- Margin bottom: 4px

#### Helper Text

- Font: 12px, Regular
- Color: Gray-500
- Margin top: 4px

#### Error Text

- Font: 12px, Medium
- Color: Red-500 #EF4444
- Margin top: 4px

---

### Card

#### Default Card

```
Background: White
Border: 1px solid Gray-200
Border radius: 12px (rounded-xl)
Padding: 24px
Shadow: 0 1px 2px rgba(0,0,0,0.05)
```

#### Hover Card (clickable)

```
Shadow on hover: 0 4px 6px rgba(0,0,0,0.07)
Transition: shadow 200ms
Cursor: pointer
```

#### Card with Banner

```
Banner height: 120-160px
Banner border radius: 12px 12px 0 0
Content padding: 16px
```

---

### Badge

| Variant       | Background | Text       | Use              |
| ------------- | ---------- | ---------- | ---------------- |
| `default`     | Gray-100   | Gray-700   | Generic          |
| `primary`     | Royal-100  | Royal-700  | Primary status   |
| `success`     | Teal-100   | Teal-700   | Approved, active |
| `warning`     | Yellow-100 | Yellow-700 | Pending          |
| `destructive` | Red-100    | Red-700    | Rejected, banned |
| `info`        | Aqua-100   | Aqua-700   | Information      |

```
Font: 12px, Medium
Padding: 2px 8px
Border radius: 9999px (pill)
```

---

### Modal/Dialog

```
Overlay: Black 50% opacity, blur backdrop
Container:
  - Max width: 480px (default), 640px (large)
  - Background: White
  - Border radius: 16px (rounded-2xl)
  - Shadow: 0 25px 50px rgba(0,0,0,0.25)
  - Padding: 24px

Header:
  - Font: 18px, Semibold
  - Margin bottom: 16px
  - Close button: top-right corner

Body:
  - Font: 14px, Regular
  - Color: Gray-600
  - Margin bottom: 24px

Footer:
  - Flex row, justify end, gap 12px
  - Cancel button: outline variant
  - Confirm button: default variant
```

---

### Table

```
Header:
  - Background: Gray-50
  - Font: 12px, Semibold
  - Text: Gray-500
  - Text transform: uppercase
  - Letter spacing: 0.05em
  - Padding: 12px 16px
  - Border bottom: 1px solid Gray-200

Row:
  - Padding: 12px 16px
  - Border bottom: 1px solid Gray-100
  - Hover: Gray-50 background

Cell:
  - Font: 14px, Regular
  - Color: Gray-900
  - Secondary: Gray-500

Striped (optional):
  - Every other row: bg Gray-50/50
```

---

### Alert

| Type      | Background | Border     | Icon Color | Text Color |
| --------- | ---------- | ---------- | ---------- | ---------- |
| `info`    | Blue-50    | Blue-200   | Blue-500   | Blue-800   |
| `success` | Teal-50    | Teal-200   | Teal-500   | Teal-800   |
| `warning` | Yellow-50  | Yellow-200 | Yellow-500 | Yellow-800 |
| `error`   | Red-50     | Red-200    | Red-500    | Red-800    |

```
Border radius: 8px
Padding: 16px
Font: 14px
Border: 1px left (4px) with type color
```

---

### Toast/Snackbar

```
Position: bottom-right
Width: 360px max
Background: White
Border: 1px solid Gray-200
Border radius: 8px
Shadow: 0 10px 15px rgba(0,0,0,0.1)
Padding: 12px 16px

Content:
  - Icon (16x16) + Message (14px) + Close button
  - Duration: 5000ms auto-dismiss
  - Animation: slide in from right, fade out

Variants: info, success, warning, error (same colors as Alert)
```

---

### Empty State

```
Alignment: Center
Padding: 48px vertical
Max width: 320px

Content:
  - Illustration/icon: 80x80, Gray-300
  - Title: 18px, Semibold, Gray-900
  - Description: 14px, Regular, Gray-500
  - Action button (optional): default variant
```

---

### Error State

```
Alignment: Center
Padding: 48px vertical

Content:
  - Error icon: 48x48, Red-500
  - Title: 18px, Semibold, Gray-900
  - Description: 14px, Regular, Gray-500
  - Retry button: outline variant
```

---

### Loading State

#### Skeleton

```
Background: Gray-200
Border radius: 4px
Animation: pulse (opacity 0.5 → 1, 2s infinite)

Variants:
  - text: height 14px, width varies
  - title: height 20px, width 60%
  - avatar: 40x40, circle
  - card: full card skeleton
  - image: full width, 200px height
```

#### Spinner

```
Size: 24x24 (default), 16x16 (sm), 32x32 (lg)
Color: Royal-500
Animation: spin (360deg, 1s linear infinite)
```

---

## Color Tokens Reference

### Primary

| Token       | Hex     | RGB           |
| ----------- | ------- | ------------- |
| `navy`      | #0A1D4D | 10, 29, 77    |
| `navy-50`   | #E8EBF3 | 232, 235, 243 |
| `navy-100`  | #C5CCE3 | 197, 204, 227 |
| `royal`     | #1D4ED8 | 29, 78, 216   |
| `royal-50`  | #EBF0FD | 235, 240, 253 |
| `royal-500` | #1D4ED8 | 29, 78, 216   |
| `royal-600` | #1740B5 | 23, 64, 181   |
| `teal`      | #11A79B | 17, 167, 155  |
| `teal-500`  | #11A79B | 17, 167, 155  |
| `teal-600`  | #0E8A80 | 14, 138, 128  |
| `aqua`      | #00C8E6 | 0, 200, 230   |

### Neutral

| Token      | Hex     |
| ---------- | ------- |
| `white`    | #FFFFFF |
| `gray-50`  | #F9FAFB |
| `gray-100` | #F3F4F6 |
| `gray-200` | #E5E7EB |
| `gray-300` | #D1D5DB |
| `gray-400` | #9CA3AF |
| `gray-500` | #6B7280 |
| `gray-600` | #4B5563 |
| `gray-700` | #374151 |
| `gray-800` | #1F2937 |
| `gray-900` | #111827 |

### Semantic

| Token        | Hex     | Use                |
| ------------ | ------- | ------------------ |
| `red-500`    | #EF4444 | Error, destructive |
| `green-500`  | #22C55E | Success (alt)      |
| `yellow-500` | #EAB308 | Warning            |
| `blue-500`   | #3B82F6 | Info (alt)         |

---

## Accessibility

### Contrast Ratios (WCAG AA)

| Foreground | Background | Ratio  | Pass  |
| ---------- | ---------- | ------ | ----- |
| White      | Royal-500  | 4.6:1  | AA ✓  |
| White      | Navy       | 12.5:1 | AAA ✓ |
| Gray-900   | White      | 17.4:1 | AAA ✓ |
| Gray-700   | White      | 10.4:1 | AAA ✓ |
| Gray-500   | White      | 4.6:1  | AA ✓  |

### Focus Indicators

- All interactive elements: 2px ring, Royal-500, 2px offset
- Skip to content link for keyboard navigation

### ARIA Patterns

- Modals: `role="dialog"`, `aria-modal="true"`
- Navigation: `<nav>` with `aria-label`
- Buttons: `aria-label` for icon-only buttons
- Forms: `aria-describedby` for error messages
- Loading: `aria-busy="true"`, `aria-live="polite"`
