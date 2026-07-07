# Accessibility — KomunaID

## Standards

- **Target**: WCAG 2.1 Level AA
- **Scope**: All MVP screens and components

---

## 1. Keyboard Navigation

### Global

- All interactive elements must be focusable via `Tab`
- Focus order must follow visual order
- Skip-to-content link as first focusable element
- `Escape` closes modals, dropdowns, menus

### Skip Link

```html
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:p-4 focus:bg-white focus:text-royal-500"
>
  Skip to content
</a>
```

### Focus Indicators

- All interactive elements: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-500 focus-visible:ring-offset-2`
- Minimum ring width: 2px
- Ring offset: 2px

### Keyboard Shortcuts

| Action               | Key             | Context                    |
| -------------------- | --------------- | -------------------------- |
| Navigate items       | `↑` `↓`         | Lists, menus               |
| Select item          | `Enter` `Space` | Buttons, links, checkboxes |
| Open dropdown        | `Enter` `Space` | Dropdown triggers          |
| Close dropdown/modal | `Escape`        | Any open overlay           |
| Submit form          | `Enter`         | Form fields                |
| Tab through form     | `Tab`           | Form fields                |

---

## 2. ARIA Attributes

### Landmarks

| Element    | ARIA                               | Usage                  |
| ---------- | ---------------------------------- | ---------------------- |
| `<header>` | `role="banner"`                    | Site header (implicit) |
| `<nav>`    | `role="navigation"` + `aria-label` | Navigation             |
| `<main>`   | `role="main"`                      | Main content           |
| `<footer>` | `role="contentinfo"`               | Site footer (implicit) |
| `<aside>`  | `role="complementary"`             | Sidebar                |

### Common Patterns

#### Modal/Dialog

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Title</h2>
  <!-- content -->
</div>
```

#### Dropdown Menu

```html
<button aria-haspopup="true" aria-expanded="{isOpen}">Menu</button>
<div role="menu" aria-label="User menu">
  <button role="menuitem">Item 1</button>
  <button role="menuitem">Item 2</button>
</div>
```

#### Tab List

```html
<div role="tablist" aria-label="Community sections">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Tab 2</button>
</div>
<div role="tabpanel" id="panel-1">Content 1</div>
<div role="tabpanel" id="panel-2" hidden>Content 2</div>
```

#### Alert

```html
<div role="alert" aria-live="assertive">Error message</div>
```

#### Status (Toast)

```html
<div role="status" aria-live="polite">Success message</div>
```

#### Loading

```html
<div aria-busy="true" aria-live="polite">Loading...</div>
```

#### Progress Bar

```html
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>
```

#### Badge (Notification Count)

```html
<span aria-label="5 unread notifications">5</span>
```

#### Avatar (Image)

```html
<img alt="Profile photo of John Doe" src="..." />
```

#### Avatar (Fallback)

```html
<div aria-label="John Doe avatar">JD</div>
```

---

## 3. Focus State Management

### Focus Trap

- Modals must trap focus within the modal
- When modal opens, focus moves to first focusable element
- When modal closes, focus returns to trigger element
- Tab cycles within modal only

### Focus Restoration

- When sidebar collapses, focus moves to content
- When mobile menu closes, focus returns to hamburger button
- When toast appears, focus is not moved (non-intrusive)

### Visible Focus

- Never use `outline: none` without replacement
- Ring must be visible on all backgrounds
- Minimum contrast: 3:1 against adjacent colors

---

## 4. Color Contrast

### Text Contrast (WCAG AA: 4.5:1 normal, 3:1 large)

| Foreground          | Background          | Ratio  | Status          |
| ------------------- | ------------------- | ------ | --------------- |
| Gray-900 (#111827)  | White (#FFFFFF)     | 17.4:1 | AAA ✓           |
| Gray-700 (#374151)  | White (#FFFFFF)     | 10.4:1 | AAA ✓           |
| Gray-500 (#6B7280)  | White (#FFFFFF)     | 4.6:1  | AA ✓            |
| Gray-400 (#9CA3AF)  | White (#FFFFFF)     | 3.0:1  | Large text only |
| Royal-500 (#1D4ED8) | White (#FFFFFF)     | 4.6:1  | AA ✓            |
| White (#FFFFFF)     | Royal-500 (#1D4ED8) | 4.6:1  | AA ✓            |
| White (#FFFFFF)     | Navy (#0A1D4D)      | 12.5:1 | AAA ✓           |
| White (#FFFFFF)     | Teal-500 (#11A79B)  | 3.1:1  | Large text only |

### Non-Text Contrast (WCAG AA: 3:1)

| Element            | Foreground | Background | Ratio | Status                           |
| ------------------ | ---------- | ---------- | ----- | -------------------------------- |
| Focus ring         | Royal-500  | White      | 4.6:1 | AA ✓                             |
| Input border       | Gray-300   | White      | 2.3:1 | Use Gray-400 for focus           |
| Input focus border | Royal-500  | White      | 4.6:1 | AA ✓                             |
| Button border      | Gray-300   | White      | 2.3:1 | Acceptable (accompanied by text) |

---

## 5. Alt Text Guidelines

### Images

| Type                       | Alt Text Format         | Example                                   |
| -------------------------- | ----------------------- | ----------------------------------------- |
| User avatar                | "[Name] profile photo"  | "John Doe profile photo"                  |
| Community logo             | "[Community name] logo" | "React Jakarta logo"                      |
| Event banner               | "[Event name] banner"   | "Tech Meetup 2026 banner"                 |
| Organization logo          | "[Org name] logo"       | "Google Indonesia logo"                   |
| Decorative illustration    | `alt=""` (empty)        | —                                         |
| Informational illustration | Descriptive text        | "Illustration of community collaboration" |

### Icons

- Icon-only buttons: `aria-label` describes action
- Decorative icons: `aria-hidden="true"`
- Informational icons: accompany text or have `aria-label`

---

## 6. Heading Structure

### Rules

- Only one `<h1>` per page
- Headings must not skip levels (h1 → h3)
- Headings must be nested logically

### Page Heading Hierarchy

```
<h1> Page Title </h1>
  <h2> Section Title </h2>
    <h3> Subsection Title </h3>
  <h2> Section Title </h2>
```

### Example: Community Detail Page

```
<h1> Community Name </h1>
  <h2> Tentang </h2>
    <h3> Deskripsi </h3>
    <h3> Informasi Kontak </h3>
  <h2> Postingan </h2>
    <h3> Post Title </h3>
  <h2> Event </h2>
  <h2> Anggota </h2>
```

---

## 7. Form Accessibility

### Labels

- Every input must have a visible `<label>` or `aria-label`
- Labels must be associated with inputs via `htmlFor`/`id`
- Required fields: `aria-required="true"` + visual indicator (*)

### Error Messages

- Error messages must be associated via `aria-describedby`
- Error messages must use `role="alert"` for screen readers
- Focus must move to first error on submit

### Example

```html
<div>
  <label htmlFor="email">Email *</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
    aria-invalid="{hasError}"
  />
  {hasError && (
  <p id="email-error" role="alert" className="text-red-500 text-xs">Email tidak valid</p>
  )}
</div>
```

### Validation

- Inline validation on blur
- Summary of errors at top of form on submit
- First error field receives focus

---

## 8. Screen Reader Support

### Live Regions

- Toast notifications: `aria-live="polite"` + `role="status"`
- Error alerts: `aria-live="assertive"` + `role="alert"`
- Loading states: `aria-busy="true"` + `aria-live="polite"`
- Dynamic content updates: `aria-live="polite"`

### Hidden Content

- Use `sr-only` class for screen-reader-only text
- Use `aria-hidden="true"` for decorative elements

### Announcements

- Page title changes: Update `<title>` tag
- Route changes: Announce to live region
- Form submission success/failure: Announce result

---

## 9. Responsive Accessibility

### Mobile

- Minimum touch target: 44x44px
- Adequate spacing between interactive elements
- No hover-only interactions

### Tablet

- Support both touch and mouse
- No hover-dependent functionality

### Desktop

- Full keyboard navigation
- Mouse + keyboard support

---

## 10. Testing Checklist

- [ ] All pages navigable via keyboard only
- [ ] All interactive elements have visible focus
- [ ] Skip-to-content link works
- [ ] All images have appropriate alt text
- [ ] All forms have associated labels
- [ ] All error messages are announced
- [ ] All modals trap focus correctly
- [ ] All color contrast meets WCAG AA
- [ ] All heading levels are logical
- [ ] All ARIA attributes are correct
- [ ] Screen reader can navigate all content
- [ ] No content is inaccessible without color
- [ ] All animations respect `prefers-reduced-motion`
