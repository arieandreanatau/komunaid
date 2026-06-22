# Product Requirements Document (PRD)

**Proyek:** KomunaID
**Versi:** 1.0
**Tanggal:** 22 Juni 2026
**Status:** Draft

---

## 1. Product Vision

> KomunaID adalah platform digital yang menghubungkan anggota, komunitas, dan brand dalam satu ekosistem terpadu, memudahkan kolaborasi, manajemen event, dan transparansi keuangan komunitas di Indonesia.

### Visi Jangka Panjang

Menjadi **platform utama** untuk ekosistem komunitas di Indonesia, tempat setiap komunitas dapat tumbuh, berkolaborasi, dan memberikan nilai kepada anggotanya.

---

## 2. Product Goals

| No | Goal | KPI | Target |
|----|------|-----|--------|
| 1 | Membangun direktori komunitas publik terbesar di Indonesia | Jumlah komunitas terdaftar | 2.000 komunitas dalam 1 tahun |
| 2 | Memfasilitasi kolaborasi antar komunitas dan brand | Jumlah kolaborasi aktif | 300 kolaborasi dalam 1 tahun |
| 3 | Menyediakan manajemen komunitas yang terstruktur | Monthly Active Users | 15.000 MAU dalam 1 tahun |
| 4 | Menciptakan transparansi keuangan komunitas | Total donasi tercatat | 10.000 transaksi dalam 1 tahun |
| 5 | Menjadi platform referensi untuk event komunitas | Jumlah event | 3.000 event dalam 1 tahun |

---

## 3. Persona

### 3.1 Persona 1: Andi (Member)

```
Nama: Andi Pratama
Usia: 24 tahun
Pekerjaan: Software Developer
Lokasi: Bandung

Kebutuhan:
- Mencari komunitas teknologi yang sesuai minat
- Mengikuti event dan workshop
- Berdonasi untuk komunitas yang diikuti
- Berinteraksi dengan anggota lain

Frustrasi:
- Sulit menemukan komunitas yang aktif
- Informasi event tersebar di banyak platform
- Tidak ada catatan donasi yang transparan

Goals:
- Bergabung dengan 3-5 komunitas aktif
- Mengikuti minimal 2 event per bulan
- Berkontribusi melalui donasi
```

### 3.2 Persona 2: Budi (Community Owner)

```
Nama: Budi Santoso
Usia: 30 tahun
Pekerjaan: IT Consultant
Lokasi: Jakarta

Kebutuhan:
- Mengelola komunitas dengan ratusan anggota
- Membuat dan mempromosikan event
- Mencari brand untuk kolaborasi/sponsorship
- Mengelola keuangan komunitas

Frustrasi:
- Mengelola anggota manual melalui WhatsApp
- Sulit melacak keuangan komunitas
- Tidak ada platform terpadu untuk kolaborasi

Goals:
- Mengelola komunitas dengan efisien
- Meningkatkan partisipasi anggota
- Mendapatkan sponsorship dari brand
```

### 3.3 Persona 3: Sari (Brand Owner)

```
Nama: Sari Dewi
Usia: 28 tahun
Pekerjaan: Marketing Manager
Lokasi: Surabaya

Kebutuhan:
- Mencari komunitas yang relevan dengan brand
- Membuat campaign marketing melalui komunitas
- Mengukur ROI dari kolaborasi
- Membangun brand awareness

Frustrasi:
- Sulit menemukan komunitas yang sesuai target market
- Tidak ada platform untuk menawarkan kolaborasi
- Sulit mengukur dampak campaign

Goals:
- Berkolaborasi dengan 10+ komunitas
- Meningkatkan brand awareness
- Mendapatkan ROI positif dari campaign
```

### 3.4 Persona 4: Admin (Superadmin)

```
Nama: Tim Platform
Usia: - 
Pekerjaan: Platform Administrator
Lokasi: Remote

Kebutuhan:
- Mengawasi seluruh aktivitas platform
- Melakukan approval untuk data sensitif
- Memantau revenue dan pertumbuhan platform
- Menangani laporan dan masalah user

Frustrasi:
- Banyak permintaan approval yang menumpuk
- Sulit memantau aktivitas mencurigakan
- Tidak ada dashboard yang komprehensif

Goals:
- Memastikan platform berjalan lancar
- Menjaga kualitas data dan komunitas
- Meningkatkan pertumbuhan platform
```

---

## 4. User Journey

### 4.1 Journey: Visitor → Member

```
1. Visitor mengakses landing page KomunaID
2. Visitor melihat daftar komunitas publik
3. Visitor mencari komunitas berdasarkan kategori/lokasi
4. Visitor melihat detail komunitas
5. Visitor memutuskan untuk bergabung
6. Visitor mengklik "Join" (redirect ke login/register)
7. Visitor mendaftar akun baru (email + password)
8. Visitor mendapatkan role "Member" secara default
9. Member mengakses dashboard
10. Member mencari dan join komunitas
```

### 4.2 Journey: Member → Community Owner

```
1. Member login ke platform
2. Member mengakses profil
3. Member mengajukan role "Community Owner"
4. Member mengisi form pengajuan (nama komunitas, deskripsi, dll)
5. Pengajuan dikirim ke Superadmin (status: Pending)
6. Superadmin meninjau pengajuan
7. Superadmin approve pengajuan
8. Member mendapatkan role "Community Owner"
9. CO mengakses dashboard khusus
10. CO membuat komunitas baru
```

### 4.3 Journey: Community Management

```
1. CO membuat komunitas baru
2. Komunitas dikirim untuk approval Superadmin
3. Superadmin approve komunitas
4. Komunitas muncul di direktori publik
5. CO membuat sub komunitas
6. CO menetapkan regional
7. CO mengelola anggota (approve/reject join request)
8. CO membuat event
9. CO mengupload galeri
10. CO berkomunikasi dengan anggota via chat
```

### 4.4 Journey: Brand Collaboration

```
1. Brand Owner mendaftar dan mendapatkan role BO
2. BO membuat profil brand
3. BO menjelajahi komunitas di direktori
4. BO mengajukan kolaborasi ke komunitas tertentu
5. CO menerima notifikasi pengajuan kolaborasi
6. CO meninjau detail pengajuan
7. CO approve/reject pengajuan
8. Jika approve, kolaborasi aktif
9. Kolaborasi dilakukan (event bersama, campaign, dll)
10. Hasil kolaborasi di-dokumentasikan di galeri
```

### 4.5 Journey: Donation Flow

```
1. Member mengakses detail komunitas
2. Member mengklik "Donasi"
3. Member mengisi nominal donasi
4. Member memilih metode pembayaran (simulasi)
5. Konfirmasi pembayaran
6. Transaksi tercatat di wallet ledger
7. Member melihat histori donasi
8. CO melihat total donasi di dashboard
9. Superadmin melihat revenue di dashboard
```

---

## 5. MVP Feature List

| No | Modul | Fitur | Status |
|----|-------|-------|--------|
| 1 | **Public** | Landing page | MVP |
| 2 | **Public** | Daftar komunitas publik | MVP |
| 3 | **Public** | Pencarian komunitas | MVP |
| 4 | **Public** | Detail komunitas | MVP |
| 5 | **Auth** | Register | MVP |
| 6 | **Auth** | Login | MVP |
| 7 | **Auth** | Logout | MVP |
| 8 | **Auth** | Forgot password | MVP |
| 9 | **Role** | Default role member | MVP |
| 10 | **Role** | Request role Community Owner | MVP |
| 11 | **Role** | Request role Brand Owner | MVP |
| 12 | **Role** | Superadmin approve/reject role | MVP |
| 13 | **Community** | Buat komunitas | MVP |
| 14 | **Community** | Edit komunitas | MVP |
| 15 | **Community** | Sub komunitas | MVP |
| 16 | **Community** | Regional | MVP |
| 17 | **Community** | Join/leave komunitas | MVP |
| 18 | **Community** | Manajemen anggota | MVP |
| 19 | **Community** | Role anggota | MVP |
| 20 | **Event** | Buat event | MVP |
| 21 | **Event** | Edit/hapus event | MVP |
| 22 | **Event** | Registrasi event | MVP |
| 23 | **Event** | Kalender event | MVP |
| 24 | **Gallery** | Upload foto | MVP |
| 25 | **Gallery** | Upload video | MVP |
| 26 | **Gallery** | Lihat galeri | MVP |
| 27 | **Chat** | Kirim pesan | MVP |
| 28 | **Chat** | Lihat pesan | MVP |
| 29 | **Collaboration** | Ajukan kolaborasi | MVP |
| 30 | **Collaboration** | Terima/tolak kolaborasi | MVP |
| 31 | **Collaboration** | Lihat status kolaborasi | MVP |
| 32 | **Donation** | Donasi ke komunitas | MVP |
| 33 | **Donation** | Wallet ledger simulasi | MVP |
| 34 | **Donation** | Histori transaksi | MVP |
| 35 | **Brand** | Profil brand | MVP |
| 36 | **Brand** | Campaign brand | MVP |
| 37 | **Brand** | Komunitas terkait | MVP |
| 38 | **Dashboard** | Dashboard member | MVP |
| 39 | **Dashboard** | Dashboard CO | MVP |
| 40 | **Dashboard** | Dashboard BO | MVP |
| 41 | **Dashboard** | Dashboard superadmin | MVP |
| 42 | **Approval** | Approve/reject role | MVP |
| 43 | **Approval** | Approve/reject komunitas | MVP |
| 44 | **Approval** | Approve/reject brand | MVP |
| 45 | **Approval** | Approve/reject event | MVP |

---

## 6. Feature Priority (MoSCow)

### Must Have (MVP)

| No | Fitur | Alasan |
|----|-------|--------|
| 1 | Authentication (Register/Login) | Fondasi dari semua fitur |
| 2 | Role Permission (Member/CO/BO/Superadmin) | Dasar akses dan keamanan |
| 3 | Public Community Directory | Fitur utama untuk menarik visitor |
| 4 | Community CRUD | Fitur inti untuk Community Owner |
| 5 | Member Management (Join/Leave) | Interaksi utama anggota |
| 6 | Event Management | Fitur utama untuk aktivitas komunitas |
| 7 | Superadmin Approval Center | Kontrol kualitas data |
| 8 | Dashboard per Role | Visibilitas data untuk setiap role |
| 9 | Role Request & Approval | Jalur eskalasi role |
| 10 | Donation & Wallet Ledger | Fitur keuangan dasar |

### Should Have (Phase 2)

| No | Fitur | Alasan |
|----|-------|--------|
| 1 | Email Notification | Komunikasi yang lebih baik |
| 2 | Advanced Search & Filter | Temukan komunitas/brand lebih mudah |
| 3 | Event Calendar View | Visualisasi event lebih baik |
| 4 | Campaign Management | Fitur lengkap untuk brand |
| 5 | Revenue Reporting | Analisis keuangan |
| 6 | Member Activity Log | Tracking aktivitas |
| 7 | Gallery Advanced (Album, Tag) | Organisasi galeri lebih baik |

### Could Have (Phase 3)

| No | Fitur | Alasan |
|----|-------|--------|
| 1 | Real-time Chat (WebSocket) | Komunikasi instan |
| 2 | Push Notification | Notifikasi real-time |
| 3 | API untuk Mobile | Ekosistem multi-platform |
| 4 | Advanced Analytics Dashboard | Insight mendalam |
| 5 | Multi-language (EN) | Ekspansi pasar |
| 6 | SEO Optimization | Visibilitas search engine |
| 7 | White Label | Branding kustom |

### Won't Have (Future)

| No | Fitur | Alasan |
|----|-------|--------|
| 1 | Payment Gateway Real | Risiko keuangan tinggi |
| 2 | Real Money Wallet | Regulasi keuangan |
| 3 | Mobile Application | Fokus web dulu |
| 4 | AI Recommendation | Kompleksitas tinggi |
| 5 | Live Streaming | Infrastruktur kompleks |
| 6 | Marketplace | Ekspansi scope terlalu besar |

---

## 7. Release Plan

### MVP (Phase 1) - 8 Minggu

| Minggu | Deliverable |
|--------|-------------|
| 1-2 | Setup project, database design, authentication, role permission |
| 3-4 | Public community directory, community CRUD, member management |
| 5-6 | Event management, gallery, simple chat |
| 7 | Collaboration, donation & wallet, brand management |
| 8 | Dashboard, approval center, bug fixing, testing |

### Phase 2 - 8 Minggu (setelah MVP)

| Minggu | Deliverable |
|--------|-------------|
| 1-2 | Email notification, advanced search & filter |
| 3-4 | Event calendar, campaign management |
| 5-6 | Revenue reporting, member activity log |
| 7-8 | Gallery advanced, performance optimization |

### Phase 3 - 12 Minggu (setelah Phase 2)

| Minggu | Deliverable |
|--------|-------------|
| 1-3 | Real-time chat (WebSocket), push notification |
| 4-6 | API untuk mobile, advanced analytics |
| 7-9 | Multi-language, SEO optimization |
| 10-12 | White label, security audit, load testing |

---

## 8. Product Metric

### Engagement Metrics

| No | Metrik | Definisi | Target MVP |
|----|--------|---------|-----------|
| 1 | **DAU (Daily Active Users)** | Jumlah user unik yang login per hari | 50 |
| 2 | **MAU (Monthly Active Users)** | Jumlah user unik yang login per bulan | 200 |
| 3 | **Session Duration** | Rata-rata durasi sesi per user | 5 menit |
| 4 | **Pages per Session** | Rata-rata halaman yang dilihat per sesi | 5 halaman |
| 5 | **Bounce Rate** | Persentase user yang langsung pergi | < 60% |

### Community Metrics

| No | Metrik | Definisi | Target MVP |
|----|--------|---------|-----------|
| 1 | **Community Growth Rate** | Persentase pertumbuhan komunitas per bulan | 20% |
| 2 | **Average Members per Community** | Rata-rata anggota per komunitas | 20 orang |
| 3 | **Community Activity Rate** | Persentase komunitas yang aktif per bulan | 60% |
| 4 | **Join Request Approval Rate** | Persentase join request yang di-approve | 80% |

### Event Metrics

| No | Metrik | Definisi | Target MVP |
|----|--------|---------|-----------|
| 1 | **Event Creation Rate** | Jumlah event baru per minggu | 5 event |
| 2 | **Event Registration Rate** | Persentase visitor yang daftar event | 30% |
| 3 | **Event Attendance Rate** | Persentase registrant yang hadir | 70% |

### Collaboration Metrics

| No | Metrik | Definisi | Target MVP |
|----|--------|---------|-----------|
| 1 | **Collaboration Request Rate** | Jumlah pengajuan kolaborasi per bulan | 10 |
| 2 | **Collaboration Acceptance Rate** | Persentase pengajuan yang diterima | 50% |
| 3 | **Active Collaborations** | Jumlah kolaborasi aktif | 5 |

### Financial Metrics

| No | Metrik | Definisi | Target MVP |
|----|--------|---------|-----------|
| 1 | **Total Donation Volume** | Total donasi per bulan | Rp 5.000.000 |
| 2 | **Average Donation Amount** | Rata-rata nominal per donasi | Rp 50.000 |
| 3 | **Donation Frequency** | Rata-rata donasi per user per bulan | 1 kali |

### Platform Health Metrics

| No | Metrik | Definisi | Target MVP |
|----|--------|---------|-----------|
| 1 | **Approval Response Time** | Rata-rata waktu approval superadmin | < 24 jam |
| 2 | **Error Rate** | Persentase request yang error | < 1% |
| 3 | **Page Load Time** | Rata-rata waktu loading halaman | < 3 detik |
| 4 | **Uptime** | Persentase waktu platform aktif | > 99% |

---

## Dokumen Terkait

- [BRD.md](./BRD.md) - Business Requirements Document
- [User-Requirements.md](./User-Requirements.md) - User Requirements
- [Functional-Requirements.md](./Functional-Requirements.md) - Functional Requirements
- [Non-Functional-Requirements.md](./Non-Functional-Requirements.md) - Non-Functional Requirements
- [Use-Case.md](./Use-Case.md) - Use Case Diagram & Deskripsi
- [User-Stories.md](./User-Stories.md) - User Stories
- [RTM.md](./RTM.md) - Requirement Traceability Matrix
