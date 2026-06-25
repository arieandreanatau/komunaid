# KomunaID V2 — Smoke Test Checklist

> Checklist testing setelah deployment ke environment apapun.

---

## Public Pages

| # | Page | URL Pattern | Expected | Status |
|---|------|-------------|----------|--------|
| 1 | Homepage | `/` | 200 OK, loads correctly | [ ] |
| 2 | Login page | `/login` | 200 OK, form visible | [ ] |
| 3 | Register page | `/register` | 200 OK, form visible | [ ] |
| 4 | Community list | `/communities` | 200 OK, list loads | [ ] |
| 5 | Event list | `/events` | 200 OK, list loads | [ ] |
| 6 | Blog | `/blogs` | 200 OK | [ ] |
| 7 | About | `/about` | 200 OK | [ ] |
| 8 | Contact | `/contact` | 200 OK | [ ] |

---

## Authentication

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 1 | Login superadmin | Dashboard redirect | [ ] |
| 2 | Login member | Member area redirect | [ ] |
| 3 | Logout | Redirect to homepage | [ ] |
| 4 | Login with wrong password | Error message shown | [ ] |
| 5 | CSRF token present | Form submits correctly | [ ] |

---

## Dashboards

| # | Dashboard | URL Pattern | Expected | Status |
|---|-----------|-------------|----------|--------|
| 1 | Superadmin | `/superadmin/dashboard` | 200 OK, stats loaded | [ ] |
| 2 | Member | `/member/dashboard` | 200 OK | [ ] |
| 3 | Community Owner | `/community-owner/dashboard` | 200 OK | [ ] |
| 4 | Brand Owner | `/brand/dashboard` | 200 OK | [ ] |
| 5 | Company Owner | `/company/dashboard` | 200 OK | [ ] |

---

## Core Actions (Staging/Local Only)

> **Production:** Non-destructive test only. Jangan buat data dummy.

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 1 | Create community | Community created | [ ] |
| 2 | Create event | Event created | [ ] |
| 3 | Register to event | Registration saved | [ ] |
| 4 | Create brand/company | Entity created | [ ] |
| 5 | Send collaboration proposal | Proposal created | [ ] |
| 6 | Premium lock check | Locked feature shows lock | [ ] |
| 7 | Language switch | UI language changes | [ ] |
| 8 | Admin chat send message | Message saved | [ ] |
| 9 | Generate documentation | Document generated | [ ] |
| 10 | Upload file (avatar) | File saved, accessible | [ ] |
| 11 | Export data | File downloaded | [ ] |

---

## File Upload Test

| # | Upload Type | Expected | Status |
|---|------------|----------|--------|
| 1 | Member avatar | Saved to storage, visible | [ ] |
| 2 | Community logo | Saved, visible on community page | [ ] |
| 3 | Event banner | Saved, visible on event page | [ ] |
| 4 | Donation proof | Saved, accessible by admin | [ ] |
| 5 | Brand/company logo | Saved, visible | [ ] |
| 6 | Collaboration attachment | Saved, accessible | [ ] |
| 7 | Invalid file type | Rejected with error | [ ] |
| 8 | Oversized file | Rejected with error | [ ] |

---

## Multilanguage

| # | Action | Expected | Status |
|---|--------|----------|--------|
| 1 | Switch to English | UI in English | [ ] |
| 2 | Switch to Bahasa | UI in Bahasa | [ ] |
| 3 | Fallback works | Missing keys show fallback | [ ] |

---

## Performance Quick Check

| # | Check | Expected | Status |
|---|-------|----------|--------|
| 1 | Homepage load time | < 3 seconds | [ ] |
| 2 | Dashboard load time | < 3 seconds | [ ] |
| 3 | No 500 errors in logs | Clean log | [ ] |
| 4 | Assets loaded (CSS/JS) | No 404 for assets | [ ] |

---

## Smoke Test Result

| Environment | Date | Tester | Result | Notes |
|-------------|------|--------|--------|-------|
| Local | | | PASS/FAIL | |
| Staging | | | PASS/FAIL | |
| Production | | | PASS/FAIL | |

---

## Production Smoke Test Rules

1. **Non-destructive:** Jangan buat data di production kecuali via admin test account yang disetujui
2. **Cleanup:** Hapus/archive test data setelah test
3. **Admin test account:** Gunakan akun khusus test, bukan superadmin utama
4. **Quick test:** Fokus pada critical path (login, dashboard, public pages)
5. **Monitor logs:** Cek `storage/logs/laravel.log` setelah test
