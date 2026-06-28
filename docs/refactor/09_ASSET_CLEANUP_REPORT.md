# 09 — Asset Cleanup Report

## Scope
- `public/build` — Vite build output (regenerate via `npm run build`).
- `public/images`, `public/assets` — image/logo assets.
- `resources/css`, `resources/js` — Vite sources.
- `storage/app/public` — user uploads (JANGAN dihapus).

## Inventory
- `public/build/manifest.json` masih dipakai.
- Logo & banner yang di-upload user disimpan via `FileUploadService` ke `storage/app/public/{folder}/{random}.{ext}`.

## Aturan
1. **JANGAN** hapus `storage/app/public` (upload user).
2. **JANGAN** hapus `public/build/manifest.json` (Vite reference).
3. Asset UI statis (logo brand, favicon) di `public/images` atau `public/assets` — periksa referensi di `views/*` sebelum hapus.

## Action
- Tidak ada asset yang dihapus pada refactor ini.
- Vite build tidak dijalankan (asset tidak berubah).
- Upload folder untuk v2 sudah benar (`storage/app/public/communities`, `brands`, `companies`).
