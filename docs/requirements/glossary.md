# Glossary — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Platform Terms

| Term                            | Definition                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| **KomunaID**                    | Platform Community-Tech digital yang menghubungkan individu, komunitas, organisasi, dan event |
| **PT Komuna Digital Indonesia** | Perusahaan pengelola platform KomunaID                                                        |
| **Komuna.id**                   | Domain utama platform                                                                         |
| **MVP**                         | Minimum Viable Product — versi paling sederhana yang bisa diluncurkan untuk validasi          |
| **NFR**                         | Non Functional Requirement — requirement teknis di luar fitur fungsional                      |
| **SDLC**                        | Software Development Life Cycle — siklus pengembangan perangkat lunak                         |
| **RBAC**                        | Role-Based Access Control — sistem kontrol akses berbasis role                                |
| **REST API**                    | Representational State Transfer Application Programming Interface                             |
| **SSR**                         | Server-Side Rendering — teknologi rendering halaman di server                                 |
| **SPA**                         | Single Page Application — aplikasi web satu halaman                                           |

---

## 2. User Terms

| Term                   | Definition                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Guest / Visitor**    | Pengunjung platform yang belum login. Bisa melihat konten publik.                                 |
| **Member / User**      | Pengguna terdaftar yang sudah memiliki akun dan bisa login                                        |
| **Community Owner**    | User yang memiliki dan mengelola komunitas. Role level 40.                                        |
| **Community Admin**    | User yang membantu operasional komunitas. Role level 30. Bukan pemilik.                           |
| **Event Manager**      | User yang mengelola event komunitas. Role level 20. Scoped ke event tertentu.                     |
| **Organization Owner** | User yang memiliki dan mengelola organisasi/perusahaan. Role level 60.                            |
| **Organization Admin** | User yang membantu operasional organisasi. Role level 50. Bukan pemilik.                          |
| **Platform Admin**     | Admin internal yang mengelola approval, moderasi, dan support. Role level 80.                     |
| **Super Admin**        | Admin dengan kontrol penuh terhadap seluruh platform. Role level 100. Tidak bisa register publik. |
| **Volunteer**          | User yang mendaftar sebagai volunteer untuk event. Later scope.                                   |
| **Stakeholder**        | Pihak yang memiliki kepentingan terhadap proyek (ponsor, investor, tim, user)                     |

---

## 3. Community Terms

| Term                   | Definition                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Community**          | Kelompok orang dengan minat/lokasi/aktifitas yang sama, terdaftar di platform         |
| **Sub Community**      | Komunitas cabang di bawah komunitas induk. Later scope.                               |
| **Regional Community** | Komunitas berdasarkan wilayah/geografis. Later scope.                                 |
| **Membership Type**    | Tipe keanggotaan komunitas: OPEN (langsung aktif) atau APPROVAL (perlu approve admin) |
| **Community Member**   | User yang sudah join komunitas. Bisa berstatus ACTIVE, PENDING, BANNED, LEFT.         |
| **Community Post**     | Konten/thread yang dibuat oleh member di komunitas                                    |
| **Community Gallery**  | Koleksi gambar/foto komunitas. Later scope.                                           |
| **Community Bookmark** | Penanda komunitas oleh member untuk akses cepat                                       |
| **Community Slug**     | URL-friendly identifier untuk komunitas (contoh: "komunitas-startup-indonesia")       |

---

## 4. Organization Terms

| Term                    | Definition                                                             |
| ----------------------- | ---------------------------------------------------------------------- |
| **Organization**        | Entity perusahaan/lembaga yang terdaftar di platform                   |
| **Organization Member** | User yang tergabung dalam organisasi                                   |
| **Organization Owner**  | Pemilik organisasi. Satu user hanya boleh punya 1 organization di MVP. |
| **Organization Admin**  | Admin operasional organisasi                                           |
| **Industry**            | Bidang industri organisasi (contoh: Technology, Education, Healthcare) |
| **Organization Slug**   | URL-friendly identifier untuk organisasi                               |

---

## 5. Event Terms

| Term                   | Definition                                                             |
| ---------------------- | ---------------------------------------------------------------------- |
| **Event**              | Kegiatan yang diselenggarakan oleh komunitas atau organisasi           |
| **Event Registration** | Pendaftaran user ke event                                              |
| **Event Capacity**     | Kuota maksimal peserta event                                           |
| **Event Status**       | Status event: DRAFT, PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED |
| **Check-in**           | Proses konfirmasi kehadiran peserta saat event berlangsung             |
| **Attendee**           | Peserta yang sudah terdaftar di event                                  |
| **Event Slug**         | URL-friendly identifier untuk event                                    |
| **Online Event**       | Event yang dilaksanakan secara online (virtual)                        |
| **Offline Event**      | Event yang dilaksanakan secara offline (fisik)                         |
| **Hybrid Event**       | Event yang dilaksanakan secara online dan offline                      |

---

## 6. Content Terms

| Term         | Definition                                                            |
| ------------ | --------------------------------------------------------------------- |
| **Post**     | Konten/thread yang dibuat oleh member di komunitas                    |
| **Category** | Klasifikasi konten (COMMUNITY, EVENT, ORGANIZATION)                   |
| **Interest** | Minat/peminatan user untuk rekomendasi komunitas                      |
| **Region**   | Wilayah/geografis untuk filter komunitas dan event                    |
| **Tag**      | Label tambahan untuk konten. Later scope.                             |
| **Blog**     | Artikel publik tentang komunitas, event, kolaborasi. Later scope.     |
| **CMS**      | Content Management System untuk mengelola konten publik. Later scope. |

---

## 7. Admin Terms

| Term                 | Definition                                                                       |
| -------------------- | -------------------------------------------------------------------------------- |
| **Approval**         | Proses review dan persetujuan oleh admin untuk komunitas, organisasi, atau event |
| **Approval Queue**   | Antrean request yang menunggu review admin                                       |
| **Moderation**       | Proses peninjauan konten atau laporan yang melanggar kebijakan                   |
| **Moderation Queue** | Antrean laporan yang menunggu tindak lanjut admin                                |
| **Report Abuse**     | Laporan pelanggaran oleh user terhadap komunitas, event, atau user lain          |
| **Suspension**       | Penangguhan akun atau entity (komunitas, organisasi) karena pelanggaran          |
| **Suspend**          | Melakukan penangguhan terhadap akun atau entity                                  |
| **Archive**          | Menyimpan entity ke status archived (tidak aktif tapi tidak dihapus)             |
| **Soft Delete**      | Penghapusan data secara logis (deletedAt diisi) tanpa menghapus dari database    |
| **Hard Delete**      | Penghapusan data permanen dari database. Tidak digunakan di KomunaID.            |

---

## 8. Technical Terms

| Term                 | Definition                                                                        |
| -------------------- | --------------------------------------------------------------------------------- |
| **JWT**              | JSON Web Token — token otentikasi untuk API                                       |
| **Access Token**     | Token jangka pendek (7 hari) untuk akses API                                      |
| **Refresh Token**    | Token jangka panjang (30 hari) untuk memperbarui access token                     |
| **Scope**            | Cakupan role (COMMUNITY, ORGANIZATION, PLATFORM) untuk permission                 |
| **Scope ID**         | ID entity yang menjadi cakupan role (community ID, organization ID)               |
| **Slug**             | URL-friendly identifier (contoh: "komunitas-startup-indonesia")                   |
| **ORM**              | Object-Relational Mapping — Prisma sebagai ORM untuk MySQL                        |
| **MySQL**            | Database relasional yang digunakan oleh KomunaID                                  |
| **Prisma**           | ORM TypeScript untuk akses database MySQL                                         |
| **NestJS**           | Framework backend Node.js yang digunakan untuk API                                |
| **Next.js**          | Framework frontend React dengan SSR untuk web application                         |
| **Tailwind CSS**     | Utility-first CSS framework untuk styling                                         |
| **shadcn/ui**        | Komponen UI berbasis Tailwind CSS                                                 |
| **S3-compatible**    | Object storage yang kompatibel dengan Amazon S3 (contoh: Vercel Blob, Cloudinary) |
| **Vercel**           | Platform deployment untuk frontend Next.js                                        |
| **Hostinger**        | Provider hosting untuk database MySQL production                                  |
| **CI/CD**            | Continuous Integration / Continuous Deployment — pipeline otomatis                |
| **GitHub Actions**   | Layanan CI/CD dari GitHub                                                         |
| **Migration**        | Script untuk membuat/mengubah struktur database                                   |
| **Seed Data**        | Data awal untuk inisialisasi database                                             |
| **E2E Test**         | End-to-end test yang menguji seluruh alur aplikasi                                |
| **Unit Test**        | Test untuk komponen/fungsi individual                                             |
| **Integration Test** | Test untuk interaksi antar komponen                                               |

---

## 9. Business Terms

| Term              | Definition                                                                 |
| ----------------- | -------------------------------------------------------------------------- |
| **Collaboration** | Kerja sama antara komunitas dan brand/organisasi. Later scope untuk MVP.   |
| **Proposal**      | Usulan kerja sama dari komunitas ke brand/organisasi. Later scope.         |
| **Sponsorship**   | Dukungan finansial atau material dari brand ke komunitas. Later scope.     |
| **CSR**           | Corporate Social Responsibility — program tanggung jawab sosial perusahaan |
| **Campaign**      | Kampanye yang dijalankan oleh brand/organisasi. Later scope.               |
| **Brand**         | Merek atau label yang dimiliki oleh organisasi. Later scope.               |
| **Product**       | Produk yang dimiliki oleh brand. Later scope.                              |
| **Volunteer**     | Relawan yang membantu pelaksanaan event. Later scope.                      |
| **Donation**      | Donasi dari user ke komunitas atau event. Later scope (payment gateway).   |
| **Wallet**        | Dompet digital internal. Later scope.                                      |
| **Marketplace**   | Platform jual beli produk. Later scope.                                    |
| **Gamification**  | Sistem poin, badge, leaderboard. Later scope.                              |

---

## 10. Database Terms

| Term                  | Definition                                                            |
| --------------------- | --------------------------------------------------------------------- |
| **Entity**            | Objek data utama (User, Community, Organization, Event)               |
| **Relation**          | Hubungan antar entity di database                                     |
| **Migration**         | Script untuk membuat/mengubah tabel database                          |
| **Schema**            | Struktur database (tabel, kolom, relasi, index)                       |
| **Soft Delete**       | Menghapus data dengan mengisi deletedAt, bukan menghapus baris        |
| **Audit Log**         | Catatan semua aksi penting (create, update, delete, approve, suspend) |
| **Index**             | Struktur data untuk mempercepat query database                        |
| **Foreign Key**       | Kolom yang merujuk ke primary key tabel lain                          |
| **Primary Key**       | Kolom unik pengidentifikasi setiap baris                              |
| **Unique Constraint** | Aturan yang memastikan nilai kolom unik                               |

---

## 11. Status Terms

| Term          | Definition                             |
| ------------- | -------------------------------------- |
| **PENDING**   | Status menunggu review/approval        |
| **APPROVED**  | Status sudah disetujui                 |
| **REJECTED**  | Status ditolak                         |
| **SUSPENDED** | Status ditangguhkan karena pelanggaran |
| **ARCHIVED**  | Status diarsipkan (tidak aktif)        |
| **ACTIVE**    | Status aktif dan beroperasi            |
| **INACTIVE**  | Status tidak aktif                     |
| **DRAFT**     | Status draft (belum dipublikasikan)    |
| **CANCELLED** | Status dibatalkan                      |
| **COMPLETED** | Status selesai                         |
| **FLAGGED**   | Status ditandai (untuk moderasi)       |
| **RESOLVED**  | Status laporan sudah ditangani         |
| **DISMISSED** | Status laporan ditolak/ditutup         |
