# 06 — FRONTEND ARCHITECTURE

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR, SSG, CSR, RSC |
| UI Library | React 19 | Component system |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| State (Client) | Zustand 5 | Global client state |
| State (Server) | TanStack React Query 5 | Server state caching |
| Forms | React Hook Form + Zod | Form management + validation |
| HTTP Client | Axios | API communication |
| Routing | Next.js App Router (file-based) | Page routing |

---

## App Router Structure

```
apps/web/app/
├── layout.tsx                    Root layout (Providers, metadata, html lang=id)
├── globals.css                   Tailwind + CSS vars + Plus Jakarta Sans
├── page.tsx                      HomePage (Server Component)
├── loading.tsx                   Global loading
├── not-found.tsx                 404 page
├── error.tsx                     Global error boundary (Client)
│
├── login/page.tsx                LoginPage (Client)
├── register/page.tsx             RegisterPage (Client)
├── forgot-password/page.tsx      ForgotPasswordPage (Client)
├── reset-password/page.tsx       ResetPasswordPage (Client) [PLANNED]
│
├── communities/
│   ├── page.tsx                  CommunitiesPage (Client) — directory
│   └── [slug]/page.tsx           CommunityDetailPage (Client)
│
├── events/
│   ├── page.tsx                  EventsPage (Client) — directory
│   └── [slug]/page.tsx           EventDetailPage (Client)
│
├── organizations/
│   ├── page.tsx                  OrganizationsPage (Client) — directory
│   └── [slug]/page.tsx           OrganizationDetailPage (Client) [PLANNED]
│
├── about/page.tsx                AboutPage (Server)
├── faq/page.tsx                  FAQPage (Server)
├── contact/page.tsx              ContactPage (Server)
├── terms/page.tsx                TermsPage (Server)
├── privacy/page.tsx              PrivacyPage (Server)
├── community-guidelines/page.tsx CommunityGuidelinesPage (Server)
├── event-guidelines/page.tsx     EventGuidelinesPage (Server)
│
├── dashboard/                    [PLANNED — all empty]
│   ├── layout.tsx                Dashboard layout (sidebar)
│   ├── page.tsx                  Dashboard overview
│   ├── profile/page.tsx          Profile view/edit
│   ├── notifications/page.tsx    Notification list
│   ├── activity/page.tsx         Activity history
│   ├── interests/page.tsx        Interest management
│   ├── communities/
│   │   ├── page.tsx              My communities
│   │   ├── new/page.tsx          Create community
│   │   └── [id]/
│   │       ├── page.tsx          Community admin panel
│   │       ├── edit/page.tsx     Edit community
│   │       ├── members/page.tsx  Member management
│   │       └── join-requests/page.tsx  Join request management
│   ├── organizations/
│   │   ├── page.tsx              My organizations
│   │   ├── new/page.tsx          Create organization
│   │   └── [id]/
│   │       ├── page.tsx          Org admin panel
│   │       ├── edit/page.tsx     Edit organization
│   │       └── members/page.tsx  Team management
│   └── events/
│       ├── page.tsx              My events
│       └── [id]/
│           ├── page.tsx          Event admin panel
│           └── edit/page.tsx     Edit event
│
└── admin/                        [PLANNED — all empty]
    ├── layout.tsx                Admin layout (sidebar)
    ├── page.tsx                  Admin dashboard
    ├── users/
    │   ├── page.tsx              User management
    │   └── [id]/page.tsx         User detail + role change
    ├── communities/page.tsx      Community approval
    ├── organizations/page.tsx    Organization approval
    ├── reports/page.tsx          Report moderation
    ├── audit-logs/page.tsx       Audit log viewer
    ├── categories/page.tsx       Category management
    └── settings/page.tsx         Platform settings [PLANNED]
```

---

## Component Architecture

### Providers

```
providers.tsx
├── QueryClientProvider (TanStack Query)
│   └── staleTime: 60s
└── AuthProvider (React Context)
    └── Provides: user, isAuthenticated, isLoading, login, logout, updateUser
```

### Layout Hierarchy

```
RootLayout (Server)
├── <html lang="id">
├── <body>
├── <Providers> (QueryClient + Auth)
│   ├── Header (navigation, auth state)
│   ├── <main> (page content)
│   └── Footer
```

### Dashboard Layout (Planned)

```
DashboardLayout (Client)
├── Sidebar
│   ├── Profile link
│   ├── My Communities
│   ├── My Organizations
│   ├── My Events
│   ├── Notifications
│   └── Settings
├── Main content area
└── Mobile responsive menu
```

### Admin Layout (Planned)

```
AdminLayout (Client)
├── AdminSidebar
│   ├── Dashboard
│   ├── Users
│   ├── Communities
│   ├── Organizations
│   ├── Reports
│   ├── Audit Logs
│   ├── Categories
│   └── Settings
├── Main content area
└── Mobile responsive menu
```

---

## State Management

### Zustand — Client State

```typescript
// apps/web/lib/auth.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tokens: Tokens) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}
```

### TanStack Query — Server State

```
Queries:
  - useCommunities(page, limit, search)
  - useCommunity(slug)
  - useEvents(page, limit, search, filters)
  - useEvent(slug)
  - useOrganizations(page, limit, search)
  - useOrganization(slug)
  - useProfile()
  - useNotifications(page, unreadOnly)
  - useActivityHistory(page)
  - useAdminStats()
  - useAdminUsers(page, search, status)
  - useAdminPendingCommunities()
  - useAdminPendingOrganizations()
  - useAdminReports(page, status)
  - useAdminAuditLogs(page, filters)

Mutations:
  - useRegister()
  - useLogin()
  - useLogout()
  - useUpdateProfile()
  - useUpdateInterests()
  - useCreateCommunity()
  - useUpdateCommunity()
  - useJoinCommunity()
  - useLeaveCommunity()
  - useApproveJoinRequest()
  - useCreateOrganization()
  - useUpdateOrganization()
  - useCreateEvent()
  - useRegisterEvent()
  - useCancelEventRegistration()
  - useSubmitReport()
  - useAdminApproveCommunity()
  - useAdminSuspendCommunity()
  - useAdminApproveOrganization()
  - useAdminSuspendOrganization()
  - useAdminSuspendUser()
  - useAdminActivateUser()
  - useAdminChangeRole()
  - useAdminResolveReport()
```

### React Context — Auth State

```
AuthProvider:
  - Mounted once at root
  - Fetches /auth/me on mount
  - Provides auth state to all children
  - Handles 401 redirect
```

---

## Data Fetching Patterns

### Public Pages (Server Components)

```
Landing Page (SSR/SSG):
  - Static content (hero, features, stats)
  - ISR with 60s revalidation

Directory Pages (Client):
  - TanStack Query for data fetching
  - Debounced search input
  - Pagination component
```

### Protected Pages (Client Components)

```
Dashboard Pages:
  - Require auth (middleware check)
  - TanStack Query for data
  - React Hook Form for forms
  - Optimistic updates for mutations
```

### Form Pattern

```
React Hook Form + Zod:
  1. Define schema in @komunaid/shared
  2. Use useForm with zodResolver
  3. Submit → mutation hook → API call
  4. Handle success/error
  5. Invalidate related queries
```

---

## UI Component Design

### Existing Components (@komunaid/ui)

| Component | Props | Purpose |
|-----------|-------|---------|
| Button | variant, size, disabled, loading | Action trigger |
| Card | className, children | Content container |
| Input | label, error, type, placeholder | Form input |

### Planned Components

| Component | Purpose |
|-----------|---------|
| Avatar | User/community/org image |
| Badge | Status indicator |
| Modal | Dialog overlay |
| Dropdown | Menu/actions |
| Pagination | Page navigation |
| Table | Data display |
| Tabs | Content switching |
| Toast/Snackbar | Notification feedback |
| Skeleton | Loading placeholder |
| EmptyState | No data display |
| SearchInput | Debounced search |
| Select | Dropdown selection |
| Textarea | Multi-line input |
| Alert | Warning/error display |
| Sidebar | Navigation sidebar |
| DataTable | Sortable, filterable table |

---

## Routing & Navigation

### Public Navigation

```
Header:
  ├── Logo → /
  ├── Komunitas → /communities
  ├── Event → /events
  ├── Organisasi → /organizations
  ├── Tentang → /about
  ├── [Login] → /login
  └── [Register] → /register
```

### Authenticated Navigation

```
Header (logged in):
  ├── Logo → /
  ├── Komunitas → /communities
  ├── Event → /events
  ├── Organisasi → /organizations
  ├── [Dashboard] → /dashboard
  ├── [Notifications bell]
  └── [Avatar dropdown]
      ├── Profile
      ├── Settings
      └── Logout
```

### Admin Navigation

```
Admin Sidebar:
  ├── Dashboard → /admin
  ├── Users → /admin/users
  ├── Communities → /admin/communities
  ├── Organizations → /admin/organizations
  ├── Reports → /admin/reports
  ├── Audit Logs → /admin/audit-logs
  ├── Categories → /admin/categories
  └── Settings → /admin/settings
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640-1024px | 2 columns, collapsible sidebar |
| Desktop | > 1024px | Full layout, sidebar visible |

### Component Behavior

| Component | Mobile | Desktop |
|-----------|--------|---------|
| Header | Hamburger menu | Full nav |
| Dashboard | Bottom nav | Sidebar |
| Admin | Hamburger + overlay | Fixed sidebar |
| Forms | Full width | Max-width container |
| Tables | Card view | Table view |
| Modals | Full screen | Centered overlay |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
