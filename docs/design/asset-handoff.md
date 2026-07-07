# Asset Handoff Guide — KomunaID

## Overview

Panduan ini menjelaskan cara menyerahkan aset desain ke developer frontend.

---

## File Structure

### Design Files

```
design/
├── figma/                  # Figma project link (shared separately)
├── icons/                  # Icon assets
│   ├── lucide/             # Lucide icons (via lucide-react)
│   └── custom/             # Custom SVG icons (if needed)
├── illustrations/          # Illustration assets
│   ├── empty-states/       # Empty state illustrations
│   ├── errors/             # Error state illustrations
│   └── onboarding/         # Onboarding illustrations
├── images/                 # Static images
│   ├── logos/              # Logo variants
│   ├── banners/            # Default banners
│   └── avatars/            # Default avatar placeholders
└── fonts/                  # Font files (if self-hosted)
    └── plus-jakarta-sans/
```

---

## Icon System

### Primary: Lucide React

- **Package**: `lucide-react` (already installed)
- **Usage**: Import directly from `lucide-react`
- **Size**: 16px (sm), 20px (default), 24px (lg)

```tsx
import { Users, Calendar, Settings, Search } from 'lucide-react';

<Users size={20} className="text-gray-500" />
<Calendar size={16} className="text-royal-500" />
```

### Common Icons by Context

| Context           | Icons                                                     |
| ----------------- | --------------------------------------------------------- |
| Navigation        | Home, Users, Calendar, Bell, Settings, Search             |
| Actions           | Plus, Edit, Trash, Eye, Download, Upload, Filter, SortAsc |
| Status            | Check, X, AlertTriangle, Info, Clock, Loader              |
| Social            | Heart, MessageCircle, Share2, Bookmark                    |
| Media             | Image, File, Link, ExternalLink                           |
| Navigation arrows | ChevronLeft, ChevronRight, ChevronDown, ArrowLeft         |

### Custom Icons

- Format: SVG (inline or component)
- Size: 24x24 viewBox
- Stroke: 2px (consistent with Lucide)
- Color: Current color (inherit from parent)

---

## Illustration System

### Style Guide

- **Style**: Flat/semi-flat, minimal detail
- **Colors**: Use brand palette (navy, royal, teal, aqua, grays)
- **Format**: SVG (preferred) or PNG with transparency
- **Size**: 80x80 (small), 120x120 (medium), 200x200 (large)

### Required Illustrations

| Context                 | Description            | Size    |
| ----------------------- | ---------------------- | ------- |
| Empty: No communities   | Person with binoculars | 120x120 |
| Empty: No events        | Calendar with check    | 120x120 |
| Empty: No posts         | Speech bubble          | 120x120 |
| Empty: No notifications | Bell with slash        | 80x80   |
| Empty: No results       | Magnifying glass       | 80x80   |
| Error: Server           | Server with warning    | 120x120 |
| Error: Network          | Cloud with disconnect  | 120x120 |
| Error: 404              | Lost map               | 160x160 |
| Onboarding: Welcome     | Wave hand              | 120x120 |
| Onboarding: Interests   | Grid of icons          | 120x120 |
| Onboarding: Complete    | Checkmark celebration  | 120x120 |

### Implementation

```tsx
// components/feedback/empty-state.tsx
import { Inbox } from 'lucide-react';

// For simple states, use Lucide icons
<Inbox size={80} className="text-gray-300" />;

// For complex illustrations, use SVG components
import EmptyCommunitySvg from '@/assets/illustrations/empty-community.svg';
<EmptyCommunitySvg width={120} height={120} />;
```

---

## Image Specifications

### Logo

| Variant               | Size    | Format | Use               |
| --------------------- | ------- | ------ | ----------------- |
| Full (horizontal)     | 200x48  | SVG    | Navbar, footer    |
| Icon only             | 32x32   | SVG    | Favicon, app icon |
| Icon + text (stacked) | 120x120 | SVG    | Login page        |

### Avatar

| Variant                | Size  | Format   | Use                  |
| ---------------------- | ----- | -------- | -------------------- |
| User avatar            | 40x40 | WebP/PNG | Comments, list items |
| User avatar (lg)       | 80x80 | WebP/PNG | Profile page         |
| Community logo         | 48x48 | WebP/PNG | Community cards      |
| Community logo (lg)    | 80x80 | WebP/PNG | Community detail     |
| Organization logo      | 48x48 | WebP/PNG | Org cards            |
| Organization logo (lg) | 80x80 | WebP/PNG | Org detail           |

### Banner

| Variant             | Size     | Aspect Ratio | Format   |
| ------------------- | -------- | ------------ | -------- |
| Community banner    | 1200x400 | 3:1          | WebP/JPG |
| Event banner        | 1200x600 | 2:1          | WebP/JPG |
| Organization banner | 1200x400 | 3:1          | WebP/JPG |
| Hero (landing)      | 1200x600 | 2:1          | WebP/JPG |

### Default Placeholders

| Type              | Description         | Fallback                      |
| ----------------- | ------------------- | ----------------------------- |
| User avatar       | Initials on gray bg | `{firstName[0]}{lastName[0]}` |
| Community logo    | Building icon       | Lucide `Building`             |
| Event banner      | Calendar pattern    | Lucide `Calendar`             |
| Organization logo | Briefcase icon      | Lucide `Briefcase`            |

---

## Font

### Plus Jakarta Sans

- **Source**: Google Fonts (loaded via CSS)
- **Weights**: 200–800
- **Import**: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');`
- **Already configured** in `globals.css`

---

## Asset Loading Strategy

### Static Assets

- Place in `apps/web/public/` for direct access
- Use Next.js `Image` component for optimization

```tsx
import Image from 'next/image';

<Image src="/logo.svg" alt="KomunaID" width={200} height={48} priority />;
```

### SVG Icons (inline)

- Small, frequently used icons → inline SVG or Lucide
  -好处: No extra HTTP requests, tree-shakeable

### SVG Illustrations

- Complex illustrations → SVG component files
- Place in `apps/web/src/assets/illustrations/`
- Import as React components

### Images (raster)

- Photos, complex graphics → WebP/JPG
- Use Next.js Image for automatic optimization
- Place in `apps/web/public/images/`

---

## Responsive Image Sizes

### Community Card

```
Mobile:  100% width, 120px banner height
Tablet:  50% width, 140px banner height
Desktop: 33% width, 160px banner height
```

### Event Card

```
Mobile:  100% width, 160px banner height
Tablet:  50% width, 180px banner height
Desktop: 33% width, 200px banner height
```

### Profile Avatar

```
List item:  40x40px
Card:       64x64px
Profile:    96x96px
```

---

## Figma Integration

### Handoff Checklist

- [ ] Figma project link shared with dev team
- [ ] Component library published
- [ ] Design tokens exported (via Figma Tokens plugin)
- [ ] Icon library exported
- [ ] Illustration assets exported as SVG
- [ ] Image assets exported as WebP
- [ ] Responsive variants documented
- [ ] Interaction notes added to Figma comments

### Design-to-Code Mapping

| Figma Feature      | Code Implementation             |
| ------------------ | ------------------------------- |
| Auto Layout        | Flexbox / CSS Grid              |
| Component variants | CVA + Tailwind classes          |
| Design tokens      | CSS variables + Tailwind config |
| Prototyping flows  | React state + routing           |
| Responsive frames  | Tailwind breakpoints            |
