# KomunaID — Pending Enhancement Backlog

> Item yang **belum** diimplementasikan, diurutkan berdasarkan prioritas & effort.
> Tanggal: 2026-06-28.

## P0 — Security (Immediate)

| ID | Item | Effort | Note |
|----|------|--------|------|
| P0-01 | Reset password untuk 3 prod user yang gagal login | S | Di luar scope audit, butuh owner. |
| P0-02 | `.env.example` di `gitignore` (sengaja) — pertimbangkan track `.env.example` saja | S | Verify `.gitignore`. |
| P0-03 | Investigasi kenapa Vercel tidak punya `/blog` route (mungkin build lama) | S | Deploy ulang. |

## P1 — High Value, Low Effort

| ID | Item | Effort | File |
|----|------|--------|------|
| P1-01 | Update README route list ke path valid | S | `README.md` |
| P1-02 | Hapus `test_logins.php`, `composer.phar`, `composer-setup.php` dari root | S | root dir |
| P1-03 | Tambah CSP headers | S | `SecurityHeaders.php` |
| P1-04 | Tambah rate-limit global (default 60/min) | S | `bootstrap/app.php` |
| P1-05 | Index `(action, created_at)` di `audit_logs` & `(user_id, created_at)` di `login_logs` | S | migration |
| P1-06 | Soft delete untuk `Community`, `Event`, `Brand`, `Company` | M | migration + model |
| P1-07 | FAQ master data + page | S | migration + controller + view |
| P1-08 | Konsolidasi `regions` vs `master_regions` | S | migration deprecate |
| P1-09 | Email template & notification template master data | M | migration + model + view |
| P1-10 | Bahasa Inggris penuh (Translation files) | M | `lang/en/` |
| P1-11 | Force HTTPS di production (cek `config/session.php` secure cookie) | S | config |
| P1-12 | HSTS header | S | `SecurityHeaders.php` |

## P2 — Medium Value

| ID | Item | Effort |
|----|------|--------|
| P2-01 | Notification center UI (bell + /notifications) | M |
| P2-02 | Email notification (SMTP production) | M |
| P2-03 | File upload validation terpusat | S |
| P2-04 | Export CSV untuk semua report (saat ini sebagian) | S |
| P2-05 | Bookmark event | S |
| P2-06 | Member recommendation engine | M |
| P2-07 | Public Campaign page | M |
| P2-08 | Product & product category | M |
| P2-09 | Bahasa Sunda admin UI | M |
| P2-10 | Onboarding flow enhancement (skip jika role sudah ada) | S |
| P2-11 | Member-side report download | S |
| P2-12 | 2FA superadmin | M |
| P2-13 | Event registration QR code (tiket) | M |
| P2-14 | Donation transparency dashboard | M |
| P2-15 | Multi-language ID/EN basic | M |

## P3 — Advanced / Phase 2

| ID | Item | Effort |
|----|------|--------|
| P3-01 | Payment gateway (Midtrans/Xendit) | L |
| P3-02 | Wallet top-up flow | M |
| P3-03 | Refund flow | M |
| P3-04 | Real-time chat (Laravel Reverb) | L |
| P3-05 | QR check-in event | M |
| P3-06 | Certificate generator (PDF) | M |
| P3-07 | Job/internship marketplace | L |
| P3-08 | Sponsorship package | M |
| P3-09 | Campaign analytics | M |
| P3-10 | Reputation & badge | L |
| P3-11 | CSR impact dashboard | M |
| P3-12 | REST API for mobile app | L |
| P3-13 | Dusk E2E | M |
| P3-14 | Vercel preview per branch | M |
| P3-15 | Sentry / Flare error monitoring | S |
| P3-16 | Backup database otomatis | M |

## P4 — Infrastruktur

| ID | Item |
|----|------|
| P4-01 | Setup CI (GitHub Actions) untuk run test + pint |
| P4-02 | Setup Vercel preview deployment per branch |
| P4-03 | Setup error monitoring (Sentry / Flare) |
| P4-04 | Setup uptime monitoring (Vercel Analytics) |
| P4-05 | Backup database otomatis (cron) |

## Estimasi Total

* P0: ~3-5 hari
* P1: ~10-15 hari
* P2: ~30-40 hari (1-2 sprint)
* P3: ~60-90 hari (2-3 sprint)
* P4: ~5-10 hari
