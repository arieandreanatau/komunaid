# Responsive Design — KomunaID

## Breakpoints

| Name | Width       | Tailwind | Target           |
| ---- | ----------- | -------- | ---------------- |
| xs   | 0–639px     | default  | Mobile portrait  |
| sm   | 640–767px   | `sm:`    | Mobile landscape |
| md   | 768–1023px  | `md:`    | Tablet           |
| lg   | 1024–1279px | `lg:`    | Desktop          |
| xl   | 1280px+     | `xl:`    | Wide desktop     |

---

## Public Pages

### Landing Page (`/`)

| Breakpoint | Layout | Navbar     | Hero                | Stats | Features | Cards | Footer |
| ---------- | ------ | ---------- | ------------------- | ----- | -------- | ----- | ------ |
| xs         | 1 col  | Hamburger  | Stacked, full width | 1 col | 1 col    | 1 col | 1 col  |
| sm         | 1 col  | Hamburger  | Stacked, full width | 3 col | 1 col    | 2 col | 2 col  |
| md         | 1 col  | Horizontal | Side by side        | 3 col | 3 col    | 2 col | 4 col  |
| lg         | 1 col  | Horizontal | Side by side        | 3 col | 3 col    | 3 col | 4 col  |
| xl         | 1 col  | Horizontal | Side by side        | 3 col | 3 col    | 4 col | 4 col  |

### Directory Pages (`/communities`, `/events`, `/organizations`)

| Breakpoint | Layout | Navbar     | Search     | Filters  | Grid  | Pagination    |
| ---------- | ------ | ---------- | ---------- | -------- | ----- | ------------- |
| xs         | 1 col  | Hamburger  | Full width | Stacked  | 1 col | Full width    |
| sm         | 1 col  | Hamburger  | Full width | 2 col    | 2 col | Centered      |
| md         | 1 col  | Horizontal | Full width | Row wrap | 2 col | Centered      |
| lg         | 1 col  | Horizontal | Full width | Row      | 3 col | Right aligned |
| xl         | 1 col  | Horizontal | Full width | Row      | 3 col | Right aligned |

### Detail Pages (`/communities/[slug]`, `/events/[slug]`)

| Breakpoint | Layout | Navbar     | Banner            | Info          | Sidebar        | Content    |
| ---------- | ------ | ---------- | ----------------- | ------------- | -------------- | ---------- |
| xs         | 1 col  | Hamburger  | Full width, 120px | Stacked       | Hidden (below) | Full width |
| sm         | 1 col  | Hamburger  | Full width, 160px | Stacked       | Hidden (below) | Full width |
| md         | 1 col  | Horizontal | Full width, 200px | 2 col         | Hidden (below) | Full width |
| lg         | 1 col  | Horizontal | Full width, 200px | 2 col (70/30) | Visible        | Full width |
| xl         | 1 col  | Horizontal | Full width, 200px | 2 col (70/30) | Visible        | Full width |

---

## Auth Pages

### Login, Register, Forgot/Reset Password

| Breakpoint | Layout   | Form Width        | Footer  |
| ---------- | -------- | ----------------- | ------- |
| xs         | Centered | 100% (full width) | Hidden  |
| sm         | Centered | 400px             | Hidden  |
| md         | Centered | 400px             | Visible |
| lg         | Centered | 400px             | Visible |
| xl         | Centered | 400px             | Visible |

---

## Dashboard Pages

### Member Dashboard (`/app/*`)

| Breakpoint | Layout  | Sidebar            | Header     | Content    | Table             |
| ---------- | ------- | ------------------ | ---------- | ---------- | ----------------- |
| xs         | Stacked | Hidden (hamburger) | Full width | Full width | Horizontal scroll |
| sm         | Stacked | Hidden (hamburger) | Full width | Full width | Horizontal scroll |
| md         | Side    | Collapsed (icons)  | Full width | Flex-1     | Horizontal scroll |
| lg         | Side    | Expanded (256px)   | Full width | Flex-1     | Full width        |
| xl         | Side    | Expanded (256px)   | Full width | Flex-1     | Full width        |

### Sidebar Behavior

| Breakpoint | State                  | Trigger        | Width |
| ---------- | ---------------------- | -------------- | ----- |
| xs         | Hidden                 | Hamburger menu | —     |
| sm         | Hidden                 | Hamburger menu | —     |
| md         | Collapsed (icons only) | Toggle button  | 64px  |
| lg         | Expanded               | Toggle button  | 256px |
| xl         | Expanded               | Toggle button  | 256px |

### Community/Organization Management (`/app/community/[id]/*`, `/app/organization/[id]/*`)

| Breakpoint | Layout  | Sidebar            | Header     | Tabs                  | Content    |
| ---------- | ------- | ------------------ | ---------- | --------------------- | ---------- |
| xs         | Stacked | Hidden (hamburger) | Full width | Scrollable horizontal | Full width |
| sm         | Stacked | Hidden (hamburger) | Full width | Scrollable horizontal | Full width |
| md         | Side    | Collapsed (icons)  | Full width | Scrollable horizontal | Flex-1     |
| lg         | Side    | Expanded (256px)   | Full width | Full width            | Flex-1     |
| xl         | Side    | Expanded (256px)   | Full width | Full width            | Flex-1     |

---

## Admin Panel (`/admin/*`)

| Breakpoint | Layout  | Sidebar                | Header     | Content    | Table             |
| ---------- | ------- | ---------------------- | ---------- | ---------- | ----------------- |
| xs         | Stacked | Hidden (hamburger)     | Full width | Full width | Horizontal scroll |
| sm         | Stacked | Hidden (hamburger)     | Full width | Full width | Horizontal scroll |
| md         | Side    | Collapsed (icons)      | Full width | Flex-1     | Horizontal scroll |
| lg         | Side    | Expanded (256px, dark) | Full width | Flex-1     | Full width        |
| xl         | Side    | Expanded (256px, dark) | Full width | Flex-1     | Full width        |

### Admin Sidebar Behavior

| Breakpoint | State             | Theme | Width |
| ---------- | ----------------- | ----- | ----- |
| xs         | Hidden            | —     | —     |
| sm         | Hidden            | —     | —     |
| md         | Collapsed (icons) | Dark  | 64px  |
| lg         | Expanded          | Dark  | 256px |
| xl         | Expanded          | Dark  | 256px |

---

## Component Responsive Behavior

### Table

| Breakpoint | Behavior                  |
| ---------- | ------------------------- |
| xs         | Horizontal scroll wrapper |
| sm         | Horizontal scroll wrapper |
| md         | Horizontal scroll wrapper |
| lg         | Full width                |
| xl         | Full width                |

Implementation: Wrap `<Table>` in `<div className="overflow-x-auto">`.

### Card Grid

| Breakpoint | Columns | Gap  |
| ---------- | :-----: | :--: |
| xs         |    1    | 16px |
| sm         |    2    | 16px |
| md         |    2    | 24px |
| lg         |    3    | 24px |
| xl         |    4    | 32px |

### Modal/Dialog

| Breakpoint | Width                      | Behavior              |
| ---------- | -------------------------- | --------------------- |
| xs         | 100% (minus 32px padding)  | Full screen on mobile |
| sm         | 100% (minus 32px padding)  | Centered              |
| md         | 480px                      | Centered              |
| lg         | 480px / 640px (lg variant) | Centered              |
| xl         | 480px / 640px (lg variant) | Centered              |

### Form

| Breakpoint | Layout  | Label | Input      | Button     |
| ---------- | ------- | ----- | ---------- | ---------- |
| xs         | Stacked | Above | Full width | Full width |
| sm         | Stacked | Above | Full width | Full width |
| md         | Stacked | Above | Full width | Auto width |
| lg         | Stacked | Above | Full width | Auto width |
| xl         | Stacked | Above | Full width | Auto width |

### Toast/Snackbar

| Breakpoint | Position                        | Width     |
| ---------- | ------------------------------- | --------- |
| xs         | Bottom, full width (minus 32px) | Auto      |
| sm         | Bottom right                    | 360px max |
| md         | Bottom right                    | 360px     |
| lg         | Bottom right                    | 360px     |
| xl         | Bottom right                    | 360px     |

### FilterBar

| Breakpoint | Layout             |
| ---------- | ------------------ |
| xs         | Stacked vertically |
| sm         | 2 columns          |
| md         | Row wrap           |
| lg         | Row, no wrap       |
| xl         | Row, no wrap       |

---

## Touch Targets

| Breakpoint | Minimum Touch Target |
| ---------- | -------------------- |
| xs         | 44x44px              |
| sm         | 44x44px              |
| md         | 32x32px (mouse)      |
| lg         | 32x32px (mouse)      |
| xl         | 32x32px (mouse)      |

---

## Typography Scale per Breakpoint

| Element       | xs   | sm   | md   | lg   | xl   |
| ------------- | ---- | ---- | ---- | ---- | ---- |
| Hero headline | 24px | 30px | 36px | 36px | 36px |
| Page title    | 20px | 24px | 24px | 30px | 30px |
| Section title | 18px | 18px | 20px | 24px | 24px |
| Card title    | 16px | 16px | 18px | 20px | 20px |
| Body          | 14px | 14px | 16px | 16px | 16px |
| Caption       | 12px | 12px | 12px | 14px | 14px |
