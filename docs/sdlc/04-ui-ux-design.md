# Tahap 4 — UI/UX Design

## Ringkasan

| Item        | Detail                            |
| ----------- | --------------------------------- |
| **Project** | KomunaID                          |
| **Tahap**   | 4 — UI/UX Design (Design Handoff) |
| **Status**  | Selesai                           |
| **Tanggal** | 2026-07-07                        |
| **Oleh**    | AI Engineering Agent              |

## Tujuan

Menerjemahkan requirement dari Tahap 1–3 menjadi:

1. Struktur halaman & route map MVP
2. Information architecture
3. User flow utama
4. Design system & design token
5. Wireframe notes
6. UI specification
7. Component inventory
8. Asset handoff guide
9. Frontend foundation files (design tokens, base components)

## Deliverables

### Dokumen Desain

| File                                      | Deskripsi                                     |
| ----------------------------------------- | --------------------------------------------- |
| `docs/design/sitemap.md`                  | Peta seluruh halaman MVP (71 routes)          |
| `docs/design/information-architecture.md` | Hierarki konten & navigasi                    |
| `docs/design/user-flow.md`                | Alur pengguna (23 flows)                      |
| `docs/design/user-journeys.md`            | Perjalanan pengguna per role (9 roles)        |
| `docs/design/screen-inventory.md`         | Inventaris seluruh halaman (75 screens)       |
| `docs/design/wireframe-notes.md`          | Catatan wireframe per halaman (18 wireframes) |
| `docs/design/ui-specification.md`         | Spesifikasi UI detail                         |
| `docs/design/design-system.md`            | Design token & aturan visual                  |
| `docs/design/component-inventory.md`      | Inventaris komponen UI (82 components)        |
| `docs/design/asset-handoff.md`            | Panduan handoff aset ke developer             |
| `docs/design/responsive-design.md`        | Spesifikasi responsive design                 |
| `docs/design/accessibility.md`            | Standar aksesibilitas WCAG 2.1 AA             |
| `docs/design/ui-states.md`                | Seluruh state UI                              |
| `docs/design/role-based-ui.md`            | UI per role pengguna                          |
| `docs/design/developer-handoff.md`        | Spesifikasi per halaman untuk developer       |

### Frontend Foundation Files

| File                                 | Deskripsi                                                          |
| ------------------------------------ | ------------------------------------------------------------------ |
| `apps/web/src/lib/design-tokens.ts`  | Design token centralized (corrected navy-500 alias)                |
| `apps/web/src/components/ui/*`       | Base UI components (25 components)                                 |
| `apps/web/src/components/layout/*`   | Layout components (header with ARIA, skip-link, footer)            |
| `apps/web/src/components/feedback/*` | Feedback components (toast, confirm-dialog, progress-bar, spinner) |

## Route Map MVP

### Public Routes (13)

```
/                       → Landing page
/about                  → Tentang KomunaID
/communities            → Directory komunitas
/communities/[slug]     → Detail komunitas
/organizations          → Directory organisasi
/organizations/[slug]   → Detail organisasi
/events                 → Directory event
/events/[slug]          → Detail event
/faq                    → FAQ
/contact                → Hubungi kami
/terms                  → Syarat & ketentuan
/privacy                → Kebijakan privasi
/community-guideline    → Pedoman komunitas
/event-guideline        → Pedoman event
```

### Auth Routes (4)

```
/login                  → Masuk
/register               → Daftar
/forgot-password        → Lupa password
/reset-password         → Reset password
```

### Member Routes (12)

```
/app                    → Dashboard anggota
/app/profile            → Profil
/app/interests          → Minat & preferensi
/app/communities        → Komunitas saya
/app/communities/create → Buat komunitas
/app/organizations      → Organisasi saya
/app/organizations/create → Buat organisasi
/app/events             → Event saya
/app/notifications      → Notifikasi
/app/activity           → Aktivitas
/app/bookmarks          → Bookmark
/app/reports            → Laporan saya
/app/settings           → Pengaturan
```

### Community Routes (12)

```
/app/community/[id]/overview        → Ringkasan
/app/community/[id]/profile         → Profil komunitas
/app/community/[id]/members         → Anggota
/app/community/[id]/join-requests   → Permintaan bergabung
/app/community/[id]/roles           → Manajemen role
/app/community/[id]/events          → Event komunitas
/app/community/[id]/events/create   → Buat event
/app/community/[id]/participants    → Peserta
/app/community/[id]/posts           → Postingan
/app/community/[id]/posts/create    → Buat postingan
/app/community/[id]/reports         → Laporan
/app/community/[id]/settings        → Pengaturan
```

### Organization Routes (10)

```
/app/organization/[id]/overview      → Ringkasan
/app/organization/[id]/profile       → Profil organisasi
/app/organization/[id]/team          → Tim
/app/organization/[id]/events        → Event
/app/organization/[id]/events/create → Buat event
/app/organization/[id]/participants  → Peserta
/app/organization/[id]/content       → Konten
/app/organization/[id]/content/create → Buat konten
/app/organization/[id]/insight       → Insight & analytics
/app/organization/[id]/settings      → Pengaturan
```

### Admin Routes (16)

```
/admin                       → Dashboard admin
/admin/users                 → Manajemen pengguna
/admin/users/[id]            → Detail pengguna
/admin/roles                 → Manajemen role
/admin/roles/[id]            → Detail role
/admin/community-approval    → Persetujuan komunitas
/admin/community-approval/[id] → Detail persetujuan komunitas
/admin/organization-approval → Persetujuan organisasi
/admin/organization-approval/[id] → Detail persetujuan organisasi
/admin/events                → Manajemen event
/admin/events/[id]           → Detail event
/admin/categories            → Manajemen kategori
/admin/categories/[id]       → Detail kategori
/admin/reports               → Laporan moderasi
/admin/reports/[id]          → Detail laporan
/admin/analytics             → Analitik platform
/admin/audit-log             → Log audit
/admin/settings              → Pengaturan platform
```

### Error Routes (4)

```
/403                        → Akses ditolak
/404                        → Halaman tidak ditemukan
/500                        → Server error
/maintenance                → Pemeliharaan
```

## Design System Summary

### Warna Utama

| Token | Hex     | Kegunaan                     |
| ----- | ------- | ---------------------------- |
| Navy  | #0A1D4D | Primary dark, navbar, footer |
| Royal | #1D4ED8 | Primary brand, links, CTAs   |
| Teal  | #11A79B | Secondary accent, success    |
| Aqua  | #00C8E6 | Highlight, badges            |

### Typography

- **Font Family**: Plus Jakarta Sans
- **Scale**: 12px → 48px (xs → 4xl)

### Spacing

- **Base unit**: 4px
- **Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32

### Border Radius

- **sm**: 4px (badge, tag)
- **md**: 6px (input, button)
- **lg**: 8px (card small)
- **xl**: 12px (card)
- **2xl**: 16px (modal)
- **full**: 9999px (avatar, pill)

### Shadow

- **sm**: Subtle elevation
- **md**: Cards, dropdowns
- **lg**: Modals, popovers

## Komponen UI

### Base (25 komponen sudah ada)

Button, Input, Label, Textarea, Checkbox, Radio Group, Switch, Select, Avatar, Badge, Card, Dialog, Dropdown Menu, Tabs, Toast, Tooltip, Table, Separator, Scroll Area, Skeleton, Pagination, Alert, Empty State, Error State, Loading State

### Layout (2 komponen)

Header, Footer

### Feedback (akan ditambah)

Toast notification, Snackbar, Progress indicator

## Checklist Tahap 4

- [x] Dokumen SDLC tahap 4 dibuat
- [x] Sitemap MVP dibuat (71 routes)
- [x] Information architecture dibuat
- [x] User flow untuk semua role dibuat (23 flows)
- [x] User journey untuk 9 role dibuat
- [x] Screen inventory lengkap (75 screens)
- [x] Wireframe notes untuk semua halaman dibuat (18 wireframes)
- [x] UI specification dibuat
- [x] Design system & design token dibuat (fixed inconsistencies)
- [x] Component inventory dibuat (82 components)
- [x] Asset handoff guide dibuat
- [x] Responsive design documentation dibuat
- [x] Accessibility documentation dibuat (WCAG 2.1 AA)
- [x] UI states documentation dibuat
- [x] Role-based UI documentation dibuat
- [x] Developer handoff documentation dibuat (30 screens)
- [x] Design token TypeScript file dibuat (corrected)
- [x] Frontend foundation files diperiksa/diperbarui
- [x] Button radius inconsistency fixed (rounded-md → rounded-lg)
- [x] Navy-500 color aliasing fixed
- [x] globals.css CSS variables completed
- [x] Header ARIA labels added
- [x] Skip-to-content link added
- [x] Mobile menu aria-expanded added
- [x] Semua deliverables terdokumentasi

## Dependencies

### Input dari Tahap Sebelumnya

- Tahap 1: Requirement gathering → user needs, feature list
- Tahap 1a: Remediation → revised scope
- Architecture: Monorepo structure, tech stack decisions

### Input ke Tahap Selanjutnya

- Tahap 5: Frontend development → implement components
- Tahap 6: Backend development → API integration
- Tahap 7: Testing → UI/UX testing
