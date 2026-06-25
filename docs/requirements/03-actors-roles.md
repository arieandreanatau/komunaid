# 03 — ACTOR & ROLE DEFINITION

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Daftar Aktor

| No | Aktor | Deskripsi | Role Spatie | Login URL | Dashboard URL |
|----|-------|-----------|-------------|-----------|---------------|
| 1 | Guest / Public Visitor | Pengunjung belum login | — (guest) | — | — |
| 2 | Member | User registered, role default | `member` | `/login` | `/member/dashboard` |
| 3 | Community Owner | User memiliki/mengelola komunitas | `community_owner` | `/login` | `/community-own/dashboard` |
| 4 | Pengurus Komunitas | User menjadi pengurus komunitas | `community_admin` | `/login` | `/member/dashboard` |
| 5 | Volunteer Komunitas | User volunteer komunitas/event | `community_volunteer` | `/login` | `/member/dashboard` |
| 6 | Brand Owner | User memiliki brand | `brand_owner` | `/login` | `/brand/dashboard` |
| 7 | Brand Staff | Staff yang membantu brand owner | `brand_staff` | `/login` | `/brand/dashboard` |
| 8 | Company Owner | User memiliki perusahaan | `company_owner` | `/login` | `/company/dashboard` |
| 9 | Superadmin | Pemilik/pengelola platform | `superadmin` | `/admin/login` | `/superadmin/dashboard` |
| 10 | Platform Admin | Admin internal platform | `platform_admin` | `/admin/login` | `/superadmin/dashboard` |

---

## 2. Role Permission Matrix (MVP)

| Fitur | Guest | Member | CO | CA | BO | BS | CP | SA | PA |
|-------|:-----:|:------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Lihat homepage | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Lihat komunitas public | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Lihat event public | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Baca blog | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Register | Y | — | — | — | — | — | — | — | — |
| Edit profil | — | Y | Y | Y | Y | Y | Y | Y | Y |
| Join komunitas | — | Y | Y | Y | — | — | — | — | — |
| Daftar event | — | Y | Y | Y | — | — | — | — | — |
| Bookmark | — | Y | Y | Y | — | — | — | — | — |
| Tambah teman | — | Y | Y | Y | — | — | — | — | — |
| Upload galeri | — | Y | Y | Y | — | — | — | — | — |
| Buat komunitas | — | — | Y | — | — | — | — | — | — |
| Kelola komunitas | — | — | Y | Y* | — | — | — | — | — |
| Buat event | — | — | Y | Y* | — | — | — | — | — |
| Buat brand | — | — | — | — | Y | — | — | — | — |
| Kelola brand | — | — | — | — | Y | Y* | — | — | — |
| Buat perusahaan | — | — | — | — | — | — | Y | — | — |
| Kolaborasi brand↔community | — | — | Y | — | Y | Y* | — | — | — |
| Kelola semua data | — | — | — | — | — | — | — | Y | Y* |
| Approve role request | — | — | — | — | — | — | — | Y | Y |
| CMS management | — | — | — | — | — | — | — | Y | Y |
| Master data | — | — | — | — | — | — | — | Y | Y |
| Audit log | — | — | — | — | — | — | — | Y | — |
| Premium/trial | — | — | — | — | — | — | — | Y | — |

> **Legend:** CO=Community Owner, CA=Community Admin, BO=Brand Owner, BS=Brand Staff, CP=Company Owner, SA=Superadmin, PA=Platform Admin. `Y*` = dengan permission terbatas

---

## 3. Role Transisi & Approval Flow

```
Guest → Register → Member (default)
                         │
                         ├── Request Community Owner → Pending → SA Approve → Community Owner
                         ├── Request Brand Owner → Pending → SA Approve → Brand Owner
                         ├── Request Company Owner → Pending → SA Approve → Company Owner
                         └── Skip (Nanti Saja) → Tetap Member
```

### Flow Detail:

1. User register → otomatis mendapat role `member`
2. User bisa request role khusus dari dashboard
3. Request dikirim ke superadmin approval center
4. Superadmin approve → role ditambahkan via Spatie
5. Superadmin reject → alasan ditampilkan ke user
6. User yang belum approve tidak bisa akses dashboard role khusus

---

## 4. Existing Roles (Spatie Seeder)

| Role | Display Name | Jumlah User (Demo) |
|------|-------------|---------------------|
| `superadmin` | Superadmin | 1 |
| `platform_admin` | Platform Admin | 0 |
| `member` | Member | 2 |
| `community_owner` | Community Owner | 2 |
| `community_admin` | Community Admin | 0 |
| `community_volunteer` | Community Volunteer | 0 |
| `brand_owner` | Brand Owner | 1 |
| `company_owner` | Company Owner | 0 |
| `community_staff` | Community Staff | 0 |
| `brand_staff` | Brand Staff | 0 |
