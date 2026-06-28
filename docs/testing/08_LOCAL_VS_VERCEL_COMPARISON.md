# KomunaID — Local vs Vercel Comparison

> Tanggal: 2026-06-28

## 1. Ringkasan

| Aspek | Local (XAMPP) | Vercel (production) | Selaras? |
|-------|---------------|---------------------|----------|
| Public homepage | 200, 46 KB | 200, 1.3 KB (HTML) | OK (size berbeda karena Vercel compress) |
| Public komunitas | 200, 40 KB | 200 | ✅ |
| Public events | 200, 16 KB | 200 | ✅ |
| Public blog | 200, 22 KB | 404 | ❌ — Vercel tidak punya route `/blog` (di local juga tidak! route `/blog` adalah alias dan Vercel route registry mungkin tidak include). Perlu cek. |
| Public about | 200, 18 KB | 200 | ✅ |
| Public contact | 200, 20 KB | 200 | ✅ |
| Auth login | OK untuk 6/8 user | OK untuk 8/11 user (komuna.id) | ✅ sebagian |
| Redirect by role | Benar | Benar | ✅ |
| Asset `/build/manifest.json` | 200 | 200 | ✅ |
| Asset `/assets/app-*.css` | 200 (di local ada di `/build/assets/`) | **404** | ❌ Vercel-specific |
| Asset `/build/assets/app-*.css` | 200 | 200 | ✅ |
| `/tentang-kami` | 404 | 404 | ✅ (sama-sama 404, sama-sama bug doc) |
| `/member/dashboard` (guest) | 302 → /login | - (tidak dites) | - |
| `/up` (health) | 200 | 200 | ✅ |

## 2. Perbedaan ENV

| Aspek | Local | Vercel |
|-------|-------|--------|
| `APP_ENV` | local | production |
| `APP_DEBUG` | true | false (expected) |
| `SESSION_DRIVER` | file | database (expected) |
| `DB_HOST` | 127.0.0.1 | srv1761.hstgr.io (per `.env.production`) |
| `FILESYSTEM_DISK` | public | s3 (expected) |
| `MAIL_MAILER` | log | smtp (expected) |
| Cache | file | database |

## 3. Perbedaan Database

* Local: XAMPP MySQL `komunaid`, master + demo seed.
* Vercel: Hostinger MySQL dengan akun `@komuna.id` (production).
* Akun `member@komuna.id` ada di DB (cek: `id=2`) tapi login gagal — password tidak cocok dengan `Password123!`.

## 4. Perbedaan Route

* Local & Vercel sama-sama tidak punya `/tentang-kami`, `/hubungi-kami`, `/event`, `/member`, `/superadmin` (bare prefix). Ini bug doc.
* Local & Vercel sama-sama redirect guest ke login.

## 5. Perbedaan Build Behavior

* **Local:** `npm run build` menghasilkan `public/build/assets/app-*.css` dan `public/build/assets/app-*.js`.
* **Vercel:** `vercel.json` `outputDirectory: "public"`. Build menghasilkan file di `public/build/assets/...` lalu di-serve via `api/static.php` route.
* **Manifest** secara konsisten mencatat path relatif `assets/app-*.css` (tanpa prefix). Blade `@vite()` helper menghasilkan URL `https://site/assets/app-*.css`. Tapi di Vercel, `vercel.json` route `/assets/(.*)` ada dan mengarah ke `api/static.php` — namun static.php tidak menemukan file tersebut di `/assets/` path (karena file fisik di `/build/assets/`).
* **Root cause:** Vite base path di production harus `/build/` (atau Vercel route harusnya `/build/assets/(.*)`).

## 6. Rekomendasi

1. **Critical**: perbaiki Vite base path atau vercel.json static routes.
2. Update README dengan route valid.
3. Tambah alias `/blog` ke `/blogs`.
4. Investigasi password prod user yang tidak match.
5. Tambah test otomatis untuk asset path resolution di CI.
