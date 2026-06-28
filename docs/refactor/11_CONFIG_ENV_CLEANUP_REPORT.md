# 11 — Config & Environment Cleanup Report

## Verified
- `composer.json` — OK (Laravel 11).
- `package.json` — OK (Vite).
- `vite.config.js` — OK.
- `.env.example` — tidak ada secret hardcoded (cek cepat).
- `bootstrap/app.php` — mendaftarkan middleware alias `role`/`permission`/`role_or_permission`/`admin`/`active_user`/`not.banned`/`cron.token` (Laravel 11 style, no Kernel.php).

## Production Reminder (dari prompt)
1. `APP_DEBUG=false` di production (cek `.env.production`).
2. `APP_URL` benar.
3. `SESSION_DRIVER=cookie` atau `database` untuk serverless.
4. `CACHE_DRIVER=database` atau `file` (lihat `config/cache.php`).
5. `FILESYSTEM_DISK=public`.
6. `DB_*` env tidak hardcoded.
7. Tidak ada mail credential hardcoded.

## Tidak Diubah
- File `.env*` di root tidak disentuh (mungkin berisi data lokal; tidak masuk git).
- `config/app.php`, `config/auth.php`, `config/database.php`, dll tidak diubah.

## Catatan
- Vercel deployment: `vercel.json` meroute `/storage/*` ke static, sisanya ke `api/index.php`.
- `vendor/` masuk git (sengaja untuk serverless) per `.gitignore`.
