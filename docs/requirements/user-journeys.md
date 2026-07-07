# User Journeys — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Guest / Visitor Journey

### Journey: Menemukan Komunitas

| Step | Activity                                     | Page/Route                | Decision                |
| ---- | -------------------------------------------- | ------------------------- | ----------------------- |
| 1    | Buka komuna.id                               | `/`                       | —                       |
| 2    | Lihat hero section & search bar              | `/`                       | —                       |
| 3    | Ketik keyword komunitas atau browse kategori | `/`                       | Mau search atau browse? |
| 4a   | Search: Lihat hasil pencarian                | `/komunitas?search=`      | —                       |
| 4b   | Browse: Pilih kategori                       | `/komunitas?category=`    | —                       |
| 5    | Lihat daftar komunitas                       | `/komunitas`              | —                       |
| 6    | Klik komunitas tertentu                      | `/komunitas/{slug}`       | —                       |
| 7    | Lihat detail komunitas                       | `/komunitas/{slug}`       | Mau join?               |
| 8a   | Join: Klik Join → diminta login/register     | `/login` atau `/register` | Sudah punya akun?       |
| 8b   | Tidak join: Kembali ke daftar                | `/komunitas`              | —                       |

### Journey: Mendaftar Event

| Step | Activity                                | Page/Route                | Decision    |
| ---- | --------------------------------------- | ------------------------- | ----------- |
| 1    | Buka komuna.id                          | `/`                       | —           |
| 2    | Navigasi ke Event Directory             | `/events`                 | —           |
| 3    | Filter event berdasarkan tanggal/lokasi | `/events`                 | —           |
| 4    | Klik event tertentu                     | `/events/{slug}`          | —           |
| 5    | Lihat detail event                      | `/events/{slug}`          | Mau daftar? |
| 6    | Klik Daftar → diminta login/register    | `/login` atau `/register` | —           |

### Entry Point: Browser, search engine, social media link

### Exit Point: Halaman login/register, atau kembali ke home

---

## 2. Member Journey

### Journey: Register & Onboarding

| Step | Activity                                       | Page/Route           | Decision |
| ---- | ---------------------------------------------- | -------------------- | -------- |
| 1    | Buka /register                                 | `/register`          | —        |
| 2    | Isi nama, username, password, email (opsional) | `/register`          | —        |
| 3    | Submit register                                | `/register`          | —        |
| 4    | Otomatis login                                 | `/dashboard`         | —        |
| 5    | Lihat dashboard overview                       | `/dashboard`         | —        |
| 6    | Edit profil (bio, lokasi, interest)            | `/dashboard/profile` | —        |
| 7    | Mulai explore komunitas                        | `/komunitas`         | —        |

### Journey: Join Komunitas

| Step | Activity                              | Page/Route                 | Decision                 |
| ---- | ------------------------------------- | -------------------------- | ------------------------ |
| 1    | Login                                 | `/login`                   | —                        |
| 2    | Buka direktori komunitas              | `/komunitas`               | —                        |
| 3    | Pilih komunitas                       | `/komunitas/{slug}`        | —                        |
| 4    | Klik Join                             | `/komunitas/{slug}`        | Type OPEN atau APPROVAL? |
| 5a   | OPEN: Langsung aktif                  | `/dashboard/communities`   | —                        |
| 5b   | APPROVAL: Status pending              | `/dashboard/communities`   | —                        |
| 6    | Tunggu approval (jika APPROVAL)       | `/dashboard/notifications` | —                        |
| 7    | Menerima notifikasi approved/rejected | `/dashboard/notifications` | —                        |

### Journey: Daftar Event

| Step | Activity               | Page/Route          | Decision |
| ---- | ---------------------- | ------------------- | -------- |
| 1    | Login                  | `/login`            | —        |
| 2    | Buka direktori event   | `/events`           | —        |
| 3    | Pilih event            | `/events/{slug}`    | —        |
| 4    | Klik Daftar            | `/events/{slug}`    | —        |
| 5    | Konfirmasi pendaftaran | `/events/{slug}`    | —        |
| 6    | Lihat di My Events     | `/dashboard/events` | —        |

### Journey: Ajukan Role Tambahan

| Step | Activity                                               | Page/Route                 | Decision |
| ---- | ------------------------------------------------------ | -------------------------- | -------- |
| 1    | Login                                                  | `/login`                   | —        |
| 2    | Buka menu Role Request                                 | `/dashboard/role-request`  | —        |
| 3    | Pilih jenis role: Community Owner / Organization Owner | `/dashboard/role-request`  | —        |
| 4    | Isi data pendukung                                     | `/dashboard/role-request`  | —        |
| 5    | Submit                                                 | `/dashboard/role-request`  | —        |
| 6    | Tunggu admin review                                    | `/dashboard/notifications` | —        |
| 7    | Menerima notifikasi approved/rejected                  | `/dashboard/notifications` | —        |

### Entry Point: Login page, direct URL

### Exit Point: Dashboard, logout

---

## 3. Community Owner Journey

### Journey: Buat Komunitas

| Step | Activity                                            | Page/Route                    | Decision |
| ---- | --------------------------------------------------- | ----------------------------- | -------- |
| 1    | Login                                               | `/login`                      | —        |
| 2    | Klik "Daftarkan Komunitas"                          | `/dashboard/community/create` | —        |
| 3    | Isi nama, deskripsi, kategori, lokasi, logo, banner | `/dashboard/community/create` | —        |
| 4    | Pilih membership type: OPEN/APPROVAL                | `/dashboard/community/create` | —        |
| 5    | Submit                                              | `/dashboard/community/create` | —        |
| 6    | Status: PENDING approval                            | `/dashboard`                  | —        |
| 7    | Tunggu admin approve                                | `/dashboard/notifications`    | —        |
| 8    | Approved → komunitas aktif                          | `/dashboard/community/{id}`   | —        |

### Journey: Kelola Member

| Step | Activity                    | Page/Route                          | Decision |
| ---- | --------------------------- | ----------------------------------- | -------- |
| 1    | Login                       | `/login`                            | —        |
| 2    | Buka dashboard komunitas    | `/dashboard/community/{id}`         | —        |
| 3    | Buka Member Management      | `/dashboard/community/{id}/members` | —        |
| 4    | Lihat pending join requests | `/dashboard/community/{id}/members` | —        |
| 5    | Approve atau Reject         | `/dashboard/community/{id}/members` | —        |
| 6    | Ban member (jika perlu)     | `/dashboard/community/{id}/members` | —        |

### Journey: Buat Event

| Step | Activity                                            | Page/Route                                | Decision |
| ---- | --------------------------------------------------- | ----------------------------------------- | -------- |
| 1    | Login                                               | `/login`                                  | —        |
| 2    | Buka dashboard komunitas                            | `/dashboard/community/{id}`               | —        |
| 3    | Klik Create Event                                   | `/dashboard/community/{id}/events/create` | —        |
| 4    | Isi nama, deskripsi, tanggal, lokasi, kuota, poster | `/dashboard/community/{id}/events/create` | —        |
| 5    | Simpan sebagai Draft atau Publish                   | `/dashboard/community/{id}/events/create` | —        |
| 6    | Event tampil di direktori event                     | `/events`                                 | —        |

### Entry Point: Dashboard after login

### Exit Point: Dashboard, logout

---

## 4. Organization Owner Journey

### Journey: Buat Organisasi

| Step | Activity                            | Page/Route                       | Decision     |
| ---- | ----------------------------------- | -------------------------------- | ------------ |
| 1    | Login                               | `/login`                         | —            |
| 2    | Klik "Daftarkan Organisasi"         | `/dashboard/organization/create` | —            |
| 3    | Cek apakah sudah punya organisation | `/dashboard/organization/create` | Sudah punya? |
| 4a   | Sudah: Tidak bisa buat lagi         | `/dashboard`                     | —            |
| 4b   | Belum: Isi data organisation        | `/dashboard/organization/create` | —            |
| 5    | Submit                              | `/dashboard/organization/create` | —            |
| 6    | Status: PENDING approval            | `/dashboard`                     | —            |
| 7    | Tunggu admin approve                | `/dashboard/notifications`       | —            |
| 8    | Approved → organisation aktif       | `/dashboard/organization/{id}`   | —            |

### Journey: Kelola Team

| Step | Activity                                   | Page/Route                          | Decision |
| ---- | ------------------------------------------ | ----------------------------------- | -------- |
| 1    | Login                                      | `/login`                            | —        |
| 2    | Buka dashboard organisation                | `/dashboard/organization/{id}`      | —        |
| 3    | Buka Team Management                       | `/dashboard/organization/{id}/team` | —        |
| 4    | Invite staff                               | `/dashboard/organization/{id}/team` | —        |
| 5    | Assign role: Admin / Finance / Partnership | `/dashboard/organization/{id}/team` | —        |
| 6    | Staff menerima notifikasi                  | —                                   | —        |

### Entry Point: Dashboard after login

### Exit Point: Dashboard, logout

---

## 5. Platform Admin Journey

### Journey: Review & Approve Komunitas

| Step | Activity                       | Page/Route                          | Decision |
| ---- | ------------------------------ | ----------------------------------- | -------- |
| 1    | Login admin                    | `/admin/login`                      | —        |
| 2    | Buka Approval Queue            | `/admin/approvals`                  | —        |
| 3    | Filter: Community              | `/admin/approvals?entity=community` | —        |
| 4    | Buka detail komunitas          | `/admin/approvals/{id}`             | —        |
| 5    | Review data, deskripsi, owner  | `/admin/approvals/{id}`             | —        |
| 6a   | Approve                        | `/admin/approvals/{id}`             | —        |
| 6b   | Reject (isi alasan)            | `/admin/approvals/{id}`             | —        |
| 6c   | Request Revision (isi catatan) | `/admin/approvals/{id}`             | —        |
| 7    | Owner menerima notifikasi      | —                                   | —        |

### Journey: Handle Report Abuse

| Step | Activity                      | Page/Route            | Decision |
| ---- | ----------------------------- | --------------------- | -------- |
| 1    | Login admin                   | `/admin/login`        | —        |
| 2    | Buka Moderation Queue         | `/admin/reports`      | —        |
| 3    | Lihat laporan masuk           | `/admin/reports`      | —        |
| 4    | Buka detail laporan           | `/admin/reports/{id}` | —        |
| 5    | Review konten yang dilaporkan | `/admin/reports/{id}` | —        |
| 6a   | No Action                     | `/admin/reports/{id}` | —        |
| 6b   | Warning ke user               | `/admin/reports/{id}` | —        |
| 6c   | Hide konten                   | `/admin/reports/{id}` | —        |
| 6d   | Suspend user                  | `/admin/reports/{id}` | —        |
| 7    | Catat di audit log            | —                     | —        |

### Entry Point: Admin login page

### Exit Point: Admin dashboard, logout

---

## 6. Super Admin Journey

### Journey: Kelola Platform

| Step | Activity                          | Page/Route         | Decision |
| ---- | --------------------------------- | ------------------ | -------- |
| 1    | Login super admin                 | `/admin/login`     | —        |
| 2    | Lihat dashboard overview          | `/admin/dashboard` | —        |
| 3    | Review statistics                 | `/admin/dashboard` | —        |
| 4    | Akses management sesuai kebutuhan | —                  | —        |

### Journey: Assign Role ke User

| Step | Activity             | Page/Route                | Decision |
| ---- | -------------------- | ------------------------- | -------- |
| 1    | Login super admin    | `/admin/login`            | —        |
| 2    | Buka User Management | `/admin/users`            | —        |
| 3    | Cari user            | `/admin/users?search=`    | —        |
| 4    | Buka detail user     | `/admin/users/{id}`       | —        |
| 5    | Klik Assign Role     | `/admin/users/{id}/roles` | —        |
| 6    | Pilih role dan scope | `/admin/users/{id}/roles` | —        |
| 7    | Submit               | `/admin/users/{id}/roles` | —        |
| 8    | Audit log tercatat   | —                         | —        |

### Journey: Manage Platform Settings

| Step | Activity           | Page/Route        | Decision |
| ---- | ------------------ | ----------------- | -------- |
| 1    | Login super admin  | `/admin/login`    | —        |
| 2    | Buka Settings      | `/admin/settings` | —        |
| 3    | Edit settings      | `/admin/settings` | —        |
| 4    | Save               | `/admin/settings` | —        |
| 5    | Audit log tercatat | —                 | —        |

### Entry Point: Admin login page

### Exit Point: Admin dashboard, logout

---

## 7. Journey Summary

| Role               | Entry Point             | Key Activities                            | Exit Point              |
| ------------------ | ----------------------- | ----------------------------------------- | ----------------------- |
| Guest              | Browser, search, social | Browse, search, view detail               | Login/Register          |
| Member             | Login                   | Profile, join community, event, dashboard | Dashboard, logout       |
| Community Owner    | Dashboard               | Create community, manage members, events  | Dashboard, logout       |
| Organization Owner | Dashboard               | Create org, manage team                   | Dashboard, logout       |
| Platform Admin     | Admin Login             | Approve entities, moderate, manage users  | Admin Dashboard, logout |
| Super Admin        | Admin Login             | Full platform control, settings, roles    | Admin Dashboard, logout |
