<?php

namespace App\Services\Documentation;

use App\Models\AuditLog;
use App\Models\DocumentationFile;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class DocumentationGeneratorService
{
    private string $storagePath;

    private array $availableDocuments = [
        'brd' => [
            'title' => 'Business Requirement Document (BRD)',
            'type' => 'business',
        ],
        'frd' => [
            'title' => 'Functional Requirement Document (FRD)',
            'type' => 'requirement',
        ],
        'srs' => [
            'title' => 'Software Requirement Specification (SRS)',
            'type' => 'requirement',
        ],
        'use_case' => [
            'title' => 'Use Case Documentation',
            'type' => 'requirement',
        ],
        'user_story' => [
            'title' => 'User Story & Acceptance Criteria',
            'type' => 'requirement',
        ],
        'route_documentation' => [
            'title' => 'Route Documentation',
            'type' => 'technical',
        ],
        'module_documentation' => [
            'title' => 'Module Documentation',
            'type' => 'technical',
        ],
        'database_documentation' => [
            'title' => 'Database Documentation',
            'type' => 'database',
        ],
        'data_dictionary' => [
            'title' => 'Data Dictionary',
            'type' => 'database',
        ],
        'erd' => [
            'title' => 'Entity Relationship Diagram (ERD)',
            'type' => 'database',
        ],
        'role_permission_matrix' => [
            'title' => 'Role & Permission Matrix',
            'type' => 'technical',
        ],
        'rtm' => [
            'title' => 'Requirement Traceability Matrix (RTM)',
            'type' => 'requirement',
        ],
        'test_plan' => [
            'title' => 'Test Plan',
            'type' => 'testing',
        ],
        'test_case' => [
            'title' => 'Test Case Template',
            'type' => 'testing',
        ],
        'release_notes' => [
            'title' => 'Release Notes',
            'type' => 'deployment',
        ],
        'deployment_checklist' => [
            'title' => 'Deployment Checklist',
            'type' => 'deployment',
        ],
        'user_guide' => [
            'title' => 'User Guide',
            'type' => 'user_guide',
        ],
        'admin_guide' => [
            'title' => 'Admin Guide',
            'type' => 'user_guide',
        ],
        'handover_document' => [
            'title' => 'Handover Document',
            'type' => 'handover',
        ],
    ];

    public function __construct()
    {
        $this->storagePath = storage_path('app/documentation');
        if (!is_dir($this->storagePath)) {
            mkdir($this->storagePath, 0755, true);
        }
    }

    public function getAvailableDocuments(): array
    {
        return $this->availableDocuments;
    }

    public function generate(string $documentKey, string $format = 'md'): DocumentationFile
    {
        if (!isset($this->availableDocuments[$documentKey])) {
            throw new \InvalidArgumentException("Document key '{$documentKey}' is not valid.");
        }

        $docInfo = $this->availableDocuments[$documentKey];
        $content = $this->buildDocumentContent($documentKey);

        if (empty(trim($content))) {
            $content = "# {$docInfo['title']}\n\n_Dokumen ini kosong atau belum tersedia data untuk generate._\n";
        }

        $content = $this->sanitizeContent($content);

        $fileName = $this->getFileName($documentKey, $format);
        $filePath = $this->saveFile($fileName, $content, $format);

        $metadata = $this->getMetadata($documentKey, $content);

        $docRecord = DocumentationFile::updateOrCreate(
            ['document_key' => $documentKey],
            [
                'title' => $docInfo['title'],
                'document_type' => $docInfo['type'],
                'format' => $format,
                'file_path' => $fileName,
                'status' => 'generated',
                'generated_by' => Auth::id(),
                'generated_at' => now(),
                'summary' => Str::limit(strip_tags($this->extractSummary($content)), 500),
                'metadata' => $metadata,
            ]
        );

        if (class_exists(AuditLog::class)) {
            AuditLog::log('documentation_generated', $docRecord, "Generated document: {$docInfo['title']}");
        }

        return $docRecord;
    }

    public function generateAll(string $format = 'md'): array
    {
        $results = [];

        foreach (array_keys($this->availableDocuments) as $key) {
            try {
                $doc = $this->generate($key, $format);
                $results[$key] = ['status' => 'success', 'id' => $doc->id];
            } catch (\Throwable $e) {
                $results[$key] = ['status' => 'failed', 'error' => $e->getMessage()];
            }
        }

        return $results;
    }

    public function buildDocumentContent(string $documentKey): string
    {
        $method = 'build' . Str::camel($documentKey);

        if (method_exists($this, $method)) {
            return $this->$method();
        }

        return $this->buildDefaultContent($documentKey);
    }

    private function buildDefaultContent(string $key): string
    {
        $info = $this->availableDocuments[$key] ?? ['title' => 'Unknown Document'];
        return "# {$info['title']}\n\nDokumen ini belum tersedia untuk generate otomatis.\n";
    }

    private function getFileName(string $key, string $format): string
    {
        $date = now()->format('Y-m-d_His');
        return "{$key}_{$date}.{$format}";
    }

    private function saveFile(string $fileName, string $content, string $format): string
    {
        $fullPath = $this->storagePath . '/' . $fileName;
        File::put($fullPath, $content);
        return $fileName;
    }

    private function sanitizeContent(string $content): string
    {
        $patterns = [
            '/DB_PASSWORD\s*=\s*\S+/',
            '/DB_USERNAME\s*=\s*\S+/',
            '/DB_HOST\s*=\s*\S+/',
            '/APP_KEY\s*=\s*\S+/',
            '/MAIL_PASSWORD\s*=\s*\S+/',
            '/MAIL_USERNAME\s*=\s*\S+/',
            '/password\s*[:=]\s*["\'][^"\']+["\']/',
            '/secret\s*[:=]\s*["\'][^"\']+["\']/',
            '/token\s*[:=]\s*["\'][^"\']+["\']/',
        ];

        $sanitized = $content;
        foreach ($patterns as $pattern) {
            $sanitized = preg_replace($pattern, '[REDACTED]', $sanitized);
        }

        return $sanitized;
    }

    private function getMetadata(string $key, string $content): array
    {
        $lines = explode("\n", $content);
        $wordCount = str_word_count($content);
        $lineCount = count($lines);

        return [
            'word_count' => $wordCount,
            'line_count' => $lineCount,
            'char_count' => strlen($content),
            'generated_at' => now()->toISOString(),
            'generator_version' => '2.0',
        ];
    }

    private function extractSummary(string $content): string
    {
        $lines = explode("\n", $content);
        $summary = '';
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (!empty($trimmed) && !Str::startsWith($trimmed, '#') && !Str::startsWith($trimmed, '---')) {
                $summary .= $trimmed . ' ';
                if (str_word_count($summary) >= 50) {
                    break;
                }
            }
        }
        return $summary ?: 'Dokumen SDLC KomunaID V2';
    }

    // ─── BRD Generator ──────────────────────────────────────────

    private function buildBrd(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Business Requirement Document (BRD) — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Business Requirement Document (BRD) |
| Version | 2.0 |
| Generated Date | {$now} |
| Project Name | KomunaID V2 |
| Platform | Web Application (Laravel + MySQL) |

---

## 2. Executive Summary

KomunaID V2 adalah platform komunitas berbasis web yang menghubungkan member dengan komunitas, komunitas dengan komunitas, komunitas dengan brand, brand dengan perusahaan, serta brand/perusahaan dengan event komunitas.

Platform ini dirancang untuk menjadi ekosistem komunitas digital yang komprehensif, mendukung manajemen komunitas, event, donasi, kolaborasi brand, dan monetisasi premium.

### Business Objective
- Menyediakan platform komunitas terpadu untuk pasar Indonesia
- Menghubungkan ekosistem komunitas, brand, dan perusahaan
- Mendukung monetisasi melalui fitur premium dan subscription
- Memberikan tools manajemen komunitas yang powerful

### Target Users
- Member / Anggota komunitas
- Community Owner / Pengelola komunitas
- Brand Owner / Pemilik brand
- Company Owner / Pemilik perusahaan
- Superadmin / Pengelola platform

---

## 3. Business Background

### Masalah yang Diselesaikan
1. Komunitas sulit mengelola anggota, event, dan keuangan secara terpusat
2. Brand sulit menemukan komunitas yang relevan untuk kolaborasi
3. Tidak ada platform yang menghubungkan ekosistem komunitas secara menyeluruh
4. Transparansi donasi dan keuangan event masih rendah

### Kebutuhan Komunitas
- Manajemen anggota dan pengurus
- Pencatatan event, volunteer, dan donasi
- Kolaborasi dengan brand dan perusahaan
- Dashboard keuangan transparan

### Kebutuhan Brand/Company
- Pencarian komunitas berdasarkan kategori dan lokasi
- Pengiriman proposal kolaborasi
- Manajemen staff dan campaign

### Kebutuhan Platform Owner
- Monetisasi melalui premium features
- Approval dan moderasi konten
- Monitoring aktivitas dan audit

---

## 4. Business Goals

| Goal | Description | Success Metric |
|---|---|---|
| Member Engagement | Menghubungkan member dengan komunitas | Registrasi aktif bulanan |
| Community Management | Mendukung manajemen komunitas digital | Jumlah komunitas aktif |
| Event Support | Mendukung event, volunteer, donation | Jumlah event terlaksana |
| Brand Collaboration | Memfasilitasi kolaborasi brand-komunitas | Jumlah kolaborasi tercipta |
| Premium Monetization | Monetisasi melalui fitur premium | Revenue dari subscription |
| Platform Trust | Membangun kepercayaan melalui transparansi | Skor kepuasan pengguna |

---

## 5. Stakeholders

| Stakeholder | Role | Responsibility |
|---|---|---|
| Platform Owner | Pemilik platform | Kebijakan strategis, monetisasi |
| Superadmin | Pengelola platform | Moderasi, approval, operasional |
| Admin Platform | Asisten pengelola platform | Dukungan operasional |
| Member | Pengguna platform | Bergabung komunitas, event, donasi |
| Community Owner | Pengelola komunitas | Manajemen komunitas, event |
| Brand Owner | Pemilik brand | Kolaborasi, campaign |
| Company Owner | Pemilik perusahaan | Kolaborasi strategis |
| Community Pengurus | Staf komunitas | Bantu manajemen harian |
| Volunteer | Relawan event | Partisipasi event |
| Public Visitor | Pengunjung tidak terdaftar | Melihat informasi publik |

---

## 6. Scope

### In Scope
1. Public Website (Beranda, Blog, About, Contact)
2. Authentication & Role Request
3. Superadmin Dashboard & Management
4. Member Module
5. Community Module (Owner, Members, Events)
6. Event, Volunteer, Donation & Finance
7. Brand, Company & Collaboration
8. Premium Feature, Trial & Subscription
9. UI/UX Modern Design System
10. Multilanguage (ID/EN)
11. Admin Chat / Internal Messaging
12. SDLC Documentation

### Out of Scope
1. Mobile native app (Android/iOS)
2. Payment gateway integration penuh
3. AI-powered features
4. Real-time video chat
5. Marketplace fisik
6. Integrasi ERP pihak ketiga

---

## 7. Business Requirements Table

| Req ID | Module | Requirement | Priority | Actor | Status |
|---|---|---|---|---|---|
| BR-PUB-001 | Public Website | Menampilkan beranda dengan informasi platform | High | Public | Implemented |
| BR-PUB-002 | Public Website | Blog dan CMS management | Medium | Superadmin | Implemented |
| BR-PUB-003 | Public Website | Halaman Tentang Kami dan Hubungi Kami | Medium | Public | Implemented |
| BR-AUTH-001 | Auth | Registrasi menggunakan email/username | High | Guest | Implemented |
| BR-AUTH-002 | Auth | Login terpisah untuk user dan superadmin | High | Member/Superadmin | Implemented |
| BR-AUTH-003 | Auth | Request role (community_owner, brand_owner, dll) | High | Member | Implemented |
| BR-SUP-001 | Superadmin | Dashboard overview platform | High | Superadmin | Implemented |
| BR-SUP-002 | Superadmin | Approval center untuk role, komunitas, brand | High | Superadmin | Implemented |
| BR-SUP-003 | Superadmin | Manajemen member, komunitas, brand, event | High | Superadmin | Implemented |
| BR-SUP-004 | Superadmin | Audit log dan login log | Medium | Superadmin | Implemented |
| BR-MBR-001 | Member | Dashboard personal member | High | Member | Implemented |
| BR-MBR-002 | Member | Profile management dan interest selection | Medium | Member | Implemented |
| BR-MBR-003 | Member | Bookmark dan friendship | Low | Member | Implemented |
| BR-COM-001 | Community | CRUD komunitas | High | Community Owner | Implemented |
| BR-COM-002 | Community | Manajemen anggota, pengurus, volunteer | High | Community Owner | Implemented |
| BR-COM-003 | Community | Region dan subgroup management | Medium | Community Owner | Implemented |
| BR-EVT-001 | Event | CRUD event | High | Community Owner | Implemented |
| BR-EVT-002 | Event | Registrasi event dan upload payment | High | Member | Implemented |
| BR-EVT-003 | Event | Volunteer campaign dan application | Medium | Community Owner/Member | Implemented |
| BR-EVT-004 | Event | Donation management dan verifikasi | High | Member/Community Owner | Implemented |
| BR-EVT-005 | Event | Finance transaction dan report | Medium | Community Owner | Implemented |
| BR-BRD-001 | Brand | CRUD brand | High | Brand Owner | Implemented |
| BR-BRD-002 | Brand | Campaign management | Medium | Brand Owner | Implemented |
| BR-BRD-003 | Brand | Staff management | Medium | Brand Owner | Implemented |
| BR-COL-001 | Collaboration | Kirim proposal kolaborasi | High | Brand Owner/Community Owner | Implemented |
| BR-COL-002 | Collaboration | Respond proposal (accept/reject) | High | Community Owner/Brand Owner | Implemented |
| BR-CMP-001 | Company | CRUD company | Medium | Company Owner | Implemented |
| BR-CMP-002 | Company | Brand management per company | Medium | Company Owner | Implemented |
| BR-PRM-001 | Premium | Premium plan dan subscription | High | Superadmin/Member | Implemented |
| BR-PRM-002 | Premium | Feature lock berdasarkan plan | High | System | Implemented |
| BR-PRM-003 | Premium | Trial management | Medium | Superadmin | Implemented |
| BR-MLT-001 | Multilanguage | Support Bahasa Indonesia dan Inggris | Medium | All | Implemented |
| BR-CHT-001 | Admin Chat | Internal messaging antar admin | Medium | Superadmin/Admin | Implemented |
| BR-DMS-001 | Documentation | Generate SDLC documentation | Medium | Superadmin | Implemented |

---

## 8. Business Rules

1. Setiap user hanya bisa memiliki satu role utama di waktu bersamaan
2. Community yang dibuat perlu approval superadmin sebelum aktif
3. Brand yang dibuat perlu approval superadmin sebelum aktif
4. Event yang dibuat perlu approval sebelum published
5. Donation hanya bisa dilakukan oleh member terdaftar
6. Premium features hanya bisa diakses oleh subscriber aktif atau trial
7. Role request yang ditolak tidak bisa diajukan ulang dengan role sama dalam 7 hari
8. Admin chat hanya bisa diakses oleh superadmin dan admin platform
9. Documentation hanya bisa di-generate oleh superadmin

---

## 9. Assumptions

1. User memiliki akses internet yang stabil
2. Browser modern yang mendukung HTML5 dan CSS3
3. Server deployment menggunakan XAMPP/compatible PHP environment
4. Database MySQL 8.x tersedia
5. Tidak ada integrasi payment gateway di fase awal

---

## 10. Constraints

1. Platform hanya berbasis web, belum native mobile
2. Max upload file disesuaikan dengan konfigurasi server
3. Real-time features terbatas (chat menggunakan polling/refresh)
4. Multilanguage masih manual (ID/EN)

---

## 11. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Data security breach | High | Encryption, RBAC, audit log |
| Scalability issues | Medium | Database optimization, caching |
| User adoption low | Medium | UX improvement, community building |
| Feature scope creep | Medium | Strict scope management |
| Bug di production | High | Testing, rollback plan |

---

## 12. Success Criteria

1. Semua modul utama berfungsi tanpa critical bug
2. User dapat melakukan registrasi, login, dan akses fitur sesuai role
3. Community owner dapat mengelola komunitas secara lengkap
4. Event, volunteer, dan donation berjalan sesuai flow
5. Brand dan company dapat berkolaborasi dengan komunitas
6. Premium feature berfungsi dengan benar
7. Documentation lengkap dan terstruktur

---

## 13. Future Enhancements

1. Mobile app (Flutter/React Native)
2. Payment gateway integration
3. AI-powered recommendations
4. Advanced analytics dashboard
5. Multi-tenant support
6. API untuk integrasi pihak ketiga
7. Push notification
8. Live streaming event

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildFrd(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Functional Requirement Document (FRD) — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Functional Requirement Document (FRD) |
| Version | 2.0 |
| Generated Date | {$now} |
| Project Name | KomunaID V2 |

---

## 2. System Overview

KomunaID V2 adalah platform komunitas web-based yang dibangun dengan Laravel 11 + MySQL + Tailwind CSS. Platform ini menyediakan manajemen komunitas, event, donasi, kolaborasi brand, dan fitur premium.

---

## 3. Actor List

| Actor | Description |
|---|---|
| Guest | Pengunjung tidak terdaftar |
| Member | Pengguna terdaftar dengan role member |
| Community Owner | Pemilik komunitas |
| Brand Owner | Pemilik brand |
| Company Owner | Pemilik perusahaan |
| Superadmin | Pengelola platform |
| Admin Platform | Asisten pengelola platform |
| Community Pengurus | Staf komunitas |
| Community Volunteer | Relawan komunitas |

---

## 4. Module List

| Module | Description |
|---|---|
| Public Website | Beranda, Blog, CMS, Contact |
| Auth | Login, Register, Password Reset, Role Request |
| Superadmin Dashboard | Overview, Management, Approval |
| Member Module | Profile, Interest, Activity |
| Community Module | CRUD, Members, Regions, Subgroups |
| Event Module | CRUD, Registration, Gallery, Chat |
| Volunteer Module | Campaign, Application |
| Donation Module | Donation, Verification |
| Finance Module | Transaction, Summary, Report |
| Brand Module | CRUD, Campaign, Staff |
| Company Module | CRUD, Brand Management |
| Collaboration Module | Proposal, Response, Tracking |
| Premium Module | Plans, Subscriptions, Feature Lock |
| CMS Module | Homepage, Blog, Pages, Contact |
| Multilanguage | Translation ID/EN |
| Admin Chat | Internal Messaging |
| Documentation | SDLC Documentation Generator |

---

## 5. Functional Requirements

### 5.1 Public Website & CMS

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-PUB-001 | Homepage | Menampilkan beranda dengan hero, fitur, komunitas unggulan | Public | High |
| FR-PUB-002 | Blog | Menampilkan daftar dan detail blog post | Public | Medium |
| FR-PUB-003 | About | Menampilkan halaman Tentang Kami | Public | Medium |
| FR-PUB-004 | Contact | Form saran dan kontak | Public | Medium |
| FR-PUB-005 | Community Directory | Pencarian dan filter komunitas | Public | Medium |
| FR-PUB-006 | Event Directory | Daftar event publik | Public | Medium |
| FR-CMS-001 | Homepage Sections | CRUD homepage sections | Superadmin | Medium |
| FR-CMS-002 | Blog Management | CRUD blog posts, publish/archive | Superadmin | Medium |
| FR-CMS-003 | Pages Management | Edit CMS pages (tentang, hubungi) | Superadmin | Medium |
| FR-CMS-004 | Contact Settings | Update informasi kontak | Superadmin | Low |
| FR-CMS-005 | Suggestions | Review dan archive saran | Superadmin | Low |

### 5.2 Auth & Role Request

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-AUTH-001 | Register | Registrasi dengan email atau username + password | Guest | High |
| FR-AUTH-002 | Login User | Login untuk member dan role lainnya | Member | High |
| FR-AUTH-003 | Login Superadmin | Login terpisah di /admin/login | Superadmin | High |
| FR-AUTH-004 | Password Reset | Reset password via email | Guest | Medium |
| FR-AUTH-005 | Logout | Logout dan invalidasi session | All Auth | High |
| FR-AUTH-006 | Onboarding | Pilih interest dan role request setelah register | Member | Medium |
| FR-AUTH-007 | Role Request | Ajukan request untuk role tertentu | Member | High |
| FR-AUTH-008 | Approve Role | Approve/reject role request | Superadmin | High |
| FR-AUTH-009 | Account Restricted | Halaman untuk akun banned/suspended | System | Medium |

### 5.3 Superadmin Dashboard

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-SUP-001 | Dashboard | Overview statistik platform | Superadmin | High |
| FR-SUP-002 | Member Management | List, search, export, suspend, ban, activate | Superadmin | High |
| FR-SUP-003 | Community Owner Management | List, search, export, suspend, ban | Superadmin | High |
| FR-SUP-004 | Brand Owner Management | List, search, export, suspend, ban | Superadmin | High |
| FR-SUP-005 | Company Management | List, search, export, suspend, ban, delete | Superadmin | High |
| FR-SUP-006 | Community Management | List, approve, reject, suspend, ban, activate | Superadmin | High |
| FR-SUP-007 | Brand Management | List, approve, reject, suspend, ban, activate | Superadmin | High |
| FR-SUP-008 | Event Management | List, view, cancel, archive, delete | Superadmin | Medium |
| FR-SUP-009 | Approval Center | Central approval untuk semua entity | Superadmin | High |
| FR-SUP-010 | Role Request Management | List, view, approve, reject | Superadmin | High |
| FR-SUP-011 | Audit Logs | View audit trail | Superadmin | Medium |
| FR-SUP-012 | Login Logs | View login activity, today's login | Superadmin | Medium |
| FR-SUP-013 | Wallet Management | View dan adjust wallet user | Superadmin | Medium |
| FR-SUP-014 | Donation Management | View, confirm, reject donations | Superadmin | Medium |
| FR-SUP-015 | Platform Fees | View fee reports | Superadmin | Low |
| FR-SUP-016 | Settings | Edit profile dan password | Superadmin | Medium |
| FR-SUP-017 | Master Data | Kelola interests, event types, regions | Superadmin | Medium |
| FR-SUP-018 | Ownership Transfer | Transfer ownership komunitas/brand | Superadmin | Medium |

### 5.4 Member Module

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-MBR-001 | Member Dashboard | Dashboard personal dengan aktivitas | Member | High |
| FR-MBR-002 | Profile Edit | Edit biodata, avatar, bio | Member | High |
| FR-MBR-003 | Interest Selection | Pilih minat dari master interests | Member | Medium |
| FR-MBR-004 | Join Community | Join/leave komunitas | Member | High |
| FR-MBR-005 | Event Registration | Register event, upload payment | Member | High |
| FR-MBR-006 | Event Chat | Akses forum chat event | Member | Medium |
| FR-MBR-007 | Wallet | Lihat saldo dan history | Member | Medium |
| FR-MBR-008 | Donations | Donasi ke event atau komunitas | Member | Medium |
| FR-MBR-009 | Role Requests | Lihat status role request | Member | Medium |

### 5.5 Community Module

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-COM-001 | CRUD Community | Create, read, update, delete komunitas | Community Owner | High |
| FR-COM-002 | Member Management | Approve, role update, remove, ban/unban | Community Owner | High |
| FR-COM-003 | Region Management | CRUD regions untuk komunitas | Community Owner | Medium |
| FR-COM-004 | Subgroup Management | CRUD subgroups | Community Owner | Medium |
| FR-COM-005 | Community Approval | Approve/reject by superadmin | Superadmin | High |

### 5.6 Event Module

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-EVT-001 | CRUD Event | Create, read, update, delete event | Community Owner | High |
| FR-EVT-002 | Event Registration | Register dan bayar event | Member | High |
| FR-EVT-003 | Payment Confirmation | Confirm/reject payment | Community Owner | High |
| FR-EVT-004 | Event Gallery | Upload dan hapus foto event | Community Owner | Medium |
| FR-EVT-005 | Event Chat Forum | Buat, pin, approve/reject threads | Community Owner | Medium |

### 5.7 Volunteer & Donation

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-VOL-001 | Volunteer Campaign | Buat kampanye volunteer | Community Owner | Medium |
| FR-VOL-002 | Volunteer Application | Apply sebagai volunteer | Member | Medium |
| FR-DON-001 | Donate to Event | Donasi ke event tertentu | Member | Medium |
| FR-DON-002 | Donate to Community | Donasi ke komunitas | Member | Medium |
| FR-DON-003 | Donation Verification | Confirm/reject donasi | Community Owner | High |
| FR-FIN-001 | Finance Transaction | Catat transaksi keuangan | Community Owner | Medium |
| FR-FIN-002 | Finance Summary | Ringkasan keuangan event | Community Owner | Medium |

### 5.8 Brand & Company

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-BRD-001 | CRUD Brand | Create, read, update, delete brand | Brand Owner | High |
| FR-BRD-002 | Brand Campaign | Buat campaign brand | Brand Owner | Medium |
| FR-BRD-003 | Brand Staff | Kelola staff brand | Brand Owner | Medium |
| FR-BRD-004 | Brand Approval | Approve/reject brand | Superadmin | High |
| FR-CMP-001 | CRUD Company | Create, read, update, delete company | Company Owner | High |
| FR-CMP-002 | Company Brand | Kelola brand dalam company | Company Owner | Medium |

### 5.9 Collaboration

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-COL-001 | Send Proposal | Kirim proposal kolaborasi | Brand Owner | High |
| FR-COL-002 | Respond Proposal | Accept/reject proposal | Community Owner | High |
| FR-COL-003 | Cancel Collaboration | Batalkan proposal | Sender | Medium |
| FR-COL-004 | Complete Collaboration | Tandai selesai | Receiver | Medium |
| FR-COL-005 | Collaboration Tracking | Track status kolaborasi | All | Medium |

### 5.10 Premium

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-PRM-001 | Premium Plans | CRUD premium plans | Superadmin | High |
| FR-PRM-002 | Subscription | Subscribe ke plan | Member | High |
| FR-PRM-003 | Feature Lock | Lock/unlock features based on plan | System | High |
| FR-PRM-004 | Trial Management | Activate/deactivate trial | Superadmin | Medium |

### 5.11 Multilanguage

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-MLT-001 | Language Switch | Toggle Bahasa Indonesia/Inggris | All | Medium |
| FR-MLT-002 | Translation Management | Kelola konten terjemahan | Superadmin | Low |

### 5.12 Admin Chat

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-CHT-001 | Conversation List | List percakapan admin | Superadmin | Medium |
| FR-CHT-002 | Send Message | Kirim pesan internal | Superadmin | Medium |
| FR-CHT-003 | Add Participant | Tambah peserta percakapan | Superadmin | Low |
| FR-CHT-004 | Archive | Arsipkan percakapan | Superadmin | Low |

### 5.13 Documentation

| FR ID | Feature | Description | Actor | Priority |
|---|---|---|---|---|
| FR-DMS-001 | Dashboard | Lihat daftar dokumentasi | Superadmin | Medium |
| FR-DMS-002 | Generate Document | Generate dokumen SDLC individual | Superadmin | Medium |
| FR-DMS-003 | Generate All | Generate semua dokumen sekaligus | Superadmin | Medium |
| FR-DMS-004 | Preview | Preview konten dokumen | Superadmin | Medium |
| FR-DMS-005 | Download | Download dokumen dalam format md/txt/html | Superadmin | Medium |
| FR-DMS-006 | Delete | Hapus dokumen | Superadmin | Low |
| FR-DMS-007 | Route Inventory | Lihat daftar routes | Superadmin | Medium |
| FR-DMS-008 | Database Inventory | Lihat struktur database | Superadmin | Medium |

---

## 6. Non-functional References

- Response time < 3 detik untuk setiap halaman
- Mobile responsive untuk semua halaman
- HTTPS untuk seluruh komunikasi
- Backup database harian
- Audit log untuk semua aksi penting

---

## 7. Access Control

Setiap route dilindungi oleh middleware:
- `auth` — Autentikasi wajib
- `active_user` — Status user aktif (bukan banned/suspended)
- `admin` — Role superadmin atau platform_admin
- Role-based: `role:community_owner`, `role:brand_owner`, dll.

---

## 8. Error Handling

- Flash message untuk success/error
- Validasi form dengan error message spesifik
- 403 Forbidden untuk unauthorized access
- 404 Not Found untuk resource tidak ada
- Try-catch untuk operasi yang berpotensi error

---

## 9. Reporting/Export

- Export data member, community owner, brand owner, company dalam CSV
- Export keuangan dan donasi
- Export documentation dalam format MD/TXT/HTML

---

## 10. Audit Trail

- Semua aksi penting tercatat di audit_logs
- Login activity tercatat di login_logs
- Documentation generation tercatat di documentation_files

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildSrs(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Software Requirement Specification (SRS) — KomunaID V2

---

## 1. Introduction

### 1.1 Purpose
Dokumen ini mendefinisikan spesifikasi teknis dan non-teknis untuk pengembangan KomunaID V2.

### 1.2 Scope
KomunaID V2 adalah platform komunitas web-based yang dibangun dengan Laravel 11, MySQL, dan Tailwind CSS.

### 1.3 Definitions
- **RBAC**: Role-Based Access Control
- **CRUD**: Create, Read, Update, Delete
- **Middleware**: Layer autentikasi/otorisasi Laravel
- **Soft Delete**: Penghapusan logis tanpa menghapus data fisik

### 1.4 References
- BRD KomunaID V2
- FRD KomunaID V2
- Laravel 11 Documentation
- Spatie Laravel Permission Documentation

---

## 2. Overall Description

### 2.1 Product Perspective
KomunaID V2 adalah web application single-page-like yang dibangun dengan:
- **Backend**: Laravel 11 (PHP 8.2+)
- **Database**: MySQL 8.x
- **Frontend**: Blade Templates + Tailwind CSS 4.x + Vite
- **Auth**: Laravel Breeze + Spatie Permission
- **File Storage**: Laravel Storage (local/S3)

### 2.2 User Classes

| Class | Description | Access Level |
|---|---|---|
| Guest | Visitor belum login | Public pages only |
| Member | User terdaftar dengan role member | Member dashboard + public |
| Community Owner | Pemilik komunitas | Community management |
| Brand Owner | Pemilik brand | Brand management |
| Company Owner | Pemilik perusahaan | Company management |
| Superadmin | Pengelola platform | Full access |
| Admin Platform | Asisten pengelola |大部分 akses admin |

### 2.3 Operating Environment
- PHP 8.2+
- MySQL 8.x
- Node.js 18+ (untuk build assets)
- Composer (package manager PHP)
- npm (package manager JS)

### 2.4 Design Constraints
- Menggunakan Laravel conventions (MVC, Eloquent, Blade)
-遵循 PSR-12 coding standards
- Mobile responsive design
- Tidak menggunakan external API untuk fitur inti

### 2.5 Assumptions
- Server memiliki PHP 8.2+ dengan extensions yang diperlukan
- MySQL 8.x dengan InnoDB engine
- Node.js tersedia untuk asset build

---

## 3. System Features

### 3.1 Public Website
- Responsive homepage dengan hero, features, communities
- Blog system dengan CRUD
- CMS pages (About, Contact)
- Community directory dengan search/filter
- Event directory

### 3.2 Authentication
- Laravel Breeze untuk register/login
- Superadmin login terpisah (/admin/login)
- Password reset via email
- Session management dan invalidation

### 3.3 Role & Permission (Spatie)
- Roles: superadmin, admin_platform, member, community_owner, brand_owner, company_owner, community_pengurus, community_volunteer, brand_staff
- Permission-based access control
- Role request dan approval workflow

### 3.4 Superadmin Features
- Dashboard statistik
- Entity management (members, communities, brands, companies, events)
- Approval center terpusat
- Audit log dan login log
- Wallet management
- Donation management
- CMS management
- Master data management
- Settings

### 3.5 Member Features
- Personal dashboard
- Profile management
- Interest selection
- Community join/leave
- Event registration
- Wallet dan donations
- Role request

### 3.6 Community Features
- CRUD komunitas
- Member management (approve, role, ban)
- Region dan subgroup
- Event management
- Volunteer campaigns
- Donations management
- Collaboration responses

### 3.7 Event Features
- CRUD events
- Registration dan payment
- Gallery management
- Chat forum
- Finance transactions

### 3.8 Brand/Company Features
- Brand CRUD dan campaign
- Staff management
- Company CRUD
- Brand within company

### 3.9 Collaboration Features
- Proposal creation
- Accept/reject/cancel/complete workflow
- Status tracking

### 3.10 Premium Features
- Premium plans management
- Subscription management
- Feature lock/unlock
- Trial management

### 3.11 Multilanguage
- Switcher ID/EN
- Translation model
- Blade translation helpers

### 3.12 Admin Chat
- Conversation management
- Message threading
- Participant management
- Read/unread tracking
- Archive/unarchive

---

## 4. External Interface Requirements

### 4.1 User Interface
- Blade templates dengan Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Consistent design system (#0B2D89, #25B9F2)
- Dark sidebar untuk admin

### 4.2 Software Interface
- Laravel Framework 11
- Spatie Permission 6.x
- Laravel Breeze 2.x
- Vite bundler

### 4.3 Database Interface
- Eloquent ORM
- Laravel Migrations
- MySQL 8.x native

### 4.4 File/Storage Interface
- Laravel Storage facade
- Local filesystem atau S3
- File upload untuk gallery, profile, payment

---

## 5. Non-functional Requirements

### 5.1 Security
- CSRF protection aktif
- XSS prevention (Blade auto-escaping)
- SQL injection prevention (Eloquent parameterized)
- Password hashing (bcrypt)
- Role-based access control
- Audit logging
- Session management
- No .env exposure

### 5.2 Performance
- Halaman load < 3 detik
- Database query optimization (eager loading)
- Pagination untuk list data
- Asset optimization (Vite minify)
- Cache untuk data statis

### 5.3 Reliability
- Soft deletes untuk data penting
- Try-catch untuk error handling
- Flash messages untuk user feedback
- Validation di backend

### 5.4 Usability
- Intuitive navigation
- Mobile responsive
- Consistent UI patterns
- Error messages yang jelas
- Loading indicators

### 5.5 Maintainability
- PSR-12 coding standard
- MVC architecture
- Service layer pattern
- Repository pattern where applicable
- Comprehensive documentation

### 5.6 Compatibility
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Android Chrome)
- Laravel 11 compatible

---

## 6. Data Requirements

### Database Tables (KomunaID V2):
- users, profiles, role_requests
- communities, community_members, community_managements
- community_volunteers, community_campaigns
- events, event_registrations, event_donations
- event_finance_transactions, event_finance_summaries
- brands, companies, collaboration_proposals
- premium_plans, subscriptions, feature_locks, feature_usages
- admin_conversations, admin_messages
- cms_pages, blogs, homepage_sections
- documentation_files
- audit_logs, login_logs
- interests, event_types, regions
- translations

---

## 7. Access Control Requirements

| Route Pattern | Middleware | Roles |
|---|---|---|
| / (public) | guest | - |
| /login, /register | guest | - |
| /member/* | auth, active_user | member, community_owner, brand_owner, etc |
| /community-own/* | auth, active_user, role:community_owner | community_owner |
| /brand/* | auth, active_user, role:brand_owner\|brand_staff | brand_owner, brand_staff |
| /company-owner/* | auth, active_user, role:company_owner\|superadmin | company_owner |
| /superadmin/* | auth, active_user, admin | superadmin, platform_admin |
| /admin/login | guest | - |

---

## 8. Error Handling

- **403 Forbidden**: Role tidak cukup
- **404 Not Found**: Resource tidak ditemukan
- **422 Validation Error**: Input tidak valid
- **500 Server Error**: Error internal (logged)
- Flash messages: success, error, warning

---

## 9. Backup/Restore Notes

- Database backup sebelum migration
- File backup untuk storage/app
- Rollback strategy: revert code + restore DB

---

## 10. Future Requirements

- Real-time notifications (WebSocket/Pusher)
- Payment gateway integration
- Mobile app (React Native/Flutter)
- Advanced analytics
- Multi-tenant architecture
- API v2 dengan versioning

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildUseCase(): string
    {
        $now = now()->format('d M Y H:i');

        $uc = function (string $id, string $name, string $actor, string $desc, string $pre, string $trigger, string $main, string $alt, string $exception, string $post, string $rules) {
            return "| {$id} | {$name} | {$actor} | {$desc} | {$pre} | {$trigger} | {$main} | {$alt} | {$exception} | {$post} | {$rules} |\n";
        };

        return "# Use Case Documentation — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Use Case Documentation |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Actors

| Actor | Description |
|---|---|
| Guest | Pengunjung tidak terdaftar |
| Member | Pengguna terdaftar |
| Community Owner | Pemilik komunitas |
| Brand Owner | Pemilik brand |
| Company Owner | Pemilik perusahaan |
| Superadmin | Pengelola platform |
| Admin Platform | Asisten pengelola |

---

## 3. Use Case List

| UC ID | Name | Actor | Description | Precondition | Trigger | Main Flow | Alt Flow | Exception Flow | Postcondition | Business Rules |
|---|---|---|---|---|---|---|---|---|---|---|
| UC-AUTH-001 | Register Account | Guest | Membuat akun baru | Guest membuka halaman register | Submit form register | 1. Buka register 2. Isi email/username + password 3. Submit 4. Sistem buat akun 5. Redirect onboarding | Email sudah terdaftar: tampilkan error | Data tidak valid: tampilkan validasi error | Akun terbuat, redirect onboarding | Email/username unik, password min 8 karakter |
| UC-AUTH-002 | Login Public | Member/Role lain | Login ke sistem | User memiliki akun | Submit form login | 1. Buka login 2. Isi credentials 3. Submit 4. Sistem validasi 5. Redirect sesuai role | Password salah: tampilkan error | Akun dibanned: redirect restricted | Login berhasil, redirect dashboard | Status account harus active |
| UC-AUTH-003 | Login Superadmin | Superadmin | Login ke panel admin | Superadmin memiliki akun | Submit form login | 1. Buka /admin/login 2. Isi credentials 3. Submit 4. Validasi 5. Redirect dashboard | Password salah: tampilkan error | Bukan superadmin: 403 | Login berhasil, redirect superadmin dashboard | Hanya superadmin/platform_admin |
| UC-AUTH-004 | Request Role | Member | Mengajukan permintaan role | Member sudah login | Klik role request | 1. Buka role request 2. Pilih role 3. Isi data pendukung 4. Submit 5. Status pending | Role sudah pernah diajukan: tolak | Data tidak lengkap: tampilkan error | Request terkirim, menunggu approval | Hanya bisa request role tertentu |
| UC-AUTH-005 | Approve Role Request | Superadmin | Menyetujui/menolak role | Ada role request pending | Klik approve/reject | 1. Buka approval center 2. Lihat detail 3. Approve/reject 4. Update status | Sudah diproses: tampilkan pesan | - | Status role updated | Superadmin only |
| UC-COM-001 | Manage Community | Community Owner | CRUD komunitas | Community owner sudah login | Klik create/edit community | 1. Buka komunitas 2. Create/edit 3. Isi data 4. Submit 5. Pending approval | Slug sudah ada: tolak | Data tidak valid: error | Komunitas terbuat/updated | Perlu approval superadmin |
| UC-EVT-001 | Create Event | Community Owner | Membuat event baru | Community owner punya komunitas | Klik create event | 1. Buka create event 2. Isi data 3. Upload gambar 4. Submit | Tidak ada komunitas: tolak | Data tidak valid: error | Event terbuat, pending approval | Perlu approval superadmin |
| UC-EVT-002 | Register Event | Member | Mendaftar event | Member sudah login, event tersedia | Klik register event | 1. Pilih event 2. Klik register 3. Upload bukti bayar 4. Submit | Sudah terdaftar: tolak | Slot penuh: tolak | Registrasi terbuat, pending payment | Membership aktif |
| UC-BRD-001 | Create Brand | Brand Owner | Membuat brand | Brand owner sudah login | Klik create brand | 1. Buka brand 2. Create 3. Isi data 4. Submit | Nama brand sudah ada: tolak | Data tidak valid: error | Brand terbuat, pending approval | Perlu approval superadmin |
| UC-COL-001 | Send Collaboration | Brand/Community Owner | Kirim proposal | Brand/community sudah terdaftar | Klik send proposal | 1. Pilih target 2. Isi proposal 3. Submit | Target sudah ada proposal: tolak | Data tidak valid: error | Proposal terkirim | Target harus aktif |
| UC-DON-001 | Donate to Event | Member | Donasi ke event | Member sudah login, event aktif | Klik donate | 1. Pilih event 2. Isi nominal 3. Konfirmasi 4. Submit | Event tidak aktif: tolak | Nominal tidak valid: error | Donasi tercatat | Member harus aktif |
| UC-PRM-001 | Subscribe Premium | Member | Berlangganan premium | Member sudah login | Klik subscribe | 1. Pilih plan 2. Pilih metode 3. Submit | Sudah subscribe: tolak | Payment gagal: error | Subscription aktif | Payment harus berhasil |
| UC-DMS-001 | Generate Documentation | Superadmin | Generate dokumen SDLC | Superadmin sudah login | Klik generate | 1. Pilih dokumen 2. Pilih format 3. Klik generate 4. Proses 5. File tersimpan | Generate gagal: error | Data tidak lengkap: warning | Dokumen tergenerate | Superadmin only |
";
    }

    private function buildUserStory(): string
    {
        $now = now()->format('d M Y H:i');

        return "# User Story & Acceptance Criteria — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | User Story & Acceptance Criteria |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Public Visitor

### US-PUB-001
**As a** public visitor,
**I want to** see the homepage with information about KomunaID,
**So that** I understand what the platform offers.

**Acceptance Criteria:**
- **Given** I open the homepage
- **When** the page loads
- **Then** I see hero section, features, and community highlights

### US-PUB-002
**As a** public visitor,
**I want to** browse community directory,
**So that** I can find communities that match my interests.

**Acceptance Criteria:**
- **Given** I open communities page
- **When** I search or filter
- **Then** I see filtered list of communities

### US-PUB-003
**As a** public visitor,
**I want to** read blog posts,
**So that** I stay informed about platform updates.

**Acceptance Criteria:**
- **Given** I open blog page
- **When** I click on a blog post
- **Then** I see full blog content

---

## 3. Member

### US-MBR-001
**As a** guest,
**I want to** register using email or username,
**So that** I can access KomunaID as a member.

**Acceptance Criteria:**
- **Given** I open register page
- **When** I submit valid email/username and password
- **Then** system creates member account and redirects to onboarding

### US-MBR-002
**As a** member,
**I want to** complete my profile and select interests,
**So that** I get personalized community recommendations.

**Acceptance Criteria:**
- **Given** I complete onboarding
- **When** I select interests
- **Then** my profile is updated with selected interests

### US-MBR-003
**As a** member,
**I want to** join a community,
**So that** I can participate in community activities.

**Acceptance Criteria:**
- **Given** I browse communities
- **When** I click join
- **Then** my membership is created (pending approval if required)

### US-MBR-004
**As a** member,
**I want to** register for an event,
**So that** I can participate in community events.

**Acceptance Criteria:**
- **Given** I view an event
- **When** I click register and upload payment
- **Then** my registration is created as pending

### US-MBR-005
**As a** member,
**I want to** request a role upgrade,
**So that** I can manage communities or brands.

**Acceptance Criteria:**
- **Given** I open role request
- **When** I select a role and submit
- **Then** my request is sent for superadmin approval

---

## 4. Community Owner

### US-COM-001
**As a** community owner,
**I want to** create and manage my community,
**So that** I can build and grow my community.

**Acceptance Criteria:**
- **Given** I am a community owner
- **When** I create a community with valid data
- **Then** community is created and pending superadmin approval

### US-COM-002
**As a** community owner,
**I want to** manage community members,
**So that** I control who participates in my community.

**Acceptance Criteria:**
- **Given** I view member list
- **When** I approve, ban, or change role
- **Then** member status is updated

### US-COM-003
**As a** community owner,
**I want to** create events for my community,
**So that** members can participate in organized activities.

**Acceptance Criteria:**
- **Given** I create an event
- **When** I fill in event details
- **Then** event is created and pending approval

### US-COM-004
**As a** community owner,
**I want to** manage volunteer campaigns,
**So that** I can recruit volunteers for events.

**Acceptance Criteria:**
- **Given** I create a volunteer campaign
- **When** members apply
- **Then** I can review and accept/reject applications

### US-COM-005
**As a** community owner,
**I want to** verify donations,
**So that** I can confirm or reject community/event donations.

**Acceptance Criteria:**
- **Given** I view donations
- **When** I confirm or reject
- **Then** donation status is updated

---

## 5. Brand Owner

### US-BRD-001
**As a** brand owner,
**I want to** create my brand profile,
**So that** I can establish brand presence on KomunaID.

**Acceptance Criteria:**
- **Given** I am a brand owner
- **When** I create a brand with valid data
- **Then** brand is created and pending superadmin approval

### US-BRD-002
**As a** brand owner,
**I want to** send collaboration proposals to communities,
**So that** I can partner with relevant communities.

**Acceptance Criteria:**
- **Given** I select a community
- **When** I send a proposal
- **Then** proposal is sent to community owner for review

### US-BRD-003
**As a** brand owner,
**I want to** manage brand staff,
**So that** I can delegate brand management tasks.

**Acceptance Criteria:**
- **Given** I view staff management
- **When** I add or remove staff
- **Then** staff list is updated

---

## 6. Company Owner

### US-CMP-001
**As a** company owner,
**I want to** create my company profile,
**So that** I can manage company brands on KomunaID.

**Acceptance Criteria:**
- **Given** I am a company owner
- **When** I create a company
- **Then** company is created and pending approval

---

## 7. Superadmin

### US-SUP-001
**As a** superadmin,
**I want to** see a dashboard overview,
**So that** I monitor platform health at a glance.

**Acceptance Criteria:**
- **Given** I login as superadmin
- **When** I view dashboard
- **Then** I see key metrics (users, communities, events, etc.)

### US-SUP-002
**As a** superadmin,
**I want to** approve or reject role requests,
**So that** I control platform access levels.

**Acceptance Criteria:**
- **Given** I view approval center
- **When** I approve or reject a role request
- **Then** user role is updated accordingly

### US-SUP-003
**As a** superadmin,
**I want to** generate SDLC documentation,
**So that** project documentation stays up to date.

**Acceptance Criteria:**
- **Given** I open documentation dashboard
- **When** I select and generate a document
- **Then** document is generated and available for preview/download

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildRouteDocumentation(): string
    {
        $now = now()->format('d M Y H:i');

        $routes = Route::getRoutes();
        $routeRows = '';

        foreach ($routes as $route) {
            $methods = implode('|', $route->methods());
            $uri = '/' . ltrim($route->uri(), '/');
            $name = $route->getName() ?: '-';
            $action = $route->getAction('uses') ?: '-';
            $middleware = is_array($route->middleware()) ? implode(', ', $route->middleware()) : ($route->middleware() ?: '-');

            $actionStr = is_string($action) ? $action : '-';
            if ($actionStr !== '-' && class_exists($actionStr)) {
                $actionStr = class_basename($actionStr);
            } elseif ($actionStr !== '-' && str_contains($actionStr, '@')) {
                $parts = explode('@', $actionStr);
                $actionStr = class_basename($parts[0]) . '@' . ($parts[1] ?? '');
            }

            $group = $this->detectRouteGroup($uri, $name);
            $authRequired = str_contains($middleware, 'auth') || str_contains($middleware, 'admin') || str_contains($middleware, 'active_user') ? 'Yes' : 'No';
            $roleRequired = '-';
            if (preg_match('/role:(.+)/', $middleware, $m)) {
                $roleRequired = $m[1];
            } elseif (str_contains($middleware, 'admin')) {
                $roleRequired = 'superadmin|platform_admin';
            }

            $safeUri = htmlspecialchars($uri, ENT_QUOTES, 'UTF-8');
            $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
            $safeAction = htmlspecialchars($actionStr, ENT_QUOTES, 'UTF-8');
            $safeMiddleware = htmlspecialchars($middleware, ENT_QUOTES, 'UTF-8');

            $routeRows .= "| `{$methods}` | `{$safeUri}` | `{$safeName}` | `{$safeMiddleware}` | `{$safeAction}` | {$group} | {$authRequired} | {$roleRequired} |\n";
        }

        return "# Route Documentation — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Route Documentation |
| Version | 2.0 |
| Generated Date | {$now} |
| Total Routes | {$routes->count()} |

---

## 2. Route Overview

| Method | URI | Name | Middleware | Controller/Action | Module Group | Auth | Role |
|---|---|---|---|---|---|---|---|
{$routeRows}

---

## 3. Route Groups

### Public Routes
- `/` — Homepage
- `/blogs` — Blog
- `/communities` — Community Directory
- `/events` — Event Directory
- `/about` — About Page
- `/contact` — Contact Page

### Auth Routes
- `/register` — Register
- `/login` — Login
- `/forgot-password` — Password Reset
- `/admin/login` — Superadmin Login

### Member Routes (`/member`)
- `/member/dashboard` — Member Dashboard
- `/member/profile` — Profile Management
- `/member/role-requests` — Role Requests
- `/member/events` — Event Registration
- `/member/wallet` — Wallet
- `/member/donations` — Donations

### Community Owner Routes (`/community-own`)
- `/community-own/dashboard` — Dashboard
- `/community-own/communities` — Community CRUD
- `/community-own/events` — Event Management
- `/community-own/collaborations` — Collaboration
- `/community-own/wallet` — Wallet
- `/community-own/donations` — Donations

### Brand Owner Routes (`/brand`)
- `/brand/dashboard` — Dashboard
- `/brand/brands` — Brand CRUD
- `/brand/campaigns` — Campaign Management
- `/brand/collaborations` — Collaboration
- `/brand/staff` — Staff Management

### Company Owner Routes (`/company-owner`)
- `/company-owner/dashboard` — Dashboard

### Superadmin Routes (`/superadmin`)
- `/superadmin/dashboard` — Dashboard
- `/superadmin/members` — Member Management
- `/superadmin/community-owners` — Community Owners
- `/superadmin/brand-owners` — Brand Owners
- `/superadmin/companies` — Companies
- `/superadmin/communities` — Communities
- `/superadmin/brands` — Brands
- `/superadmin/events` — Events
- `/superadmin/approval-center` — Approval Center
- `/superadmin/role-requests` — Role Requests
- `/superadmin/audit-logs` — Audit Logs
- `/superadmin/login-logs` — Login Logs
- `/superadmin/wallets` — Wallets
- `/superadmin/donations` — Donations
- `/superadmin/cms` — CMS Management
- `/superadmin/admin-chat` — Admin Chat
- `/superadmin/settings` — Settings
- `/superadmin/documentation` — Documentation

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function detectRouteGroup(string $uri, string $name): string
    {
        if (Str::startsWith($uri, 'superadmin/documentation')) return 'Documentation';
        if (Str::startsWith($uri, 'superadmin/cms')) return 'CMS';
        if (Str::startsWith($uri, 'superadmin')) return 'Superadmin';
        if (Str::startsWith($uri, 'community-own')) return 'Community Owner';
        if (Str::startsWith($uri, 'brand')) return 'Brand Owner';
        if (Str::startsWith($uri, 'company-owner')) return 'Company Owner';
        if (Str::startsWith($uri, 'member')) return 'Member';
        if (Str::startsWith($uri, 'admin')) return 'Auth (Superadmin)';
        if (Str::startsWith($uri, 'register') || Str::startsWith($uri, 'login') || Str::startsWith($uri, 'forgot-password') || Str::startsWith($uri, 'reset-password')) return 'Auth';
        if (Str::startsWith($uri, 'onboarding')) return 'Onboarding';
        if (Str::startsWith($uri, 'blogs') || Str::startsWith($uri, 'communities') || Str::startsWith($uri, 'events') || Str::startsWith($uri, 'about') || Str::startsWith($uri, 'contact')) return 'Public';
        return 'Other';
    }

    private function buildModuleDocumentation(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Module Documentation — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Module Documentation |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Module Overview

### Module 1: Public Website & CMS
**Path**: `app/Http/Controllers/Public/`, `app/Http/Controllers/Superadmin/Cms/`
**Description**: Public-facing pages and CMS management.

| Component | Path | Description |
|---|---|---|
| PublicHomeController | Public/PublicHomeController.php | Homepage rendering |
| PublicBlogController | Public/PublicBlogController.php | Blog listing & detail |
| PublicPageController | Public/PublicPageController.php | CMS pages |
| PublicContactController | Public/PublicContactController.php | Contact page |
| PublicSuggestionController | Public/PublicSuggestionController.php | Suggestion form |
| PublicCommunityController | Public/PublicCommunityController.php | Community directory |
| PublicEventController | Public/PublicEventController.php | Event directory |
| SuperadminCmsDashboardController | Superadmin/Cms/SuperadminCmsDashboardController.php | CMS dashboard |
| SuperadminHomepageSectionController | Superadmin/Cms/SuperadminHomepageSectionController.php | Homepage sections CRUD |
| SuperadminBlogController | Superadmin/Cms/SuperadminBlogController.php | Blog CRUD |
| SuperadminPageController | Superadmin/Cms/SuperadminPageController.php | Page editing |
| SuperadminContactSettingController | Superadmin/Cms/SuperadminContactSettingController.php | Contact settings |
| SuperadminSuggestionController | Superadmin/Cms/SuperadminSuggestionController.php | Suggestion management |

**Models**: CmsPage, Blog, HomepageSection, ContactSetting, Suggestion

---

### Module 2: Auth & Role Request
**Path**: `app/Http/Controllers/Auth/`, `app/Http/Controllers/Member/RoleRequestController.php`
**Description**: Authentication, registration, and role request flow.

| Component | Path | Description |
|---|---|---|
| AuthenticatedSessionController | Auth/AuthenticatedSessionController.php | User login |
| RegisteredUserController | Auth/RegisteredUserController.php | User registration |
| PasswordResetLinkController | Auth/PasswordResetLinkController.php | Password reset |
| NewPasswordController | Auth/NewPasswordController.php | New password |
| OnboardingController | Auth/OnboardingController.php | Post-registration onboarding |
| SuperadminLoginController | Superadmin/LoginController.php | Superadmin login |
| DashboardRedirectController | Auth/DashboardRedirectController.php | Role-based redirect |
| AccountRestrictedController | Auth/AccountRestrictedController.php | Banned/suspended page |

**Models**: User, RoleRequest, RoleApproval
**Middleware**: active_user, admin, role

---

### Module 3: Superadmin Dashboard
**Path**: `app/Http/Controllers/Superadmin/`
**Description**: Platform management and monitoring.

| Component | Description |
|---|---|
| DashboardController | Overview statistics |
| UserController | User management |
| MemberController | Enhanced member management |
| CommunityOwnerController | Community owner management |
| BrandOwnerController | Brand owner management |
| CompanyController | Company management |
| CommunityController | Community management |
| BrandController | Brand management |
| EventController | Event management |
| ApprovalCenterController | Centralized approvals |
| RoleRequestController | Role request management |
| AuditLogController | Audit trail |
| LoginLogController | Login logs |
| WalletController | Wallet management |
| DonationController | Donation management |
| PlatformFeeController | Platform fee reports |
| SettingController | Profile & password |
| InterestController | Interest master data |
| EventTypeController | Event type master data |
| MasterRegionController | Region master data |

**Models**: User, Community, Brand, Company, Event, AuditLog, LoginLog, Wallet, Donation, PlatformFee, Interest, EventType, MasterRegion

---

### Module 4: Member Module
**Path**: `app/Http/Controllers/Member/`
**Description**: Member dashboard and activities.

| Component | Description |
|---|---|
| DashboardController | Member dashboard |
| ProfileController | Profile CRUD |
| RoleRequestController | Role request flow |
| CommunityController | Join/leave community |
| EventController | Event registration |
| EventChatController | Event chat |
| WalletController | Wallet & history |
| DonationController | Donation management |

**Models**: User, Profile, Community, CommunityMember, EventRegistration, Wallet, Donation

---

### Module 5: Community Owner Module
**Path**: `app/Http/Controllers/CommunityOwner/`
**Description**: Community management by owners.

| Component | Description |
|---|---|
| DashboardController | Community owner dashboard |
| CommunityController | Community CRUD |
| MemberController | Member management |
| RegionController | Region management |
| SubgroupController | Subgroup management |
| EventController | Event CRUD |
| EventGalleryController | Event gallery |
| EventChatController | Event chat/forum |
| CommunityCollaborationController | Collaboration management |
| DonationController | Donation management |
| CommunityWalletController | Community wallet |

**Models**: Community, CommunityMember, CommunityManagement, CommunityRegion, CommunitySubgroup, CommunityVolunteer, Event, EventRegistration, EventDonation, EventFinanceTransaction

---

### Module 6: Event, Volunteer, Donation & Finance
**Path**: Shared across CommunityOwner and Member controllers.
**Description**: Event lifecycle management.

**Key Models**: Event, EventRegistration, EventVolunteerCampaign, EventVolunteerApplication, EventDonation, EventFinanceTransaction, EventFinanceSummary, EventGallery, EventChat, EventChatThread

---

### Module 7: Brand, Company & Collaboration
**Path**: `app/Http/Controllers/BrandOwner/`, `app/Http/Controllers/CompanyOwner/`
**Description**: Brand and company management.

| Component | Description |
|---|---|
| BrandOwner DashboardController | Brand dashboard |
| BrandController | Brand CRUD |
| CampaignController | Campaign management |
| CollaborationController | Collaboration requests |
| StaffController | Staff management |
| CommunityDirectoryController | Browse communities |
| OwnershipTransferController | Brand ownership transfer |
| ProposalCollaborationController | Proposal management |
| SettingController | Brand settings |
| CompanyOwner CompanyController | Company CRUD |
| CompanyOwner CompanyBrandController | Brand within company |

**Models**: Brand, BrandMember, BrandOwnershipTransfer, Company, CompanyBrandMember, Campaign, CollaborationProposal, CollaborationRequest

---

### Module 8: Premium Feature, Trial & Subscription
**Path**: Models in app/Models/
**Description**: Premium monetization system.

**Models**: PremiumPlan, Subscription, FeatureLock, FeatureUsage

---

### Module 9: UI/UX Design System
**Path**: `resources/css/`, `resources/js/`, `resources/views/layouts/admin.blade.php`
**Description**: Consistent design across platform.

**Colors**: #0B2D89 (primary dark), #25B9F2 (accent), #126BFF (secondary)
**Framework**: Tailwind CSS 4.x + Vite

---

### Module 10: Multilanguage
**Path**: `app/Models/Translation.php`, Translation helpers
**Description**: ID/EN language support.

**Models**: Translation

---

### Module 11: Admin Chat / Internal Messaging
**Path**: `app/Http/Controllers/Superadmin/AdminChatController.php`, `app/Services/AdminChatService.php`
**Description**: Internal messaging between admins.

**Models**: AdminConversation, AdminConversationParticipant, AdminMessage
**Service**: AdminChatService

---

### Module 12: SDLC Documentation
**Path**: `app/Http/Controllers/Superadmin/DocumentationController.php`, `app/Services/Documentation/`
**Description**: Documentation generation system.

**Models**: DocumentationFile
**Service**: DocumentationGeneratorService

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildDatabaseDocumentation(): string
    {
        $now = now()->format('d M Y H:i');

        $tables = DB::select('SHOW TABLES');
        $dbName = DB::getDatabaseName();
        $tableNameKey = "Tables_in_{$dbName}";

        $sections = '';

        foreach ($tables as $table) {
            $tableName = $table->$tableNameKey;
            $columns = DB::select("SHOW COLUMNS FROM `{$tableName}`");
            $count = DB::table($tableName)->count();

            $sections .= "### {$tableName} ({$count} rows)\n\n";
            $sections .= "| Column | Type | Null | Default | Key | Extra |\n";
            $sections .= "|---|---|---|---|---|---|\n";

            foreach ($columns as $col) {
                $safeField = htmlspecialchars($col->Field, ENT_QUOTES, 'UTF-8');
                $safeType = htmlspecialchars($col->Type, ENT_QUOTES, 'UTF-8');
                $safeNull = htmlspecialchars($col->Null, ENT_QUOTES, 'UTF-8');
                $safeDefault = htmlspecialchars($col->Default ?? 'NULL', ENT_QUOTES, 'UTF-8');
                $safeKey = htmlspecialchars($col->Key, ENT_QUOTES, 'UTF-8');
                $safeExtra = htmlspecialchars($col->Extra, ENT_QUOTES, 'UTF-8');
                $sections .= "| `{$safeField}` | {$safeType} | {$safeNull} | {$safeDefault} | {$safeKey} | {$safeExtra} |\n";
            }
            $sections .= "\n";
        }

        return "# Database Documentation — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Database Documentation |
| Version | 2.0 |
| Generated Date | {$now} |
| Database | {$dbName} |
| Total Tables | " . count($tables) . " |

---

## 2. Database Overview

- **Engine**: MySQL / InnoDB
- **Charset**: utf8mb4
- **Total Tables**: " . count($tables) . "

---

## 3. Table Documentation

{$sections}

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildDataDictionary(): string
    {
        $now = now()->format('d M Y H:i');

        $tables = DB::select('SHOW TABLES');
        $dbName = DB::getDatabaseName();
        $tableNameKey = "Tables_in_{$dbName}";

        $rows = '';

        foreach ($tables as $table) {
            $tableName = $table->$tableNameKey;
            $columns = DB::select("SHOW COLUMNS FROM `{$tableName}`");

            foreach ($columns as $col) {
                $desc = 'Auto-generated description';
                $example = '-';
                $safeTable = htmlspecialchars($tableName, ENT_QUOTES, 'UTF-8');
                $safeField = htmlspecialchars($col->Field, ENT_QUOTES, 'UTF-8');
                $safeType = htmlspecialchars($col->Type, ENT_QUOTES, 'UTF-8');
                $safeNull = htmlspecialchars($col->Null, ENT_QUOTES, 'UTF-8');
                $safeDefault = htmlspecialchars($col->Default ?? 'NULL', ENT_QUOTES, 'UTF-8');
                $safeKey = htmlspecialchars($col->Key, ENT_QUOTES, 'UTF-8');

                $rows .= "| `{$safeTable}` | `{$safeField}` | {$safeType} | {$safeNull} | {$safeDefault} | {$safeKey} | {$desc} | {$example} |\n";
            }
        }

        return "# Data Dictionary — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Data Dictionary |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Data Dictionary

| Table | Column | Data Type | Nullable | Default | Key | Description | Example/Notes |
|---|---|---|---|---|---|---|---|
{$rows}

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildErd(): string
    {
        $now = now()->format('d M Y H:i');

        $tables = DB::select('SHOW TABLES');
        $dbName = DB::getDatabaseName();
        $tableNameKey = "Tables_in_{$dbName}";

        $entityList = '';
        $relationshipList = '';

        $tableNames = array_map(fn($t) => $t->$tableNameKey, $tables);

        foreach ($tables as $table) {
            $tableName = $table->$tableNameKey;
            $columns = DB::select("SHOW COLUMNS FROM `{$tableName}`");
            $fields = array_map(fn($c) => $c->Field, $columns);

            $entityList .= "- **{$tableName}**\n";
            foreach ($columns as $col) {
                $marker = $col->Key === 'PRI' ? ' (PK)' : ($col->Key === 'MUL' ? ' (FK)' : '');
                $entityList .= "  - {$col->Field}: {$col->Type}{$marker}\n";
            }
            $entityList .= "\n";

            foreach ($fields as $field) {
                if (Str::endsWith($field, '_id') && $field !== 'id') {
                    $relatedTable = Str::plural(Str::beforeLast($field, '_id'));
                    if (in_array($relatedTable, $tableNames)) {
                        $safeTable = htmlspecialchars($tableName, ENT_QUOTES, 'UTF-8');
                        $safeRelated = htmlspecialchars($relatedTable, ENT_QUOTES, 'UTF-8');
                        $safeField = htmlspecialchars($field, ENT_QUOTES, 'UTF-8');
                        $relationshipList .= "- {$safeTable}.{$safeField} -> {$safeRelated}.id\n";
                    }
                }
            }
        }

        $mermaidLines = '';
        foreach ($tables as $table) {
            $tableName = $table->$tableNameKey;
            $columns = DB::select("SHOW COLUMNS FROM `{$tableName}`");
            $fields = array_map(fn($c) => $c->Field, $columns);

            foreach ($fields as $field) {
                if (Str::endsWith($field, '_id') && $field !== 'id') {
                    $relatedTable = Str::plural(Str::beforeLast($field, '_id'));
                    if (in_array($relatedTable, $tableNames)) {
                        $safeTable = htmlspecialchars($tableName, ENT_QUOTES, 'UTF-8');
                        $safeRelated = htmlspecialchars($relatedTable, ENT_QUOTES, 'UTF-8');
                        $mermaidLines .= "    {$safeTable} }}o--|| {$safeRelated} : \"{$field}\"\n";
                    }
                }
            }
        }

        return "# Entity Relationship Diagram (ERD) — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Entity Relationship Diagram (ERD) |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Entity List

{$entityList}

---

## 3. Relationship List

{$relationshipList}

---

## 4. Mermaid ER Diagram

\`\`\`mermaid
erDiagram
{$mermaidLines}
\`\`\`

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildRolePermissionMatrix(): string
    {
        $now = now()->format('d M Y H:i');

        $roles = ['superadmin', 'admin_platform', 'member', 'community_owner', 'community_pengurus', 'community_volunteer', 'brand_owner', 'brand_staff', 'company_owner'];
        $features = [
            'Access public website' => [true, true, true, true, true, true, true, true, true],
            'Register/Login' => [false, false, true, true, true, true, true, true, true],
            'Member dashboard' => [false, false, true, true, true, true, true, true, true],
            'Community owner dashboard' => [false, false, false, true, true, true, false, false, false],
            'Brand owner dashboard' => [false, false, false, false, false, false, true, true, false],
            'Company owner dashboard' => [false, false, false, false, false, false, false, false, true],
            'Superadmin dashboard' => [true, true, false, false, false, false, false, false, false],
            'Manage members' => [true, true, false, false, false, false, false, false, false],
            'Manage communities' => [true, true, false, true, true, false, false, false, false],
            'Manage events' => [true, true, false, true, true, false, false, false, false],
            'Manage brands' => [true, true, false, false, false, false, true, true, false],
            'Manage companies' => [true, true, false, false, false, false, false, false, true],
            'Manage collaborations' => [true, true, false, true, false, false, true, false, false],
            'Manage premium' => [true, true, false, false, false, false, false, false, false],
            'Manage CMS' => [true, true, false, false, false, false, false, false, false],
            'Manage admin chat' => [true, true, false, false, false, false, false, false, false],
            'Generate documentation' => [true, false, false, false, false, false, false, false, false],
            'Approve role requests' => [true, true, false, false, false, false, false, false, false],
            'View audit logs' => [true, true, false, false, false, false, false, false, false],
            'Manage wallets' => [true, true, false, false, false, false, false, false, false],
        ];

        $header = '| Feature | Guest | ' . implode(' | ', array_map(fn($r) => ucwords(str_replace('_', ' ', $r)), $roles)) . " |\n";
        $separator = '|---|' . str_repeat('---|', count($roles) + 1) . "\n";

        $rows = '';
        foreach ($features as $feature => $checks) {
            $cells = array_map(fn($c) => $c ? 'Yes' : 'No', $checks);
            $rows .= "| {$feature} | " . implode(' | ', $cells) . " |\n";
        }

        $roleDesc = '';
        foreach ($roles as $role) {
            $roleDesc .= "- **" . ucwords(str_replace('_', ' ', $role)) . "**: " . $this->getRoleDescription($role) . "\n";
        }

        return "# Role & Permission Matrix — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Role & Permission Matrix |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Roles

{$roleDesc}

---

## 3. Permission Matrix

{$header}{$separator}{$rows}

---

## 4. Notes

- **Yes** = Feature can be accessed
- **No** = Feature cannot be accessed
- Middleware enforcement: `auth`, `active_user`, `admin`, `role:xxx`
- Role-based routes use Laravel Spatie Permission
- Superadmin and Platform Admin share admin-level access

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function getRoleDescription(string $role): string
    {
        return match ($role) {
            'superadmin' => 'Full platform access, manage all entities, generate documentation',
            'admin_platform' => 'Platform assistant with most admin features',
            'member' => 'Standard user, join communities, register events, donate',
            'community_owner' => 'Own and manage communities, events, volunteers, donations',
            'community_pengurus' => 'Community staff, help manage daily operations',
            'community_volunteer' => 'Volunteer for community events',
            'brand_owner' => 'Own and manage brands, send collaborations, create campaigns',
            'brand_staff' => 'Staff helping manage brand operations',
            'company_owner' => 'Own and manage companies, company brands',
            default => 'Unknown role',
        };
    }

    private function buildRtm(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Requirement Traceability Matrix (RTM) — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Requirement Traceability Matrix (RTM) |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. RTM

| Req ID | Req Description | Module | Source | Design Ref | Route/Controller Ref | Test Case ID | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| BR-AUTH-001 | Register with email/username | Auth | BRD | FR-AUTH-001 | RegisteredUserController | TC-AUTH-001 | Implemented | |
| BR-AUTH-002 | Login separation | Auth | BRD | FR-AUTH-002/003 | AuthenticatedSessionController, SuperadminLoginController | TC-AUTH-002 | Implemented | |
| BR-AUTH-003 | Role request | Auth | BRD | FR-AUTH-007 | RoleRequestController | TC-AUTH-003 | Implemented | |
| BR-SUP-001 | Superadmin dashboard | Superadmin | BRD | FR-SUP-001 | SuperadminDashboardController | TC-SUP-001 | Implemented | |
| BR-SUP-002 | Approval center | Superadmin | BRD | FR-SUP-009 | SuperadminApprovalCenterController | TC-SUP-002 | Implemented | |
| BR-SUP-003 | Entity management | Superadmin | BRD | FR-SUP-002~008 | Various controllers | TC-SUP-003 | Implemented | |
| BR-SUP-004 | Audit & login logs | Superadmin | BRD | FR-SUP-011/012 | AuditLogController, LoginLogController | TC-SUP-004 | Implemented | |
| BR-MBR-001 | Member dashboard | Member | BRD | FR-MBR-001 | MemberDashboardController | TC-MBR-001 | Implemented | |
| BR-MBR-002 | Profile & interest | Member | BRD | FR-MBR-002/003 | ProfileController | TC-MBR-002 | Implemented | |
| BR-COM-001 | Community CRUD | Community | BRD | FR-COM-001 | CommunityOwnerCommunityController | TC-COM-001 | Implemented | |
| BR-COM-002 | Member management | Community | BRD | FR-COM-002 | CommunityOwnerMemberController | TC-COM-002 | Implemented | |
| BR-EVT-001 | Event CRUD | Event | BRD | FR-EVT-001 | CommunityOwnerEventController | TC-EVT-001 | Implemented | |
| BR-EVT-002 | Event registration | Event | BRD | FR-EVT-002 | MemberEventController | TC-EVT-002 | Implemented | |
| BR-EVT-003 | Volunteer campaign | Volunteer | BRD | FR-VOL-001 | CommunityOwnerEventController | TC-VOL-001 | Implemented | |
| BR-EVT-004 | Donation management | Donation | BRD | FR-DON-001~003 | MemberDonationController, CommunityOwnerDonationController | TC-DON-001 | Implemented | |
| BR-BRD-001 | Brand CRUD | Brand | BRD | FR-BRD-001 | BrandOwnerBrandController | TC-BRD-001 | Implemented | |
| BR-COL-001 | Collaboration proposal | Collaboration | BRD | FR-COL-001~003 | CollaborationController, CommunityCollaborationController | TC-COL-001 | Implemented | |
| BR-CMP-001 | Company CRUD | Company | BRD | FR-CMP-001 | CompanyOwnerCompanyController | TC-CMP-001 | Implemented | |
| BR-PRM-001 | Premium plans | Premium | BRD | FR-PRM-001~003 | Models + Feature Lock | TC-PRM-001 | Implemented | |
| BR-MLT-001 | Multilanguage | Multilanguage | BRD | FR-MLT-001 | Translation model | TC-MLT-001 | Implemented | |
| BR-CHT-001 | Admin chat | Admin Chat | BRD | FR-CHT-001~004 | AdminChatController | TC-CHT-001 | Implemented | |
| BR-DMS-001 | Documentation generator | Documentation | BRD | FR-DMS-001~008 | DocumentationController | TC-DMS-001 | Implemented | |

---

## 3. Mapping Legend

- **BR-xxx**: Business Requirement from BRD
- **FR-xxx**: Functional Requirement from FRD
- **TC-xxx**: Test Case identifier

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildTestPlan(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Test Plan — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Test Plan |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Objective

Memastikan seluruh fitur KomunaID V2 berfungsi sesuai requirement, aman dari vulnerability, dan sesuai dengan BRD/FRD.

---

## 3. Scope

### In Scope
1. Functional Testing semua modul
2. Role Access Testing (RBAC)
3. Security Testing (CSRF, XSS, SQL Injection, Auth)
4. UI/UX Testing (responsive, accessibility)
5. Regression Testing
6. Smoke Testing
7. UAT (User Acceptance Testing)

### Out of Scope
1. Load testing (fase lanjutan)
2. Penetration testing (memerlukan tools khusus)
3. Mobile app testing

---

## 4. Test Strategy

| Test Type | Description | Tools |
|---|---|---|
| Functional | Testing setiap fitur sesuai FRD | Manual + PHPUnit |
| Role Access | Testing akses berdasarkan role | Manual testing |
| Security | Testing CSRF, XSS, Auth | Manual review |
| UI/UX | Testing tampilan dan responsivitas | Browser manual |
| Regression | Testing ulang setelah perubahan | Manual + PHPUnit |
| Smoke | Testing jalur utama setelah deploy | Manual |
| UAT | Testing oleh stakeholder | Manual |

---

## 5. Test Environment

| Item | Value |
|---|---|
| Server | XAMPP Local |
| PHP | 8.2+ |
| Database | MySQL 8.x |
| Browser | Chrome, Firefox |
| OS | Windows |

---

## 6. Test Data

- Superadmin account
- Member accounts (multiple roles)
- Community data (approved, pending, suspended)
- Brand data
- Event data
- Documentation test data

---

## 7. Entry Criteria

1. Semua modul sudah di-deploy ke test environment
2. Database sudah migrated dan seeded
3. Tidak ada blocking error di log
4. Test data sudah tersedia

---

## 8. Exit Criteria

1. Semua test case executed
2. Tidak ada Critical/High bug terbuka
3. Semua smoke test passed
4. UAT approval dari stakeholder

---

## 9. Test Modules

| Module | Test Focus | Priority |
|---|---|---|
| Auth | Login, register, password reset | High |
| Role Request | Request, approve, reject | High |
| Superadmin Dashboard | CRUD, approval, logs | High |
| Member | Profile, community join, event | High |
| Community | CRUD, members, events | High |
| Event | Registration, payment, volunteer | High |
| Brand/Company | CRUD, collaboration | Medium |
| Premium | Plans, subscription, feature lock | Medium |
| CMS | Blog, pages, homepage | Medium |
| Multilanguage | Translation switch | Low |
| Admin Chat | Conversation, messaging | Medium |
| Documentation | Generate, preview, download | Medium |

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Incomplete test data | Medium | Create comprehensive seeders |
| Environment differences | Medium | Match production config |
| Time constraints | Medium | Prioritize critical paths |

---

## 11. Defect Management

- Critical: Fix immediately, block release
- High: Fix before release
- Medium: Fix if time permits
- Low: Log for future sprint

---

## 12. Test Schedule

| Phase | Duration |
|---|---|
| Smoke Testing | 1 day |
| Functional Testing | 3-5 days |
| Role Access Testing | 1-2 days |
| Security Testing | 1 day |
| Regression Testing | 1-2 days |
| UAT | 1-2 days |

---

## 13. Approval

| Role | Name | Status |
|---|---|---|
| Project Manager | [Placeholder] | Pending |
| Lead Developer | [Placeholder] | Pending |
| QA Lead | [Placeholder] | Pending |

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildTestCase(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Test Case Template — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Test Case Template |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Test Cases

| TC ID | Module | Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | Auth | Register success | Guest on register page | 1. Fill email 2. Fill password 3. Submit | valid@email.com / password123 | Account created, redirect onboarding | - | Not Run | |
| TC-AUTH-002 | Auth | Register duplicate email | Guest on register page | 1. Fill existing email 2. Submit | existing@email.com | Error: email already taken | - | Not Run | |
| TC-AUTH-003 | Auth | Login success | Registered member | 1. Fill credentials 2. Submit | valid@email.com / password123 | Login success, redirect dashboard | - | Not Run | |
| TC-AUTH-004 | Auth | Login wrong password | Registered member | 1. Fill wrong password 2. Submit | valid@email.com / wrong | Error: credentials mismatch | - | Not Run | |
| TC-AUTH-005 | Auth | Superadmin login | Superadmin account | 1. Open /admin/login 2. Fill credentials 3. Submit | admin@komunaid.com / admin123 | Login success, redirect superadmin dashboard | - | Not Run | |
| TC-AUTH-006 | Auth | Role request | Member logged in | 1. Open role request 2. Select role 3. Submit | community_owner | Request created, pending approval | - | Not Run | |
| TC-AUTH-007 | Auth | Approve role request | Pending role request | 1. Open approval center 2. Approve | - | Role updated, user gets new role | - | Not Run | |
| TC-SUP-001 | Superadmin | Dashboard view | Superadmin logged in | 1. Open /superadmin/dashboard | - | Dashboard with stats displayed | - | Not Run | |
| TC-SUP-002 | Superadmin | Member list | Superadmin logged in | 1. Open members page | - | List of members displayed | - | Not Run | |
| TC-SUP-003 | Superadmin | Suspend user | Superadmin logged in | 1. Select user 2. Suspend | - | User status updated to suspended | - | Not Run | |
| TC-SUP-004 | Superadmin | Export members | Superadmin logged in | 1. Click export | - | CSV file downloaded | - | Not Run | |
| TC-MBR-001 | Member | Edit profile | Member logged in | 1. Open profile 2. Edit bio 3. Save | New bio text | Profile updated | - | Not Run | |
| TC-MBR-002 | Member | Join community | Member logged in | 1. Browse communities 2. Click join | - | Membership created | - | Not Run | |
| TC-MBR-003 | Member | Register event | Member logged in, event available | 1. Open event 2. Register 3. Upload payment | Payment screenshot | Registration created | - | Not Run | |
| TC-MBR-004 | Member | Donate to event | Member logged in | 1. Open event donation 2. Fill amount 3. Submit | Rp 50.000 | Donation recorded | - | Not Run | |
| TC-COM-001 | Community | Create community | Community owner logged in | 1. Fill community data 2. Submit | Valid data | Community created, pending approval | - | Not Run | |
| TC-COM-002 | Community | Approve member | Community owner, pending member | 1. Open member list 2. Approve | - | Member approved | - | Not Run | |
| TC-COM-003 | Community | Ban member | Community owner | 1. Select member 2. Ban | - | Member banned | - | Not Run | |
| TC-EVT-001 | Event | Create event | Community owner with community | 1. Fill event data 2. Submit | Valid data | Event created, pending approval | - | Not Run | |
| TC-EVT-002 | Event | Confirm payment | Community owner, pending payment | 1. Open registrations 2. Confirm | - | Payment confirmed | - | Not Run | |
| TC-EVT-003 | Event | Create volunteer campaign | Community owner | 1. Create campaign 2. Submit | Valid data | Campaign created | - | Not Run | |
| TC-BRD-001 | Brand | Create brand | Brand owner logged in | 1. Fill brand data 2. Submit | Valid data | Brand created, pending approval | - | Not Run | |
| TC-BRD-002 | Brand | Send collaboration | Brand owner | 1. Select community 2. Send proposal | Proposal data | Proposal sent | - | Not Run | |
| TC-COL-001 | Collaboration | Accept proposal | Community owner, received proposal | 1. Open proposal 2. Accept | - | Proposal accepted | - | Not Run | |
| TC-COL-002 | Collaboration | Reject proposal | Community owner, received proposal | 1. Open proposal 2. Reject | - | Proposal rejected | - | Not Run | |
| TC-PRM-001 | Premium | View premium plans | Member logged in | 1. Open premium page | - | Plans displayed | - | Not Run | |
| TC-CMS-001 | CMS | Create blog | Superadmin logged in | 1. Fill blog data 2. Publish | Valid data | Blog published | - | Not Run | |
| TC-MLT-001 | Multilanguage | Switch language | Any user | 1. Click language switcher | - | Language changed | - | Not Run | |
| TC-CHT-001 | Admin Chat | Send message | Superadmin logged in | 1. Open chat 2. Send message | Message text | Message sent | - | Not Run | |
| TC-DMS-001 | Documentation | Generate BRD | Superadmin logged in | 1. Open documentation 2. Generate BRD | - | BRD generated, available for download | - | Not Run | |
| TC-DMS-002 | Documentation | Generate all | Superadmin logged in | 1. Click generate all | - | All documents generated | - | Not Run | |
| TC-DMS-003 | Documentation | Download document | Document generated | 1. Click download | - | File downloaded | - | Not Run | |
| TC-DMS-004 | Documentation | Preview document | Document generated | 1. Click preview | - | Content displayed | - | Not Run | |
| TC-DMS-005 | Documentation | Delete document | Document exists | 1. Click delete 2. Confirm | - | Document deleted | - | Not Run | |

---

## 3. Status Legend

- **Not Run**: Belum dijalankan
- **Passed**: Test berhasil
- **Failed**: Test gagal
- **Blocked**: Test tidak bisa dijalankan

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildReleaseNotes(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Release Notes — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Release Notes |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Release Version: V2.0

### Release Date
{$now}

### Summary
KomunaID V2 adalah rilis mayor yang mencakup seluruh fitur platform komunitas, termasuk manajemen komunitas, event, donasi, kolaborasi brand, premium features, admin chat, dan SDLC documentation generator.

---

## 3. New Features

### Prompt 0 — Audit Project Existing
- Initial project audit and structure analysis

### Prompt 1 — Fix Bug & Stabilization
- Bug fixes dan stabilization seluruh modul

### Prompt 2 — Update Requirement KomunaID V2
- Requirement document diperbarui untuk V2

### Prompt 3 — Database & Migration Enhancement
- Database schema enhancement
- Multiple new tables untuk modul baru

### Prompt 4 — Auth, Role, Permission & Login Separation
- Login terpisah untuk user dan superadmin
- Role-based access control dengan Spatie
- Role request dan approval workflow
- Onboarding flow

### Prompt 5 — Superadmin Dashboard Enhancement
- Dashboard statistics
- Entity management (members, communities, brands, companies)
- Approval center
- Audit log dan login log

### Prompt 6 — Beranda, CMS, Blog, Tentang Kami, Hubungi Kami
- Public homepage dengan design modern
- Blog management CMS
- CMS pages (About, Contact)
- Contact settings dan suggestions

### Prompt 7 — Register & Role Request Flow Enhancement
- Enhanced registration flow
- Role request system
- Onboarding dengan interest selection

### Prompt 8 — Member Module Enhancement
- Member dashboard
- Profile management
- Community join/leave
- Interest selection
- Friendships dan bookmarks

### Prompt 9 — Community Module Enhancement
- Community CRUD
- Member management (approve, ban, role)
- Region dan subgroup management
- Community approval workflow

### Prompt 10 — Event, Volunteer Campaign, Donation & Report
- Event CRUD
- Event registration dan payment
- Volunteer campaign
- Donation management
- Finance transactions

### Prompt 11 — Brand, Company & Collaboration Module
- Brand CRUD
- Company CRUD
- Collaboration proposal workflow
- Staff management
- Ownership transfer

### Prompt 12 — Premium Feature, Trial & Subscription Lock
- Premium plans
- Subscription management
- Feature lock/unlock
- Trial management

### Prompt 13 — UI/UX, Theme, Color, Logo & Layout Modernization
- Modern design system
- Color scheme (#0B2D89, #25B9F2)
- Responsive layout
- Admin sidebar

### Prompt 14 — Multilanguage
- Bahasa Indonesia & English
- Translation model
- Language switcher

### Prompt 15 — Chat Admin / Internal Messaging
- Admin conversation system
- Message threading
- Participant management
- Read/unread tracking
- Archive/unarchive

### Prompt 16 — SDLC Documentation Generator
- Documentation dashboard
- 19 document types
- Generate single/all documents
- Preview and download
- MD/TXT/HTML export

---

## 4. Improvements
- Database indexing optimization
- Soft deletes untuk data recovery
- Audit logging untuk semua aksi
- CSRF protection aktif
- Mobile responsive design

---

## 5. Bug Fixes
- (Refer to individual prompt changelogs)

---

## 6. Security Updates
- Role-based access control (RBAC)
- Active user middleware
- Audit trail
- Login logging
- No credential exposure in documentation

---

## 7. Known Issues
- Real-time chat masih menggunakan polling
- PDF/DOCX export belum tersedia
- Mobile app belum tersedia

---

## 8. Migration Notes
- Jalankan `php artisan migrate` untuk update database
- Jalankan `npm run build` untuk rebuild assets
- Jalankan `php artisan optimize:clear` untuk clear cache

---

## 9. Deployment Notes
- Backup database sebelum migration
- Pastikan PHP 8.2+ tersedia
- Pastikan Node.js 18+ tersedia
- Pastikan storage/link sudah dijalankan

---

## 10. Rollback Notes
- Restore database backup
- Revert code ke versi sebelumnya
- Jalankan `php artisan migrate:rollback` jika perlu
- Clear cache

---

## 11. Next Release Plan
- Prompt 17 — Testing & QA Enhancement
- Payment gateway integration
- Advanced analytics
- API v2

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildDeploymentChecklist(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Deployment Checklist — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Deployment Checklist |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Pre-deployment

- [ ] Backup database
- [ ] Backup files (storage, uploads)
- [ ] Check .env configuration
- [ ] Set APP_ENV=production
- [ ] Set APP_DEBUG=false
- [ ] Set APP_URL to production URL
- [ ] Verify database connection
- [ ] Check storage link (php artisan storage:link)
- [ ] Check queue/schedule configuration
- [ ] Check file permissions (storage, bootstrap/cache)
- [ ] Check PHP version >= 8.2
- [ ] Check MySQL version >= 8.0
- [ ] Check Node.js version >= 18

---

## 3. Deployment

- [ ] Pull/upload code to server
- [ ] Run `composer install --no-dev --optimize-autoloader`
- [ ] Run `npm install && npm run build`
- [ ] Run `php artisan migrate --force`
- [ ] Run `php artisan optimize:clear`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`
- [ ] Run `php artisan storage:link`
- [ ] Seed safe data if needed (roles, permissions)
- [ ] Set proper file permissions (755 for dirs, 644 for files)

---

## 4. Post-deployment

- [ ] Smoke test: Login superadmin (/admin/login)
- [ ] Smoke test: Login member (/login)
- [ ] Smoke test: Public pages (homepage, blog, communities)
- [ ] Smoke test: Register new account
- [ ] Smoke test: Role request flow
- [ ] Smoke test: Community CRUD
- [ ] Smoke test: Event management
- [ ] Smoke test: Documentation generator
- [ ] Check application logs (storage/logs/laravel.log)
- [ ] Check error monitoring (if configured)
- [ ] Verify HTTPS is active
- [ ] Verify all forms have CSRF protection

---

## 5. Rollback Plan

1. **Restore code**: Checkout previous version / restore backup
2. **Restore database**: Import database backup
3. **Clear cache**: `php artisan optimize:clear`
4. **Verify**: Run smoke tests
5. **Notify team**: Inform stakeholders of rollback

---

## 6. Security Checklist

- [ ] No production secrets in repository
- [ ] APP_DEBUG=false in production
- [ ] HTTPS enabled and enforced
- [ ] File permissions correctly set
- [ ] Admin password changed from default
- [ ] .env file not accessible via web
- [ ] Directory listing disabled
- [ ] Security headers configured
- [ ] CSRF protection active
- [ ] XSS protection active (Blade auto-escaping)

---

## 7. Monitoring

- [ ] Application logs monitored
- [ ] Database performance monitored
- [ ] Server resources monitored
- [ ] Error alerting configured (optional)

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildUserGuide(): string
    {
        $now = now()->format('d M Y H:i');

        return "# User Guide — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | User Guide |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Getting Started

Selamat datang di KomunaID! Platform komunitas yang menghubungkan Anda dengan komunitas, event, dan kolaborasi.

---

## 3. Register

1. Buka halaman Register
2. Masukkan email atau username
3. Masukkan password (minimal 8 karakter)
4. Klik **Register**
5. Anda akan dialihkan ke halaman onboarding

---

## 4. Login

1. Buka halaman Login
2. Masukkan email/username dan password
3. Klik **Login**
4. Anda akan dialihkan ke dashboard sesuai role

---

## 5. Complete Profile

1. Setelah login pertama, Anda akan masuk onboarding
2. Lengkapi informasi profil Anda
3. Pilih minat/interest yang Anda sukai
4. Klik **Save**

---

## 6. Select Interest

1. Pada halaman onboarding, pilih interest dari daftar yang tersedia
2. Interest membantu sistem merekomendasikan komunitas yang relevan
3. Pilih minimal 3 interest
4. Klik **Continue**

---

## 7. Explore Communities

1. Buka halaman **Communities** dari menu
2. Gunakan search atau filter untuk menemukan komunitas
3. Klik pada komunitas untuk melihat detail
4. Klik **Join** untuk bergabung

---

## 8. Join Community

1. Pilih komunitas yang ingin diikuti
2. Klik **Join Community**
3. Tunggu persetujuan dari Community Owner (jika diperlukan)
4. Setelah disetujui, Anda resmi menjadi anggota

---

## 9. Register Event

1. Buka halaman **Events**
2. Pilih event yang ingin diikuti
3. Klik **Register**
4. Upload bukti pembayaran (jika berbayar)
5. Tunggu konfirmasi dari Community Owner

---

## 10. Apply Volunteer

1. Buka event yang memiliki program volunteer
2. Klik **Apply as Volunteer**
3. Isi informasi yang diminta
4. Tunggu persetujuan dari Community Owner

---

## 11. Donate to Event

1. Buka event yang ingin didonasikan
2. Klik **Donate**
3. Masukkan nominal donasi
4. Konfirmasi donasi
5. Donasi Anda akan tercatat

---

## 12. Bookmark Community

1. Buka halaman komunitas
2. Klik ikon **Bookmark**
3. Komunitas akan tersimpan di daftar bookmark Anda

---

## 13. Request Role

1. Buka menu **Role Request**
2. Pilih role yang diinginkan (Community Owner, Brand Owner, dll)
3. Isi data pendukung
4. Klik **Submit**
5. Tunggu persetujuan dari Superadmin

---

## 14. Change Language

1. Cari tombol switcher bahasa
2. Klik untuk beralih antara Bahasa Indonesia dan English
3. Seluruh UI akan berubah sesuai pilihan

---

## 15. Logout

1. Klik menu **Logout** di sidebar atau header
2. Anda akan keluar dari sistem
3. Session akan di-invalidate

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildAdminGuide(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Admin Guide — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Admin Guide |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Login Superadmin

1. Buka `/admin/login`
2. Masukkan email superadmin dan password
3. Klik **Login**
4. Anda akan masuk ke Superadmin Dashboard

---

## 3. Dashboard Overview

Dashboard menampilkan ringkasan:
- Total Members
- Total Communities
- Total Events
- Total Brands
- Recent activities

---

## 4. Manage Members

1. Klik menu **Members** di sidebar
2. Lihat daftar semua member
3. Gunakan search untuk mencari member
4. Klik nama untuk melihat detail
5. Aksi yang tersedia:
   - **Suspend**: Menangguhkan akun
   - **Ban**: Membanned akun
   - **Activate**: Mengaktifkan kembali
   - **Export**: Download data CSV

---

## 5. Manage Community Owners

1. Klik menu **Community Owners**
2. Lihat daftar community owner
3. Lihat komunitas yang dimiliki
4. Aksi: Suspend, Ban, Activate, Export

---

## 6. Manage Brand Owners

1. Klik menu **Brand Owners**
2. Lihat daftar brand owner
3. Lihat brand yang dimiliki
4. Aksi: Suspend, Ban, Activate, Export

---

## 7. Manage Companies

1. Klik menu **Companies**
2. Lihat daftar perusahaan
3. Aksi: Suspend, Ban, Activate, Delete, Export

---

## 8. Manage Communities

1. Klik menu **Communities**
2. Lihat daftar komunitas (approved, pending, dll)
3. Aksi:
   - **Approve**: Setujui komunitas
   - **Reject**: Tolak komunitas
   - **Suspend**: Tangguhkan
   - **Ban/Ban**: Ban komunitas
   - **Activate**: Aktifkan kembali
   - **Transfer Owner**: Pindah kepemilikan
   - **Export**: Download data CSV

---

## 9. Manage Events

1. Klik menu **Events**
2. Lihat daftar event
3. Aksi: View, Cancel, Archive, Delete, Export

---

## 10. Manage Role Requests

1. Klik menu **Approval Center** atau **Role Requests**
2. Lihat daftar role request yang pending
3. Klik untuk melihat detail
4. **Approve**: Setujui role request
5. **Reject**: Tolak dengan alasan

---

## 11. Manage CMS

### Homepage Sections
1. Klik **CMS Beranda**
2. CRUD sections untuk homepage

### Blog
1. Klik **Blog**
2. Create, edit, publish, archive blog posts

### Pages
1. Klik **Pages**
2. Edit CMS pages (About, Contact)

### Contact Settings
1. Klik **Contact**
2. Update informasi kontak

### Suggestions
1. Klik **Suggestions**
2. Review dan archive saran dari pengunjung

---

## 12. Manage Premium Trial

1. Akses premium features melalui model management
2. Kelola premium plans
3. Manage subscriptions
4. Manage feature locks

---

## 13. Manage Admin Chat

1. Klik **Admin Chat** di sidebar
2. Buat percakapan baru
3. Kirim pesan internal ke admin lain
4. Kelola peserta percakapan
5. Arsipkan percakapan selesai

---

## 14. Manage Multilanguage

1. Kelola konten terjemahan melalui Translation model
2. Toggle bahasa dari UI

---

## 15. Generate Documentation

1. Klik **Documentation** di sidebar
2. Lihat daftar dokumen SDLC
3. **Generate**: Generate dokumen individual
4. **Generate All**: Generate semua dokumen
5. **Preview**: Lihat konten dokumen
6. **Download**: Download file (MD/TXT/HTML)
7. **Delete**: Hapus dokumen

---

## 16. Audit Logs

1. Klik **Audit Logs** di sidebar
2. Lihat semua aksi yang tercatat
3. Filter berdasarkan action, user, atau tanggal

---

## 17. Security Notes

- Selalu gunakan password yang kuat
- Aktifkan 2FA jika tersedia
- Jangan share credential
- Review audit logs secara berkala
- Logout setelah selesai bekerja

---

## 18. Logout

1. Klik **Logout** di sidebar
2. Session akan di-invalidate

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }

    private function buildHandoverDocument(): string
    {
        $now = now()->format('d M Y H:i');

        return "# Handover Document — KomunaID V2

---

## 1. Document Control

| Field | Value |
|---|---|
| Document Name | Handover Document |
| Version | 2.0 |
| Generated Date | {$now} |

---

## 2. Project Overview

KomunaID V2 adalah platform komunitas berbasis web yang dibangun dengan Laravel 11 + MySQL + Tailwind CSS. Platform ini menghubungkan member, komunitas, brand, dan perusahaan dalam satu ekosistem digital.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11 (PHP 8.2+) |
| Database | MySQL 8.x |
| Frontend | Blade Templates + Tailwind CSS 4.x |
| Bundler | Vite 5.x |
| Auth | Laravel Breeze + Spatie Permission 6.x |
| File Storage | Laravel Storage (Local/S3) |

---

## 4. Local Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.x
- XAMPP / Laragon / Docker

### Steps
```bash
cd C:\\Xampp\\htdocs\\komunaid
composer install
cp .env.example .env
php artisan key:generate
# Configure .env (database, mail, etc.)
php artisan migrate
php artisan db:seed
npm install
npm run build
php artisan storage:link
php artisan serve
```

---

## 5. Folder Structure

```
komunaid/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/           # Auth controllers
│   │   │   ├── BrandOwner/     # Brand owner controllers
│   │   │   ├── CommunityOwner/ # Community owner controllers
│   │   │   ├── CompanyOwner/   # Company owner controllers
│   │   │   ├── Guest/          # Guest controllers
│   │   │   ├── Member/         # Member controllers
│   │   │   ├── Public/         # Public controllers
│   │   │   └── Superadmin/     # Superadmin controllers
│   │   └── Middleware/          # Custom middleware
│   ├── Models/                 # Eloquent models (68+)
│   └── Services/               # Business logic services
├── database/
│   ├── migrations/             # Database migrations
│   └── seeders/                # Database seeders
├── resources/
│   └── views/
│       ├── layouts/            # Blade layouts
│       └── superadmin/         # Superadmin views
├── routes/
│   └── web.php                 # Route definitions
├── storage/
│   └── app/
│       └── documentation/      # Generated documentation
└── tests/                      # PHPUnit tests
```

---

## 6. Environment Variables

**IMPORTANT**: Jangan pernah menulis nilai .env asli ke dokumentasi!

```
APP_NAME=KomunaID
APP_ENV=production
APP_KEY=your_app_key
APP_DEBUG=false
APP_URL=https://your-production-url.com

DB_CONNECTION=mysql
DB_HOST=your_host
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
```

---

## 7. Database Overview

- **Total Tables**: 80+ tables
- **Key Tables**: users, communities, events, brands, companies, premium_plans
- **Soft Deletes**: users, documentation_files
- **Audit**: audit_logs, login_logs
- **Seeding**: roles, permissions, superadmin account

---

## 8. Key Routes

| Module | Prefix | Middleware |
|---|---|---|
| Public | `/` | Guest |
| Auth | `/login`, `/register` | Guest |
| Member | `/member` | auth, active_user |
| Community Owner | `/community-own` | auth, active_user, role:community_owner |
| Brand Owner | `/brand` | auth, active_user, role:brand_owner\|brand_staff |
| Company Owner | `/company-owner` | auth, active_user, role:company_owner\|superadmin |
| Superadmin | `/superadmin` | auth, active_user, admin |
| Documentation | `/superadmin/documentation` | auth, active_user, admin |

---

## 9. User Roles

| Role | Access Level |
|---|---|
| superadmin | Full platform access |
| platform_admin | Most admin features |
| member | Standard user |
| community_owner | Community management |
| brand_owner | Brand management |
| company_owner | Company management |
| community_pengurus | Community staff |
| community_volunteer | Community volunteer |
| brand_staff | Brand staff |

---

## 10. Main Modules

1. Public Website & CMS
2. Auth & Role Request
3. Superadmin Dashboard
4. Member Module
5. Community Module
6. Event, Volunteer, Donation & Finance
7. Brand, Company & Collaboration
8. Premium Feature & Subscription
9. UI/UX Design System
10. Multilanguage
11. Admin Chat / Internal Messaging
12. SDLC Documentation

---

## 11. Testing Instructions

```bash
# Clear cache
php artisan optimize:clear

# Run tests
php artisan test

# Build assets
npm run build
```

---

## 12. Deployment Instructions

1. Backup database
2. Backup files
3. Upload code
4. Composer install (production)
5. NPM build
6. Artisan migrate
7. Artisan optimize
8. Storage link
9. Smoke test

---

## 13. Known Issues

1. Real-time chat menggunakan polling (bukan WebSocket)
2. PDF/DOCX export belum tersedia
3. Mobile app belum tersedia
4. Payment gateway belum terintegrasi penuh

---

## 14. Pending Features

1. Payment gateway integration penuh
2. Mobile native app
3. Advanced analytics
4. AI-powered recommendations
5. API v2 dengan versioning

---

## 15. Security Checklist

- [ ] No production secrets in repository
- [ ] APP_DEBUG=false
- [ ] HTTPS enabled
- [ ] File permissions set
- [ ] Admin password changed
- [ ] CSRF protection active
- [ ] RBAC enforced
- [ ] Audit logging active

---

## 16. Maintenance Notes

- Backup database secara berkala
- Monitor error logs
- Update dependencies periodically
- Review audit logs
- Monitor server performance

---

## 17. Contact/Ownership

| Role | Contact |
|---|---|
| Project Owner | [Placeholder] |
| Lead Developer | [Placeholder] |
| DevOps | [Placeholder] |

---

_Generated by KomunaID V2 Documentation System_
_Generated at: {$now}_
";
    }
}
