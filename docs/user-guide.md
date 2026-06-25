# KomunaID - Panduan Pengguna

## Daftar Isi

1. [Membuat Akun](#membuat-akun)
2. [Login](#login)
3. [Member](#member)
4. [Community Owner](#community-owner)
5. [Brand Owner](#brand-owner)
6. [Superadmin](#superadmin)

---

## Membuat Akun

1. Buka halaman utama KomunaID (`/`)
2. Klik **Daftar Sekarang**
3. Isi formulir:
   - Nama lengkap
   - Email
   - Password
   - Konfirmasi password
4. Klik **Daftar**
5. Setelah register, Anda akan diarahkan ke halaman **Onboarding** untuk melengkapi profil:
   - Username
   - Bio
   - Kota
   - Provinsi
   - No. telepon
6. Setelah onboarding, Anda akan masuk ke **Member Dashboard**

---

## Login

### User Login
1. Buka `/login`
2. Masukkan email dan password
3. Klik **Login**

### Superadmin Login
1. Buka `/admin/login`
2. Masukkan email dan password superadmin
3. Klik **Login**

---

## Member

### Dashboard
- Melihat jumlah komunitas yang diikuti
- Melihat jumlah event yang diikuti
- Melihat saldo wallet
- Akses cepat ke fitur utama

### Profil
1. Klik **Profil** di sidebar
2. Edit informasi profil
3. Klik **Simpan**
4. Untuk menghapus akun, klik **Hapus Akun**

### Bergabung ke Komunitas
1. Buka **Jelajahi Komunitas** (`/komunitas`)
2. Cari komunitas yang diminati
3. Klik komunitas untuk melihat detail
4. Klik **Gabung**
5. Status keanggotaan: **Pending** → menunggu approval dari Community Owner

### Keluar dari Komunitas
1. Buka detail komunitas yang sudah diikuti
2. Klik **Keluar**

### Mendaftar Event
1. Buka halaman **Events** (`/events`)
2. Pilih event yang diminati
3. Klik **Daftar**
4. Jika event berbayar, upload bukti pembayaran
5. Status pembayaran: **Menunggu Konfirmasi** → **Dikonfirmasi** / **Ditolak**

### Membatalkan Pendaftaran Event
1. Buka **My Registrations** (`/member/my-registrations`)
2. Pilih event yang ingin dibatalkan
3. Klik **Batalkan**

### Chat Event
1. Buka detail event
2. Klik menu **Chat**
3. Kirim pesan atau balas pesan yang ada
4. Pesan baru menunggu approval dari Community Owner

### Wallet
1. Buka **Wallet** (`/member/wallet`)
2. Melihat saldo saat ini
3. Klik **Riwayat** untuk melihat transaksi sebelumnya

### Donasi
1. Buka **Donasi** (`/member/donations`)
2. Pilih jenis donasi:
   - Donasi ke Event: pilih event, masukkan nominal
   - Donasi ke Komunitas: pilih komunitas, masukkan nominal
3. Klik **Kirim Donasi**

### Pengajuan Role
1. Buka **Role Request** (`/member/role-request`)
2. Pilih role yang ingin diajukan (Community Owner / Brand Owner)
3. Isi catatan/alasan
4. Klik **Ajukan**
5. Status: **Pending** → **Approved** / **Rejected**

---

## Community Owner

### Dashboard
- Melihat total komunitas, member, event
- Melihat event paid/free
- Melihat total donasi
- Melihat saldo wallet komunitas

### Mengelola Komunitas
1. Buka **Komunitas Saya** (`/community-own/communities`)
2. Klik **Buat Komunitas** untuk membuat baru
3. Isi form:
   - Nama komunitas
   - Deskripsi
   - About
   - Kategori
   - Kota / Provinsi
   - Tipe komunitas (open/closed)
   - Visibilitas (public/private)
4. Klik **Simpan**
5. Komunitas akan berstatus **Pending** → menunggu approval superadmin

### Mengelola Member
1. Buka detail komunitas
2. Klik **Member**
3. Aksi yang tersedia:
   - **Approve** - terima member baru
   - **Update Role** - ubah role (admin/volunteer/member)
   - **Remove** - keluarkan member
   - **Ban** / **Unban** - blokir / buka blokir member

### Mengelola Regional
1. Buka detail komunitas
2. Klik **Regional**
3. Klik **Tambah Regional**
4. Isi nama, deskripsi, kota, provinsi
5. Klik **Simpan**

### Mengelola Sub Komunitas
1. Buka detail komunitas
2. Klik **Sub Komunitas**
3. Klik **Tambah Sub Komunitas**
4. Isi nama dan deskripsi
5. Klik **Simpan**

### Mengelola Event
1. Buka **Events** (`/community-own/events`)
2. Klik **Buat Event**
3. Isi form:
   - Judul event
   - Deskripsi
   - Tipe event (free/paid)
   - Tipe lokasi (offline/online/hybrid)
   - Alamat/link
   - Tanggal & waktu mulai/selesai
   - Kapasitas
   - Harga (jika paid)
   - Fee platform & admin
   - Status registrasi
4. Klik **Simpan**
5. Event akan berstatus **Pending** → menunggu approval superadmin

### Mengelola Registrasi Event
1. Buka detail event
2. Klik **Registrations**
3. Lihat daftar pendaftar
4. Klik **Confirm** untuk menyetujui pembayaran
5. Klik **Reject** untuk menolak pembayaran

### Mengelola Galeri Event
1. Buka detail event
2. Klik **Galeri**
3. Klik **Upload** untuk menambah foto
4. Klik **Hapus** untuk menghapus foto

### Mengelola Chat Event
1. Buka detail event
2. Klik **Chat**
3. Buat topik baru dengan klik **Buat Chat**
4. Setel sebagai **Pin** / **Unpin**
5. Review balasan: **Approve** / **Reject** balasan member
6. **Hapus** chat jika diperlukan

### Mengelola Kolaborasi
1. Buka **Kolaborasi** (`/community-own/collaborations`)
2. Lihat kolaborasi masuk dari brand
3. Klik **Terima** / **Tolak** / **Batalkan** / **Selesai**

### Wallet Komunitas
1. Buka **Wallet** (`/community-own/wallet`)
2. Melihat saldo komunitas

### Donasi
1. Buka **Donasi** (`/community-own/donations`)
2. Lihat daftar donasi masuk
3. Klik **Confirm** untuk menyetujui donasi
4. Klik **Reject** untuk menolak donasi

---

## Brand Owner

### Dashboard
- Melihat total brand, pending, approved
- Melihat campaign, active campaign
- Melihat kolaborasi

### Mengelola Brand
1. Buka **Brand Saya** (`/brand/brands`)
2. Klik **Buat Brand**
3. Isi form:
   - Nama brand
   - Deskripsi
   - Industri
   - Website
   - Instagram
   - Contact person, email, telepon
4. Klik **Simpan**
5. Brand akan berstatus **Pending** → menunggu approval superadmin

### Mengelola Campaign
1. Buka **Campaign** (`/brand/campaigns`)
2. Klik **Buat Campaign**
3. Isi form:
   - Judul campaign
   - Deskripsi
   - Budget
   - Tanggal mulai/selesai
4. Klik **Simpan**

### Mengelola Kolaborasi
1. Buka **Kolaborasi** (`/brand/collaborations`)
2. Klik **Ajukan Kolaborasi**
3. Pilih komunitas target
4. Isi:
   - Tipe kolaborasi
   - Judul
   - Proposal
   - Budget
   - Tanggal event
   - Kontak person
5. Klik **Kirim**

### Mengelola Staff
1. Buka detail brand
2. Klik **Staff**
3. Klik **Tambah Staff**
4. Cari user yang ingin ditambahkan
5. Klik **Tambah**

### Menjelajahi Komunitas
1. Buka **Komunitas** (`/brand/communities`)
2. Cari dan filter komunitas
3. Klik komunitas untuk melihat detail

---

## Superadmin

### Login
1. Buka `/admin/login`
2. Masukkan kredensial superadmin

### Dashboard
- Melihat statistik platform:
  - Total members, community owners, brand owners
  - Total communities, brands, events
  - Total donations, platform fees

### Approval Center
1. Buka **Approval Center** (`/superadmin/approval-center`)
2. Melihat semua item yang menunggu approval:
   - Role requests
   - Communities
   - Brands
   - Events
   - Payments
   - Collaborations
3. Klik **Approve** / **Reject** untuk setiap item

### Mengelola Users
1. Buka **Users** (`/superadmin/users`)
2. Cari dan filter user
3. Klik user untuk melihat detail
4. Aksi: **Suspend** / **Ban** / **Activate**

### Mengelola Komunitas
1. Buka **Communities** (`/superadmin/communities`)
2. Klik komunitas untuk detail
3. Aksi: **Approve** / **Reject** / **Suspend** / **Delete**

### Mengelola Brand
1. Buka **Brands** (`/superadmin/brands`)
2. Klik brand untuk detail
3. Aksi: **Approve** / **Reject** / **Suspend** / **Delete**

### Mengelola Kategori
1. Buka **Categories** (`/superadmin/categories`)
2. Klik **Tambah Kategori**
3. Isi nama, slug, deskripsi, icon
4. **Edit** / **Hapus** kategori yang ada

### Mengelola Master Region
1. Buka **Regions** (`/superadmin/regions`)
2. Klik **Tambah Region**
3. Isi nama provinsi
4. **Edit** / **Hapus** region yang ada

### Melihat Audit Log
1. Buka **Audit Logs** (`/superadmin/audit-logs`)
2. Filter berdasarkan tanggal, user, tipe
3. Klik untuk melihat detail

### Mengelola Wallet User
1. Buka **Wallets** (`/superadmin/wallets`)
2. Pilih user
3. Klik **Adjust** untuk menyesuaikan saldo

### Mengelola Donasi
1. Buka **Donations** (`/superadmin/donations`)
2. Klik donasi untuk detail
3. **Confirm** / **Reject** donasi

### Melihat Platform Fees
1. Buka **Platform Fees** (`/superadmin/platform-fees`)
2. Melihat laporan fee dari event berbayar
3. Klik untuk detail transaksi
