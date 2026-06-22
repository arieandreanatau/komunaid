# Requirement Traceability Matrix (RTM)

**Proyek:** KomunaID
**Versi:** 1.0
**Tanggal:** 22 Juni 2026
**Status:** Draft

---

## Deskripsi

Requirement Traceability Matrix (RTM) digunakan untuk memastikan bahwa semua requirement terhubung dari sumber ke implementasi dan pengujian. Matrix ini menghubungkan Functional Requirements (FR) dengan Use Case, User Stories, dan Test Scenarios.

---

## Legend Status

| Status | Keterangan |
|--------|-----------|
| ✅ Done | Requirement sudah diimplementasi dan diuji |
| 🔄 In Progress | Requirement sedang dalam pengembangan |
| ⏳ Pending | Requirement belum dimulai |
| ❌ Blocked | Requirement terblokir oleh dependency |

---

## 1. Authentication Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-001 | User Registration | User-Requirements (UR-V006) | UC-001 | US-005 | Authentication | Must Have | TC-001: Register dengan data valid | ✅ Done |
| FR-002 | User Login | User-Requirements (UR-V007) | UC-002 | US-006 | Authentication | Must Have | TC-002: Login dengan kredensial valid | ✅ Done |
| FR-003 | User Logout | User-Requirements (UR-V007) | UC-003 | - | Authentication | Must Have | TC-003: Logout dan session diakhiri | ✅ Done |
| FR-004 | Forgot Password | User-Requirements (UR-V007) | UC-004 | - | Authentication | Must Have | TC-004: Request reset password | ✅ Done |
| FR-005 | Reset Password | User-Requirements (UR-V007) | UC-005 | - | Authentication | Must Have | TC-005: Reset password dengan token valid | ✅ Done |
| FR-006 | Email Verification | User-Requirements (UR-V007) | - | - | Authentication | Should Have | TC-006: Verifikasi email dengan token valid | ⏳ Pending |

---

## 2. Role Request Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-007 | Request Community Owner | User-Requirements (UR-M009) | UC-006 | US-013 | Role Request | Must Have | TC-007: Ajukan role CO dengan data valid | ✅ Done |
| FR-008 | Request Brand Owner | User-Requirements (UR-M009) | UC-007 | US-014 | Role Request | Must Have | TC-008: Ajukan role BO dengan data valid | ✅ Done |
| FR-009 | View Role Requests | User-Requirements (UR-S007) | UC-008 | US-028 | Role Request | Must Have | TC-009: Superadmin melihat daftar role request | ✅ Done |
| FR-010 | Approve Role Request | User-Requirements (UR-S003) | UC-008 | US-028 | Role Request | Must Have | TC-010: Approve role request | ✅ Done |
| FR-011 | Reject Role Request | User-Requirements (UR-S003) | UC-008 | US-028 | Role Request | Must Have | TC-011: Reject role request dengan alasan | ✅ Done |
| FR-012 | View My Role Requests | User-Requirements (UR-M009) | - | US-013 | Role Request | Must Have | TC-012: Member melihat pengajuan saya | ✅ Done |

---

## 3. Public Community Directory Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-013 | View Community List | User-Requirements (UR-V002) | UC-009 | US-002 | Public Community | Must Have | TC-013: Visitor melihat daftar komunitas | ✅ Done |
| FR-014 | Search Community | User-Requirements (UR-V003) | UC-010 | US-003 | Public Community | Must Have | TC-014: Pencarian komunitas dengan kata kunci | ✅ Done |
| FR-015 | View Community Detail | User-Requirements (UR-V004) | UC-011 | US-004 | Public Community | Must Have | TC-015: Visitor melihat detail komunitas | ✅ Done |
| FR-016 | View Community Members | User-Requirements (UR-V002) | UC-011 | US-004 | Public Community | Should Have | TC-016: Melihat daftar anggota komunitas | ⏳ Pending |
| FR-017 | View Community Events | User-Requirements (UR-V005) | UC-011 | US-004 | Public Community | Must Have | TC-017: Melihat event komunitas | ✅ Done |
| FR-018 | View Community Gallery | User-Requirements (UR-V002) | UC-011 | US-004 | Public Community | Should Have | TC-018: Melihat galeri komunitas | ⏳ Pending |

---

## 4. Member Management Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-019 | Join Community | User-Requirements (UR-M002) | UC-012 | US-007 | Member Management | Must Have | TC-019: Join komunitas publik | ✅ Done |
| FR-020 | Leave Community | User-Requirements (UR-M003) | UC-013 | US-008 | Member Management | Must Have | TC-020: Leave komunitas | ✅ Done |
| FR-021 | View My Communities | User-Requirements (UR-M004) | - | US-008 | Member Management | Must Have | TC-021: Melihat komunitas yang diikuti | ⏳ Pending |
| FR-022 | Approve Join Request | User-Requirements (UR-C006) | UC-014 | US-017 | Member Management | Must Have | TC-022: CO approve join request | ✅ Done |
| FR-023 | Reject Join Request | User-Requirements (UR-C006) | UC-014 | US-017 | Member Management | Must Have | TC-023: CO reject join request | ✅ Done |
| FR-024 | View Members List | User-Requirements (UR-C006) | UC-014 | US-017 | Member Management | Must Have | TC-024: CO melihat daftar anggota | ✅ Done |
| FR-025 | Remove Member | User-Requirements (UR-C008) | - | US-017 | Member Management | Must Have | TC-025: CO menghapus anggota | ✅ Done |
| FR-026 | Assign Member Role | User-Requirements (UR-C007) | UC-019 | US-017 | Member Management | Must Have | TC-026: CO menetapkan role anggota | ✅ Done |
| FR-027 | Edit Profile | User-Requirements (UR-M001) | UC-015 | US-015 | Member Management | Must Have | TC-027: Edit profil dengan data valid | ✅ Done |
| FR-028 | Upload Profile Photo | User-Requirements (UR-M001) | UC-015 | US-015 | Member Management | Should Have | TC-028: Upload foto profil | ⏳ Pending |

---

## 5. Community Management Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-029 | Create Community | User-Requirements (UR-C001) | UC-016 | US-016 | Community Management | Must Have | TC-029: Buat komunitas dengan data valid | ✅ Done |
| FR-030 | Edit Community | User-Requirements (UR-C002) | - | US-016 | Community Management | Must Have | TC-030: Edit informasi komunitas | ✅ Done |
| FR-031 | Delete Community | User-Requirements (UR-C003) | - | US-016 | Community Management | Must Have | TC-031: Hapus komunitas | ✅ Done |
| FR-032 | Create Sub Community | User-Requirements (UR-C004) | UC-017 | - | Community Management | Must Have | TC-032: Buat sub komunitas | ✅ Done |
| FR-033 | Edit Sub Community | User-Requirements (UR-C004) | - | - | Community Management | Must Have | TC-033: Edit sub komunitas | ⏳ Pending |
| FR-034 | Delete Sub Community | User-Requirements (UR-C004) | - | - | Community Management | Must Have | TC-034: Hapus sub komunitas | ⏳ Pending |
| FR-035 | Create Regional | User-Requirements (UR-C005) | UC-018 | - | Community Management | Must Have | TC-035: Buat regional baru | ✅ Done |
| FR-036 | Assign Regional to Member | User-Requirements (UR-C005) | - | - | Community Management | Should Have | TC-036: Tetapkan regional ke anggota | ⏳ Pending |
| FR-037 | View Community Dashboard | User-Requirements (UR-C018) | UC-035 | US-022 | Community Management | Must Have | TC-037: CO melihat dashboard komunitas | ✅ Done |

---

## 6. Brand Management Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-038 | Create Brand Profile | User-Requirements (UR-B001) | - | US-023 | Brand Management | Must Have | TC-038: Buat profil brand | ✅ Done |
| FR-039 | Edit Brand Profile | User-Requirements (UR-B002) | - | US-023 | Brand Management | Must Have | TC-039: Edit profil brand | ✅ Done |
| FR-040 | View My Brand | User-Requirements (UR-B002) | - | US-027 | Brand Management | Must Have | TC-040: BO melihat profil brand | ✅ Done |
| FR-041 | View Brand Dashboard | User-Requirements (UR-B009) | UC-036 | US-027 | Brand Management | Must Have | TC-041: BO melihat dashboard brand | ✅ Done |
| FR-042 | View Brand Communities | User-Requirements (UR-B008) | - | US-027 | Brand Management | Should Have | TC-042: Melihat komunitas terkait brand | ⏳ Pending |

---

## 7. Event Management Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-043 | Create Event | User-Requirements (UR-C009) | UC-020 | US-018 | Event Management | Must Have | TC-043: Buat event dengan data valid | ✅ Done |
| FR-044 | Edit Event | User-Requirements (UR-C010) | - | US-018 | Event Management | Must Have | TC-044: Edit informasi event | ✅ Done |
| FR-045 | Delete Event | User-Requirements (UR-C011) | - | US-018 | Event Management | Must Have | TC-045: Hapus event | ✅ Done |
| FR-046 | Register for Event | User-Requirements (UR-M005) | UC-021 | US-009 | Event Management | Must Have | TC-046: Daftar event dengan kuota tersedia | ✅ Done |
| FR-047 | Cancel Event Registration | User-Requirements (UR-M005) | - | US-009 | Event Management | Must Have | TC-047: Batalkan registrasi event | ⏳ Pending |
| FR-048 | View Event List | User-Requirements (UR-V005) | UC-009 | US-002 | Event Management | Must Have | TC-048: Melihat daftar event | ✅ Done |
| FR-049 | View Event Detail | User-Requirements (UR-V005) | UC-022 | US-009 | Event Management | Must Have | TC-049: Melihat detail event | ✅ Done |
| FR-050 | View Event Participants | User-Requirements (UR-C012) | - | US-018 | Event Management | Must Have | TC-050: CO melihat daftar peserta | ✅ Done |
| FR-051 | View Event Calendar | User-Requirements (UR-M012) | UC-022 | - | Event Management | Should Have | TC-051: Melihat event dalam kalender | ⏳ Pending |

---

## 8. Collaboration Management Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-052 | Create Collaboration Request | User-Requirements (UR-B004) | UC-023 | US-025 | Collaboration | Must Have | TC-052: Ajukan kolaborasi | ✅ Done |
| FR-053 | Accept Collaboration | User-Requirements (UR-C017) | UC-024 | US-021 | Collaboration | Must Have | TC-053: Terima pengajuan kolaborasi | ✅ Done |
| FR-054 | Reject Collaboration | User-Requirements (UR-C017) | UC-024 | US-021 | Collaboration | Must Have | TC-054: Tolak pengajuan kolaborasi | ✅ Done |
| FR-055 | View Collaboration List | User-Requirements (UR-B005) | - | US-025 | Collaboration | Must Have | TC-055: Melihat daftar kolaborasi | ✅ Done |
| FR-056 | View Collaboration Detail | User-Requirements (UR-B005) | - | US-025 | Collaboration | Must Have | TC-056: Melihat detail kolaborasi | ⏳ Pending |
| FR-057 | Cancel Collaboration | User-Requirements (UR-B005) | - | - | Collaboration | Should Have | TC-057: Batalkan kolaborasi aktif | ⏳ Pending |

---

## 9. Donation and Wallet Ledger Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-058 | Create Donation | User-Requirements (UR-M007) | UC-025 | US-010 | Donation & Wallet | Must Have | TC-058: Donasi dengan nominal valid | ✅ Done |
| FR-059 | View Donation History | User-Requirements (UR-M008) | UC-026 | US-012 | Donation & Wallet | Must Have | TC-059: Melihat riwayat donasi | ✅ Done |
| FR-060 | View Wallet Balance | User-Requirements (UR-M008) | UC-026 | US-012 | Donation & Wallet | Must Have | TC-060: Melihat saldo wallet | ✅ Done |
| FR-061 | View Transaction History | User-Requirements (UR-M008) | UC-026 | US-012 | Donation & Wallet | Must Have | TC-061: Melihat riwayat transaksi | ✅ Done |
| FR-062 | View Community Donation Total | User-Requirements (UR-C019) | - | US-022 | Donation & Wallet | Must Have | TC-062: CO melihat total donasi | ✅ Done |
| FR-063 | Simulate Payment | User-Requirements (UR-M007) | UC-025 | US-010 | Donation & Wallet | Must Have | TC-063: Simulasi pembayaran berhasil | ✅ Done |
| FR-064 | Create Wallet Entry | User-Requirements (UR-M008) | - | US-012 | Donation & Wallet | Must Have | TC-064: Entry wallet dibuat otomatis | ✅ Done |

---

## 10. Gallery Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-065 | Upload Photo | User-Requirements (UR-C013) | UC-027 | US-019 | Gallery | Must Have | TC-065: Upload foto dengan format valid | ✅ Done |
| FR-066 | Upload Video | User-Requirements (UR-C013) | UC-027 | US-019 | Gallery | Must Have | TC-066: Upload video dengan format valid | ⏳ Pending |
| FR-067 | View Gallery | User-Requirements (UR-V006) | UC-028 | - | Gallery | Must Have | TC-067: Melihat galeri komunitas | ✅ Done |
| FR-068 | Delete Gallery Item | User-Requirements (UR-C014) | - | US-019 | Gallery | Must Have | TC-068: Hapus item galeri | ✅ Done |
| FR-069 | View Gallery Detail | User-Requirements (UR-V006) | UC-028 | - | Gallery | Should Have | TC-069: Melihat detail item galeri | ⏳ Pending |

---

## 11. Chat Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-070 | Send Message | User-Requirements (UR-C015) | UC-029 | US-020 | Chat | Must Have | TC-070: Kirim pesan di chat komunitas | ✅ Done |
| FR-071 | View Messages | User-Requirements (UR-C016) | UC-030 | US-020 | Chat | Must Have | TC-071: Melihat pesan di chat | ✅ Done |
| FR-072 | Delete Message | User-Requirements (UR-C015) | - | US-020 | Chat | Should Have | TC-072: Hapus pesan oleh CO | ⏳ Pending |
| FR-073 | View Chat Room | User-Requirements (UR-C016) | UC-030 | US-020 | Chat | Must Have | TC-073: Melihat chat room | ✅ Done |

---

## 12. Notification Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-074 | View Notifications | User-Requirements (UR-M014) | - | - | Notification | Should Have | TC-074: Melihat daftar notifikasi | ⏳ Pending |
| FR-075 | Mark as Read | User-Requirements (UR-M014) | - | - | Notification | Should Have | TC-075: Tandai notifikasi sebagai dibaca | ⏳ Pending |
| FR-076 | Create Notification | User-Requirements (UR-S014) | - | - | Notification | Should Have | TC-076: Sistem membuat notifikasi otomatis | ⏳ Pending |

---

## 13. Superadmin Approval Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-077 | View Pending Approvals | User-Requirements (UR-S007) | UC-031 | US-028 | Superadmin Approval | Must Have | TC-077: Melihat daftar approval pending | ✅ Done |
| FR-078 | Approve Item | User-Requirements (UR-S003) | UC-032 | US-028 | Superadmin Approval | Must Have | TC-078: Approve item pending | ✅ Done |
| FR-079 | Reject Item | User-Requirements (UR-S003) | UC-033 | US-028 | Superadmin Approval | Must Have | TC-079: Reject item dengan alasan | ✅ Done |
| FR-080 | View Approval History | User-Requirements (UR-S007) | - | US-028 | Superadmin Approval | Should Have | TC-080: Melihat riwayat approval | ⏳ Pending |
| FR-081 | Bulk Approve | User-Requirements (UR-S003) | - | - | Superadmin Approval | Could Have | TC-081: Approve beberapa item sekaligus | ⏳ Pending |

---

## 14. Dashboard and Reporting Module

| Requirement ID | Requirement Description | Source | Related Use Case | Related User Story | Module | Priority | Test Scenario | Status |
|---------------|------------------------|--------|-----------------|-------------------|--------|----------|---------------|--------|
| FR-082 | View Member Dashboard | User-Requirements (UR-M010) | UC-034 | - | Dashboard | Must Have | TC-082: Member melihat dashboard | ✅ Done |
| FR-083 | View CO Dashboard | User-Requirements (UR-C018) | UC-035 | US-022 | Dashboard | Must Have | TC-083: CO melihat dashboard komunitas | ✅ Done |
| FR-084 | View BO Dashboard | User-Requirements (UR-B009) | UC-036 | US-027 | Dashboard | Must Have | TC-084: BO melihat dashboard brand | ✅ Done |
| FR-085 | View Superadmin Dashboard | User-Requirements (UR-S001) | UC-036 | US-031 | Dashboard | Must Have | TC-085: Superadmin melihat dashboard platform | ✅ Done |
| FR-086 | View Revenue Report | User-Requirements (UR-S002) | - | US-031 | Dashboard | Must Have | TC-086: Melihat laporan revenue | ⏳ Pending |
| FR-087 | View User Report | User-Requirements (UR-S007) | - | US-032 | Dashboard | Should Have | TC-087: Melihat laporan user | ⏳ Pending |
| FR-088 | View Community Report | User-Requirements (UR-S009) | - | US-033 | Dashboard | Should Have | TC-088: Melihat laporan komunitas | ⏳ Pending |

---

## Ringkasan Status

| Modul | Total FR | Done | In Progress | Pending | Blocked |
|-------|----------|------|-------------|---------|---------|
| Authentication | 6 | 5 | 0 | 1 | 0 |
| Role Request | 6 | 6 | 0 | 0 | 0 |
| Public Community Directory | 6 | 4 | 0 | 2 | 0 |
| Member Management | 10 | 7 | 0 | 3 | 0 |
| Community Management | 9 | 6 | 0 | 3 | 0 |
| Brand Management | 5 | 4 | 0 | 1 | 0 |
| Event Management | 9 | 6 | 0 | 3 | 0 |
| Collaboration Management | 6 | 4 | 0 | 2 | 0 |
| Donation & Wallet | 7 | 7 | 0 | 0 | 0 |
| Gallery | 5 | 3 | 0 | 2 | 0 |
| Chat | 4 | 3 | 0 | 1 | 0 |
| Notification | 3 | 0 | 0 | 3 | 0 |
| Superadmin Approval | 5 | 3 | 0 | 2 | 0 |
| Dashboard & Reporting | 7 | 4 | 0 | 3 | 0 |
| **Total** | **88** | **62** | **0** | **26** | **0** |

---

## Persentase Penyelesaian

```
██████████████████████░░░░░░░░░░  70.5% Complete (62/88)
```

---

## Dokumen Terkait

- [BRD.md](./BRD.md) - Business Requirements Document
- [PRD.md](./PRD.md) - Product Requirements Document
- [User-Requirements.md](./User-Requirements.md) - User Requirements
- [Functional-Requirements.md](./Functional-Requirements.md) - Functional Requirements
- [Non-Functional-Requirements.md](./Non-Functional-Requirements.md) - Non-Functional Requirements
- [Use-Case.md](./Use-Case.md) - Use Case Diagram & Deskripsi
- [User-Stories.md](./User-Stories.md) - User Stories
