# KomunaID — Vercel Test Result

> Tanggal: 2026-06-28. URL: `https://komunaidv2-komuna.vercel.app`

## 1. Status

* Serverless function `api/index.php` aktif.
* Vite build ter-deploy (manifest reachable).
* Auth flow berfungsi untuk sebagian besar role.
* **Bug ditemukan**: Vite asset path mismatch (manifest menyebut `/assets/...` tapi Vercel serve 404 untuk path tersebut; file ada di `/build/assets/...`).
* **Bug ditemukan**: 3 dari 11 akun production tidak bisa login (kemungkinan password drift).

## 2. Response Sample

* Homepage `<title>KomunaID — Connect, Community, Grow</title>` ✅
* `Cache-Control: public, max-age=31536000, immutable` di `/build/manifest.json` ✅
* HTML pages `Cache-Control: max-age=0, must-revalidate, no-cache, no-store, private` ✅
* `content-type: text/html; charset=utf-8` untuk HTML ✅
* `content-type: application/json; charset=utf-8` untuk manifest ✅

## 3. Auth Pass Rate

* 8/11 prod users login dengan redirect benar (73%)
* 3/11 prod users gagal login (member@, community@, brand@komuna.id)

## 4. Bug Daftar (Vercel-specific)

* VBUG-01: Asset 404 (`/assets/app-*.css` dan `/assets/app-*.js` 404 padahal manifest menyebut di sana)
* VBUG-02: 3 prod user login failed
* VBUG-03: `/blog` (singular) 404 — `/blogs` (plural) works

## 5. Rekomendasi

1. **Critical fix VBUG-01**: cek `vite.config.js` dan `api/static.php` — kemungkinan `base: '/build/'` di Vite atau path resolution issue.
2. Update README agar route benar (lihat local bug BUG-001).
3. Tambah `/blog` alias di routes.
4. Reset password untuk 3 prod user atau periksa user state (banned/suspended).
