# Constraints — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Technology Constraints

| ID      | Constraint              | Description                          | Impact                              |
| ------- | ----------------------- | ------------------------------------ | ----------------------------------- |
| C-TEC01 | Frontend: Next.js 15+   | Harus menggunakan Next.js App Router | Tidak bisa pakai framework lain     |
| C-TEC02 | Backend: NestJS         | API dibangun dengan NestJS modular   | Tidak bisa pakai Express murni      |
| C-TEC03 | Database: MySQL 8.x     | Database production wajib MySQL      | Tidak bisa pakai PostgreSQL/MongoDB |
| C-TEC04 | ORM: Prisma             | ORM wajib Prisma                     | Tidak bisa pakai TypeORM/Sequelize  |
| C-TEC05 | Language: TypeScript    | Seluruh codebase TypeScript          | Tidak bisa pakai JavaScript murni   |
| C-TEC06 | Package Manager: pnpm   | Monorepo dengan pnpm workspace       | Tidak bisa pakai npm/yarn           |
| C-TEC07 | Styling: Tailwind CSS   | CSS framework wajib Tailwind         | Tidak bisa pakai Bootstrap/MUI      |
| C-TEC08 | UI Component: shadcn/ui | Komponen UI berbasis shadcn/ui       | Komponen custom jika perlu          |

---

## 2. Scope Constraints

| ID      | Constraint             | Description                                                                                                                                    | Impact                               |
| ------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| C-SCO01 | MVP Scope Freeze       | Tidak boleh menambah fitur di luar MVP scope                                                                                                   | Fitur later scope TIDAK dibangun     |
| C-SCO02 | Later Scope Exclusion  | Payment, chat, wallet, marketplace, gamification, recommendation, native mobile, venue booking, advanced analytics, public API, multi-language | Tidak ada kompromi untuk later scope |
| C-SCO03 | Brand Management Later | Brand management dan collaboration termasuk later scope                                                                                        | Tidak ada brand features di MVP      |
| C-SCO04 | Sub Community Later    | Sub community dan regional community termasuk later scope                                                                                      | Hanya community utama di MVP         |
| C-SCO05 | Volunteer Later        | Volunteer management termasuk later scope                                                                                                      | Tidak ada fitur volunteer di MVP     |
| C-SCO06 | CMS Later              | Content management system termasuk later scope                                                                                                 | Konten statis hardcoded di MVP       |

---

## 3. Deployment Constraints

| ID      | Constraint                 | Description                         | Impact                                       |
| ------- | -------------------------- | ----------------------------------- | -------------------------------------------- |
| C-DEP01 | Frontend: Vercel           | Frontend harus deploy ke Vercel     | Tidak bisa pakai Netlify/Cloudflare Pages    |
| C-DEP02 | Database: Hostinger MySQL  | Database production di Hostinger    | Koneksi remote MySQL wajib aktif             |
| C-DEP03 | Repository: GitHub         | Source code di GitHub               | Tidak bisa pakai GitLab/Bitbucket            |
| C-DEP04 | CI/CD: GitHub Actions      | Pipeline CI/CD pakai GitHub Actions | Tidak bisa pakai Jenkins/CircleCI            |
| C-DEP05 | No Local Filesystem Upload | File upload ke S3/Vercel Blob       | Tidak boleh simpan file di filesystem Vercel |

---

## 4. Security Constraints

| ID      | Constraint           | Description                                 | Impact                             |
| ------- | -------------------- | ------------------------------------------- | ---------------------------------- |
| C-SEC01 | HTTPS Required       | Semua production traffic HTTPS              | HTTP tidak diizinkan di production |
| C-SEC02 | No Secrets in Code   | Credential tidak boleh di-commit            | Gunakan .env.example               |
| C-SEC03 | Password Hashing     | bcrypt ≥ 12 rounds                          | Tidak boleh plain text atau MD5    |
| C-SEC04 | JWT Secrets Separate | Access, refresh, reset punya secret berbeda | Tidak boleh share secret           |
| C-SEC05 | Audit Log Required   | Semua action penting wajib audit log        | Tidak ada exception                |
| C-SEC06 | RBAC Enforcement     | Permission divalidasi di backend            | Tidak hanya frontend check         |

---

## 5. Business Constraints

| ID      | Constraint               | Description                                              | Impact                               |
| ------- | ------------------------ | -------------------------------------------------------- | ------------------------------------ |
| C-BUS01 | 1 Org per User           | Satu user hanya boleh punya 1 organization sebagai owner | Tidak bisa buat organization kedua   |
| C-BUS02 | Admin No Public Register | Super Admin tidak bisa register publik                   | Hanya via seed/invitation            |
| C-BUS03 | Approval Required        | Komunitas, organisasi, event baru perlu approval         | Tidak langsung tampil publik         |
| C-BUS04 | Soft Delete Only         | Data kritikal tidak boleh hard delete                    | deletedAt wajib diisi                |
| C-BUS05 | Email Optional           | Email tidak wajib saat register                          | Tapi diperlukan untuk reset password |
| C-BUS06 | No Payment Gateway       | MVP tidak ada payment gateway                            | Event gratis saja                    |

---

## 6. Budget Constraints

| ID      | Constraint                | Description                                        | Impact                              |
| ------- | ------------------------- | -------------------------------------------------- | ----------------------------------- |
| C-BGT01 | Vercel Free/Pro           | Deployment menggunakan Vercel plan yang terjangkau | Limitasi bandwidth/function hours   |
| C-BGT02 | Hostinger MySQL           | Database di Hostinger plan yang terjangkau         | Limitasi storage/connections        |
| C-BGT03 | No External Paid Services | Minimal layanan berbayar eksternal                 | Gunakan free tier jika memungkinkan |

---

## 7. Timeline Constraints

| ID      | Constraint            | Description                                                          | Impact                                |
| ------- | --------------------- | -------------------------------------------------------------------- | ------------------------------------- |
| C-TML01 | MVP Launch Target     | MVP harus siap launch sesuai timeline                                | Fitur yang belum selesai di-scope out |
| C-TML02 | SDLC Phases           | Mengikuti tahapan SDLC: Requirement → Design → Build → Test → Deploy | Tidak boleh skip phase                |
| C-TML03 | Iterative Development | Development dilakukan secara bertahap per modul                      | Tidak boleh big bang                  |

---

## 8. Regulatory Constraints

| ID      | Constraint         | Description                                  | Impact                                 |
| ------- | ------------------ | -------------------------------------------- | -------------------------------------- |
| C-REG01 | Privacy Policy     | Harus ada kebijakan privasi yang jelas       | Data user harus dilindungi             |
| C-REG02 | Terms of Service   | Harus ada syarat & ketentuan                 | User harus menyetujui sebelum register |
| C-REG03 | Data Protection    | Data user tidak boleh dijual ke pihak ketiga | Tidak ada monetisasi data              |
| C-REG04 | Content Moderation | Platform harus bisa moderasi konten          | Tidak bisa biarkan konten ilegal       |

---

## 9. Integration Constraints

| ID      | Constraint             | Description                                        | Impact                         |
| ------- | ---------------------- | -------------------------------------------------- | ------------------------------ |
| C-INT01 | No Payment Integration | Tidak ada integrasi payment gateway di MVP         | Tidak ada transaksi berbayar   |
| C-INT02 | No Chat Integration    | Tidak ada integrasi chat/messaging di MVP          | Tidak ada komunikasi real-time |
| C-INT03 | No Social Login        | Tidak ada integrasi Google/Facebook login di MVP   | Hanya email/password auth      |
| C-INT04 | No SMS Integration     | Tidak ada integrasi SMS di MVP                     | Tidak ada verifikasi via SMS   |
| C-INT05 | Email Provider         | Integrasi email untuk reset password (SMTP/Resend) | Email wajib berfungsi          |
