# Business Requirements Document (BRD)

**Proyek:** KomunaID
**Versi:** 1.0
**Tanggal:** 22 Juni 2026
**Status:** Draft

---

## 1. Background

Komunitas di Indonesia mengalami pertumbuhan yang signifikan dalam beberapa tahun terakhir, baik komunitas teknologi, kreatif, olahraga, maupun komunitas lainnya. Namun, masih banyak permasalahan yang dihadapi:

- **Fragmentasi informasi:** Komunitas tersebar di berbagai platform (WhatsApp, Instagram, Telegram) tanpa pusat data terpadu.
- **Kesulitan menemukan komunitas:** Anggota baru kesulitan menemukan komunitas yang sesuai dengan minat mereka.
- **Kurangnya kolaborasi:** Komunitas dengan komunitas lain dan brand sulit melakukan kolaborasi secara terstruktur.
- **Transparansi keuangan:** Donasi dan dana komunitas seringkali tidak transparan.
- **Manajemen event:** Pencatatan dan promosi event masih dilakukan secara manual dan tidak terpusat.

KomunaID hadir sebagai solusi platform digital yang menghubungkan anggota, komunitas, dan brand dalam satu ekosistem terpadu.

---

## 2. Business Objective

1. Menjadi platform utama bagi komunitas di Indonesia untuk mengelola aktivitas, anggota, dan kolaborasi.
2. Menghubungkan komunitas satu sama lain dan dengan brand untuk kolaborasi strategis.
3. Menyediakan transparansi keuangan melalui sistem wallet ledger internal.
4. Membangun direktori komunitas publik yang mudah diakses dan dicari.
5. Menciptakan ekosistem yang menguntungkan semua pihak: anggota, komunitas, brand, dan platform.

---

## 3. Problem Statement

| No | Masalah | Dampak |
|----|---------|--------|
| 1 | Tidak ada pusat data terpadu untuk komunitas | Informasi tersebar, sulit dikelola |
| 2 | Kesulitan menemukan komunitas yang sesuai minat | Anggota baru tidak bisa join komunitas yang tepat |
| 3 | Kolaborasi antar komunitas dan brand tidak terstruktur | Kehilangan peluang kerjasama |
| 4 | Donasi dan keuangan komunitas tidak transparan | Penyalahgunaan dana, kurangnya kepercayaan |
| 5 | Event komunitas sulit dipromosikan dan dikelola | Partisipasi rendah |
| 6 | Tidak ada sistem approval untuk data sensitif | Data tidak terverifikasi |

---

## 4. Target User

| No | Target User | Deskripsi |
|----|------------|-----------|
| 1 | **Member / Anggota Komunitas** | Individu yang ingin bergabung dengan komunitas, mengikuti event, berdonasi, dan berinteraksi dengan anggota lainnya |
| 2 | **Community Owner / Pengelola Komunitas** | Individu atau kelompok yang mengelola komunitas, mengatur anggota, event, galeri, dan kolaborasi |
| 3 | **Brand Owner / Pemilik Brand** | Perusahaan atau individu yang ingin berkolaborasi dengan komunitas untuk campaign, sponsorship, atau kegiatan lainnya |
| 4 | **Superadmin / Administrator Platform** | Tim pengelola platform KomunaID yang mengatur seluruh data, approval, dan operasional platform |

---

## 5. Stakeholder

| No | Stakeholder | Peran | Kepentingan |
|----|-----------|-------|-------------|
| 1 | Superadmin / Platform Owner | Pemilik dan pengelola platform | Tinggi - mengontrol seluruh operasional |
| 2 | Community Owner | Pengelola komunitas | Tinggi - pengguna utama fitur komunitas |
| 3 | Brand Owner | Pemilik brand/usahaan | Menengah - pengguna fitur kolaborasi |
| 4 | Member / Anggota | Pengguna aktif platform | Tinggi - pengguna utama platform |
| 5 | Developer Tim | Pengembang dan pemelihara platform | Tinggi - membangun dan memelihara sistem |
| 6 | End User (Visitor) | Pengunjung situs yang belum terdaftar | Rendah - pengguna fitur publik |

---

## 6. Business Scope

| No | Area | Deskripsi |
|----|------|-----------|
| 1 | Public Directory | Landing page, pencarian dan detail komunitas (tanpa login) |
| 2 | Authentication | Register, login, logout, reset password |
| 3 | Role Management | Default role member, pengajuan role community owner/brand owner |
| 4 | Community Management | CRUD komunitas, sub komunitas, regional, anggota, role anggota |
| 5 | Event Management | CRUD event, registrasi event, kalender |
| 6 | Gallery | Upload dan kelola foto/video komunitas |
| 7 | Chat | Pesan sederhana antar anggota dalam komunitas |
| 8 | Collaboration | Pengajuan dan manajemen kolaborasi antar komunitas dan brand |
| 9 | Donation & Wallet | Donasi opsional, wallet ledger internal, histori transaksi |
| 10 | Brand Management | Profil brand, campaign, dan komunitas terkait |
| 11 | Dashboard & Reporting | Dashboard untuk setiap role dengan data ringkasan |
| 12 | Approval Center | Superadmin approve/reject role, komunitas, brand, event |

---

## 7. MVP Scope

Fitur yang **WAJIB** ada di MVP (Minimum Viable Product):

| No | Fitur | Deskripsi |
|----|-------|-----------|
| 1 | Landing Page | Halaman utama dengan informasi platform |
| 2 | Public Community Directory | Daftar komunitas publik dengan pencarian dan detail |
| 3 | Authentication (Laravel Breeze) | Register, login, logout, forgot password |
| 4 | Role Permission (Spatie) | Role default member, pengajuan role |
| 5 | Community CRUD | Buat, edit, hapus komunitas (community owner) |
| 6 | Sub Community & Regional | Sub komunitas dan regional di dalam komunitas |
| 7 | Member Management | Join/leave komunitas, manajemen anggota |
| 8 | Event Management | CRUD event, registrasi event |
| 9 | Gallery | Upload foto/video komunitas |
| 10 | Simple Chat | Pesan sederhana dalam komunitas |
| 11 | Collaboration | Pengajuan kolaborasi antar komunitas dan brand |
| 12 | Donation & Wallet Ledger | Donasi opsional, wallet simulasi, histori transaksi |
| 13 | Brand Profile | Profil brand dan campaign |
| 14 | Dashboard per Role | Dashboard ringkasan untuk setiap role |
| 15 | Superadmin Approval | Approve/reject role, komunitas, brand, event |

---

## 8. Out of Scope MVP

Fitur yang **TIDAK** termasuk dalam MVP:

| No | Fitur | Alasan |
|----|-------|--------|
| 1 | Payment Gateway Integration | MVP menggunakan simulasi pembayaran manual |
| 2 | Real Money Wallet | Wallet hanya simulasi internal, tidak bisa withdraw |
| 3 | Push Notification (Mobile) | Fokus web application dulu |
| 4 | Mobile Application | Fokus responsive web dulu |
| 5 | Advanced Analytics | Dashboard MVP hanya menampilkan data ringkasan |
| 6 | Multi-language | Fokus bahasa Indonesia dulu |
| 7 | API untuk Mobile | API publik belum dibuat di MVP |
| 8 | Real-time Chat | Chat MVP sederhana, belum real-time WebSocket |
| 9 | Email Notification | Notifikasi via dashboard, belum email |
| 10 | Campaign Payment | Campaign di MVP hanya deskripsi, belum ada pembayaran |
| 11 | SEO Optimization Lanjutan | Basic SEO saja di MVP |
| 12 | White Label / Custom Domain | Tersedia di fase selanjutnya |

---

## 9. Business Process High Level

### Alur Utama Platform

```
Visitor → Landing Page → Search Community → View Detail
                ↓
          Register/Login
                ↓
     ┌──────────┼──────────┐
     ↓          ↓          ↓
  Member    CO Request   BO Request
     ↓          ↓          ↓
  Join        Superadmin    Superadmin
  Community   Approve CO    Approve BO
     ↓          ↓          ↓
  Browse      Manage       Manage
  Community   Community    Brand
     ↓          ↓          ↓
  Register    Create       Create
  Event       Event        Campaign
     ↓          ↓          ↓
  Donate      Collaborate  Collaborate
  (optional)  ←──────────→
```

### Approval Flow

```
User Request → Status: Pending → Superadmin Review
                                      ↓
                              ┌───────┴───────┐
                              ↓               ↓
                          Approve          Reject
                          Status:         Status:
                          Approved        Rejected
                              ↓               ↓
                          User notified   User notified
```

### Community Lifecycle

```
Community Owner Request → Superadmin Approve → Community Active
        ↓
   Create Sub Community → Assign Regional → Manage Members
        ↓
   Create Event → Members Register → Event Active
        ↓
   Upload Gallery → Create Post → Simple Chat
        ↓
   Accept Collaboration → Manage Campaign → Revenue
```

---

## 10. Revenue Stream

| No | Sumber Pendapatan | Deskripsi | Fase |
|----|-------------------|-----------|------|
| 1 | **Platform Fee (Donasi)** | Komisi kecil dari setiap transaksi donasi | MVP |
| 2 | **Premium Community** | Fitur premium untuk komunitas (analitik lanjutan, branding kustom) | Phase 2 |
| 3 | **Brand Campaign Fee** | Biaya untuk brand membuat campaign di platform | Phase 2 |
| 4 | **Event Ticketing Fee** | Biaya transaksi dari penjualan tiket event | Phase 2 |
| 5 | **Sponsored Listing** | Komunitas atau brand bayar untuk tampil di posisi teratas | Phase 3 |
| 6 | **Advertisement** | Iklan dari brand partner | Phase 3 |

> **Catatan MVP:** Belum ada revenue nyata di MVP. Semua fitur keuangan bersifat simulasi.

---

## 11. Risk and Assumption

### Risiko

| No | Risiko | Probabilitas | Dampak | Mitigasi |
|----|--------|-------------|--------|----------|
| 1 | User adoption rendah | Tinggi | Tinggi | Fokus UX yang intuitif, SEO, dan konten edukasi |
| 2 | Komunitas tidak aktif setelah registrasi | Menengah | Tinggi | Gamifikasi, notifikasi, dan fitur yang menarik |
| 3 | Brand tidak tertarik berkolaborasi | Menengah | Menengah | Tunjukkan value proposition yang jelas |
| 4 | Bug keamanan | Rendah | Tinggi | Ikuti best practice keamanan Laravel, input validation |
| 5 | Skalabilitas server | Rendah | Menengah | Desain modular, siap untuk scaling horizontal |
| 6 | Penyalahgunaan fitur donasi | Menengah | Menengah | Sistem approval, audit trail, dan batasan nominal |
| 7 | Data komunitas sensitif bocor | Rendah | Tinggi | Enkripsi data, akses berbasis role, audit log |

### Asumsi

| No | Asumsi |
|----|--------|
| 1 | User memiliki akses internet yang stabil |
| 2 | User familiar dengan penggunaan web application |
| 3 | Komunitas yang terdaftar adalah komunitas yang valid |
| 4 | Brand yang terdaftar adalah brand/usahaan yang valid |
| 5 | Superadmin aktif melakukan approval secara berkala |
| 6 | Pengembangan dilakukan oleh tim kecil (1-3 developer) |
| 7 | Infrastructure awal menggunakan XAMPP untuk development |

---

## 12. Success Metrics

| No | Metrik | Target MVP | Target 6 Bulan | Target 1 Tahun |
|----|--------|-----------|----------------|----------------|
| 1 | Jumlah komunitas terdaftar | 50 | 500 | 2.000 |
| 2 | Jumlah member terdaftar | 200 | 5.000 | 25.000 |
| 3 | Jumlah brand terdaftar | 10 | 100 | 500 |
| 4 | Jumlah event dibuat | 20 | 500 | 3.000 |
| 5 | Jumlah kolaborasi aktif | 5 | 50 | 300 |
| 6 | Monthly Active Users (MAU) | 100 | 2.000 | 15.000 |
| 7 | Jumlah donasi tercatat | 50 | 1.000 | 10.000 |
| 8 | Average session duration | 5 menit | 8 menit | 12 menit |
| 9 | Bounce rate | < 60% | < 45% | < 35% |
| 10 | User satisfaction score | 3.5/5 | 4.0/5 | 4.5/5 |

---

## Dokumen Terkait

- [PRD.md](./PRD.md) - Product Requirements Document
- [User-Requirements.md](./User-Requirements.md) - User Requirements
- [Functional-Requirements.md](./Functional-Requirements.md) - Functional Requirements
- [Non-Functional-Requirements.md](./Non-Functional-Requirements.md) - Non-Functional Requirements
- [Use-Case.md](./Use-Case.md) - Use Case Diagram & Deskripsi
- [User-Stories.md](./User-Stories.md) - User Stories
- [RTM.md](./RTM.md) - Requirement Traceability Matrix
