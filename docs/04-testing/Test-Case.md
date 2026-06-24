# KomunaID - Test Case

## Register

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-REG-001 | Register | Register dengan data valid | 1. Buka /register 2. Isi name, email, password, confirm password 3. Klik "Register" | Akun berhasil dibuat, redirect ke dashboard | | |
| TC-REG-002 | Register | Register dengan email sudah ada | 1. Buka /register 2. Isi email yang sudah terdaftar 3. Klik "Register" | Muncul error "email sudah digunakan" | | |
| TC-REG-003 | Register | Register dengan password tidak cocok | 1. Buka /register 2. Isi password berbeda di confirm password 3. Klik "Register" | Muncul error validasi password | | |
| TC-REG-004 | Register | Register dengan field kosong | 1. Buka /register 2. Klik "Register" tanpa isi data | Muncul error validasi required | | |
| TC-REG-005 | Register | Register dengan password lemah | 1. Buka /register 2. Isi password "123" 3. Klik "Register" | Muncul error password minimal 8 karakter | | |

## Login

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-LOG-001 | Login | Login sebagai superadmin | 1. Buka /login 2. Isi email: superadmin@komuna.id, password: password 3. Klik "Login" | Redirect ke /superadmin/dashboard | | |
| TC-LOG-002 | Login | Login sebagai member | 1. Buka /login 2. Isi email: member@komuna.id, password: password 3. Klik "Login" | Redirect ke /member/dashboard | | |
| TC-LOG-003 | Login | Login sebagai community_owner | 1. Buka /login 2. Isi email: community@komuna.id, password: password 3. Klik "Login" | Redirect ke /community-own/dashboard | | |
| TC-LOG-004 | Login | Login sebagai brand_owner | 1. Buka /login 2. Isi email: brand@komuna.id, password: password 3. Klik "Login" | Redirect ke /brand/dashboard | | |
| TC-LOG-005 | Login | Login dengan password salah | 1. Buka /login 2. Isi email benar, password salah 3. Klik "Login" | Muncul error "credentials tidak cocok" | | |
| TC-LOG-006 | Login | Login dengan email tidak terdaftar | 1. Buka /login 2. Isi email: notfound@test.com 3. Klik "Login" | Muncul error "credentials tidak cocok" | | |
| TC-LOG-007 | Login | Logout | 1. Login 2. Klik "Logout" | Redirect ke halaman home, session terhapus | | |

## Role Request

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-RR-001 | Role Request | Member request jadi community_owner | 1. Login sebagai member 2. Buka /member/role-request 3. Pilih "Community Owner" 4. Isi notes 5. Klik Submit | Role request berhasil dibuat dengan status pending | | |
| TC-RR-002 | Role Request | Member request jadi brand_owner | 1. Login sebagai member 2. Buka /member/role-request 3. Pilih "Brand Owner" 4. Isi notes 5. Klik Submit | Role request berhasil dibuat dengan status pending | | |
| TC-RR-003 | Role Request | Member sudah punya pending request | 1. Login sebagai member 2. Submit role request 3. Submit lagi role request yang sama | Muncul error "sudah ada pending request" | | |
| TC-RR-004 | Role Request | Cek daftar role request | 1. Login sebagai member 2. Buka /member/role-request | Menampilkan daftar role request user | | |

## Approval (Superadmin)

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-APR-001 | Approval | Approve role request | 1. Login superadmin 2. Buka /superadmin/approval-center 3. Klik Approve pada role request | Status berubah menjadi approved, user mendapat role | | |
| TC-APR-002 | Approval | Reject role request | 1. Login superadmin 2. Buka /superadmin/approval-center 3. Klik Reject pada role request | Status berubah menjadi rejected | | |
| TC-APR-003 | Approval | Approve community | 1. Login superadmin 2. Buka approval center 3. Approve community pending | Status community berubah menjadi approved | | |
| TC-APR-004 | Approval | Reject community | 1. Login superadmin 2. Buka approval center 3. Reject community pending | Status community berubah menjadi rejected | | |
| TC-APR-005 | Approval | Approve brand | 1. Login superadmin 2. Buka approval center 3. Approve brand pending | Status brand berubah menjadi approved | | |
| TC-APR-006 | Approval | Reject brand | 1. Login superadmin 2. Buka approval center 3. Reject brand pending | Status brand berubah menjadi rejected | | |
| TC-APR-007 | Approval | Confirm payment | 1. Login superadmin 2. Buka approval center 3. Confirm payment | Status payment berubah menjadi confirmed | | |
| TC-APR-008 | Approval | Reject payment | 1. Login superadmin 2. Buka approval center 3. Reject payment | Status payment berubah menjadi rejected | | |

## Create Community

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-COM-001 | Create Community | Buat komunitas baru | 1. Login community_owner 2. Buka /community-own/communities/create 3. Isi semua field 4. Klik Submit | Komunitas dibuat dengan status pending | | |
| TC-COM-002 | Create Community | Buat komunitas tanpa nama | 1. Login community_owner 2. Buka form create 3. Kosongkan nama 4. Klik Submit | Muncul error validasi name required | | |
| TC-COM-003 | Create Community | Edit komunitas | 1. Login community_owner 2. Buka komunitas 3. Klik edit 4. Ubah deskripsi 5. Klik Update | Komunitas berhasil diupdate | | |
| TC-COM-004 | Create Community | Lihat daftar komunitas | 1. Login community_owner 2. Buka /community-own/communities | Menampilkan daftar komunitas yang dimiliki | | |
| TC-COM-005 | Create Community | Lihat detail komunitas | 1. Login community_owner 2. Klik salah satu komunitas | Menampilkan detail komunitas lengkap | | |

## Join Community

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-JOIN-001 | Join Community | Join komunitas public | 1. Login member 2. Buka /komunitas/{community} 3. Klik "Join" | Berhasil join, status active | | |
| TC-JOIN-002 | Join Community | Leave komunitas | 1. Login member 2. Buka komunitas yang diikuti 3. Klik "Leave" | Berhasil leave, status left | | |
| TC-JOIN-003 | Join Community | Join komunitas sudah di-follow | 1. Login member 2. Buka komunitas yang sudah diikuti | Tombol Join tidak tampil, sudah jadi anggota | | |
| TC-JOIN-004 | Join Community | Lihat daftar komunitas diikuti | 1. Login member 2. Buka member dashboard | Menampilkan komunitas yang diikuti | | |

## Ban Member

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-BAN-001 | Ban Member | Ban anggota komunitas | 1. Login community_owner 2. Buka /community-own/communities/{id}/members 3. Klik "Ban" pada anggota 4. Isi alasan 5. Konfirmasi | Anggota dibanned, status banned | | |
| TC-BAN-002 | Ban Member | Unban anggota | 1. Login community_owner 2. Buka daftar anggota 3. Klik "Unban" | Anggota di-unban, bisa join lagi | | |
| TC-BAN-003 | Ban Member | Banned user coba join | 1. Login user yang dibanned 2. Coba join komunitas | Muncul error "Anda telah dibanned" | | |
| TC-BAN-004 | Ban Member | Lihat daftar banned | 1. Login community_owner 2. Buka halaman members | Menampilkan anggota yang dibanned | | |

## Create Brand

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-BRD-001 | Create Brand | Buat brand baru | 1. Login brand_owner 2. Buka /brand/brands/create 3. Isi semua field 4. Klik Submit | Brand dibuat dengan status pending | | |
| TC-BRD-002 | Create Brand | Edit brand | 1. Login brand_owner 2. Buka brand 3. Klik edit 4. Ubah deskripsi 5. Update | Brand berhasil diupdate | | |
| TC-BRD-003 | Create Brand | Lihat daftar brand | 1. Login brand_owner 2. Buka /brand/brands | Menampilkan daftar brand | | |
| TC-BRD-004 | Create Brand | Tambah staff | 1. Login brand_owner 2. Buka brand staff page 3. Search user 4. Tambah sebagai staff | Staff berhasil ditambahkan | | |

## Create Event

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-EVT-001 | Create Event | Buat event gratis | 1. Login community_owner 2. Buka /community-own/events/create 3. Isi field, event_type: free 4. Klik Submit | Event dibuat, approval_status: approved | | |
| TC-EVT-002 | Create Event | Buat event berbayar | 1. Login community_owner 2. Isi form, event_type: paid, price: 150000 3. Klik Submit | Event dibuat dengan harga | | |
| TC-EVT-003 | Create Event | Buat event tanpa judul | 1. Login community_owner 2. Kosongkan title 3. Klik Submit | Muncul error validasi | | |
| TC-EVT-004 | Create Event | Edit event | 1. Login community_owner 2. Buka event 3. Edit deskripsi 4. Update | Event berhasil diupdate | | |
| TC-EVT-005 | Create Event | Hapus event | 1. Login community_owner 2. Buka event 3. Klik Hapus | Event terhapus (soft delete) | | |
| TC-EVT-006 | Create Event | Lihat daftar event | 1. Login community_owner 2. Buka /community-own/events | Menampilkan daftar event komunitas | | |

## Register Paid Event

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-REG-PAID-001 | Register Paid Event | Daftar event berbayar | 1. Login member 2. Buka event berbayar 3. Klik "Register" | Registration berhasil, payment_status: unpaid | | |
| TC-REG-PAID-002 | Register Paid Event | Daftar event gratis | 1. Login member 2. Buka event gratis 3. Klik "Register" | Registration berhasil, langsung confirmed | | |
| TC-REG-PAID-003 | Register Paid Event | Cek my registrations | 1. Login member 2. Buka /member/my-registrations | Menampilkan daftar event yang didaftarkan | | |
| TC-REG-PAID-004 | Register Paid Event | Cancel registration | 1. Login member 2. Buka my registrations 3. Cancel registration | Status berubah menjadi cancelled | | |

## Manual Payment

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-PAY-001 | Manual Payment | Upload bukti bayar | 1. Login member 2. Buka event yang didaftarkan 3. Upload bukti bayar 4. Isi bank, nama rekening, jumlah 5. Submit | Payment confirmation dibuat, status: pending | | |
| TC-PAY-002 | Manual Payment | Community owner confirm payment | 1. Login community_owner 2. Buka event registrations 3. Lihat payment pending 4. Klik Confirm | Status payment: confirmed | | |
| TC-PAY-003 | Manual Payment | Community owner reject payment | 1. Login community_owner 2. Lihat payment pending 3. Klik Reject | Status payment: rejected | | |
| TC-PAY-004 | Manual Payment | Superadmin confirm payment | 1. Login superadmin 2. Buka approval center 3. Confirm payment | Status payment: confirmed | | |

## Collaboration Request

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-COL-001 | Collaboration | Brand kirim collab ke komunitas | 1. Login brand_owner 2. Buka /brand/collaborations/create 3. Pilih komunitas, isi proposal 4. Submit | Collaboration request dibuat, status: pending | | |
| TC-COL-002 | Collaboration | Community accept collab | 1. Login community_owner 2. Buka /community-own/collaborations 3. Klik Accept | Status: accepted | | |
| TC-COL-003 | Collaboration | Community reject collab | 1. Login community_owner 2. Lihat collab request 3. Klik Reject | Status: rejected | | |
| TC-COL-004 | Collaboration | Cancel collab request | 1. Login brand_owner 2. Buka collab request 3. Klik Cancel | Status: cancelled | | |
| TC-COL-005 | Collaboration | Lihat daftar collab | 1. Login brand_owner 2. Buka /brand/collaborations | Menampilkan daftar collaboration requests | | |

## Donation

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-DON-001 | Donation | Donasi ke komunitas | 1. Login member 2. Buka komunitas 3. Klik donasi 4. Isi jumlah & pesan 5. Submit | Donasi dibuat, status: pending | | |
| TC-DON-002 | Donation | Donasi ke event | 1. Login member 2. Buka event 3. Klik donasi 4. Isi jumlah & pesan 5. Submit | Donasi dibuat, status: pending | | |
| TC-DON-003 | Donation | Community confirm donasi | 1. Login community_owner 2. Buka /community-own/donations 3. Klik Confirm | Status: confirmed | | |
| TC-DON-004 | Donation | Community reject donasi | 1. Login community_owner 2. Lihat donasi 3. Klik Reject | Status: rejected | | |
| TC-DON-005 | Donation | Lihat daftar donasi | 1. Login member 2. Buka /member/donations | Menampilkan riwayat donasi | | |

## Dashboard

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-DB-001 | Dashboard | Superadmin dashboard | 1. Login superadmin 2. Buka /superadmin/dashboard | Menampilkan statistik platform, jumlah user, komunitas, brand | | |
| TC-DB-002 | Dashboard | Member dashboard | 1. Login member 2. Buka /member/dashboard | Menampilkan komunitas diikuti, event, wallet balance | | |
| TC-DB-003 | Dashboard | Community owner dashboard | 1. Login community_owner 2. Buka /community-own/dashboard | Menampilkan komunitas dimiliki, anggota, event, wallet | | |
| TC-DB-004 | Dashboard | Brand owner dashboard | 1. Login brand_owner 2. Buka /brand/dashboard | Menampilkan brand, campaign, collab requests | | |
| TC-DB-005 | Dashboard | Cek akses cross-role | 1. Login member 2. Akses /superadmin/dashboard | Ditolak, redirect atau error 403 | | |
| TC-DB-006 | Dashboard | Cek wallet | 1. Login member 2. Buka /member/wallet | Menampilkan saldo dan riwayat transaksi | | |
| TC-DB-007 | Dashboard | Cek approval center | 1. Login superadmin 2. Buka /superadmin/approval-center | Menampilkan daftar pending approval | | |
| TC-DB-008 | Dashboard | Cek audit logs | 1. Login superadmin 2. Buka /superadmin/audit-logs | Menampilkan log aktivitas | | |

## Route & Error Checking

| ID | Module | Scenario | Steps | Expected Result | Actual Result | Status |
|----|--------|----------|-------|-----------------|---------------|--------|
| TC-RT-001 | Route | Cek semua route utama | 1. Jalankan `php artisan route:list` | Semua route terdaftar tanpa error | | |
| TC-RT-002 | Route | Akses halaman public | 1. Buka http://localhost/komunaid/public/ | Homepage tampil tanpa error | | |
| TC-RT-003 | Route | Akses komunitas directory | 1. Buka /komunitas | Menampilkan daftar komunitas | | |
| TC-RT-004 | Blade | Cek error blade view | 1. Login semua role 2. Buka semua halaman | Tidak ada blade compilation error | | |
| TC-RT-005 | Empty State | Cek halaman kosong | 1. Login member baru (tanpa data) 2. Buka semua halaman | Empty state tampil dengan benar | | |
| TC-RT-006 | Route | Cek redirect未login | 1. Buka /member/dashboard tanpa login | Redirect ke /login | | |
