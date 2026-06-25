# KomunaID V2 — Security Production Checklist

> Checklist keamanan sebelum dan sesudah deployment production.

---

## Environment & Configuration

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | APP_ENV=production | [ ] | Bukan staging/local |
| 2 | APP_DEBUG=false | [ ] | Tidak expose stack trace |
| 3 | APP_KEY terisi (64 char base64) | [ ] | Generate: `php artisan key:generate` |
| 4 | .env tidak di-commit ke repo | [ ] | Cek .gitignore |
| 5 | .env tidak accessible via web | [ ] | Document root = public/ |
| 6 | config:cache dijalankan | [ ] | `php artisan config:cache` |

---

## Network & Transport

| # | Item | Status | Notes |
|---|------|--------|-------|
| 7 | HTTPS enabled | [ ] | SSL certificate aktif |
| 8 | HTTP redirect to HTTPS | [ ] | Nginx/Apache redirect |
| 9 | HSTS header | [ ] | Optional, recommended |
| 10 | X-Frame-Options: SAMEORIGIN | [ ] | Anti-clickjacking |
| 11 | X-Content-Type-Options: nosniff | [ ] | Anti-MIME-sniffing |

---

## Database

| # | Item | Status | Notes |
|---|------|--------|-------|
| 12 | DB user bukan root | [ ] | Gunakan dedicated user |
| 13 | DB password kuat | [ ] | Minimal 16 karakter |
| 14 | DB user hanya punya privilege needed | [ ] | SELECT, INSERT, UPDATE, DELETE |
| 15 | DB port tidak exposed ke internet | [ ] | Firewall block 3306 |

---

## Application Security

| # | Item | Status | Notes |
|---|------|--------|-------|
| 16 | CSRF protection aktif | [ ] | Default Laravel aktif |
| 17 | Rate limiting pada login | [ ] | `throttle:5,1` |
| 18 | Upload validation aktif | [ ] | Mimes, max size |
| 19 | Export tidak expose password/token | [ ] | Cek export columns |
| 20 | Audit log aktif | [ ] | `audit_logs` table |
| 21 | Error page tidak expose stack trace | [ ] | APP_DEBUG=false |
| 22 | Session secure cookie | [ ] | SESSION_SECURE_COOKIE=true (HTTPS) |
| 23 | Session HTTP only | [ ] | default true di Laravel |
| 24 | Session same_site=lax | [ ] | default Laravel |

---

## File & Storage

| # | Item | Status | Notes |
|---|------|--------|-------|
| 25 | Storage private tidak public | [ ] | storage/app/private hanya via code |
| 26 | public/storage hanya symlink ke public disk | [ ] | `php artisan storage:link` |
| 27 | File permission storage: 775 | [ ] | `chmod -R 775 storage` |
| 28 | File permission bootstrap/cache: 775 | [ ] | `chmod -R 775 bootstrap/cache` |
| 29 | Directory listing disabled | [ ] | .htaccess atau Nginx config |
| 30 | public folder sebagai document root | [ ] | Bukan project root |

---

## User & Auth

| # | Item | Status | Notes |
|---|------|--------|-------|
| 31 | Admin password diganti dari default | [ ] | Jangan pakai "password" |
| 32 | Demo user disabled/removed | [ ] | Tidak ada di production |
| 33 | Registration policy sesuai kebutuhan | [ ] | Bisa limit/disable jika perlu |
| 34 | Role/permission sudah di-cache | [ ] | `php artisan permission:cache-reset` |

---

## Server & Dependencies

| # | Item | Status | Notes |
|---|------|--------|-------|
| 35 | Composer dev packages tidak ada | [ ] | `composer install --no-dev` |
| 36 | Node modules tidak di-upload | [ ] | Hanya public/build |
| 37 | Logs tidak terlalu verbose | [ ] | LOG_LEVEL=error atau warning |
| 38 | Mail config aman | [ ] | Bukan log driver di production |
| 39 | No production credential in repo | [ ] | Review .env.example |
| 40 | Backup aman & accessible | [ ] | Tidak di public_html |

---

## Commands to Verify

```bash
# Check APP_DEBUG
php artisan about | findstr "Debug"

# Check config cache
php artisan config:cache

# Check route cache
php artisan route:cache

# Verify no credential in .env.example
type .env.example | findstr "PASSWORD"
# Should only show placeholder values
```

---

## Security Scan Commands

```bash
# Check for exposed .env
curl -I https://your-domain.com/.env
# Should return 404 or 403

# Check for exposed storage
curl -I https://your-domain.com/storage/
# Should not list directory

# Check for debug mode
curl -I https://your-domain.com/nonexistent-page
# Should NOT show stack trace
```
