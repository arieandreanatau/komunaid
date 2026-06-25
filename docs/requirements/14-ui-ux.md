# 14 — UI/UX REQUIREMENT

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Brand Feel

- Modern, Clean, Social platform
- Community-driven, Friendly, Trustworthy
- Growth-oriented

---

## 2. Design Token

| Token | Value | Usage |
|-------|-------|-------|
| Primary Navy Blue | #0B2D89 | Logo, header, footer |
| Primary Blue | #126BFF | Buttons, links, primary actions |
| Cyan Blue | #25B9F2 | Accent, highlights, gradients |
| Light Blue BG | #EEF7FF | Background sections |
| White | #FFFFFF | Card backgrounds |
| Dark Text | #0F172A | Headings |
| Muted Text | #64748B | Descriptions |
| Border | #E2E8F0 | Dividers, inputs |
| Success | #16A34A | Approved, active |
| Warning | #F59E0B | Pending, caution |
| Danger | #DC2626 | Rejected, banned, delete |

---

## 3. Style Guidelines

1. Rounded cards (rounded-xl / rounded-2xl)
2. Soft shadow (shadow-sm / shadow-md)
3. Gradient blue hero (Navy to Cyan)
4. Clean dashboard sidebar
5. Badge status (colored pills)
6. Table modern (striped, hover)
7. Mobile responsive (mobile-first)
8. Empty state illustration/icon
9. Button primary jelas (Primary Blue)
10. CTA besar pada landing page

---

## 4. Component List

| Component | Description |
|-----------|-------------|
| Button (primary, secondary, danger, ghost) | Aksi utama |
| Card (community, event, brand, blog) | Content display |
| Badge (status: pending, approved, rejected) | Status indicator |
| Modal (confirm, form, detail) | Overlay actions |
| Toast / Flash message | Success/error notification |
| Dropdown | Navigation, actions |
| Sidebar (dashboard) | Navigation |
| Navbar (public + admin) | Top navigation |
| Tabs | Content switching |
| Table (data table) | List data |
| Pagination | List navigation |
| Search input | Search |
| Filter sidebar/drawer | Filter UI |
| Avatar (user, community, brand) | Identity |
| Image upload (with preview) | Media |
| Rich text editor | Blog/CMS content |
| Empty state | No data |
| Loading skeleton | Loading state |
| Language switcher | Multilanguage |
| Form input (text, email, password, textarea, select, checkbox) | Forms |

---

## 5. Navigation Structure

### Public Navigation

Logo | Beranda | Komunitas | Event | Blog | Tentang Kami | Hubungi Kami | Masuk | Daftar

### Member Sidebar

Dashboard | Profil | Role Request | Komunitas Saya | Event Saya | Bookmark(V2) | Teman(V2) | Galeri(V2) | History(V2) | Wallet | Donasi | Pengaturan | Logout

### Community Owner Sidebar

Dashboard | Komunitas(List/Tambah/Pengurus/Volunteer/Region/Subgroup) | Event(List/Tambah/Registrasi/Gallery/Chat) | Kolaborasi | Wallet | Donasi | Logout

### Brand Owner Sidebar

Dashboard | Brand(List/Tambah) | Campaign(List/Tambah) | Kolaborasi | Staff | Komunitas | Logout

### Superadmin Sidebar

Dashboard | Approval Center | Users | Communities | Brands | Companies | Events | Master Data(Kategori/Interest/Regional/Jenis Event) | CMS(Beranda/Blog/Tentang Kami/Hubungi Kami/Saran) | Metrics | Login Activity | Audit Log | Wallets | Donations | Platform Fees | Premium/Trial | Chat Admin | Pengaturan | Logout
