# Problem Statement — KomunaID

| Field       | Value                       |
| ----------- | --------------------------- |
| **Project** | KomunaID                    |
| **Company** | PT Komuna Digital Indonesia |
| **Version** | 1.0 — MVP                   |
| **Date**    | 7 Juli 2026                 |

---

## 1. Context

Ekosistem komunitas di Indonesia berkembang pesat, namun masih menghadapi tantangan fundamental dalam hal discovery, manajemen, dan kolaborasi. Saat ini, informasi komunitas tersebar di berbagai platform (Instagram, WhatsApp grup, rekomendasi manual), menyulitkan individu untuk menemukan komunitas yang relevan dan menyulitkan komunitas untuk mengelola operasional mereka secara efisien.

---

## 2. Problem Statement

### 2.1 Masalah Utama

> **Individu sulit menemukan komunitas yang relevan dengan minat mereka karena informasi tersebar di Instagram, grup chat, dan rekomendasi teman, sementara komunitas sulit mengelola anggota, event, pengurus, dan laporan secara terstruktur.**

### 2.2 Masalah Pendukung

| No   | Masalah                                                             | Siapa yang Terdampak  | Dampak                                                               |
| ---- | ------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------- |
| P-01 | Discovery komunitas sulit — informasi tersebar di multiple platform | Individu/User         | Komunitas potensial tidak ditemukan, pertumbuhan komunitas terhambat |
| P-02 | Manajemen komunitas manual — tidak ada tools terstruktur            | Community Owner/Admin | Operasional tidak efisien, data tidak terpusat                       |
| P-03 | Kolaborasi brand-organisasi-komunitas tidak terstruktur             | Brand/Organization    | Kesulitan menemukan partner komunitas untuk sponsorship/CSR          |
| P-04 | Tidak ada standar keamanan — no approval, moderation, RBAC          | Platform/User         | Ekosistem tidak aman, konten berbahaya tidak termoderasi             |
| P-05 | Tidak ada audit trail — perubahan penting tidak tercatat            | Platform/Admin        | Tidak ada accountability, sulit investigasi masalah                  |

---

## 3. Problem Analysis

### 3.1 Root Cause Analysis

```
Problem: Individu sulit menemukan komunitas relevan
├── Cause 1: Tidak ada direktori terpusat
│   └── Info tersebar di Instagram, WhatsApp, manual
├── Cause 2: Tidak ada filter/search yang efektif
│   └── Manual browsing, tidak ada kategorisasi
└── Cause 3: Tidak ada metrik aktivitas
    └── Sulit bedakan komunitas aktif vs tidak aktif

Problem: Komunitas sulit mengelola operasional
├── Cause 1: Tidak ada dashboard terpusat
│   └── Data di Google Sheets, manual
├── Cause 2: Tidak ada approval system
│   └── Siapapun bisa join, tidak ada quality control
└── Cause 3: Tidak ada event management
    └── Manual via WhatsApp, sulit track attendance

Problem: Kolaborasi tidak terstruktur
├── Cause 1: Tidak ada platform discovery
│   └── Brand harus cari manual
├── Cause 2: Tidak ada standar proposal
│   └── Komunikasi tidak efisien
└── Cause 3: Tidak ada metrik komunitas
    └── Brand tidak bisa evaluate potensi partner
```

### 3.2 Affected Stakeholders

| Stakeholder        | Pain Point                      | Current Workaround            |
| ------------------ | ------------------------------- | ----------------------------- |
| Individual/Member  | Sulit temukan komunitas relevan | Browse Instagram, tanya teman |
| Community Owner    | Sulit manage anggota & event    | Google Sheets, WhatsApp       |
| Community Admin    | Tidak ada tools moderasi        | Manual review                 |
| Organization Owner | Sulit temukan komunitas partner | Network manual                |
| Platform Admin     | Tidak ada approval system       | Tidak ada sistem              |
| Brand/Sponsor      | Sulit evaluate komunitas        | Tidak ada data                |

---

## 4. User Personas

### 4.1 Persona: Andi (Individual/Member)

- **Usia**: 25 tahun
- **Pekerjaan**: Software Developer
- **Goal**: Ingin bergabung dengan komunitas tech di kota
- **Pain Point**: Info komunitas tersebar, sulit tahu mana yang aktif
- **Behavior**: Aktif di Instagram, follow beberapa akun komunitas

### 4.2 Persona: Budi (Community Owner)

- **Usia**: 30 tahun
- **Pekerjaan**: Founder komunitas startup
- **Goal**: Mengelola 200+ anggota dengan efisien
- **Pain Point**: Data anggota di Google Sheets, event manual via WA
- **Behavior**: Buat event mingguan, approve member manual

### 4.3 Persona: Citra (Organization Owner)

- **Usia**: 35 tahun
- **Pekerjaan**: Marketing Manager di tech company
- **Goal**: Cari komunitas untuk CSR partnership
- **Pain Point**: Sulit tahu komunitas mana yang aktif dan relevant
- **Behavior**: Network via event, tanya rekomendasi

---

## 5. Opportunity

### 5.1 Market Opportunity

- Indonesia memiliki ribuan komunitas aktif di berbagai kategori
- Belum ada platform sentralisasi untuk komunitas digital
- Potensi monetisasi melalui sponsorship, premium features, dan marketplace

### 5.2 Solution Opportunity

- Platform sentralisasi yang menghubungkan semua stakeholder
- Tools manajemen yang menghemat waktu operasional
- Data dan metrik yang memudahkan pengambilan keputusan

### 5.3 Competitive Advantage

- **First-mover** di niche Community-Tech Indonesia
- **Approval & moderation system** yang menjamin kualitas ekosistem
- **Scope-based RBAC** yang fleksibel untuk berbagai tipe komunitas

---

## 6. Success Metrics (Problem-Focused)

| Problem                            | Success Metric                         | Target                                         |
| ---------------------------------- | -------------------------------------- | ---------------------------------------------- |
| P-01: Discovery sulit              | Community search & find rate           | > 80% user bisa temukan komunitas dalam 3 klik |
| P-02: Management manual            | Community creation → member onboarding | < 5 menit untuk setup komunitas baru           |
| P-03: Kolaborasi tidak terstruktur | Organization → community connection    | > 50 partnership di bulan ke-3                 |
| P-04: Keamanan tidak ada           | Approval response time                 | < 24 jam untuk semua approval                  |
| P-05: Tidak ada audit trail        | Critical action audit coverage         | 100% action penting tercatat                   |

---

## 7. Constraints

Lihat `docs/requirements/constraints.md` untuk daftar lengkap.

## 8. Assumptions

Lihat `docs/requirements/assumptions.md` untuk daftar lengkap.

---

## 8. References

| Document             | Path                                        |
| -------------------- | ------------------------------------------- |
| BRD                  | `docs/requirements/brd.md`                  |
| User Requirements    | `docs/requirements/user-requirements.md`    |
| Feature Requirements | `docs/requirements/feature-requirements.md` |
| Project Brief        | `docs/product/project-brief.md`             |
