# User Journeys — KomunaID

## 1. Guest / Visitor

### Objective

Menemukan komunitas, event, atau organisasi yang relevan, dan mendaftar akun.

### Entry Point

- Direct URL
- Search engine
- Social media link
- Word of mouth

### Preconditions

- Tidak login
- Akses internet

### Happy Path

```
1. Buka landing page (/)
2. Lihat hero section, fitur, statistik
3. Klik "Komunitas" → /communities
4. Filter berdasarkan kategori/lokasi
5. Klik komunitas → /communities/[slug]
6. Lihat detail komunitas
7. Klik "Daftar" → /register
8. Isi form registrasi (3 langkah)
9. Verifikasi email
10. Redirect ke dashboard (/app)
```

### Alternative Flow

- Langsung ke /events untuk mencari event
- Langsung ke /organizations untuk mencari organisasi
- Klik "Masuk" jika sudah punya akun → /login

### Error Flow

- Email sudah terdaftar → pesan error, saran login
- Username sudah digunakan → pesan error, saran alternatif
- Password lemah → tampilkan persyaratan
- Koneksi lambat → loading indicator

### Exit Point

- Berhasil login → /app
- Membuka link eksternal
- Menutup browser

---

## 2. Member / User

### Objective

Mengelola profil, bergabung dengan komunitas/event, dan berpartisipasi.

### Entry Point

- /login (setelah register)
- / (landing page → login)

### Preconditions

- Akun terdaftar
- Email terverifikasi (opsional)

### Happy Path

```
1. Login → /app (dashboard)
2. Lihat ringkasan profil, komunitas, event
3. Klik "Komunitas" → /app/communities
4. Jelajahi komunitas yang diikuti
5. Klik komunitas → /app/community/[id]/overview
6. Baca postingan, lihat event
7. Klik "Event" → lihat event mendatang
8. Klik "Daftar" → registrasi event
9. Cek notifikasi → /app/notifications
10. Edit profil → /app/profile
```

### Alternative Flow

- Buat komunitas baru → /app/communities/create
- Buat organisasi baru → /app/organizations/create
- Bookmark komunitas → /app/bookmarks
- Lihat aktivitas → /app/activity
- Laporkan konten → Report dialog

### Error Flow

- Sesi habis → redirect ke /login
- Akses ditolak → /403
- Server error → /500

### Exit Point

- Logout → /
- Session timeout → /login

---

## 3. Community Owner

### Objective

Membuat dan mengelola komunitas, menangani anggota, dan menjalankan event.

### Entry Point

- /app (dashboard) → My Communities
- /app/community/[id]/overview

### Preconditions

- Akun terdaftar
- Memiliki komunitas (status APPROVED)
- Role: COMMUNITY_OWNER

### Happy Path

```
1. Login → /app
2. Klik komunitas yang dimiliki
3. Lihat overview (statistik, post, event)
4. Kelola anggota → /app/community/[id]/members
5. Approve/reject join request → /app/community/[id]/join-requests
6. Assign admin → ubah role anggota
7. Buat event → /app/community/[id]/events/create
8. Kelola postingan → /app/community/[id]/posts
9. Review laporan → /app/community/[id]/reports
10. Update pengaturan → /app/community/[id]/settings
```

### Alternative Flow

- Edit profil komunitas → /app/community/[id]/profile
- Kelola role & permission → /app/community/[id]/roles
- Lihat peserta event → /app/community/[id]/participants
- Buat postingan → /app/community/[id]/posts/create

### Error Flow

- Komunitas suspended → pesan di dashboard
- Tidak ada izin → pesan "Akses ditolak"
- Event melebihi kapasitas → pesan error

### Exit Point

- Kembali ke dashboard
- Logout

---

## 4. Community Admin

### Objective

Membantu mengelola komunitas dengan izin terbatas.

### Entry Point

- /app (dashboard) → My Communities → komunitas yang di-admin

### Preconditions

- Akun terdaftar
- Role: COMMUNITY_ADMIN di komunitas tertentu

### Happy Path

```
1. Login → /app
2. Pilih komunitas yang di-admin
3. Lihat overview komunitas
4. Approve/reject join request (terbatas)
5. Kelola konten postingan
6. Buat event draft
7. Moderasi konten anggota
8. Lihat laporan
```

### Alternative Flow

- Lihat daftar anggota
- Buat postingan baru
- Edit postingan yang ada

### Error Flow

- Akses ditolak untuk fitur tertentu → pesan "Tidak memiliki izin"
- komunitas suspended → pesan di dashboard

### Exit Point

- Kembali ke dashboard
- Logout

---

## 5. Event Manager

### Objective

Mengelola event yang ditugaskan, termasuk registrasi dan check-in.

### Entry Point

- /app (dashboard) → My Events → event yang dikelola
- /app/community/[id]/events → event tertentu

### Preconditions

- Akun terdaftar
- Role: EVENT_MANAGER di event tertentu

### Happy Path

```
1. Login → /app
2. Buka event yang dikelola
3. Lihat daftar peserta
4. Proses check-in → tandai kehadiran
5. Lihat laporan event
6. Edit detail event
7. Update status event
```

### Alternative Flow

- Filter peserta berdasarkan status
- Export daftar peserta
- Kirim notifikasi ke peserta

### Error Flow

- Event dibatalkan → pesan di dashboard
- Peserta sudah check-in → pesan "Sudah hadir"

### Exit Point

- Kembali ke event list
- Kembali ke dashboard

---

## 6. Organization Owner

### Objective

Membuat dan mengelola organisasi, mengundang tim, dan menjalankan event.

### Entry Point

- /app (dashboard) → My Organizations
- /app/organization/[id]/overview

### Preconditions

- Akun terdaftar
- Memiliki organisasi (status APPROVED)
- Role: ORG_OWNER

### Happy Path

```
1. Login → /app
2. Klik organisasi yang dimiliki
3. Lihat overview (statistik, event, tim)
4. Kelola tim → /app/organization/[id]/team
5. Undang anggota tim
6. Assign role admin
7. Buat event → /app/organization/[id]/events/create
8. Kelola konten → /app/organization/[id]/content
9. Lihat insight → /app/organization/[id]/insight
10. Update pengaturan → /app/organization/[id]/settings
```

### Alternative Flow

- Edit profil organisasi → /app/organization/[id]/profile
- Lihat peserta event → /app/organization/[id]/participants
- Buat konten baru → /app/organization/[id]/content/create

### Error Flow

- Organisasi suspended → pesan di dashboard
- Tidak ada izin → pesan "Akses ditolak"
- Event melebihi kapasitas → pesan error

### Exit Point

- Kembali ke dashboard
- Logout

---

## 7. Organization Admin

### Objective

Membantu mengelola organisasi dengan izin terbatas.

### Entry Point

- /app (dashboard) → My Organizations → organisasi yang di-admin

### Preconditions

- Akun terdaftar
- Role: ORG_ADMIN di organisasi tertentu

### Happy Path

```
1. Login → /app
2. Pilih organisasi yang di-admin
3. Lihat overview organisasi
4. Bantu kelola profil
5. Lihat daftar staff
6. Lihat event organisasi
7. Lihat konten
```

### Alternative Flow

- Edit profil organisasi (terbatas)
- Lihat daftar staff (read-only)

### Error Flow

- Akses ditolak untuk fitur tertentu → pesan "Tidak memiliki izin"
- Organisasi suspended → pesan di dashboard

### Exit Point

- Kembali ke dashboard
- Logout

---

## 8. Platform Admin

### Objective

Mengelola persetujuan komunitas/organisasi, moderasi konten, dan melihat laporan.

### Entry Point

- /admin (dashboard)
- /admin/community-approval
- /admin/organization-approval
- /admin/reports

### Preconditions

- Akun terdaftar
- Role: PLATFORM_ADMIN

### Happy Path

```
1. Login → /admin
2. Lihat dashboard (statistik platform)
3. Review komunitas pending → /admin/community-approval
4. Approve/reject komunitas
5. Review organisasi pending → /admin/organization-approval
6. Approve/reject organisasi
7. Review event pending → /admin/events
8. Approve/reject event
9. Review laporan → /admin/reports
10. Tindak laporan (resolve/dismiss/ban)
```

### Alternative Flow

- Kelola pengguna → /admin/users
- Assign role → /admin/roles
- Lihat analitik → /admin/analytics
- Lihat log audit → /admin/audit-log

### Error Flow

- Tidak ada item pending → empty state
- Akses ditolak → /403

### Exit Point

- Kembali ke dashboard
- Logout

---

## 9. Super Admin

### Objective

Mengelola seluruh platform, termasuk pengguna, role, kategori, dan pengaturan.

### Entry Point

- /admin (dashboard)
- /admin/users
- /admin/roles
- /admin/categories
- /admin/settings

### Preconditions

- Akun terdaftar
- Role: SUPER_ADMIN

### Happy Path

```
1. Login → /admin
2. Lihat dashboard (statistik lengkap)
3. Kelola pengguna → /admin/users
4. Cari, filter, detail pengguna
5. Suspend/activate/ban pengguna
6. Kelola role → /admin/roles
7. Buat/hapus role
8. Assign permission
9. Kelola kategori → /admin/categories
10. CRUD kategori
11. Review komunitas/organisasi pending
12. Review event pending
13. Review laporan
14. Lihat analitik → /admin/analytics
15. Lihat log audit → /admin/audit-log
16. Update pengaturan → /admin/settings
```

### Alternative Flow

- Export data
- Bulk actions pada pengguna
- Filter log audit berdasarkan user/action/tanggal

### Error Flow

- Tidak ada data → empty state
- Server error → /500

### Exit Point

- Kembali ke dashboard
- Logout
