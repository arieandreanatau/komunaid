# Feature Requirements — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Module: Public Website

| Code    | Feature             | Description                                          | Role  | Priority | Scope | Acceptance Criteria                                                                                           |
| ------- | ------------------- | ---------------------------------------------------- | ----- | -------- | ----- | ------------------------------------------------------------------------------------------------------------- |
| FR-PW01 | Landing page        | Hero, search, kategori, komunitas/event populer, CTA | Guest | High     | MVP   | GIVEN guest buka `/` WHEN halaman load THEN hero, search, kategori, populer sections terlihat dalam < 3 detik |
| FR-PW02 | Community directory | List/grid, filter, sort, search                      | Guest | High     | MVP   | GIVEN guest di `/komunitas` WHEN filter/sort/search THEN hasil sesuai dalam < 500ms                           |
| FR-PW03 | Community detail    | Profil, member, event, join button                   | Guest | High     | MVP   | GIVEN guest klik komunitas WHEN halaman load THEN profil lengkap, join button terlihat                        |
| FR-PW04 | Event directory     | List, filter, sort, search                           | Guest | High     | MVP   | GIVEN guest di `/events` WHEN filter/sort/search THEN hasil sesuai                                            |
| FR-PW05 | Event detail        | Info, poster, tanggal, lokasi, daftar button         | Guest | High     | MVP   | GIVEN guest klik event WHEN halaman load THEN info lengkap, register button terlihat                          |
| FR-PW06 | About page          | Cerita, misi, visi KomunaID                          | Guest | Medium   | MVP   | GIVEN guest buka About WHEN halaman load THEN cerita, misi, visi terlihat                                     |
| FR-PW07 | FAQ page            | Pertanyaan umum                                      | Guest | Medium   | MVP   | GIVEN guest buka FAQ WHEN halaman load THEN daftar pertanyaan terlihat                                        |
| FR-PW08 | Contact page        | Form kontak, email, social media                     | Guest | Medium   | MVP   | GIVEN guest buka Contact WHEN submit form THEN pesan tersimpan                                                |
| FR-PW09 | Terms page          | Syarat & ketentuan                                   | Guest | Medium   | MVP   | GIVEN guest buka Terms WHEN halaman load THEN konten terlihat                                                 |
| FR-PW10 | Privacy policy      | Kebijakan privasi                                    | Guest | Medium   | MVP   | GIVEN guest buka Privacy WHEN halaman load THEN konten terlihat                                               |
| FR-PW11 | Community guideline | Panduan komunitas                                    | Guest | Low      | MVP   | GIVEN guest buka Guidelines WHEN halaman load THEN panduan terlihat                                           |
| FR-PW12 | Event guideline     | Panduan event                                        | Guest | Low      | MVP   | GIVEN guest buka Guidelines WHEN halaman load THEN panduan terlihat                                           |

---

## 2. Module: Authentication

| Code    | Feature            | Description                              | Role   | Priority | Scope | Acceptance Criteria                                                                                         |
| ------- | ------------------ | ---------------------------------------- | ------ | -------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| FR-AU01 | Register           | Nama, username, password, email opsional | Guest  | High     | MVP   | GIVEN guest di `/register` WHEN isi form valid THEN akun dibuat, user login otomatis, redirect ke dashboard |
| FR-AU02 | Login              | Username/email + password                | Guest  | High     | MVP   | GIVEN user di `/login` WHEN credential valid THEN user login, redirect ke dashboard sesuai role             |
| FR-AU03 | Logout             | Server-side token invalidation           | Member | High     | MVP   | GIVEN user login WHEN klik logout THEN token invalid, user redirect ke home                                 |
| FR-AU04 | Forgot password    | Input email, kirim reset link            | Guest  | High     | MVP   | GIVEN user di `/forgot-password` WHEN email valid THEN email reset terkirim dalam 60 detik                  |
| FR-AU05 | Reset password     | Form password baru                       | Guest  | High     | MVP   | GIVEN user buka reset link WHEN isi password baru THEN password terupdate, bisa login                       |
| FR-AU06 | Email verification | Opsional, reminder only                  | Member | Low      | MVP   | GIVEN user register WHEN email diisi THEN bisa verify (tidak wajib)                                         |
| FR-AU07 | Admin login        | Route terpisah, tidak ada register       | Admin  | High     | MVP   | GIVEN admin buka `/admin/login` WHEN credential valid THEN admin masuk admin dashboard                      |
| FR-AU08 | JWT token          | Access + refresh token                   | System | High     | MVP   | GIVEN user login WHEN token diterima THEN access ≤ 7d, refresh ≤ 30d                                        |
| FR-AU09 | Rate limiting      | Login/register throttling                | System | High     | MVP   | GIVEN user login 5x gagal dalam 5 menit WHEN coba lagi THEN 429 Too Many Requests                           |

---

## 3. Module: Member Dashboard

| Code    | Feature          | Description                              | Role   | Priority | Scope | Acceptance Criteria                                                                                   |
| ------- | ---------------- | ---------------------------------------- | ------ | -------- | ----- | ----------------------------------------------------------------------------------------------------- |
| FR-MD01 | Overview         | Ringkasan profil, komunitas, event       | Member | High     | MVP   | GIVEN member buka dashboard WHEN halaman load THEN ringkasan profil, jumlah komunitas, event terlihat |
| FR-MD02 | Profile          | Edit nama, bio, lokasi, interest, avatar | Member | High     | MVP   | GIVEN member di profile WHEN edit & save THEN data terupdate, avatar terupload ≤ 2MB                  |
| FR-MD03 | My communities   | Daftar komunitas yang diikuti            | Member | High     | MVP   | GIVEN member di My Communities WHEN halaman load THEN daftar komunitas terlihat dengan pagination     |
| FR-MD04 | My events        | Daftar event yang diikuti                | Member | High     | MVP   | GIVEN member di My Events WHEN halaman load THEN daftar event terlihat                                |
| FR-MD05 | Bookmarks        | Daftar bookmark komunitas                | Member | Low      | MVP   | GIVEN member di Bookmarks WHEN halaman load THEN daftar bookmark terlihat                             |
| FR-MD06 | Notifications    | Daftar notifikasi                        | Member | High     | MVP   | GIVEN member di Notifications WHEN halaman load THEN notifikasi terlihat, unread count akurat         |
| FR-MD07 | Activity history | Riwayat aktivitas                        | Member | Low      | MVP   | GIVEN member di Activity WHEN halaman load THEN riwayat terlihat                                      |
| FR-MD08 | Role request     | Ajukan role tambahan                     | Member | Medium   | MVP   | GIVEN member submit role request WHEN success THEN request tersimpan, status SUBMITTED                |
| FR-MD09 | Settings         | Change password, privacy                 | Member | Medium   | MVP   | GIVEN member di Settings WHEN change password THEN password terupdate                                 |

---

## 4. Module: Community

| Code    | Feature             | Description               | Role            | Priority | Scope | Acceptance Criteria                                                                            |
| ------- | ------------------- | ------------------------- | --------------- | -------- | ----- | ---------------------------------------------------------------------------------------------- |
| FR-CM01 | Create community    | Submit komunitas baru     | Member          | High     | MVP   | GIVEN member submit komunitas WHEN validasi pass THEN komunitas tersimpan, status PENDING      |
| FR-CM02 | Community approval  | Admin approve/reject      | Platform Admin  | High     | MVP   | GIVEN admin approve komunitas WHEN approve THEN status APPROVED, owner dapat notifikasi        |
| FR-CM03 | Edit community      | Edit profil komunitas     | Community Owner | High     | MVP   | GIVEN owner edit komunitas WHEN save THEN data terupdate, slug otomatis                        |
| FR-CM04 | Membership type     | Open / Approval required  | Community Owner | Medium   | MVP   | GIVEN owner ubah membership type WHEN save THEN type berubah                                   |
| FR-CM05 | Join (open)         | Langsung aktif            | Member          | High     | MVP   | GIVEN member join komunitas open WHEN submit THEN status = ACTIVE langsung                     |
| FR-CM06 | Join (approval)     | Pending, admin approve    | Member          | High     | MVP   | GIVEN member join komunitas approval WHEN submit THEN status = PENDING, owner dapat notifikasi |
| FR-CM07 | Leave community     | Keluar dari komunitas     | Member          | Medium   | MVP   | GIVEN member leave WHEN confirm THEN status = LEFT                                             |
| FR-CM08 | Member management   | Approve/reject/ban member | Community Owner | High     | MVP   | GIVEN owner di member list WHEN approve/reject/ban THEN status berubah, audit log tercatat     |
| FR-CM09 | Admin assignment    | Assign admin komunitas    | Community Owner | Medium   | MVP   | GIVEN owner assign admin WHEN success THEN role admin tercatat di UserRoleAssignment           |
| FR-CM10 | Community posts     | Buat/edit/hapus post      | Community Owner | Medium   | MVP   | GIVEN owner buat/edit/hapus post WHEN save THEN perubahan tersimpan                            |
| FR-CM11 | Community gallery   | Upload galeri komunitas   | Community Owner | Low      | Later | —                                                                                              |
| FR-CM12 | Community analytics | Basic insight komunitas   | Community Owner | Medium   | MVP   | GIVEN owner di analytics WHEN halaman load THEN total member, growth, post count terlihat      |
| FR-CM13 | Sub community       | Buat sub komunitas        | Community Owner | Low      | Later | —                                                                                              |
| FR-CM14 | Regional community  | Buat regional komunitas   | Community Owner | Low      | Later | —                                                                                              |

---

## 5. Module: Organization

| Code    | Feature                | Description              | Role               | Priority | Scope | Acceptance Criteria                                                                         |
| ------- | ---------------------- | ------------------------ | ------------------ | -------- | ----- | ------------------------------------------------------------------------------------------- |
| FR-OR01 | Create organization    | Submit organisation baru | Member             | Medium   | MVP   | GIVEN member submit organisasi WHEN validasi pass THEN organisasi tersimpan, status PENDING |
| FR-OR02 | Organization approval  | Admin approve/reject     | Platform Admin     | High     | MVP   | GIVEN admin approve organisasi WHEN approve THEN status APPROVED, owner dapat notifikasi    |
| FR-OR03 | Edit organization      | Edit profil              | Organization Owner | High     | MVP   | GIVEN owner edit organisasi WHEN save THEN data terupdate                                   |
| FR-OR04 | Team management        | Invite & kelola team     | Organization Owner | Medium   | MVP   | GIVEN owner invite staff WHEN success THEN invitation terkirim                              |
| FR-OR05 | Role assignment        | Assign admin role        | Organization Owner | Medium   | MVP   | GIVEN owner assign role WHEN success THEN role tercatat                                     |
| FR-OR06 | Organization analytics | Basic insight            | Organization Owner | Low      | MVP   | GIVEN owner di analytics WHEN halaman load THEN metric dasar terlihat                       |

---

## 6. Module: Event

| Code    | Feature             | Description            | Role            | Priority | Scope | Acceptance Criteria                                                                         |
| ------- | ------------------- | ---------------------- | --------------- | -------- | ----- | ------------------------------------------------------------------------------------------- |
| FR-EV01 | Create event        | Buat event baru        | Community Owner | High     | MVP   | GIVEN owner buat event WHEN submit THEN event tersimpan, status DRAFT                       |
| FR-EV02 | Event draft/publish | Status draft → publish | Community Owner | High     | MVP   | GIVEN owner publish event WHEN submit THEN status berubah ke PENDING/APPROVED               |
| FR-EV03 | Event approval      | Admin approve event    | Platform Admin  | Medium   | MVP   | GIVEN admin approve event WHEN approve THEN status APPROVED                                 |
| FR-EV04 | Event registration  | Daftar event gratis    | Member          | High     | MVP   | GIVEN member daftar event WHEN submit THEN registrasi CONFIRMED, kapasitas berkurang        |
| FR-EV05 | Cancel registration | Batalkan daftar        | Member          | Medium   | MVP   | GIVEN member cancel WHEN confirm THEN registrasi = CANCELLED, kapasitas bertambah           |
| FR-EV06 | Attendee list       | Lihat daftar peserta   | Community Owner | Medium   | MVP   | GIVEN owner di attendees WHEN halaman load THEN daftar peserta terlihat                     |
| FR-EV07 | Check-in            | Attendance check-in    | Event Manager   | Medium   | MVP   | GIVEN EM check-in WHEN submit THEN checkedInAt tercatat                                     |
| FR-EV08 | Event report        | Laporan event          | Event Manager   | Low      | MVP   | GIVEN EM di report WHEN halaman load THEN laporan terlihat                                  |
| FR-EV09 | Event capacity      | Batas kuota peserta    | System          | High     | MVP   | GIVEN event punya capacity WHEN registrasi melebihi THEN ditolak dengan pesan "Kuota penuh" |
| FR-EV10 | Event payment       | Event berbayar         | Member          | Low      | Later | —                                                                                           |

---

## 7. Module: Post

| Code    | Feature         | Description            | Role             | Priority | Scope | Acceptance Criteria                                                            |
| ------- | --------------- | ---------------------- | ---------------- | -------- | ----- | ------------------------------------------------------------------------------ |
| FR-PO01 | Create post     | Buat post di komunitas | Community Member | Medium   | MVP   | GIVEN member buat post WHEN submit THEN post tersimpan, status DRAFT/PUBLISHED |
| FR-PO02 | Edit post       | Edit post sendiri      | Community Member | Medium   | MVP   | GIVEN author edit post WHEN save THEN data terupdate                           |
| FR-PO03 | Delete post     | Hapus post sendiri     | Community Member | Medium   | MVP   | GIVEN author hapus post WHEN confirm THEN deletedAt terisi                     |
| FR-PO04 | Post moderation | Moderasi post anggota  | Community Admin  | Medium   | MVP   | GIVEN admin moderate post WHEN action THEN status post berubah                 |

---

## 8. Module: Notification

| Code    | Feature             | Description               | Role            | Priority | Scope | Acceptance Criteria                                                                     |
| ------- | ------------------- | ------------------------- | --------------- | -------- | ----- | --------------------------------------------------------------------------------------- |
| FR-NF01 | In-app notification | Notifikasi di dashboard   | All             | High     | MVP   | GIVEN action terjadi WHEN notifikasi dikirim THEN notifikasi muncul di dashboard target |
| FR-NF02 | Approval status     | Notifikasi approve/reject | Member          | High     | MVP   | GIVEN admin approve/reject WHEN notifikasi dikirim THEN member menerima notifikasi      |
| FR-NF03 | Join request        | Notifikasi join request   | Community Owner | High     | MVP   | GIVEN member join approval WHEN notifikasi dikirim THEN owner menerima notifikasi       |
| FR-NF04 | Event registration  | Notifikasi daftar event   | Member          | High     | MVP   | GIVEN member daftar event WHEN notifikasi dikirim THEN member menerima konfirmasi       |
| FR-NF05 | Notification read   | Tandai sudah dibaca       | All             | Medium   | MVP   | GIVEN user klik notifikasi WHEN dibaca THEN isRead = true                               |

---

## 9. Module: Report

| Code    | Feature          | Description                   | Role           | Priority | Scope | Acceptance Criteria                                                                 |
| ------- | ---------------- | ----------------------------- | -------------- | -------- | ----- | ----------------------------------------------------------------------------------- |
| FR-RP01 | Report abuse     | Laporkan komunitas/event/user | Member         | Medium   | MVP   | GIVEN member submit report WHEN validasi pass THEN report tersimpan, status PENDING |
| FR-RP02 | Moderation queue | Daftar laporan                | Platform Admin | High     | MVP   | GIVEN admin buka moderation queue WHEN halaman load THEN daftar laporan terlihat    |
| FR-RP03 | Resolve report   | Tindak lanjut laporan         | Platform Admin | Medium   | MVP   | GIVEN admin resolve report WHEN action THEN status berubah, audit log tercatat      |

---

## 10. Module: Admin

| Code    | Feature               | Description               | Role           | Priority | Scope | Acceptance Criteria                                                                             |
| ------- | --------------------- | ------------------------- | -------------- | -------- | ----- | ----------------------------------------------------------------------------------------------- |
| FR-AD01 | Dashboard             | Overview platform         | Super Admin    | High     | MVP   | GIVEN super admin buka dashboard WHEN halaman load THEN stats (user, community, event) terlihat |
| FR-AD02 | User management       | Full user CRUD            | Super Admin    | High     | MVP   | GIVEN super admin di users WHEN CRUD THEN perubahan tersimpan, audit log tercatat               |
| FR-AD03 | Suspend user          | Suspend/activate user     | Platform Admin | High     | MVP   | GIVEN admin suspend user WHEN action THEN isSuspended berubah, user tidak bisa login            |
| FR-AD04 | Role assignment       | Assign/revoke role        | Super Admin    | High     | MVP   | GIVEN super admin assign role WHEN success THEN role tercatat, audit log tercatat               |
| FR-AD05 | Community approval    | Approve/reject komunitas  | Platform Admin | High     | MVP   | GIVEN admin approve/reject WHEN action THEN status berubah, owner dapat notifikasi              |
| FR-AD06 | Organization approval | Approve/reject organisasi | Platform Admin | High     | MVP   | GIVEN admin approve/reject WHEN action THEN status berubah, owner dapat notifikasi              |
| FR-AD07 | Category management   | CRUD kategori             | Super Admin    | Medium   | MVP   | GIVEN super admin CRUD category WHEN save THEN perubahan tersimpan                              |
| FR-AD08 | Audit log             | Lihat semua audit log     | Super Admin    | High     | MVP   | GIVEN super admin buka audit log WHEN filter THEN log terlihat dengan filter user/action/date   |
| FR-AD09 | Platform settings     | Pengaturan platform       | Super Admin    | Medium   | MVP   | GIVEN super admin edit settings WHEN save THEN settings terupdate                               |
| FR-AD10 | Basic analytics       | Statistics dasar          | Super Admin    | Medium   | MVP   | GIVEN super admin di analytics WHEN halaman load THEN metric terlihat                           |

---

## 11. Module: Contact

| Code    | Feature          | Description         | Role        | Priority | Scope | Acceptance Criteria                                                               |
| ------- | ---------------- | ------------------- | ----------- | -------- | ----- | --------------------------------------------------------------------------------- |
| FR-CT01 | Contact form     | Submit pesan kontak | Guest       | Medium   | MVP   | GIVEN guest submit contact WHEN validasi pass THEN pesan tersimpan, status UNREAD |
| FR-CT02 | Contact messages | Lihat pesan masuk   | Super Admin | Low      | MVP   | GIVEN super admin buka messages WHEN halaman load THEN daftar pesan terlihat      |

---

## 12. Later Scope Features

| Code    | Feature                 | Description                  | Reason                    |
| ------- | ----------------------- | ---------------------------- | ------------------------- |
| FR-LS01 | Payment gateway         | Integrasi payment provider   | Butuh integrasi eksternal |
| FR-LS02 | Internal chat           | Real-time messaging          | Kompleksitas real-time    |
| FR-LS03 | Wallet                  | Top-up, withdraw, settlement | Butuh payment gateway     |
| FR-LS04 | Marketplace penuh       | Produk, cart, checkout       | Fitur kompleks            |
| FR-LS05 | Sponsorship marketplace | Pipeline sponsorship         | Butuh brand management    |
| FR-LS06 | Venue booking           | Booking venue real-time      | Butuh integrasi venue     |
| FR-LS07 | Native mobile app       | iOS & Android native         | Web responsive dulu       |
| FR-LS08 | Advanced analytics      | Komuna Insight lanjutan      | Butuh data cukup          |
| FR-LS09 | Recommendation engine   | Rekomendasi komunitas        | Butuh data cukup          |
| FR-LS10 | Gamification            | Points, badges, leaderboard  | Later scope               |
| FR-LS11 | Public API              | API untuk developer          | Butuh validasi keamanan   |
| FR-LS12 | Multi-language          | Bahasa Indonesia & English   | Prioritas rendah          |
| FR-LS13 | Sub community           | Sub komunitas                | Kompleksitas struktur     |
| FR-LS14 | Regional community      | Cabang regional              | Kompleksitas struktur     |
| FR-LS15 | Volunteer management    | Volunteer & tugas            | Kompleksitas operasional  |
| FR-LS16 | CMS / Blog              | Content management           | Prioritas rendah          |
| FR-LS17 | Collaboration module    | Proposal kerja sama          | Butuh brand management    |
