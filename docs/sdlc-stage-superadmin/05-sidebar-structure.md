# Sidebar Structure — KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan struktur sidebar (navigation panel) untuk panel Super Admin KomunaID, termasuk item navigasi, sub-item, ikon, visibilitas berdasarkan role, dan state interaksi.

---

## 2. Sidebar Layout

```
┌─────────────────────────────┐
│         LOGO / BRAND        │
│        "KomunaID Admin"     │
├─────────────────────────────┤
│                             │
│  📊 Dashboard               │
│  👥 Members                 │
│  🏘️ Communities      ▸      │
│    ├── Approval             │
│    └── Community List       │
│  📅 Events                  │
│  🙋 Volunteers              │
│  🛡️ Moderation              │
│  📝 CMS              ▸      │
│    ├── Pages                │
│    ├── Banners              │
│    └── Media                │
│  🔔 Notifications           │
│  📋 Data Master       ▸     │
│    ├── Categories           │
│    ├── Tags                 │
│    ├── Skills               │
│    ├── Locations            │
│    └── Config               │
│  📜 Audit Log               │
│  🔒 Security                │
│  ⚙️ Settings           ▸    │
│    ├── Profile              │
│    ├── Password             │
│    ├── Notifications        │
│    ├── Platform             │
│    ├── Email                │
│    └── Appearance           │
│                             │
├─────────────────────────────┤
│  Admin Avatar & Name        │
│  Role Badge                 │
│  Logout Button              │
└─────────────────────────────┘
```

---

## 3. Sidebar Items Definition

### 3.1 Top-Level Items

| ID | Label | Icon | URL | Badge | Role Required | Children |
|----|-------|------|-----|-------|---------------|----------|
| `dashboard` | Dashboard | `LayoutDashboard` | `/admin/dashboard` | - | PLATFORM_ADMIN+ | - |
| `members` | Members | `Users` | `/admin/members` | Member count | PLATFORM_ADMIN+ | - |
| `communities` | Communities | `Building2` | `/admin/communities/approval` | Pending count | PLATFORM_ADMIN+ | 2 children |
| `events` | Events | `CalendarDays` | `/admin/events` | - | PLATFORM_ADMIN+ | - |
| `volunteers` | Volunteers | `HeartHandshake` | `/admin/volunteers` | - | PLATFORM_ADMIN+ | - |
| `moderation` | Moderation | `ShieldCheck` | `/admin/moderation` | Unresolved count | PLATFORM_ADMIN+ | - |
| `cms` | CMS | `FileText` | `/admin/cms/pages` | - | PLATFORM_ADMIN+ | 3 children |
| `notifications` | Notifications | `Bell` | `/admin/notifications` | - | PLATFORM_ADMIN+ | - |
| `data-master` | Data Master | `Database` | `/admin/data-master/categories` | - | PLATFORM_ADMIN+ | 5 children |
| `audit-log` | Audit Log | `ScrollText` | `/admin/audit-log` | - | SUPER_ADMIN only | - |
| `security` | Security | `Lock` | `/admin/security` | Alert count | SUPER_ADMIN only | - |
| `settings` | Settings | `Settings` | `/admin/settings/profile` | - | PLATFORM_ADMIN+ | 6 children |

### 3.2 Sub-Item Definitions

#### Communities Children

| Parent ID | ID | Label | Icon | URL | Badge | Role Required |
|-----------|-----|-------|------|-----|-------|---------------|
| `communities` | `community-approval` | Approval | `FileCheck` | `/admin/communities/approval` | Pending count | PLATFORM_ADMIN+ |
| `communities` | `community-list` | Community List | `List` | `/admin/communities/list` | - | PLATFORM_ADMIN+ |

#### CMS Children

| Parent ID | ID | Label | Icon | URL | Badge | Role Required |
|-----------|-----|-------|------|-----|-------|---------------|
| `cms` | `cms-pages` | Pages | `File` | `/admin/cms/pages` | - | PLATFORM_ADMIN+ |
| `cms` | `cms-banners` | Banners | `Image` | `/admin/cms/banners` | - | PLATFORM_ADMIN+ |
| `cms` | `cms-media` | Media | `Upload` | `/admin/cms/media` | - | PLATFORM_ADMIN+ |

#### Data Master Children

| Parent ID | ID | Label | Icon | URL | Badge | Role Required |
|-----------|-----|-------|------|-----|-------|---------------|
| `data-master` | `dm-categories` | Categories | `Tag` | `/admin/data-master/categories` | - | PLATFORM_ADMIN+ |
| `data-master` | `dm-tags` | Tags | `Hash` | `/admin/data-master/tags` | - | PLATFORM_ADMIN+ |
| `data-master` | `dm-skills` | Skills | `Sparkles` | `/admin/data-master/skills` | - | PLATFORM_ADMIN+ |
| `data-master` | `dm-locations` | Locations | `MapPin` | `/admin/data-master/locations` | - | PLATFORM_ADMIN+ |
| `data-master` | `dm-config` | Config | `Sliders` | `/admin/data-master/config` | - | SUPER_ADMIN only |

#### Settings Children

| Parent ID | ID | Label | Icon | URL | Badge | Role Required |
|-----------|-----|-------|------|-----|-------|---------------|
| `settings` | `settings-profile` | Profile | `User` | `/admin/settings/profile` | - | PLATFORM_ADMIN+ |
| `settings` | `settings-password` | Password | `Key` | `/admin/settings/password` | - | PLATFORM_ADMIN+ |
| `settings` | `settings-notifications` | Notifications | `Bell` | `/admin/settings/notifications` | - | PLATFORM_ADMIN+ |
| `settings` | `settings-platform` | Platform | `Globe` | `/admin/settings/platform` | - | SUPER_ADMIN only |
| `settings` | `settings-email` | Email | `Mail` | `/admin/settings/email` | - | SUPER_ADMIN only |
| `settings` | `settings-appearance` | Appearance | `Palette` | `/admin/settings/appearance` | - | SUPER_ADMIN only |

---

## 4. Sidebar Behavior Rules

### 4.1 Visibility Rules

| Rule ID | Condition | Action |
|---------|-----------|--------|
| `VR-001` | Role = MEMBER | Hide entire sidebar, redirect to `/` |
| `VR-002` | Role = PLATFORM_ADMIN | Show all items except SUPER_ADMIN-only items |
| `VR-003` | Role = SUPER_ADMIN | Show all items |
| `VR-004` | `data-master.config` | Hidden for PLATFORM_ADMIN |
| `VR-005` | `audit-log` | Hidden for PLATFORM_ADMIN |
| `VR-006` | `security` | Hidden for PLATFORM_ADMIN |
| `VR-007` | `settings-platform`, `settings-email` | Hidden for PLATFORM_ADMIN |
| `VR-008` | Module disabled via config | Hide entire module item and children |

### 4.2 Active State Rules

| Rule ID | Condition | Active Indicator |
|---------|-----------|-----------------|
| `AS-001` | URL matches item URL exactly | Full background highlight + left border |
| `AS-002` | URL matches any child URL | Parent item gets subtle highlight |
| `AS-003` | URL matches child URL | Child item gets full highlight |
| `AS-004` | URL is a sub-route of item | Parent item gets subtle highlight |

### 4.3 Badge Rules

| Badge | Condition | Color | Refresh Interval |
|-------|-----------|-------|-----------------|
| Pending community count | Count of `PENDING_REVIEW` communities | Orange | 60 seconds |
| Unresolved moderation count | Count of `REPORTED` or `UNDER_REVIEW` reports | Red | 60 seconds |
| Total member count | Total active members | Blue | 300 seconds |
| Security alert count | Count of unacknowledged security alerts | Red | 120 seconds |

### 4.4 Collapse/Expand Rules

| Rule ID | Condition | Behavior |
|---------|-----------|----------|
| `CE-001` | Sidebar collapsed | Show only icons, hide labels |
| `CE-002` | Sub-items visible | Parent item shows expand arrow |
| `CE-003` | Sub-items collapsed | Parent item shows collapse arrow |
| `CE-004` | State persistence | Sidebar collapse state saved in `localStorage` |
| `CE-005` | Mobile responsive | Sidebar converts to drawer/hamburger menu on screens < 768px |

### 4.5 Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowUp` | Move focus to previous item |
| `ArrowDown` | Move focus to next item |
| `ArrowRight` | Expand sub-items if available |
| `ArrowLeft` | Collapse sub-items if available |
| `Enter` | Navigate to focused item |
| `Escape` | Close mobile sidebar drawer |
| `Home` | Move focus to first item |
| `End` | Move focus to last item |

---

## 5. Sidebar Component Structure

### 5.1 Component Hierarchy

```
Sidebar
├── SidebarHeader
│   ├── SidebarLogo
│   └── SidebarBrand
├── SidebarContent
│   ├── SidebarNav
│   │   ├── SidebarNavItem (Dashboard)
│   │   ├── SidebarNavItem (Members)
│   │   ├── SidebarNavGroup (Communities)
│   │   │   ├── SidebarNavSubItem (Approval)
│   │   │   └── SidebarNavSubItem (Community List)
│   │   ├── SidebarNavItem (Events)
│   │   ├── SidebarNavItem (Volunteers)
│   │   ├── SidebarNavItem (Moderation)
│   │   ├── SidebarNavGroup (CMS)
│   │   │   ├── SidebarNavSubItem (Pages)
│   │   │   ├── SidebarNavSubItem (Banners)
│   │   │   └── SidebarNavSubItem (Media)
│   │   ├── SidebarNavItem (Notifications)
│   │   ├── SidebarNavGroup (Data Master)
│   │   │   ├── SidebarNavSubItem (Categories)
│   │   │   ├── SidebarNavSubItem (Tags)
│   │   │   ├── SidebarNavSubItem (Skills)
│   │   │   ├── SidebarNavSubItem (Locations)
│   │   │   └── SidebarNavSubItem (Config)
│   │   ├── SidebarNavItem (Audit Log)
│   │   ├── SidebarNavItem (Security)
│   │   └── SidebarNavGroup (Settings)
│   │       ├── SidebarNavSubItem (Profile)
│   │       ├── SidebarNavSubItem (Password)
│   │       ├── SidebarNavSubItem (Notifications)
│   │       ├── SidebarNavSubItem (Platform)
│   │       ├── SidebarNavSubItem (Email)
│   │       └── SidebarNavSubItem (Appearance)
│   └── SidebarCollapseToggle
└── SidebarFooter
    ├── SidebarUserInfo
    │   ├── SidebarAvatar
    │   ├── SidebarUserName
    │   └── SidebarRoleBadge
    └── SidebarLogout
```

### 5.2 Component Props

#### SidebarProps

```typescript
interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentPath: string;
  userRole: 'SUPER_ADMIN' | 'PLATFORM_ADMIN';
  badges?: SidebarBadges;
}

interface SidebarBadges {
  pendingCommunities?: number;
  unresolvedModerations?: number;
  totalMembers?: number;
  securityAlerts?: number;
}

interface SidebarNavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  url: string;
  badge?: number | string;
  isActive: boolean;
  isVisible: boolean;
  onClick?: () => void;
}

interface SidebarNavGroupProps {
  id: string;
  label: string;
  icon: LucideIcon;
  children: SidebarNavItemProps[];
  isExpanded: boolean;
  isActive: boolean;
  isVisible: boolean;
  onToggle: () => void;
}
```

---

## 6. Sidebar Responsive Behavior

### 6.1 Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | >= 1024px | Full sidebar, collapsible |
| Tablet | 768px - 1023px | Collapsed sidebar (icons only), expandable on hover |
| Mobile | < 768px | Hidden sidebar, hamburger menu trigger |

### 6.2 Mobile Drawer

- Triggered by hamburger menu button in top-left
- Slide-in from left with overlay backdrop
- Tap overlay or swipe left to close
- Auto-close after navigation

---

## 7. Sidebar State Management

### 7.1 State

```typescript
interface SidebarState {
  isCollapsed: boolean;
  expandedGroups: string[];
  activeItem: string;
  activeGroup: string | null;
  mobileDrawerOpen: boolean;
}
```

### 7.2 Persistence

| Key | Storage | TTL |
|-----|---------|-----|
| `sidebar:collapsed` | localStorage | Until manual clear |
| `sidebar:expandedGroups` | localStorage | Until manual clear |

### 7.3 Zustand Store

```typescript
// packages/ui/stores/sidebar-store.ts
interface SidebarStore {
  isCollapsed: boolean;
  expandedGroups: string[];
  toggleCollapse: () => void;
  toggleGroup: (groupId: string) => void;
  setActiveItem: (itemId: string) => void;
  setMobileDrawerOpen: (open: boolean) => void;
}
```

---

## 8. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| ARIA roles | `role="navigation"`, `role="menuitem"`, `role="menubar"` |
| Focus management | Tab through items, Enter to navigate |
| Screen reader | `aria-label` on sidebar, `aria-expanded` on groups |
| Color contrast | Minimum 4.5:1 contrast ratio for text |
| Keyboard shortcuts | Full keyboard navigation support |
| Skip navigation | "Skip to main content" link at top |
