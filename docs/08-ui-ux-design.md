# KomunaID - Wireframe & UI/UX Design

## Color System

```css
:root {
    --navy: #09318E;
    --blue: #0D7AFC;
    --sky-blue: #29B8FD;
    --soft-bg: #E9F2FA;
    --white: #FFFFFF;
    --gray-100: #F3F4F6;
    --gray-200: #E5E7EB;
    --gray-300: #D1D5DB;
    --gray-500: #6B7280;
    --gray-700: #374151;
    --gray-900: #111827;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
}
```

## Typography

- Headings: Inter / Poppins Bold
- Body: Inter / Poppins Regular
- Font sizes follow Tailwind defaults

## Layout Patterns

### Guest Layout (Public)
```
┌──────────────────────────────────────────┐
│  Logo          Menu1  Menu2  [Login]     │  ← Navbar
├──────────────────────────────────────────┤
│                                          │
│            HERO SECTION                  │
│         Headline + CTA                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│           FEATURES SECTION               │
│         Grid 3 columns                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│        POPULAR COMMUNITIES               │
│         Card grid                        │
│                                          │
├──────────────────────────────────────────┤
│              FOOTER                      │
└──────────────────────────────────────────┘
```

### Dashboard Layout (Authenticated)
```
┌──────────────────────────────────────────┐
│  Logo    Search    Notifications  Avatar │  ← Top navbar
├──────────┬───────────────────────────────┤
│          │                               │
│ Sidebar  │       Main Content            │
│          │                               │
│ Menu 1   │   ┌─────┐ ┌─────┐ ┌─────┐   │
│ Menu 2   │   │Stat │ │Stat │ │Stat │   │
│ Menu 3   │   └─────┘ └─────┘ └─────┘   │
│ Menu 4   │                               │
│ Menu 5   │   ┌───────────────────────┐   │
│          │   │   Table / Content     │   │
│          │   │                       │   │
│          │   └───────────────────────┘   │
│          │                               │
├──────────┴───────────────────────────────┤
│              FOOTER                      │
└──────────────────────────────────────────┘
```

## Component Patterns

### Card Component
```
┌─────────────────────────┐
│  [Logo/Image]           │
│                         │
│  Title                  │
│  Description (2 lines)  │
│  Meta: Location, Members│
│                         │
│  [Join] [View Detail]   │
└─────────────────────────┘
```

### Table Component
```
┌────┬──────────┬──────────┬──────────┬──────────┐
│ #  │ Name     │ Status   │ Date     │ Action   │
├────┼──────────┼──────────┼──────────┼──────────┤
│ 1  │ Komunitas│ Pending  │ 1 Jan    │ [App][Rej]│
│ 2  │ Brand X  │ Approved │ 2 Jan    │ [View]   │
└────┴──────────┴──────────┴──────────┴──────────┘
```

### Form Patterns
```
┌──────────────────────────────────┐
│  Form Title                      │
├──────────────────────────────────┤
│                                  │
│  Label                           │
│  ┌────────────────────────────┐  │
│  │ Input                      │  │
│  └────────────────────────────┘  │
│  Error message (if any)          │
│                                  │
│  Label                           │
│  ┌────────────────────────────┐  │
│  │ Textarea                   │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│  [Cancel]              [Submit]  │
└──────────────────────────────────┘
```

## Page Blueprints

### Landing Page
- Hero: Headline "Connect. Collaborate. Grow." + CTA buttons
- Stats: Jumlah komunitas, member, brand, event
- Popular Communities: Grid 6 cards
- How It Works: 4 step illustration
- Testimonials
- CTA section

### Community List Page
- Search bar + category filter
- Grid of community cards (3 columns)
- Pagination
- Sidebar: Popular categories, recent communities

### Community Detail Page
- Banner image
- Logo + name + description
- Stats: members, events, posts
- Join button (if not member)
- Tabs: About, Members, Events, Gallery, Posts

### Dashboard (Superadmin)
- Stat cards: Total members, communities, brands, events, revenue
- Charts: Registration trend, revenue trend
- Quick actions: Pending approvals
- Recent activity list

### Dashboard (Community Owner)
- Stat cards: Total members, events, posts
- Member growth chart
- Upcoming events
- Recent joins
- Pending approvals (member joins)

### Dashboard (Brand Owner)
- Stat cards: Total campaigns, collaborations
- Campaign performance
- Active collaborations
- Recent activity

### Member Dashboard
- Welcome message
- Joined communities list
- Upcoming events
- Wallet balance
- Recent activity
