# Design System — KomunaID

## Design Tokens

### Color Palette

#### Brand Colors

```css
/* Navy — Primary dark, used for headers, footers, text */
--color-navy: #0a1d4d;
--color-navy-50: #e8ebf3;
--color-navy-100: #c5cce3;
--color-navy-200: #9eabc9;
--color-navy-300: #7084ab;
--color-navy-400: #4a6393;
--color-navy-500: #0a1d4d;
--color-navy-600: #1a3a9e;
--color-navy-700: #0a1d4d;
--color-navy-800: #081638;
--color-navy-900: #040b1d;

/* Royal — Primary brand, CTAs, links, interactive elements */
--color-royal: #1d4ed8;
--color-royal-50: #ebf0fd;
--color-royal-100: #d1def9;
--color-royal-200: #a3bdf3;
--color-royal-300: #759ced;
--color-royal-400: #477be7;
--color-royal-500: #1d4ed8;
--color-royal-600: #1740b5;
--color-royal-700: #113192;
--color-royal-800: #0b226f;
--color-royal-900: #05134c;

/* Teal — Secondary accent, success states, community */
--color-teal: #11a79b;
--color-teal-50: #e6f7f6;
--color-teal-100: #c0ece9;
--color-teal-200: #81d9d3;
--color-teal-300: #42c6bd;
--color-teal-400: #1bb8af;
--color-teal-500: #11a79b;
--color-teal-600: #0e8a80;
--color-teal-700: #0b6d65;
--color-teal-800: #08504a;
--color-teal-900: #053330;

/* Aqua — Highlight, badges, accent */
--color-aqua: #00c8e6;
--color-aqua-50: #e6f9fc;
--color-aqua-100: #c0f0f8;
--color-aqua-200: #81e1f1;
--color-aqua-300: #42d2ea;
--color-aqua-400: #13c8e6;
--color-aqua-500: #00c8e6;
--color-aqua-600: #00a0b8;
--color-aqua-700: #00788a;
--color-aqua-800: #00505c;
--color-aqua-900: #00282e;
```

#### Neutral Colors

```css
--color-white: #ffffff;
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
--color-black: #000000;
```

#### Semantic Colors

```css
/* Status colors */
--color-success: #11a79b; /* teal-500 */
--color-success-light: #e6f7f6; /* teal-50 */
--color-warning: #eab308;
--color-warning-light: #fef9c3;
--color-error: #ef4444;
--color-error-light: #fef2f2;
--color-info: #3b82f6;
--color-info-light: #eff6ff;
```

---

### Typography

```css
/* Font Family */
--font-family-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

/* Font Sizes */
--font-size-xs: 12px; /* 0.75rem */
--font-size-sm: 14px; /* 0.875rem */
--font-size-base: 16px; /* 1rem */
--font-size-lg: 18px; /* 1.125rem */
--font-size-xl: 20px; /* 1.25rem */
--font-size-2xl: 24px; /* 1.5rem */
--font-size-3xl: 30px; /* 1.875rem */
--font-size-4xl: 36px; /* 2.25rem */

/* Font Weights */
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;

/* Letter Spacing */
--letter-spacing-tight: -0.025em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.025em;
--letter-spacing-wider: 0.05em;
```

---

### Spacing

```css
--space-0: 0px;
--space-px: 1px;
--space-0-5: 2px;
--space-1: 4px;
--space-1-5: 6px;
--space-2: 8px;
--space-2-5: 10px;
--space-3: 12px;
--space-3-5: 14px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-9: 36px;
--space-10: 40px;
--space-12: 48px;
--space-14: 56px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
```

---

### Border Radius

```css
--radius-none: 0px;
--radius-sm: 4px; /* badge, tag */
--radius-md: 6px; /* input, button */
--radius-lg: 8px; /* small card */
--radius-xl: 12px; /* card, large card */
--radius-2xl: 16px; /* modal */
--radius-3xl: 24px; /* large modal */
--radius-full: 9999px; /* avatar, pill */
```

---

### Shadow

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

---

### Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 50;
--z-sticky: 100;
--z-overlay: 200;
--z-modal: 300;
--z-popover: 400;
--z-toast: 500;
--z-tooltip: 600;
```

---

## Component Tokens

### Button

```css
/* Sizes */
--btn-height-sm: 32px;
--btn-height-md: 40px;
--btn-height-lg: 48px;
--btn-padding-sm: 12px;
--btn-padding-md: 16px;
--btn-padding-lg: 32px;
--btn-radius: 8px; /* rounded-lg — consistent across all button sizes */
--btn-font-size-sm: 12px;
--btn-font-size-md: 14px;
--btn-font-size-lg: 16px;

/* Variants */
--btn-default-bg: #1d4ed8;
--btn-default-text: #ffffff;
--btn-default-hover: #1740b5;

--btn-outline-bg: #ffffff;
--btn-outline-text: #374151;
--btn-outline-border: #d1d5db;
--btn-outline-hover: #f9fafb;

--btn-secondary-bg: #f3f4f6;
--btn-secondary-text: #111827;
--btn-secondary-hover: #e5e7eb;

--btn-ghost-bg: transparent;
--btn-ghost-text: #374151;
--btn-ghost-hover: #f3f4f6;

--btn-teal-bg: #11a79b;
--btn-teal-text: #ffffff;
--btn-teal-hover: #0e8a80;

--btn-destructive-bg: #ef4444;
--btn-destructive-text: #ffffff;
--btn-destructive-hover: #dc2626;
```

### Form

```css
--input-height: 40px;
--input-padding: 12px;
--input-radius: 8px;
--input-border: 1px solid #d1d5db;
--input-border-focus: 1px solid #1d4ed8;
--input-border-error: 1px solid #ef4444;
--input-ring-focus: 0 0 0 3px rgba(29, 78, 216, 0.1);
--input-ring-error: 0 0 0 3px rgba(239, 68, 68, 0.1);
--input-font-size: 14px;
--input-bg: #ffffff;
--input-bg-disabled: #f9fafb;
--input-text: #111827;
--input-placeholder: #9ca3af;

--label-font-size: 14px;
--label-font-weight: 500;
--label-color: #374151;
--label-margin-bottom: 4px;

--helper-font-size: 12px;
--helper-color: #6b7280;
--helper-margin-top: 4px;

--error-font-size: 12px;
--error-font-weight: 500;
--error-color: #ef4444;
--error-margin-top: 4px;
```

### Badge

```css
--badge-font-size: 12px;
--badge-font-weight: 500;
--badge-padding-y: 2px;
--badge-padding-x: 8px;
--badge-radius: 9999px;

--badge-default-bg: #f3f4f6;
--badge-default-text: #374151;

--badge-primary-bg: #ebf0fd;
--badge-primary-text: #113192;

--badge-success-bg: #e6f7f6;
--badge-success-text: #0b6d65;

--badge-warning-bg: #fef9c3;
--badge-warning-text: #854d0e;

--badge-destructive-bg: #fef2f2;
--badge-destructive-text: #b91c1c;

--badge-info-bg: #e6f9fc;
--badge-info-text: #00788a;
```

### Card

```css
--card-bg: #ffffff;
--card-border: 1px solid #e5e7eb;
--card-radius: 12px;
--card-padding: 24px;
--card-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
--card-shadow-hover: 0 4px 6px rgba(0, 0, 0, 0.07);
--card-transition: box-shadow 200ms ease;
```

### Modal

```css
--modal-overlay-bg: rgba(0, 0, 0, 0.5);
--modal-overlay-backdrop: blur(4px);
--modal-max-width: 480px;
--modal-max-width-lg: 640px;
--modal-bg: #ffffff;
--modal-radius: 16px;
--modal-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
--modal-padding: 24px;
--modal-header-font-size: 18px;
--modal-header-font-weight: 600;
--modal-body-font-size: 14px;
--modal-body-color: #4b5563;
--modal-footer-gap: 12px;
```

### Table

```css
--table-header-bg: #f9fafb;
--table-header-font-size: 12px;
--table-header-font-weight: 600;
--table-header-color: #6b7280;
--table-header-text-transform: uppercase;
--table-header-letter-spacing: 0.05em;
--table-header-padding: 12px 16px;
--table-header-border: 1px solid #e5e7eb;

--table-row-padding: 12px 16px;
--table-row-border: 1px solid #f3f4f6;
--table-row-hover-bg: #f9fafb;

--table-cell-font-size: 14px;
--table-cell-color: #111827;
--table-cell-secondary-color: #6b7280;

--table-stripe-bg: rgba(249, 250, 251, 0.5);
```

### Alert

```css
--alert-radius: 8px;
--alert-padding: 16px;
--alert-font-size: 14px;
--alert-border-width: 4px;

--alert-info-bg: #eff6ff;
--alert-info-border: #93c5fd;
--alert-info-icon: #3b82f6;
--alert-info-text: #1e40af;

--alert-success-bg: #e6f7f6;
--alert-success-border: #5eead4;
--alert-success-icon: #11a79b;
--alert-success-text: #0b6d65;

--alert-warning-bg: #fffbeb;
--alert-warning-border: #fcd34d;
--alert-warning-icon: #eab308;
--alert-warning-text: #854d0e;

--alert-error-bg: #fef2f2;
--alert-error-border: #fca5a5;
--alert-error-icon: #ef4444;
--alert-error-text: #b91c1c;
```

### Toast

```css
--toast-position-bottom: 24px;
--toast-position-right: 24px;
--toast-width: 360px;
--toast-bg: #ffffff;
--toast-border: 1px solid #e5e7eb;
--toast-radius: 8px;
--toast-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
--toast-padding: 12px 16px;
--toast-font-size: 14px;
--toast-duration: 5000ms;
--toast-animation-duration: 300ms;
```

### Empty State

```css
--empty-state-padding: 48px 0;
--empty-state-max-width: 320px;
--empty-state-icon-size: 80px;
--empty-state-icon-color: #d1d5db;
--empty-state-title-size: 18px;
--empty-state-title-weight: 600;
--empty-state-title-color: #111827;
--empty-state-desc-size: 14px;
--empty-state-desc-color: #6b7280;
```

### Loading State

```css
--skeleton-bg: #e5e7eb;
--skeleton-radius: 4px;
--skeleton-animation-duration: 2s;

--spinner-size-sm: 16px;
--spinner-size-md: 24px;
--spinner-size-lg: 32px;
--spinner-color: #1d4ed8;
--spinner-animation-duration: 1s;
```

---

## Tailwind Config Reference

All tokens above are already configured in `tailwind.config.ts` and `globals.css`. The Tailwind classes map directly:

| Token        | Tailwind Class                          |
| ------------ | --------------------------------------- |
| Brand colors | `navy-*`, `royal-*`, `teal-*`, `aqua-*` |
| Neutral      | `gray-*`                                |
| Font family  | `font-sans`                             |
| Font size    | `text-xs` through `text-4xl`            |
| Font weight  | `font-light` through `font-extrabold`   |
| Spacing      | `p-*`, `m-*`, `gap-*`, `space-*`        |
| Radius       | `rounded-sm` through `rounded-full`     |
| Shadow       | `shadow-xs` through `shadow-2xl`        |
| Z-index      | `z-*`                                   |

---

## Color Usage Rules

1. Use Royal for primary actions (CTAs, links, focus rings)
2. Use Teal for success states and community-related elements
3. Use Navy for dark backgrounds (navbar, footer, admin sidebar)
4. Use Gray scale for text hierarchy and borders
5. Never use brand colors for large background areas except designated sections

## Typography Rules

1. Always use Plus Jakarta Sans
2. Maximum 2 font weights per component
3. Body text: 16px regular, 24px line height
4. Minimum font size: 12px
5. Line height: 1.5 for body, 1.2 for headings

## Spacing Rules

1. Use consistent spacing from the 4px grid
2. Section spacing: 32–64px
3. Component internal spacing: 12–24px
4. Element gaps: 8–16px
5. Never use arbitrary pixel values

## Component Rules

1. All interactive elements must have visible focus states
2. Minimum touch target: 44x44px (mobile)
3. Consistent border radius within component families
4. Consistent shadow elevation levels
5. Smooth transitions (200ms) for hover states

## Button Radius Consistency

All buttons use `rounded-lg` (8px) for border radius, regardless of size variant. This ensures visual consistency across:

- Small buttons (h-8)
- Default buttons (h-10)
- Large buttons (h-12)
- Icon buttons (h-10 w-10)

## Color Token Reference (Corrected)

### Navy Scale

| Token    | Hex     | Use                                             |
| -------- | ------- | ----------------------------------------------- |
| navy     | #0A1D4D | Primary dark (navbar, footer, admin sidebar bg) |
| navy-50  | #E8EBF3 | Light backgrounds                               |
| navy-100 | #C5CCE3 | Borders, subtle backgrounds                     |
| navy-500 | #0A1D4D | Same as base navy                               |
| navy-700 | #0A1D4D | Same as base navy                               |

### Royal Scale

| Token     | Hex     | Use                                |
| --------- | ------- | ---------------------------------- |
| royal     | #1D4ED8 | Primary brand (CTAs, links, focus) |
| royal-50  | #EBF0FD | Light backgrounds                  |
| royal-100 | #D1DEF9 | Badge backgrounds                  |
| royal-500 | #1D4ED8 | Same as base royal                 |
| royal-600 | #1740B5 | Hover state                        |
| royal-700 | #113192 | Badge text                         |

### Teal Scale

| Token    | Hex     | Use                       |
| -------- | ------- | ------------------------- |
| teal     | #11A79B | Success, community accent |
| teal-50  | #E6F7F6 | Success light backgrounds |
| teal-100 | #C0ECE9 | Badge backgrounds         |
| teal-500 | #11A79B | Same as base teal         |
| teal-600 | #0E8A80 | Hover state               |
| teal-700 | #0B6D65 | Badge text                |
