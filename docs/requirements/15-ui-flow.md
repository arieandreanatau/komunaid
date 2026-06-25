# 15 — UI FLOW SUMMARY

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Main UI Flow

1. Guest buka beranda
2. Guest melihat komunitas/event/blog
3. Guest register
4. User selesai register → onboarding
5. User pilih role request atau nanti saja
6. User masuk dashboard member
7. User explore komunitas
8. User join komunitas
9. User daftar event
10. Community owner request role
11. Superadmin approve
12. Community owner membuat komunitas
13. Community owner membuat event
14. Brand/company mengajukan kolaborasi

---

## 2. Role Request Flow

1. User klik "Request Role" di dashboard
2. Pilih tipe: Community Owner / Brand Owner / Company Owner
3. Isi data awal sesuai tipe
4. Submit → status pending
5. Superadmin cek approval center
6. Approve → role aktif, redirect ke dashboard role
7. Reject → alasan ditampilkan, user tetap member

---

## 3. Community Owner → Event Flow

1. CO buka dashboard
2. Klik "Buat Event"
3. Isi form event
4. Publish
5. Event tampil di public listing
6. Member bisa daftar
7. CO kelola registrasi

---

## 4. Brand → Collaboration Flow

1. BO cari komunitas di directory
2. BO klik "Ajukan Kolaborasi"
3. Isi proposal
4. Kirim → status sent
5. CO lihat di halaman kolaborasi
6. CO accept/reject
7. Jika accept → status completed setelah selesai

---

## 5. Superadmin → Transfer Ownership Flow

1. SA buka detail user yang akan dihapus
2. Klik "Transfer Ownership"
3. Pilih komunitas/brand yang dimiliki user
4. Pilih user baru sebagai owner
5. Konfirmasi
6. Ownership berpindah
7. Audit log tercatat
8. User bisa dihapus/diban
