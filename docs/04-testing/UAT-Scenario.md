# KomunaID - User Acceptance Testing (UAT) Scenario

## 1. Member Role

### Login & Profil
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| M-01 | Login sebagai member | Login dengan member@komuna.id / password | Berhasil login, redirect ke /member/dashboard |
| M-02 | Lihat dashboard | Buka /member/dashboard | Menampilkan ringkasan: komunitas diikuti, event terdaftar, wallet balance |
| M-03 | Edit profil | Buka /member/profile, ubah bio & kota | Profil berhasil diupdate |
| M-04 | Lihat profil | Lihat profil sendiri | Data profil lengkap terlihat |

### Community
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| M-05 | Browse komunitas | Buka /komunitas | Menampilkan daftar komunitas approved |
| M-06 | Lihat detail komunitas | Klik salah satu komunitas | Detail komunitas lengkap: deskripsi, anggota, event |
| M-07 | Join komunitas | Klik "Join" pada komunitas | Berhasil join, menjadi anggota |
| M-08 | Cek komunitas diikuti | Lihat dashboard | Komunitas yang diikuti tampil di dashboard |
| M-09 | Leave komunitas | Klik "Leave" pada komunitas | Berhasil keluar dari komunitas |

### Event
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| M-10 | Lihat daftar event | Buka /events | Menampilkan event yang tersedia |
| M-11 | Daftar event gratis | Klik event gratis, klik Register | Registration berhasil |
| M-12 | Daftar event berbayar | Klik event berbayar, klik Register | Registration berhasil, perlu upload bukti bayar |
| M-13 | Upload bukti bayar | Pilih event, upload bukti bayar, isi data rekening | Payment confirmation dibuat, status: pending |
| M-14 | Cek my registrations | Buka /member/my-registrations | Daftar event yang didaftarkan tampil |
| M-15 | Cancel registrasi | Buka my registrations, klik Cancel | Status berubah menjadi cancelled |

### Wallet & Donasi
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| M-16 | Cek wallet | Buka /member/wallet | Saldo dan riwayat transaksi tampil |
| M-17 | Donasi ke komunitas | Buka komunitas, klik donasi, isi jumlah & pesan | Donasi dibuat, status: pending |
| M-18 | Donasi ke event | Buka event, klik donasi | Donasi dibuat |
| M-19 | Lihat riwayat donasi | Buka /member/donations | Daftar donasi tampil |

### Role Request
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| M-20 | Request jadi community_owner | Buka /member/role-request, pilih community_owner | Request dibuat, status: pending |
| M-21 | Request jadi brand_owner | Buka /member/role-request, pilih brand_owner | Request dibuat |

---

## 2. Community Owner Role

### Login & Dashboard
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CO-01 | Login sebagai community_owner | Login dengan community@komuna.id / password | Berhasil login, redirect ke /community-own/dashboard |
| CO-02 | Lihat dashboard | Buka /community-own/dashboard | Statistik: jumlah komunitas, anggota, event, donasi, wallet |

### Community Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CO-03 | Lihat daftar komunitas | Buka /community-own/communities | Daftar komunitas yang dimilikinya tampil |
| CO-04 | Buat komunitas baru | Klik create, isi semua field, submit | Komunitas dibuat dengan status pending |
| CO-05 | Edit komunitas | Pilih komunitas, klik edit, ubah deskripsi | Komunitas berhasil diupdate |
| CO-06 | Lihat detail komunitas | Klik komunitas | Detail lengkap: anggota, event, regions, subgroups |

### Member Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CO-07 | Lihat daftar anggota | Buka /community-own/communities/{id}/members | Daftar anggota tampil |
| CO-08 | Approve anggota | Klik Approve pada anggota pending | Anggota menjadi active |
| CO-09 | Ubah role anggota | Pilih anggota, ubah role ke moderator/volunteer | Role berhasil diupdate |
| CO-10 | Ban anggota | Klik Ban, isi alasan | Anggota dibanned, status: banned |
| CO-11 | Unban anggota | Klik Unban | Anggota di-unban |

### Region & Subgroup
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CO-12 | Lihat regions | Buka regions page | Daftar region tampil |
| CO-13 | Buat region baru | Klik create, isi field, submit | Region berhasil dibuat |
| CO-14 | Lihat subgroups | Buka subgroups page | Daftar subgroup tampil |
| CO-15 | Buat subgroup baru | Klik create, isi field, submit | Subgroup berhasil dibuat |

### Event Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CO-16 | Lihat daftar event | Buka /community-own/events | Daftar event komunitas tampil |
| CO-17 | Buat event gratis | Klik create, isi field, event_type: free | Event dibuat |
| CO-18 | Buat event berbayar | Klik create, isi field, event_type: paid, price | Event dibuat dengan harga |
| CO-19 | Lihat registrasi event | Buka event, klik registrations | Daftar peserta tampil |
| CO-20 | Confirm payment | Klik Confirm pada payment pending | Status: confirmed |
| CO-21 | Reject payment | Klik Reject pada payment pending | Status: rejected |

### Collaboration & Wallet
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CO-22 | Lihat collab requests | Buka /community-own/collaborations | Daftar collab masuk tampil |
| CO-23 | Accept collab | Klik Accept | Status: accepted |
| CO-24 | Reject collab | Klik Reject | Status: rejected |
| CO-25 | Lihat wallet | Buka /community-own/wallet | Saldo komunitas tampil |
| CO-26 | Lihat donasi | Buka /community-own/donations | Daftar donasi masuk tampil |

---

## 3. Brand Owner Role

### Login & Dashboard
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| BO-01 | Login sebagai brand_owner | Login dengan brand@komuna.id / password | Berhasil login, redirect ke /brand/dashboard |
| BO-02 | Lihat dashboard | Buka /brand/dashboard | Statistik: brand, campaign, collab requests |

### Brand Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| BO-03 | Lihat daftar brand | Buka /brand/brands | Daftar brand tampil |
| BO-04 | Buat brand baru | Klik create, isi field, submit | Brand dibuat, status: pending |
| BO-05 | Edit brand | Pilih brand, klik edit, ubah data | Brand diupdate |
| BO-06 | Lihat detail brand | Klik brand | Detail brand lengkap |

### Campaign Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| BO-07 | Lihat daftar campaign | Buka /brand/campaigns | Daftar campaign tampil |
| BO-08 | Buat campaign baru | Klik create, isi field, submit | Campaign dibuat |
| BO-09 | Edit campaign | Pilih campaign, edit, update | Campaign diupdate |

### Collaboration
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| BO-10 | Lihat daftar collab | Buka /brand/collaborations | Daftar collab tampil |
| BO-11 | Buat collab request | Klik create, pilih komunitas, isi proposal | Collab request dibuat |
| BO-12 | Cancel collab | Buka collab, klik Cancel | Status: cancelled |

### Staff & Directory
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| BO-13 | Lihat staff | Buka /brand/brands/{id}/staff | Daftar staff tampil |
| BO-14 | Tambah staff | Search user, klik tambah | Staff berhasil ditambah |
| BO-15 | Browse komunitas | Buka /brand/communities | Menampilkan komunitas approved |

---

## 4. Superadmin Role

### Login & Dashboard
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SA-01 | Login sebagai superadmin | Login dengan superadmin@komuna.id / password | Berhasil login, redirect ke /superadmin/dashboard |
| SA-02 | Lihat dashboard | Buka /superadmin/dashboard | Statistik platform: users, communities, brands, events, revenue |

### Approval Center
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SA-03 | Lihat approval center | Buka /superadmin/approval-center | Semua pending approval tampil |
| SA-04 | Approve role request | Klik Approve pada role request | Status: approved, role ditambahkan |
| SA-05 | Reject role request | Klik Reject | Status: rejected |
| SA-06 | Approve komunitas | Klik Approve pada komunitas pending | Status: approved |
| SA-07 | Reject komunitas | Klik Reject | Status: rejected |
| SA-08 | Approve brand | Klik Approve pada brand pending | Status: approved |
| SA-09 | Reject brand | Klik Reject | Status: rejected |
| SA-10 | Confirm payment | Klik Confirm pada payment pending | Status: confirmed |
| SA-11 | Reject payment | Klik Reject | Status: rejected |

### User Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SA-12 | Lihat daftar user | Buka /superadmin/users | Daftar user tampil |
| SA-13 | Lihat detail user | Klik user | Detail user lengkap |
| SA-14 | Suspend user | Klik Suspend | User disuspend |
| SA-15 | Ban user | Klik Ban | User dibanned |
| SA-16 | Activate user | Klik Activate | User diaktifkan |

### Community & Brand Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SA-17 | Lihat daftar komunitas | Buka /superadmin/communities | Semua komunitas tampil |
| SA-18 | Approve/Reject komunitas | Klik approve/reject | Status berubah |
| SA-19 | Lihat daftar brand | Buka /superadmin/brands | Semua brand tampil |
| SA-20 | Approve/Reject brand | Klik approve/reject | Status berubah |

### Financial & Audit
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SA-21 | Lihat wallet users | Buka /superadmin/wallets | Daftar wallet tampil |
| SA-22 | Adjust wallet | Pilih user, masukkan jumlah, submit | Saldo ter调整 |
| SA-23 | Lihat donasi | Buka /superadmin/donations | Daftar donasi tampil |
| SA-24 | Lihat platform fees | Buka /superadmin/platform-fees | Laporan fee tampil |
| SA-25 | Lihat audit logs | Buka /superadmin/audit-logs | Log aktivitas tampil |

### Category & Region Management
| No | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| SA-26 | CRUD category | Buka /superadmin/categories | Create, edit, delete category |
| SA-27 | CRUD master region | Buka /superadmin/regions | Create, edit, delete region |

---

## UAT Sign-Off

| Role | Tester | Date | Signature |
|------|--------|------|-----------|
| Member | | | |
| Community Owner | | | |
| Brand Owner | | | |
| Superadmin | | | |
