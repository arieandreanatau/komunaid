# KomunaID — Vercel Test Plan

> **VERCEL_LIVE_URL:** `https://komunaidv2-komuna.vercel.app` (dari `test_logins.php`)
> **VERCEL_TOKEN:** ada di `.env.vercel-token` (ter-commit — security risk, lihat BUG-013)
> **Tanggal:** 2026-06-28

## Keterbatasan Akses

* Vercel CLI terinstal (`vercel` ada di node_modules? Belum dicek).
* Koneksi internet dari sandbox audit: **tidak diuji coba** selama fase ini karena environment audit lokal XAMPP tidak menjamin akses keluar.
* Pengujian live Vercel akan dieksekusi menggunakan `curl` ke `https://komunaidv2-komuna.vercel.app`.

## Prasyarat

1. URL Vercel live dan resolve ke environment `production` atau `preview`.
2. Build sukses: `vercel.json` `buildCommand: npm run build` harus complete.
3. Function `api/index.php` di-deploy (verifikasi dengan `vercel ls` atau `vercel inspect`).
4. Cron secret di-set di Vercel dashboard.

## Test Items (Vercel)

### V01 - Availability
- `GET https://komunaidv2-komuna.vercel.app/` → 200
- `GET https://komunaidv2-komuna.vercel.app/up` → 200 (Laravel health)

### V02 - Static asset
- `GET /build/manifest.json` → 200, content-type `application/json`
- `GET /favicon.ico` → 200

### V03 - Auth flow
- `GET /login` → 200
- `GET /admin/login` → 200
- Login per role (lihat TC23-TC30) → redirect sesuai role

### V04 - Routing
- `GET /komunitas` → 200
- `GET /events` → 200
- `GET /about` → 200 (bukan `/tentang-kami`)

### V05 - Database connectivity
- Login sebagai superadmin (yang ada di prod DB) → 302 ke dashboard
- Lihat `/superadmin/dashboard` → 200, data ter-load

### V06 - Cron
- `GET /api/cron/scheduler?token=wrong` → 401/403
- `GET /api/cron/scheduler?token=$CRON_SECRET` → 200

### V07 - File upload
- `POST /community-own/communities/{id}` (multipart with logo) → 302 success

### V08 - Cache
- Inspect `Cache-Control` di header:
  - `/build/`: `public, max-age=31536000, immutable`
  - `/assets/`: same
  - `/favicon.ico`: same
  - HTML: `no-cache` default

### V09 - Error pages
- `GET /nonexistent` → 404
- `GET /admin/login` saat tidak di-host → 500 tidak boleh bocor stacktrace (cek `APP_DEBUG=false` di Vercel env)

### V10 - Console browser
- Load `/`, inspect Console:
  - Tidak ada error JS fatal
  - Tidak ada 404 untuk asset

### V11 - Network
- Tidak ada request 4xx/5xx saat load homepage normal

### V12 - Build
- `vercel.json` framework=null. `buildCommand: npm run build`. Vite harus output ke `public/`. (Sesuai config.)
- `outputDirectory: public`. Function di `api/index.php`.

## Alat

- `curl` (jika Unix shell tersedia, atau `Invoke-WebRequest` di Windows)
- Browser DevTools (manual, jika ada akses)
- Vercel CLI (`npx vercel inspect <DEPLOYMENT>`) untuk build logs

## Exit Criteria Vercel

- Semua ✅ V01-V12 harus passed.
- Bug baru (jika ada) dimasukkan ke `04_BUG_LIST_LOCAL.md` (sama) atau file terpisah `04_BUG_LIST_VERCEL.md`.
- Vercel-specific issues (Vercel env, function, cold start) diisolasi.
