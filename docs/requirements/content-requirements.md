# Content Requirements — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Static Content Pages

| Code    | Page                | Description                                    | Route                   | Priority | Status |
| ------- | ------------------- | ---------------------------------------------- | ----------------------- | -------- | ------ |
| CT-ST01 | Landing Page        | Hero section, headline, search bar, CTA        | `/`                     | High     | MVP    |
| CT-ST02 | About               | Cerita KomunaID, misi, visi, value proposition | `/tentang-kami`         | Medium   | MVP    |
| CT-ST03 | FAQ                 | Pertanyaan umum seputar platform               | `/faq`                  | Medium   | MVP    |
| CT-ST04 | Contact             | Form kontak, email, social media               | `/kontak`               | Medium   | MVP    |
| CT-ST05 | Terms               | Syarat & ketentuan penggunaan                  | `/terms`                | Medium   | MVP    |
| CT-ST06 | Privacy Policy      | Kebijakan privasi data                         | `/privacy-policy`       | Medium   | MVP    |
| CT-ST07 | Community Guideline | Panduan berkomunitas                           | `/guidelines/community` | Low      | MVP    |
| CT-ST08 | Event Guideline     | Panduan membuat event                          | `/guidelines/event`     | Low      | MVP    |

---

## 2. SEO Metadata

| Code    | Element          | Description                     | Priority |
| ------- | ---------------- | ------------------------------- | -------- |
| CT-SE01 | Title tag        | Judul unik per halaman          | High     |
| CT-SE02 | Meta description | Deskripsi singkat per halaman   | High     |
| CT-SE03 | Open Graph       | OG tags untuk social sharing    | Medium   |
| CT-SE04 | Canonical URL    | URL kanonik per halaman         | Medium   |
| CT-SE05 | Structured data  | JSON-LD untuk komunitas & event | Low      |
| CT-SE06 | Sitemap          | XML sitemap                     | High     |
| CT-SE07 | Robots.txt       | File robots.txt                 | High     |

---

## 3. Brand Identity Content

| Code    | Element          | Description         | Value                                       |
| ------- | ---------------- | ------------------- | ------------------------------------------- |
| CT-BI01 | Logo             | Logo utama KomunaID | Di folder assets                            |
| CT-BI02 | Tagline          | Tagline visual      | Platform - People - Community - Partnership |
| CT-BI03 | Brand message    | Pesan brand         | Terhubung. Berdaya. Berdampak.              |
| CT-BI04 | Primary color    | Deep Navy           | #0A1D4D                                     |
| CT-BI05 | Secondary color  | Royal Blue          | #1D4ED8                                     |
| CT-BI06 | Accent color     | Teal                | #11A79B                                     |
| CT-BI07 | Highlight color  | Aqua                | #00C8E6                                     |
| CT-BI08 | Background color | White               | #FFFFFF                                     |
| CT-BI09 | Primary font     | Plus Jakarta Sans   | Google Fonts                                |

---

## 4. Form Content

| Code    | Form                | Fields                                                         | Validation             | Module       |
| ------- | ------------------- | -------------------------------------------------------------- | ---------------------- | ------------ |
| CT-FM01 | Register            | Nama, username, password, email (opsional)                     | Required + unique      | Auth         |
| CT-FM02 | Login               | Email/username, password                                       | Required               | Auth         |
| CT-FM03 | Forgot password     | Email                                                          | Required + valid email | Auth         |
| CT-FM04 | Reset password      | Password, confirm password                                     | Required + match       | Auth         |
| CT-FM05 | Edit profile        | Nama, bio, lokasi, interest, avatar                            | Optional               | Profile      |
| CT-FM06 | Create community    | Nama, slug, deskripsi, kategori, logo, banner, membership type | Required fields        | Community    |
| CT-FM07 | Create event        | Nama, deskripsi, tanggal, lokasi, kuota, poster                | Required fields        | Event        |
| CT-FM08 | Create organization | Nama, deskripsi, industri, lokasi, logo                        | Required fields        | Organization |
| CT-FM09 | Contact form        | Nama, email, subjek, pesan                                     | Required + valid email | Contact      |
| CT-FM10 | Report abuse        | Target type, alasan, deskripsi                                 | Required               | Report       |

---

## 5. Notification Content

| Code    | Type                  | Title Template         | Message Template                                  |
| ------- | --------------------- | ---------------------- | ------------------------------------------------- |
| CT-NF01 | Approval              | Komunitas Disetujui    | Komunitas {{name}} telah disetujui                |
| CT-NF02 | Rejection             | Komunitas Ditolak      | Komunitas {{name}} ditolak. Alasan: {{reason}}    |
| CT-NF03 | Join request          | Permintaan Join        | {{user}} ingin join komunitas {{community}}       |
| CT-NF04 | Join approved         | Join Disetujui         | Permintaan join komunitas {{community}} disetujui |
| CT-NF05 | Join rejected         | Join Ditolak           | Permintaan join komunitas {{community}} ditolak   |
| CT-NF06 | Event registration    | Pendaftaran Event      | Anda terdaftar di event {{event}}                 |
| CT-NF07 | Role assigned         | Role Baru              | Anda mendapat role {{role}}                       |
| CT-NF08 | Warning               | Peringatan             | Akun Anda mendapat peringatan: {{reason}}         |
| CT-NF09 | Suspension            | Akun Suspended         | Akun Anda telah disuspend: {{reason}}             |
| CT-NF10 | Organization approved | Organisation Disetujui | Organisation {{name}} telah disetujui             |

---

## 6. Error Messages

| Code    | Key                      | Message                                                     |
| ------- | ------------------------ | ----------------------------------------------------------- |
| CT-ER01 | auth.failed              | Email atau password salah                                   |
| CT-ER02 | auth.throttle            | Terlalu banyak percobaan. Coba lagi dalam {{seconds}} detik |
| CT-ER03 | username.taken           | Username sudah digunakan                                    |
| CT-ER04 | email.taken              | Email sudah terdaftar                                       |
| CT-ER05 | community.not_found      | Komunitas tidak ditemukan                                   |
| CT-ER06 | community.not_approved   | Komunitas belum disetujui                                   |
| CT-ER07 | community.already_member | Anda sudah menjadi anggota komunitas ini                    |
| CT-ER08 | community.capacity_full  | Kapasitas komunitas sudah penuh                             |
| CT-ER09 | community.banned         | Anda dibanned dari komunitas ini                            |
| CT-ER10 | event.not_found          | Event tidak ditemukan                                       |
| CT-ER11 | event.capacity_full      | Kuota event sudah penuh                                     |
| CT-ER12 | event.already_registered | Anda sudah terdaftar di event ini                           |
| CT-ER13 | org.limit_reached        | Anda sudah memiliki organisation                            |
| CT-ER14 | forbidden                | Anda tidak memiliki akses                                   |
| CT-ER15 | not_found                | Data tidak ditemukan                                        |

---

## 7. Empty State Messages

| Code    | Context                    | Message                                   |
| ------- | -------------------------- | ----------------------------------------- |
| CT-ES01 | Community directory kosong | Belum ada komunitas terdaftar             |
| CT-ES02 | Event directory kosong     | Belum ada event tersedia                  |
| CT-ES03 | My communities kosong      | Anda belum bergabung di komunitas manapun |
| CT-ES04 | My events kosong           | Anda belum mendaftar di event manapun     |
| CT-ES05 | Notifications kosong       | Tidak ada notifikasi baru                 |
| CT-ES06 | Bookmarks kosong           | Belum ada bookmark                        |
| CT-ES07 | Search results kosong      | Tidak ada hasil pencarian                 |

---

## 8. Landing Page Content

| Section           | Content                                                                 | Priority |
| ----------------- | ----------------------------------------------------------------------- | -------- |
| Hero              | Headline: Platform Komunitas Indonesia, Subtitle: Hubungkan Komunitasmu | High     |
| Search            | Search bar untuk komunitas & event                                      | High     |
| Kategori          | Grid kategori komunitas populer                                         | High     |
| Komunitas Populer | Carousel/list komunitas dengan member terbanyak                         | High     |
| Event Populer     | List event mendatang                                                    | High     |
| CTA Member        | "Temukan Komunitasmu" → /komunitas                                      | High     |
| CTA Community     | "Daftarkan Komunitasmu" → /register                                     | High     |
| CTA Org           | "Kolaborasi dengan Komunitas" → /register                               | Medium   |
| Feature highlight | 3-4 fitur utama platform                                                | Medium   |
| Testimonial       | Testimoni pengguna                                                      | Low      |
| Footer            | Logo, nav, social media, copyright                                      | High     |
