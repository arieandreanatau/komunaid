# Assumptions — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. User Assumptions

| ID      | Assumption                                                                          | Impact if False           | Priority |
| ------- | ----------------------------------------------------------------------------------- | ------------------------- | -------- |
| A-USR01 | Pengguna memiliki akses internet yang stabil                                        | Fitur tidak bisa diakses  | High     |
| A-USR02 | Pengguna menggunakan browser modern (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+) | Tampilan tidak kompatibel | Medium   |
| A-USR03 | Pengguna memiliki perangkat dengan layar minimal 375px (mobile)                     | Layout tidak responsif    | Medium   |
| A-USR04 | Pengguna memahami Bahasa Indonesia                                                  | Konten tidak dipahami     | High     |
| A-USR05 | Pengguna bersedia mendaftar akun untuk fitur tertentu                               | Conversion rate rendah    | Medium   |
| A-USR06 | Pengguna memiliki email aktif untuk reset password                                  | Recovery akun gagal       | High     |
| A-USR07 | Pengguna bersedia memberikan data profil yang benar                                 | Data tidak akurat         | Low      |
| A-USR08 | Pengguna memahami konsep komunitas dan event                                        | User experience buruk     | Low      |

---

## 2. Technical Assumptions

| ID      | Assumption                                                   | Impact if False                             | Priority |
| ------- | ------------------------------------------------------------ | ------------------------------------------- | -------- |
| A-TEC01 | MySQL 8.x tersedia dan bisa diakses dari Vercel              | Database tidak bisa diakses                 | High     |
| A-TEC02 | Vercel mendukung deployment Next.js tanpa konfigurasi khusus | Deployment gagal                            | High     |
| A-TEC03 | Hostinger menyediakan remote MySQL connection                | Database tidak bisa diakses dari production | High     |
| A-TEC04 | S3-compatible storage tersedia untuk file upload             | File upload tidak berfungsi                 | Medium   |
| A-TEC05 | GitHub repository tersedia untuk source code                 | Tidak ada version control                   | High     |
| A-TEC06 | Node.js runtime tersedia di environment deployment           | Aplikasi tidak bisa dijalankan              | High     |
| A-TEC07 | pnpm workspace bisa resolve dependencies dengan benar        | Build gagal                                 | Medium   |
| A-TEC08 | Prisma client bisa connect ke MySQL dari Vercel serverless   | Database query gagal                        | High     |
| A-TEC09 | JWT signing dan verification berfungsi di serverless         | Auth tidak berfungsi                        | High     |
| A-TEC10 | Email provider (SMTP/Resend) tersedia untuk reset password   | Reset password tidak berfungsi              | Medium   |

---

## 3. Business Assumptions

| ID      | Assumption                                                                 | Impact if False            | Priority |
| ------- | -------------------------------------------------------------------------- | -------------------------- | -------- |
| A-BUS01 | Tim development bisa menyelesaikan MVP dalam timeline yang ditentukan      | Delay launch               | High     |
| A-BUS02 | Ada tim internal yang mengelola approval dan moderasi setelah launch       | Admin queue menumpuk       | High     |
| A-BUS03 | Konten statis (About, FAQ, Terms, Privacy) sudah tersedia atau bisa dibuat | Halaman kosong             | Medium   |
| A-BUS04 | Logo dan brand identity KomunaID sudah final                               | Perlu redesign             | Medium   |
| A-BUS05 | Target user aktif di media sosial dan bisa dijangkau via marketing         | User acquisition rendah    | Medium   |
| A-BUS06 | Komunitas existing bersedia join platform                                  | Komunitas kosong di launch | High     |
| A-BUS07 | Budget tersedia untuk hosting dan infrastruktur production                 | Tidak bisa launch          | High     |
| A-BUS08 | Tidak ada regulasi khusus yang mengharuskan fitur tambahan di MVP          | Compliance issue           | Low      |
| A-BUS09 | User bersedia menunggu approval komunitas/organisasi (< 24 jam)            | User frustration           | Medium   |
| A-BUS10 | Email verification tidak wajib untuk MVP                                   | Security risk rendah       | Medium   |

---

## 4. Infrastructure Assumptions

| ID      | Assumption                                       | Impact if False            | Priority |
| ------- | ------------------------------------------------ | -------------------------- | -------- |
| A-INF01 | Vercel free/pro tier mencukupi untuk MVP traffic | Deployment limit           | Medium   |
| A-INF02 | Hostinger MySQL plan mencukupi untuk data MVP    | Database limit             | Medium   |
| A-INF03 | SSL certificate tersedia untuk domain komuna.id  | HTTPS tidak berfungsi      | High     |
| A-INF04 | DNS bisa dikonfigurasi untuk pointing domain     | Domain tidak aktif         | High     |
| A-INF05 | Backup otomatis tersedia dari provider hosting   | Data loss risk             | High     |
| A-INF06 | Monitoring tool tersedia untuk uptime check      | Tidak bisa detect downtime | Medium   |
| A-INF07 | CDN tersedia untuk static assets                 | Performance buruk          | Medium   |

---

## 5. Data Assumptions

| ID      | Assumption                                                  | Impact if False               | Priority |
| ------- | ----------------------------------------------------------- | ----------------------------- | -------- |
| A-DAT01 | Seed data cukup untuk demo dan testing                      | Platform kosong saat launch   | Medium   |
| A-DAT02 | Kategori komunitas dan event sudah didefinisikan            | User bingung memilih kategori | Medium   |
| A-DAT03 | Region/lokasi sudah didefinisikan untuk filter              | Filter tidak berfungsi        | Low      |
| A-DAT04 | Data user seeded bisa digunakan untuk testing               | Testing terhambat             | Low      |
| A-DAT05 | Struktur database tidak akan berubah drastis setelah launch | Migration sulit               | Medium   |
