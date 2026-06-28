# 57 — TROUBLESHOOTING GUIDE

## 57.1 "Saya tidak bisa register"
- **Cek**: Apakah email / username sudah dipakai orang lain? Pesan error di bawah field akan menjelaskan.
- **Cek**: Apakah password minimal 8 karakter dan konfirmasi cocok?
- **Cek**: Apakah Anda mengisi email ATAU username (minimal salah satu)?
- **Solusi**: Jika semua benar dan tetap gagal, refresh halaman (Ctrl+F5) dan coba lagi.

## 57.2 "Saya tidak bisa login"
- **Cek**: Apakah email / username + password benar?
- **Cek**: Apakah akun di-banned atau di-suspend? Anda akan diarahkan ke halaman **Account Restricted**.
- **Solusi**: Klik **Lupa password** untuk reset.

## 57.3 "Saya tidak menerima email reset"
- Cek folder **Spam** / **Promotions**.
- Pastikan email yang Anda masukkan adalah email yang terdaftar.
- Tunggu 1-2 menit; email bisa tertunda.

## 57.4 "Tidak ada error message saat register/login gagal"
- Ini adalah UX yang sedang diperbaiki (F-002). Sementara, error per-field di bawah input akan menjelaskan.
- Pastikan JavaScript tidak memblokir submit.

## 57.5 "Halaman /communities atau /blog 404"
- Ini bug F-001. Sedang diperbaiki. Sementara, komunitas tersedia di landing page, dan blog akan hadir di P1.

## 57.6 "Login terlalu sering ditolak"
- 5 kali gagal dalam 1 menit = 429 throttled. Tunggu 1 menit.
- Jika Anda yakin password benar, gunakan **Lupa password**.

## 57.7 "Saya tidak bisa join komunitas"
- **Cek**: Apakah Anda sudah join 3x dan keluar 3x dalam 90 hari? (F-008)
- **Cek**: Apakah komunitas dalam mode **closed**?
- **Cek**: Apakah Anda di-banned dari komunitas ini?

## 57.8 "Brand saya tidak muncul"
- Brand baru berstatus **pending** sampai disetujui superadmin. Cek notifikasi.

## 57.9 "Event saya tidak publish"
- Event **paid** butuh approval superadmin. Event **free** akan auto-publish jika komunitas approved.
- Cek status event: `draft → submitted → approved → published`.

## 57.10 "Tidak bisa upload foto / logo"
- **Cek**: File di bawah 2 MB.
- **Cek**: Format file JPG / PNG / WebP.
- Refresh halaman dan coba lagi.

## 57.11 "Dompet saya tidak bisa top-up"
- Payment gateway belum terintegrasi (F-017). Untuk sementara, top-up tidak tersedia.

## 57.12 "Vercel terasa lambat"
- Cold start serverless. Refresh akan lebih cepat setelah warm-up.
- Untuk produksi, pindah ke VPS (lihat `47_DEPLOYMENT_AUDIT_AND_RECOMMENDATION.md`).

## 57.13 "Laravel error 500"
- Untuk development lokal, cek `storage/logs/laravel.log`.
- Untuk produksi, hubungi admin. APP_DEBUG=false menyembunyikan detail.
