# 17 — Known Limitations

> KomunaID Super Admin MVP — Platform Governance Module

---

## Limitasi MVP

### 1. CMS

- **Tidak ada drag-and-drop page builder** — Editor menggunakan rich text editor standar (TipTap/Lexical). Page builder seperti WordPress Gutenberg belum diimplementasikan.
- **Tidak ada versiing halaman** — Perubahan halaman CMS langsung menimpa konten sebelumnya. History/revisi halaman belum tersedia.
- **Tidak ada preview sebelum publish** — Admin tidak bisa melihat preview halaman sebelum mempublikasikan.
- **Upload gambar di CMS tidak ada crop/edit** — Gambar yang diupload tidak bisa dicrop atau diedit langsung di CMS.

### 2. Notifications

- **Tidak ada push notification native** — Push notification untuk mobile belum diimplementasi. Hanya email dan in-app notification.
- **Tidak ada notifikasi real-time** — Notifikasi muncul setelah refresh halaman. WebSocket/SSE untuk real-time belum diimplementasi.
- **Template terbatas** — Hanya mendukung template email dan in-app. Template SMS atau WhatsApp belum tersedia.
- **Tidak ada scheduling notifikasi** — Notifikasi harus dikirim langsung. Penjadwalan notifikasi belum tersedia.

### 3. Audit Logs

- **Tidak ada export audit logs** — Data audit logs tidak bisa di-export ke CSV/Excel.
- **Tidak ada retention policy otomatis** — Audit logs tidak otomatis dihapus setelah periode tertentu. Perlu diatur manual.
- **Tidak ada visualisasi audit logs** — Hanya tampilan tabel. Chart atau grafik aktivitas audit belum tersedia.

### 4. Security

- **Tidak ada 2FA untuk admin** — Super Admin tidak diwajibkan menggunakan two-factor authentication.
- **Tidak ada IP whitelisting** — Akses admin tidak dibatasi berdasarkan IP address.
- **Tidak ada session management UI** — Admin tidak bisa melihat atau mengelola sesi aktif pengguna lain secara detail.
- **GeoIP resolution akurat** — Lokasi login hanya berdasarkan IP, akurasi tergantung provider GeoIP.
- **Tidak ada anomaly detection otomatis** — Deteksi aktivitas mencurigakan masih berbasis rule sederhana (brute force). ML-based anomaly detection belum diimplementasi.

### 5. Master Data

- **Tidak ada import dari API eksternal** — Data master harus diinput manual atau melalui bulk update JSON. Integrasi dengan API BPS (Biro Pusat Statistik) belum tersedia.
- **Tidak ada hierarki dinamis** — Struktur hierarki (Provinsi > Kota > Kecamatan > Kelurahan) hardcoded. Konfigurasi hierarki custom belum tersedia.

### 6. Events

- **Tidak ada integrasi payment** — Event berbayar belum didukung. Integrasi payment gateway belum diimplementasi.
- **Tidak ada streaming/event virtual** — Event virtual atau live streaming belum didukung.
- **Tidak ada sertifikat otomatis** — Sertifikat partisipasi tidak otomatis di-generate setelah event selesai.

### 7. Volunteers

- **Tidak ada matching otomatis** — Sistem tidak otomatis mencocokkan relawan dengan event berdasarkan skill. Masih manual.
- **Tidak ada rating sistem lengkap** — Rating relawan hanya berbasis rata-rata. Sistem review detail belum tersedia.

### 8. Reports

- **Tidak ada auto-moderation** — Tidak ada otomatisasi moderasi konten berbasis AI/ML. Semua moderasi dilakukan manual oleh admin.
- **Tidak ada escalation otomatis** — Laporan kritis tidak otomatis di-escal ke admin yang lebih tinggi.

### 9. Performance

- **Tidak ada caching layer** — Tidak menggunakan Redis atau caching lainnya. Semua query langsung ke database.
- **Tidak ada CDN untuk assets** — Gambar dan aset statis belum didistribusikan melalui CDN.
- **Tidak ada connection pooling** — Prisma connection pooling belum dikonfigurasi secara optimal untuk high traffic.

### 10. Deployment

- **Tidak ada staging environment** — MVP belum memiliki environment staging terpisah. Testing langsung di development.
- **Tidak ada CI/CD pipeline otomatis** — Deploy masih manual. GitHub Actions atau similar belum dikonfigurasi.
- **Tidak ada blue-green deployment** — Deploy menghentikan service sebelum restart. Zero-downtime deployment belum diimplementasi.

---

## Fitur yang Ditunda ke Post-MVP

| Fitur | Prioritas | Estimasi | Keterangan |
|-------|-----------|----------|------------|
| Two-Factor Authentication (2FA) | High | 1 minggu | Security enhancement |
| Real-time notifications (WebSocket) | High | 2 minggu | UX improvement |
| Email scheduling | Medium | 1 minggu | Notification feature |
| Audit log export | Medium | 2-3 hari | Audit feature |
| CMS versioning | Medium | 1 minggu | CMS feature |
| Caching layer (Redis) | High | 1 minggu | Performance |
| CI/CD pipeline | High | 2 minggu | DevOps |
| Staging environment | High | 1 minggu | DevOps |
| IP whitelisting | Medium | 2-3 hari | Security |
| Auto-moderation (AI) | Low | 4 minggu | Moderation |
| Push notification native | Medium | 2 minggu | Notification |
| Session management UI | Low | 1 minggu | Security |
| CMS page builder drag-and-drop | Low | 3 minggu | CMS |
| Payment integration | High | 3 minggu | Event |
| Certificate generation | Low | 1 minggu | Event |
| Volunteer auto-matching | Medium | 2 minggu | Volunteer |
| Report auto-escalation | Low | 1 minggu | Reports |
| Blue-green deployment | Medium | 1 minggu | DevOps |
| Log retention policy | Low | 2-3 hari | Maintenance |
| Master data API integration | Low | 2 minggu | Master Data |

---

## Out of Scope

Fitur berikut tidak masuk dalam roadmap Super Admin dan tidak akan diimplementasikan:

1. **Multi-tenant admin panel** — Hanya ada satu panel admin untuk seluruh platform.
2. **Custom role builder** — Role sudah ditentukan di constants. Custom role dengan permission matrix dinamis tidak didukung.
3. **Workflow approval multi-level** — Approval komunitas hanya satu level (Super Admin langsung approve/reject).
4. **White-label admin panel** — Panel admin tidak bisa di-custom branding-nya.
5. **Mobile admin app** — Admin hanya bisa diakses melalui web browser.
6. **GraphQL API** — Semua endpoint menggunakan REST.
7. **Webhook system** — Tidak ada webhook untuk integrasi pihak ketiga.
8. **Analytics dashboard lanjutan** — Analytics terbatas pada dashboard statis. Integrasi Google Analytics atau Mixpanel belum tersedia.
9. **Multi-language admin panel** — Admin panel hanya dalam Bahasa Indonesia.
10. **API versioning selain v1** — Hanya ada satu versi API (v1).
