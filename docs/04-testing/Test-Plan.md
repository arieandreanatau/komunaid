# KomunaID - Test Plan

## 1. Testing Objective

- Memverifikasi bahwa seluruh fitur aplikasi KomunaID berfungsi sesuai requirement
- Memastikan akses role-based berjalan benar (superadmin, member, community_owner, brand_owner)
- Mengidentifikasi bug dan defect sebelum production deployment
- Memvalidasi integritas data dan alur transaksi (wallet, event registration, donation)
- Memastikan UX/UI konsisten dan responsif

## 2. Scope

### In-Scope
- Authentication (register, login, logout, password reset)
- Role management (role request, approval/rejection)
- Community CRUD (create, update, delete, status approval)
- Community member management (join, leave, ban, unban, role assignment)
- Community regions & subgroups
- Brand CRUD (create, update, approval/rejection)
- Brand staff management
- Event management (create free/paid, registration, payment confirmation)
- Event gallery & chat/forum
- Collaboration requests (brand <-> community)
- Donation (community/event)
- Wallet transactions (credit, debit, balance)
- Platform fee calculation
- Dashboard per role
- Approval center (superadmin)
- Audit logs

### Out-of-Scope
- Performance/load testing
- Security penetration testing
- Mobile responsive testing (hanya desktop web)
- Third-party API integration testing
- Email delivery testing

## 3. Testing Type

| Type | Description | Tools |
|------|-------------|-------|
| Functional Testing | Uji fungsi setiap modul sesuai requirement | Manual + PHP Unit |
| Integration Testing | Uji integrasi antar modul (event -> payment -> wallet) | Manual |
| UAT | User Acceptance Testing per role | Manual (checklist) |
| Regression Testing | Pastikan perubahan tidak merusak fitur existing | Manual |
| Smoke Testing | Cek route utama dapat diakses | artisan route:list |
| Error Checking | Cek blade view error, empty state | Browser + artisan |

## 4. Environment

| Item | Value |
|------|-------|
| PHP | 8.2+ |
| Laravel | 11.x |
| Database | MySQL 8.0 (XAMPP local) |
| OS | Windows 10/11 |
| Browser | Chrome / Firefox latest |
| URL | http://localhost/komunaid/public |

### Database Setup
```bash
php artisan migrate:fresh --seed
```

### Demo Accounts
| Email | Password | Role |
|-------|----------|------|
| superadmin@komuna.id | password | Superadmin |
| member@komuna.id | password | Member |
| community@komuna.id | password | Community Owner |
| brand@komuna.id | password | Brand Owner |

## 5. Entry Criteria

- Database migration dan seeder berhasil dijalankan tanpa error
- Semua route terdaftar dan dapat diakses (`php artisan route:list`)
- Tidak ada blade compilation error
- Akun demo dapat login sesuai role
- Environment XAMPP (Apache + MySQL) berjalan normal

## 6. Exit Criteria

- 100% test case critical/pass
- 90%+ test case high priority pass
- Tidak ada bug severity S1 (blocker) atau S2 (critical) yang belum fix
- Semua dashboard role dapat diakses tanpa error
- Empty state handling berfungsi (tidak ada error pada halaman kosong)
- Semua form validation berfungsi

## 7. Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| XAMPP MySQL port conflict | Tidak bisa migrate | Cek port 3306, restart MySQL |
| Seeder data inconsistency | Test case invalid | Jalankan migrate:fresh --seed ulang |
| Role middleware gagal | Akses tidak sesuai role | Cek Spatie permission config |
| Blade template error | Halaman tidak tampil | Cek log Laravel, pastikan view exist |
| WalletService dependency | Seeder gagal | Pastikan service registered di provider |
| ENUM column mismatch | Migration error | Cek alter migration order |

## 8. Test Schedule

| Phase | Duration | Activity |
|-------|----------|----------|
| 1 | Day 1 | Environment setup + smoke test |
| 2 | Day 1-2 | Functional testing per modul |
| 3 | Day 2-3 | UAT per role |
| 4 | Day 3 | Regression + bug fix |
| 5 | Day 4 | Final verification + report |

## 9. Defect Severity

| Level | Description | Response Time |
|-------|-------------|---------------|
| S1 - Blocker | Aplikasi crash, tidak bisa login | Immediate fix |
| S2 - Critical | Fitur utama tidak berfungsi | Fix dalam 24 jam |
| S3 - Major | Fitur berfungsi tapi dengan workaround | Fix dalam 3 hari |
| S4 - Minor | UI/cosmetic issue | Fix sebelum release |
