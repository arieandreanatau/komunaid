# Dependencies — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Internal Dependencies

| ID      | Dependency            | Description                                                  | Dependent Module          | Impact if Unavailable        |
| ------- | --------------------- | ------------------------------------------------------------ | ------------------------- | ---------------------------- |
| D-INT01 | Database Schema       | Prisma schema harus selesai sebelum backend development      | All Modules               | Tidak bisa query database    |
| D-INT02 | Authentication Module | Auth harus selesai sebelum semua protected routes            | All Protected Routes      | Tidak bisa akses fitur login |
| D-INT03 | RBAC System           | Role & permission harus selesai sebelum admin features       | Admin Module              | Tidak bisa kontrol akses     |
| D-INT04 | User Model            | User model harus selesai sebelum semua user-related features | Profile, Community, Event | Tidak bisa relate user data  |
| D-INT05 | Community Model       | Community model harus selesai sebelum community features     | Community Module          | Tidak bisa manage komunitas  |
| D-INT06 | Organization Model    | Organization model harus selesai sebelum org features        | Organization Module       | Tidak bisa manage organisasi |
| D-INT07 | Event Model           | Event model harus selesai sebelum event features             | Event Module              | Tidak bisa manage event      |
| D-INT08 | Notification System   | Notification harus selesai untuk semua notifikasi            | Notification Module       | Tidak ada notifikasi         |
| D-INT09 | Audit Log System      | Audit log harus selesai sebelum admin actions                | Admin Module              | Tidak ada audit trail        |
| D-INT10 | Shared Package        | Shared types & validators harus selesai sebelum frontend     | Frontend                  | Tidak bisa share types       |

---

## 2. External Dependencies

| ID      | Dependency       | Provider               | Description                          | Impact if Unavailable                |
| ------- | ---------------- | ---------------------- | ------------------------------------ | ------------------------------------ |
| D-EXT01 | MySQL Database   | Hostinger              | Database MySQL 8.x production        | Tidak ada data persistence           |
| D-EXT02 | Vercel           | Vercel                 | Frontend deployment platform         | Tidak bisa deploy frontend           |
| D-EXT03 | GitHub           | GitHub                 | Source code repository & CI/CD       | Tidak ada version control & pipeline |
| D-EXT04 | Vercel Blob / S3 | Vercel / AWS           | Object storage untuk file upload     | Tidak ada file upload                |
| D-EXT05 | Email Provider   | Resend / SMTP          | Transactional email (reset password) | Reset password tidak berfungsi       |
| D-EXT06 | Domain           | Domain Provider        | Domain komuna.id                     | Tidak ada akses via custom domain    |
| D-EXT07 | SSL Certificate  | Vercel / Let's Encrypt | HTTPS certificate                    | HTTPS tidak berfungsi                |
| D-EXT08 | DNS Provider     | Domain Provider        | DNS management                       | Domain tidak resolve                 |

---

## 3. Business Dependencies

| ID      | Dependency           | Stakeholder              | Description                                      | Impact if Unavailable              |
| ------- | -------------------- | ------------------------ | ------------------------------------------------ | ---------------------------------- |
| D-BUS01 | BRD Approval         | Product Owner            | BRD harus diapprove sebelum development          | Requirement berubah terus          |
| D-BUS02 | Design Approval      | Product Owner / Designer | UI/UX design harus diapprove                     | Developer tidak punya referensi UI |
| D-BUS03 | Brand Identity       | Marketing                | Logo, warna, font harus final                    | Konsistensi brand terganggu        |
| D-BUS04 | Content Availability | Content Team             | Konten statis (About, FAQ, Terms) harus tersedia | Halaman kosong                     |
| D-BUS05 | Seed Data            | Product Owner            | Data awal harus didefinisikan                    | Platform kosong saat launch        |
| D-BUS06 | Admin Assignment     | Operations               | Tim admin harus diassign setelah launch          | Approval queue menumpuk            |
| D-BUS07 | Legal Review         | Legal                    | Terms & Privacy Policy harus di-review           | Compliance risk                    |

---

## 4. Technical Dependencies

| ID      | Dependency      | Description                    | Dependent Module  | Impact if Unavailable                |
| ------- | --------------- | ------------------------------ | ----------------- | ------------------------------------ |
| D-TEC01 | Node.js Runtime | Node.js ≥ 18 harus tersedia    | Backend, Frontend | Tidak bisa menjalankan aplikasi      |
| D-TEC02 | pnpm            | pnpm harus terinstall          | All Packages      | Tidak bisa install dependencies      |
| D-TEC03 | Prisma CLI      | Prisma CLI harus tersedia      | Database          | Tidak bisa generate client & migrate |
| D-TEC04 | TypeScript      | TypeScript harus terinstall    | All Packages      | Tidak bisa compile code              |
| D-TEC05 | ESLint          | ESLint harus terconfig         | Code Quality      | Tidak ada code linting               |
| D-TEC06 | Prettier        | Prettier harus terconfig       | Code Formatting   | Tidak ada formatting konsisten       |
| D-TEC07 | GitHub Actions  | GitHub Actions harus terconfig | CI/CD             | Tidak ada automated testing & deploy |
| D-TEC08 | Swagger         | Swagger harus terconfig        | API Documentation | Tidak ada API docs                   |

---

## 5. Infrastructure Dependencies

| ID      | Dependency          | Description                                    | Impact if Unavailable                       |
| ------- | ------------------- | ---------------------------------------------- | ------------------------------------------- |
| D-INF01 | Remote MySQL Access | Hostinger MySQL harus bisa diakses dari Vercel | Database tidak bisa diakses dari production |
| D-INF02 | Vercel Serverless   | Vercel harus mendukung serverless functions    | API tidak bisa berjalan                     |
| D-INF03 | File Storage        | S3/Vercel Blob harus tersedia                  | File upload tidak berfungsi                 |
| D-INF04 | Email Service       | Email provider harus aktif                     | Reset password tidak berfungsi              |
| D-INF05 | CDN                 | CDN harus tersedia untuk static assets         | Performance buruk                           |
| D-INF06 | Backup System       | Backup otomatis harus terkonfigurasi           | Data loss risk                              |
| D-INF07 | Monitoring          | Uptime monitoring harus aktif                  | Tidak bisa detect issues                    |

---

## 6. Dependency Matrix

| Module       | Depends On                                            |
| ------------ | ----------------------------------------------------- |
| Auth         | User Model, Database Schema, JWT Config               |
| Profile      | User Model, Auth Module                               |
| Community    | User Model, Community Model, Auth Module, RBAC        |
| Organization | User Model, Organization Model, Auth Module, RBAC     |
| Event        | User Model, Event Model, Community Model, Auth Module |
| Post         | User Model, Community Model, Post Model, Auth Module  |
| Notification | User Model, Auth Module                               |
| Report       | User Model, Auth Module                               |
| Admin        | All Models, RBAC, Audit Log                           |
| Public Pages | Category Model, Community Model, Event Model          |
