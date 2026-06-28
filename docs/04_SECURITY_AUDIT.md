# KomunaID — Security Audit

> Pendekatan: static code review + grep + cek konfigurasi.
> Severity: **Critical**, **High**, **Medium**, **Low**, **Info**.

## 1. Authentication & Session

| # | Aspek | Status | Evidence |
|---|-------|--------|----------|
| S01 | Password hashing | ✅ | `User::casts()['password'] = 'hashed'` |
| S02 | Session regenerate on login | ✅ | `AuthenticatedSessionController@store:104` |
| S03 | Session invalidate on logout | ✅ | `destroy:127-129` |
| S04 | CSRF on forms | ✅ | `routes/web.php` includes `web` middleware (default) |
| S05 | Rate-limit login (30/min) | ✅ | `throttle:30,1` |
| S06 | Rate-limit forgot-password (3/min) | ✅ | `throttle:3,1` |
| S07 | Banned/suspended user diblokir di create login | ✅ | `create():21-24` |
| S08 | Banned user logout otomatis | ✅ | `store():85-101` |
| S09 | Superadmin login terpisah | ✅ | `/admin/login` |
| S10 | 2FA | ❌ | tidak ada |
| S11 | Force password change after admin reset | ❌ | tidak ada |

## 2. Authorization

| # | Aspek | Status |
|---|-------|--------|
| S12 | RBAC (Spatie) | ✅ |
| S13 | Route group tidak pakai `role:` middleware untuk member area | ⚠️ (lihat RP1) |
| S14 | Policy class | ✅ (`app/Policies/`: Brand, Community, Event, CollaborationRequest) |
| S15 | Ownership check di controller | perlu verifikasi per controller |
| S16 | Idempotency untuk action sensitif (suspend/ban) | perlu dicek |

## 3. Input Validation & Sanitization

| # | Aspek | Status |
|---|-------|--------|
| S17 | FormRequest validation | ✅ (di folder `app/Http/Requests/`) |
| S18 | File upload validation | ✅ (image, mimes, max size di `FormRequest`) |
| S19 | Mass assignment protection | ✅ (`$fillable` di setiap model) |
| S20 | SQL injection | ✅ (Eloquent parameterized) |
| S21 | XSS escaping | ✅ (Blade `{{ }}`) |
| S22 | JSON output | ✅ (`->json()` otomatis escape) |
| S23 | WYSIWYG / HTML allowed fields | perlu audit; kalau pakai `{!! $body !!}` wajib sanitasi |

## 4. Configuration / Environment

| # | Aspek | Status |
|---|-------|--------|
| S24 | `APP_DEBUG` di production harus `false` | ✅ (cek `.env.production`) |
| S25 | `APP_KEY` ada | ✅ |
| S26 | `.env` di-ignore git | perlu dicek `.gitignore` |
| S27 | `SESSION_DRIVER=file` di `.env` lokal | ⚠️ (lihat `.env`) |
| S28 | `SESSION_ENCRYPT` di production | ✅ (di `.env.production`) |
| S29 | `SESSION_DOMAIN` prod | ✅ |
| S30 | `FILESYSTEM_DISK=public` lokal | ✅ |
| S31 | `MAIL_MAILER=log` | ✅ (dev) — production harus SMTP/SES |
| S32 | `QUEUE_CONNECTION=database` | ✅ |
| S33 | Trusted proxy (Vercel) | ✅ (`bootstrap/app.php`: `trustProxies(at: '*')`) |

## 5. Cookie / Header

| # | Aspek | Status |
|---|-------|--------|
| S34 | HTTPS-only session cookie | default Laravel: ya untuk `cookie_secure = true` (cek `config/session.php`) |
| S35 | `SameSite=lax` | default Laravel |
| S36 | X-Frame-Options | ❌ tidak di-set |
| S37 | CSP | ❌ tidak di-set |
| S38 | HSTS | ❌ tidak di-set |
| S39 | X-Content-Type-Options | ❌ |

## 6. File Upload

| # | Aspek | Status |
|---|-------|--------|
| S40 | Validasi mime (image) | ✅ (di FormRequest) |
| S41 | Validasi size | ✅ |
| S42 | Storage di `public/` disk | ✅ (lokal), `s3` di prod (perlu verify env) |
| S43 | Random nama file | ✅ (Laravel default) |
| S44 | Anti-malware scan | ❌ |

## 7. Audit & Logging

| # | Aspek | Status |
|---|-------|--------|
| S45 | LoginLog untuk setiap attempt | ✅ |
| S46 | AuditLog untuk admin actions | ✅ |
| S47 | ApprovalLog | ✅ |
| S48 | Rate-limit event 5xx logging | default Laravel |
| S49 | Sensitive data di log (password, token) | dicek via `Log::shareContext` (tidak ada → aman) |

## 8. Demo / Test Account

| # | Aspek | Status |
|---|-------|--------|
| S50 | `password` untuk semua akun demo | ⚠️ (lihat `test_logins.php` pakai `Password123!`) |
| S51 | Demo user otomatis ter-seed hanya di `local`/`debug` | ✅ (di `DatabaseSeeder.php:53`) |
| S52 | `superadmin@komuna.id` di master seeder | ⚠️ password default `password` |

## 9. Vercel-specific Security

| # | Aspek | Status |
|---|-------|--------|
| S53 | `vercel.json` env tidak di-hardcode | ✅ |
| S54 | Cron route dilindungi token | ✅ (`VerifyCronToken`) |
| S55 | `vendor/` ter-commit (lihat `CLAUDE.md`) — supply chain risk | ⚠️ (acceptable trade-off) |

## 10. Rekomendasi Prioritas

1. **Tambah `role:` middleware** di group role-specific (lihat `bugfix/03_FIXED_BUG_LIST.md`).
2. **Tambah security headers** (X-Frame-Options, X-Content-Type-Options, CSP) via middleware custom atau di Vercel `headers`.
3. **CSP policy** minimal: `default-src 'self'`, blok inline script (Vite menggunakan nonce atau external `build/`).
4. **Hapus `.env` dari git** jika sudah ter-commit (`git rm --cached .env`).
5. **2FA untuk superadmin** (advanced).
6. **Strict-Transport-Security** di Vercel header.

## 11. Quick Fixes (akan dilakukan di tahap E)

- Tambah `role:` middleware di routes/modules/*.
- Tambah `EnsureFrontendHeaders` middleware (X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- Update README route list.
