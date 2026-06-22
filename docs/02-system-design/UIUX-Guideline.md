# KomunaID — UI/UX Guideline

## 1. Design Principle

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Clarity** | Setiap elemen UI harus jelas fungsinya. User tidak boleh bingung apa yang harus dilakukan. |
| **Consistency** | Warna, tipografi, spacing, dan komponen harus konsisten di seluruh halaman. |
| **Accessibility** | Kontras warna cukup, ukuran font minimal 14px, semua elemen bisa diakses dengan keyboard. |
| **Simplicity** | Hindari elemen yang tidak perlu. Fokus pada konten dan aksi utama. |
| **Feedback** | Setiap aksi user harus mendapat feedback (loading, success, error). |

### Design Tokens

| Token | Value |
|-------|-------|
| Border Radius (sm) | `4px` |
| Border Radius (md) | `8px` |
| Border Radius (lg) | `12px` |
| Border Radius (xl) | `16px` |
| Border Radius (full) | `9999px` |
| Shadow (sm) | `0 1px 2px rgba(0,0,0,0.05)` |
| Shadow (md) | `0 4px 6px rgba(0,0,0,0.07)` |
| Shadow (lg) | `0 10px 15px rgba(0,0,0,0.1)` |
| Spacing unit | `4px` (Tailwind default) |

---

## 2. Typography

### Font Family

```css
/* Primary */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | 30px (1.875rem) | 700 | 1.2 | Page title |
| H2 | 24px (1.5rem) | 700 | 1.3 | Section title |
| H3 | 20px (1.25rem) | 600 | 1.4 | Sub-section title |
| H4 | 18px (1.125rem) | 600 | 1.4 | Card title |
| Body Large | 16px (1rem) | 400 | 1.5 | Main content |
| Body | 14px (0.875rem) | 400 | 1.5 | Default text |
| Body Small | 12px (0.75rem) | 400 | 1.5 | Caption, label |
| Button | 14px (0.875rem) | 500 | 1.0 | Button text |

### Tailwind Classes

```html
<h1 class="text-3xl font-bold leading-tight">Page Title</h1>
<h2 class="text-2xl font-bold">Section Title</h2>
<h3 class="text-xl font-semibold">Sub Section</h3>
<h4 class="text-lg font-semibold">Card Title</h4>
<p class="text-base leading-relaxed">Body text large</p>
<p class="text-sm">Default body text</p>
<p class="text-xs text-gray-500">Caption / small text</p>
```

---

## 3. Color Usage

### Brand Colors

| Color Name | Hex | Tailwind Class | Usage |
|-----------|-----|---------------|-------|
| Primary Dark | `#09318E` | `bg-primary-dark` / `text-primary-dark` | Header, footer, sidebar background, primary headings |
| Primary | `#0D7AFC` | `bg-primary` / `text-primary` | Primary buttons, links, active states, icons |
| Primary Light | `#29B8FD` | `bg-primary-light` / `text-primary-light` | Hover states, secondary accents, badges |
| Background | `#E9F2FA` | `bg-background` / `bg-blue-50` | Page background, card backgrounds, subtle fills |
| White | `#FFFFFF` | `bg-white` | Card surfaces, form inputs, modals |

### Semantic Colors

| Semantic | Color | Tailwind | Usage |
|----------|-------|----------|-------|
| Success | `#10B981` | `text-emerald-500` / `bg-emerald-50` | Approved, success messages, active status |
| Warning | `#F59E0B` | `text-amber-500` / `bg-amber-50` | Pending status, warning messages |
| Danger | `#EF4444` | `text-red-500` / `bg-red-50` | Delete actions, error messages, rejected status |
| Info | `#3B82F6` | `text-blue-500` / `bg-blue-50` | Info messages, links |
| Neutral | `#6B7280` | `text-gray-500` | Secondary text, muted content |
| Border | `#E5E7EB` | `border-gray-200` | Borders, dividers |

### Text Colors

| Element | Class | Description |
|---------|-------|-------------|
| Heading | `text-gray-900` | Main headings |
| Body | `text-gray-700` | Body text |
| Secondary | `text-gray-500` | Captions, timestamps |
| Disabled | `text-gray-400` | Disabled text |
| Link | `text-primary hover:text-primary-dark` | Clickable links |
| On Primary | `text-white` | Text on primary-colored backgrounds |

---

## 4. Button Style

### Variants

| Variant | Class | Description |
|---------|-------|-------------|
| Primary | `bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors` | Main CTA, submit forms |
| Secondary | `bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors` | Secondary actions, cancel |
| Danger | `bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors` | Delete, destructive actions |
| Ghost | `hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors` | Tertiary actions |
| Link | `text-primary hover:text-primary-dark font-medium underline` | Inline text actions |

### Sizes

| Size | Class | Usage |
|------|-------|-------|
| SM | `px-3 py-1.5 text-xs` | Small spaces, table actions |
| MD | `px-4 py-2 text-sm` | Default button size |
| LG | `px-6 py-3 text-base` | Main CTAs, hero sections |

### States

| State | Modification |
|-------|-------------|
| Disabled | `opacity-50 cursor-not-allowed pointer-events-none` |
| Loading | `opacity-75 cursor-wait` + spinner icon |
| Active | Ring: `ring-2 ring-primary ring-offset-2` |

### Icon Buttons

```html
<button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors">
    <x-heroicon-s-plus class="w-4 h-4" />
    Buat Komunitas
</button>
```

---

## 5. Card Style

### Standard Card

```html
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <!-- Content -->
</div>
```

| Property | Value |
|----------|-------|
| Background | `bg-white` |
| Border Radius | `rounded-xl` (12px) |
| Shadow | `shadow-sm` |
| Border | `border border-gray-100` |
| Padding | `p-6` (24px) |

### Card Variants

| Variant | Usage | Modification |
|---------|-------|-------------|
| Default | General content | Standard card |
| Interactive | Clickable cards (community, event) | Add `hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer` |
| Stat Card | Dashboard statistics | Add left colored border: `border-l-4 border-primary` |
| Profile Card | User/community/brand profile | Add `overflow-hidden` with banner image on top |

### Community Card

```html
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
    <img src="banner.jpg" class="w-full h-40 object-cover" />
    <div class="p-5">
        <div class="flex items-center gap-3 mb-3">
            <img src="logo.jpg" class="w-10 h-10 rounded-full" />
            <h4 class="font-semibold text-gray-900">Community Name</h4>
        </div>
        <p class="text-sm text-gray-500 mb-3">Location • 230 members</p>
        <p class="text-sm text-gray-700 line-clamp-2">Description...</p>
    </div>
</div>
```

---

## 6. Layout

### Page Layout Structure

```
┌─────────────────────────────────────────────────┐
│                   Navbar                         │
├────────┬────────────────────────────────────────┤
│        │                                        │
│  Side  │         Main Content                   │
│  bar   │                                        │
│        │                                        │
│        │                                        │
│        │                                        │
│        │                                        │
├────────┴────────────────────────────────────────┤
│                   Footer                        │
└─────────────────────────────────────────────────┘
```

### Breakpoints (Tailwind Default)

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop, sidebar visible |
| `xl` | 1280px | Standard desktop |
| `2xl` | 1536px | Large desktop |

### Max Width

| Context | Class | Width |
|---------|-------|-------|
| Content | `max-w-7xl mx-auto` | 1280px |
| Form | `max-w-2xl mx-auto` | 672px |
| Auth | `max-w-md mx-auto` | 448px |
| Dashboard | Full width with padding | — |

### Grid System

```html
<!-- 2 columns on desktop, 1 on mobile -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

<!-- 3 columns on desktop, 2 on tablet, 1 on mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- 4 columns on large desktop -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

---

## 7. Sidebar

### Sidebar Layout

```
┌──────────────────────┐
│  [LOGO KomunaID]     │
├──────────────────────┤
│                      │
│  📊 Dashboard        │  ← Active: bg-primary text-white
│                      │
│  ─── Komunitas ───   │
│  📋 Daftar           │
│  ➕ Buat Baru        │
│                      │
│  ─── Event ───       │
│  📅 Daftar Event     │
│  ➕ Buat Event       │
│                      │
│  ─── Anggota ───     │
│  👥 Kelola Member    │
│                      │
│  ─── Pengaturan ───  │
│  ⚙️ Settings         │
│  👤 Profil           │
│                      │
├──────────────────────┤
│  [Avatar] John Doe   │
│  Community Owner     │
│  [Logout]            │
└──────────────────────┘
```

### Sidebar Styles

| Element | Class |
|---------|-------|
| Container | `w-64 bg-primary-dark text-white min-h-screen flex flex-col` |
| Logo | `px-6 py-5 border-b border-white/10` |
| Section Label | `px-6 pt-4 pb-2 text-xs font-semibold uppercase text-white/50` |
| Nav Item (inactive) | `mx-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-sm font-medium transition-colors` |
| Nav Item (active) | `mx-3 px-3 py-2 rounded-lg bg-white/20 text-white text-sm font-medium` |
| User Section | `px-4 py-3 border-t border-white/10 mt-auto` |

### Mobile Sidebar

```html
<!-- Mobile: hidden by default, toggle with hamburger -->
<div class="lg:hidden fixed inset-0 z-50 bg-black/50" x-show="sidebarOpen">
    <div class="w-64 bg-primary-dark h-full">...</div>
</div>
```

---

## 8. Dashboard UI

### Dashboard Grid Layout

```
┌──────────────────────────────────────────────────────────┐
│  Welcome Back, John! 👋                                  │
├──────────┬──────────┬──────────┬─────────────────────────┤
│  Stats   │  Stats   │  Stats   │  Stats                  │
│  Card 1  │  Card 2  │  Card 3  │  Card 4                 │
├──────────┴──────────┴──────────┴─────────────────────────┤
│                                                          │
│  ┌── Main Content ────────────────────────────────┐     │
│  │                                                 │     │
│  │  Table / List / Grid                            │     │
│  │                                                 │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  ┌── Sidebar Content ─────────────────────────────┐     │
│  │                                                 │     │
│  │  Recent Activity / Quick Actions                │     │
│  │                                                 │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Stats Card

```html
<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 border-primary">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-sm text-gray-500 font-medium">Total Komunitas</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">2</p>
        </div>
        <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <x-heroicon-s-building-library class="w-6 h-6 text-primary" />
        </div>
    </div>
</div>
```

### Data Table

```html
<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Table Header -->
    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">Daftar Komunitas</h3>
        <div class="flex items-center gap-2">
            <input type="text" placeholder="Search..." class="..." />
            <button class="btn-primary">+ Buat Baru</button>
        </div>
    </div>

    <!-- Table Content -->
    <table class="w-full">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
                <th class="px-6 py-3 text-left">Nama</th>
                <th class="px-6 py-3 text-left">Kategori</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-right">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">...</td>
            </tr>
        </tbody>
    </table>
</div>
```

---

## 9. Empty State

### Empty State Component

```html
<div class="text-center py-12">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <x-heroicon-s-inbox class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">Belum Ada Komunitas</h3>
    <p class="text-sm text-gray-500 mb-4">Anda belum membuat komunitas apapun.</p>
    <button class="btn-primary">+ Buat Komunitas Pertama</button>
</div>
```

### Empty State Variants

| Context | Icon | Title | CTA |
|---------|------|-------|-----|
| No Communities | `inbox` | Belum Ada Komunitas | Buat Komunitas |
| No Events | `calendar` | Belum Ada Event | Buat Event |
| No Members | `users` | Belum Ada Anggota | — |
| No Brands | `building-store` | Belum Ada Brand | Buat Brand |
| No Results | `magnifying-glass` | Tidak Ditemukan | Hapus Filter |
| No Role Request | `document-check` | Tidak Ada Request | — |

---

## 10. Error State

### Error Page (404, 403, 500)

```html
<div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
        <p class="text-6xl font-bold text-primary mb-4">404</p>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
        <p class="text-gray-500 mb-6">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <a href="/" class="btn-primary">Kembali ke Beranda</a>
    </div>
</div>
```

### Error States

| Code | Title | Message |
|------|-------|---------|
| 404 | Halaman Tidak Ditemukan | Halaman yang Anda cari tidak ada atau telah dipindahkan. |
| 403 | Akses Ditolak | Anda tidak memiliki izin untuk mengakses halaman ini. |
| 500 | Kesalahan Server | Terjadi kesalahan. Silakan coba lagi nanti. |

### Form Validation Error

```html
<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div class="flex items-center gap-2">
        <x-heroicon-s-exclamation-circle class="w-5 h-5 text-red-500" />
        <p class="text-sm text-red-700 font-medium">Terjadi kesalahan validasi:</p>
    </div>
    <ul class="mt-2 text-sm text-red-600 list-disc list-inside">
        <li>Nama wajib diisi.</li>
        <li>Email sudah terdaftar.</li>
    </ul>
</div>
```

### Flash Messages

| Type | Class | Icon |
|------|-------|------|
| Success | `bg-emerald-50 border-emerald-200 text-emerald-700` | `check-circle` |
| Error | `bg-red-50 border-red-200 text-red-700` | `exclamation-circle` |
| Warning | `bg-amber-50 border-amber-200 text-amber-700` | `exclamation-triangle` |
| Info | `bg-blue-50 border-blue-200 text-blue-700` | `information-circle` |

---

## 11. Mobile Responsive Behavior

### Breakpoint Strategy

| Breakpoint | Layout Changes |
|-----------|---------------|
| `< 640px` (Mobile) | Single column, hamburger menu, bottom nav optional, stacked cards |
| `640px - 768px` (Tablet Portrait) | 2-column grid, sidebar hidden |
| `768px - 1024px` (Tablet Landscape) | Sidebar collapsible, 2-3 column grid |
| `> 1024px` (Desktop) | Full sidebar visible, multi-column layout |

### Mobile Navigation

```
┌─────────────────────┐
│  [☰]  KomunaID  [👤]│
├─────────────────────┤
│                     │
│   Main Content      │
│                     │
│                     │
├─────────────────────┤
│  🏠  📋  📅  👤     │  ← Bottom navigation bar
└─────────────────────┘
```

### Mobile Bottom Nav

```html
<div class="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40">
    <div class="flex justify-around py-2">
        <a href="/" class="flex flex-col items-center gap-1 text-primary">
            <x-heroicon-s-home class="w-5 h-5" />
            <span class="text-xs font-medium">Beranda</span>
        </a>
        <a href="/communities" class="flex flex-col items-center gap-1 text-gray-400">
            <x-heroicon-s-building-library class="w-5 h-5" />
            <span class="text-xs font-medium">Komunitas</span>
        </a>
        <a href="/events" class="flex flex-col items-center gap-1 text-gray-400">
            <x-heroicon-s-calendar class="w-5 h-5" />
            <span class="text-xs font-medium">Event</span>
        </a>
        <a href="/member/profile" class="flex flex-col items-center gap-1 text-gray-400">
            <x-heroicon-s-user class="w-5 h-5" />
            <span class="text-xs font-medium">Profil</span>
        </a>
    </div>
</div>
```

### Responsive Table

```html
<!-- Desktop: table view -->
<div class="hidden md:block">
    <table>...</table>
</div>

<!-- Mobile: card view -->
<div class="md:hidden space-y-4">
    <div class="bg-white rounded-lg border p-4">
        <p class="font-medium">Name</p>
        <p class="text-sm text-gray-500">Details...</p>
    </div>
</div>
```

### Responsive Images

```html
<img src="banner.jpg"
     class="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover rounded-xl" />
```

### Mobile-Friendly Forms

```html
<!-- Full width inputs on mobile -->
<input class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-primary focus:border-primary
              sm:text-sm" />

<!-- Stack buttons on mobile -->
<div class="flex flex-col sm:flex-row gap-3">
    <button class="btn-secondary flex-1">Batal</button>
    <button class="btn-primary flex-1">Simpan</button>
</div>
```
