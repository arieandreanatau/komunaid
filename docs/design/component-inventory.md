# Component Inventory — KomunaID

## Status Legend

- ✅ Implemented — Component exists and is functional
- 🔧 Exists — Component file exists, may need enhancement
- 📋 Planned — Needs to be built

---

## Base UI Components (`apps/web/src/components/ui/`)

| Component     | File                | Status | Notes                                                               |
| ------------- | ------------------- | ------ | ------------------------------------------------------------------- |
| Alert         | `alert.tsx`         | ✅     | info, success, warning, error variants                              |
| Avatar        | `avatar.tsx`        | ✅     | Radix UI based, fallback initials                                   |
| Badge         | `badge.tsx`         | ✅     | Multiple variants, pill shape                                       |
| Button        | `button.tsx`        | ✅     | CVA variants: default, destructive, outline, secondary, ghost, link |
| Card          | `card.tsx`          | ✅     | Card, CardHeader, CardContent, CardFooter                           |
| Checkbox      | `checkbox.tsx`      | ✅     | Radix UI based                                                      |
| Dialog        | `dialog.tsx`        | ✅     | Radix UI based, modal + non-modal                                   |
| Dropdown Menu | `dropdown-menu.tsx` | ✅     | Radix UI based                                                      |
| Empty State   | `empty-state.tsx`   | ✅     | Icon + title + description + action                                 |
| Error State   | `error-state.tsx`   | ✅     | Error icon + message + retry                                        |
| Input         | `input.tsx`         | ✅     | With label, error, helper text support                              |
| Label         | `label.tsx`         | ✅     | Radix UI based                                                      |
| Loading State | `loading-state.tsx` | ✅     | Spinner + optional text                                             |
| Pagination    | `pagination.tsx`    | ✅     | Page numbers + prev/next                                            |
| Radio Group   | `radio-group.tsx`   | ✅     | Radix UI based                                                      |
| Scroll Area   | `scroll-area.tsx`   | ✅     | Radix UI based                                                      |
| Select        | `select.tsx`        | ✅     | Radix UI based                                                      |
| Separator     | `separator.tsx`     | ✅     | Radix UI based                                                      |
| Skeleton      | `skeleton.tsx`      | ✅     | Pulse animation                                                     |
| Switch        | `switch.tsx`        | ✅     | Radix UI based                                                      |
| Table         | `table.tsx`         | ✅     | HTML table with styling                                             |
| Tabs          | `tabs.tsx`          | ✅     | Radix UI based                                                      |
| Textarea      | `textarea.tsx`      | ✅     | Auto-resize support                                                 |
| Toast         | `toast.tsx`         | ✅     | Radix UI based                                                      |
| Tooltip       | `tooltip.tsx`       | ✅     | Radix UI based                                                      |

---

## Layout Components (`apps/web/src/components/layout/`)

| Component       | File                   | Status | Notes                                  |
| --------------- | ---------------------- | ------ | -------------------------------------- |
| Header          | `header.tsx`           | 🔧     | Exists, needs mobile menu + responsive |
| Footer          | `footer.tsx`           | 🔧     | Exists, needs responsive layout        |
| Sidebar         | `sidebar.tsx`          | 📋     | Collapsible sidebar for dashboard      |
| AdminSidebar    | `admin-sidebar.tsx`    | 📋     | Dark sidebar for admin panel           |
| Navbar          | `navbar.tsx`           | 📋     | Public navbar (sticky, scroll effect)  |
| DashboardLayout | `dashboard-layout.tsx` | 📋     | Sidebar + content wrapper              |
| AdminLayout     | `admin-layout.tsx`     | 📋     | Admin sidebar + content wrapper        |
| PageHeader      | `page-header.tsx`      | 📋     | Page title + description + actions     |
| Breadcrumb      | `breadcrumb.tsx`       | 📋     | Navigation breadcrumb                  |

---

## Feedback Components (`apps/web/src/components/feedback/`)

| Component      | File                 | Status | Notes                                                 |
| -------------- | -------------------- | ------ | ----------------------------------------------------- |
| Toast          | `toast.tsx`          | ✅     | info, success, warning, error variants                |
| Confirm Dialog | `confirm-dialog.tsx` | ✅     | Reusable confirm/cancel modal                         |
| Progress Bar   | `progress-bar.tsx`   | ✅     | Linear progress indicator                             |
| Spinner        | `spinner.tsx`        | ✅     | Standalone spinner component                          |
| Toast Provider | `toast-provider.tsx` | 📋     | Global toast context (needed for programmatic toasts) |

---

## Feature Components (Planned)

### Auth (`apps/web/src/components/auth/`)

| Component          | Status | Notes                        |
| ------------------ | ------ | ---------------------------- |
| LoginForm          | 📋     | Email + password form        |
| RegisterForm       | 📋     | Multi-step registration form |
| ForgotPasswordForm | 📋     | Email input form             |
| ResetPasswordForm  | 📋     | New password form            |
| AuthGuard          | 📋     | Route protection wrapper     |

### Dashboard (`apps/web/src/components/dashboard/`)

| Component      | Status | Notes                             |
| -------------- | ------ | --------------------------------- |
| StatsCard      | 📋     | Stat card with icon, value, label |
| ActivityFeed   | 📋     | Activity timeline list            |
| UpcomingEvents | 📋     | Event preview cards               |
| QuickActions   | 📋     | Action buttons grid               |

### Community (`apps/web/src/components/community/`)

| Component       | Status | Notes                                |
| --------------- | ------ | ------------------------------------ |
| CommunityCard   | 📋     | Community preview card               |
| CommunityHeader | 📋     | Banner + logo + info                 |
| CommunityTabs   | 📋     | Tab navigation                       |
| MemberList      | 📋     | Member table with actions            |
| JoinRequestList | 📋     | Pending requests with approve/reject |
| PostCard        | 📋     | Post preview card                    |
| PostForm        | 📋     | Create/edit post form                |

### Event (`apps/web/src/components/event/`)

| Component        | Status | Notes                         |
| ---------------- | ------ | ----------------------------- |
| EventCard        | 📋     | Event preview card            |
| EventHeader      | 📋     | Banner + info                 |
| EventForm        | 📋     | Create/edit event form        |
| RegistrationCard | 📋     | Registration status + actions |
| ParticipantList  | 📋     | Participant table             |

### Organization (`apps/web/src/components/organization/`)

| Component          | Status | Notes                     |
| ------------------ | ------ | ------------------------- |
| OrganizationCard   | 📋     | Organization preview card |
| OrganizationHeader | 📋     | Banner + logo + info      |
| TeamMemberList     | 📋     | Team table with actions   |
| InsightDashboard   | 📋     | Analytics cards + charts  |

### Admin (`apps/web/src/components/admin/`)

| Component       | Status | Notes                       |
| --------------- | ------ | --------------------------- |
| AdminStatsCard  | 📋     | Admin stat card             |
| UserTable       | 📋     | User management table       |
| ApprovalCard    | 📋     | Community/org approval card |
| AuditLogTable   | 📋     | Audit log table             |
| CategoryManager | 📋     | Category CRUD interface     |
| ReportCard      | 📋     | Report review card          |

### Profile (`apps/web/src/components/profile/`)

| Component        | Status | Notes                        |
| ---------------- | ------ | ---------------------------- |
| ProfileCard      | 📋     | User profile display         |
| ProfileForm      | 📋     | Edit profile form            |
| AvatarUpload     | 📋     | Avatar upload with preview   |
| InterestSelector | 📋     | Multi-select interest picker |

### Forms (`apps/web/src/components/forms/`)

| Component       | Status | Notes                              |
| --------------- | ------ | ---------------------------------- |
| SearchInput     | 📋     | Search input with icon             |
| FilterBar       | 📋     | Filter dropdowns row               |
| DateRangePicker | 📋     | Date range selection               |
| FileUpload      | 📋     | File upload with preview           |
| RichTextEditor  | 📋     | Markdown/rich text editor (future) |

---

## Shared/HOC Components

| Component      | Status | Notes                         |
| -------------- | ------ | ----------------------------- |
| WithAuth       | 📋     | HOC for auth protection       |
| WithRole       | 📋     | HOC for role-based rendering  |
| InfiniteScroll | 📋     | Infinite scroll wrapper       |
| LazyLoad       | 📋     | Intersection observer wrapper |

---

## Summary

| Category     | Implemented | Exists | Planned | Total  |
| ------------ | :---------: | :----: | :-----: | :----: |
| Base UI      |     25      |   0    |    0    |   25   |
| Layout       |      2      |   0    |    7    |   9    |
| Feedback     |      4      |   0    |    1    |   5    |
| Auth         |      0      |   0    |    5    |   5    |
| Dashboard    |      0      |   0    |    4    |   4    |
| Community    |      0      |   0    |    7    |   7    |
| Event        |      0      |   0    |    5    |   5    |
| Organization |      0      |   0    |    4    |   4    |
| Admin        |      0      |   0    |    6    |   6    |
| Profile      |      0      |   0    |    4    |   4    |
| Forms        |      0      |   0    |    5    |   5    |
| Shared/HOC   |      0      |   0    |    4    |   4    |
| **Total**    |   **31**    | **0**  | **51**  | **82** |

---

## Component Architecture

### File Structure

```
apps/web/src/components/
├── ui/                    # Base UI (shadcn/ui pattern)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── layout/                # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   └── ...
├── feedback/              # Feedback components
│   ├── toast-provider.tsx
│   ├── confirm-dialog.tsx
│   └── ...
├── auth/                  # Auth feature components
├── dashboard/             # Dashboard feature components
├── community/             # Community feature components
├── event/                 # Event feature components
├── organization/          # Organization feature components
├── admin/                 # Admin feature components
├── profile/               # Profile feature components
├── forms/                 # Shared form components
└── providers/             # Context providers
```

### Conventions

1. One component per file
2. Export named + default
3. Use `cn()` for class merging
4. Use CVA for variant-based styling
5. Forward refs for all interactive components
6. TypeScript interfaces for all props
7. Radix UI primitives for complex components
