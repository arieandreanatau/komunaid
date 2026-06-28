# 54 — ADMIN GUIDE: SUPERADMIN

## 54.1 Login
- URL khusus: `https://komunaidv2-komuna.vercel.app/admin/login`.
- Akun harus sudah diberi role `superadmin` atau `platform_admin`.

## 54.2 Dashboard
- KPI ringkas: total user, komunitas, brand, perusahaan, event, donation hari ini, fee hari ini.

## 54.3 Approval queue
- **Communities**, **Brands**, **Companies**, **Role Requests** — semua di tab Approval.
- Klik **Approve** atau **Reject** (wajib isi alasan untuk reject).
- Setiap keputusan tercatat di `approval_logs` dan `audit_logs`.

## 54.4 Suspend / freeze / delete
- **Users** → cari user → pilih tindakan.
- **Communities / Brands / Companies / Events** → sama.
- Tindakan destruktif butuh alasan dan tercatat di audit log.

## 54.5 Master data
- **Master Data** → region, kategori komunitas, interest, event type, dll.
- Tambah / edit / nonaktifkan.

## 54.6 CMS
- **CMS** → buat / edit halaman statis (about, terms, privacy).
- **Blog** → buat / edit artikel.

## 54.7 Revenue
- **Revenue** → total platform fee per hari / minggu / bulan.

## 54.8 Audit & login log
- **Audit Logs** → semua perubahan state.
- **Login Logs** → semua percobaan login (sukses & gagal).

## 54.9 Feature lock (premium)
- **Premium** → aktif/nonaktifkan fitur premium.
- Pantau `feature_usages`.

## 54.10 Health check
- **Health** → status DB, cache, queue, storage, mail.

## 54.11 Chat admin
- **Admin Chat** → mulai percakapan dengan owner atau member.

## 54.12 Tips
- Selalu isi alasan saat reject atau suspend.
- Cek audit log setelah operasi besar.
- Backup DB sebelum migrasi.
