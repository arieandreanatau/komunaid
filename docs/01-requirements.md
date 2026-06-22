# KomunaID - Requirements Specification

## 1. Functional Requirements

### 1.1 Public Visitor (Tanpa Login)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PUB-01 | Melihat landing page | Must Have |
| FR-PUB-02 | Melihat daftar komunitas | Must Have |
| FR-PUB-03 | Mencari komunitas berdasarkan nama/kategori | Must Have |
| FR-PUB-04 | Melihat detail komunitas | Must Have |
| FR-PUB-05 | Melihat daftar event publik | Should Have |
| FR-PUB-06 | Melihat daftar brand | Should Have |

### 1.2 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Register dengan email dan password | Must Have |
| FR-AUTH-02 | Login dengan email dan password | Must Have |
| FR-AUTH-03 | Logout | Must Have |
| FR-AUTH-04 | Reset password via email | Should Have |
| FR-AUTH-05 | Default role setelah register adalah "member" | Must Have |

### 1.3 Member

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MEM-01 | Mengelola profil (nama, foto, bio, telepon) | Must Have |
| FR-MEM-02 | Join komunitas | Must Have |
| FR-MEM-03 | Leave komunitas | Must Have |
| FR-MEM-04 | Melihat komunitas yang diikuti | Must Have |
| FR-MEM-05 | Daftar event | Must Have |
| FR-MEM-06 | Melihat histori event | Must Have |
| FR-MEM-07 | Donasi opsional ke komunitas (simulasi) | Should Have |
| FR-MEM-08 | Mengajukan role sebagai Community Owner | Must Have |
| FR-MEM-09 | Mengajukan role sebagai Brand Owner | Must Have |
| FR-MEM-10 | Melihat status pengajuan role | Must Have |

### 1.4 Community Owner

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CO-01 | Membuat komunitas (menunggu approval superadmin) | Must Have |
| FR-CO-02 | Mengelola komunitas (edit info, logo, banner) | Must Have |
| FR-CO-03 | Membuat sub komunitas | Must Have |
| FR-CO-04 | Membuat regional/Chapter | Should Have |
| FR-CO-05 | Mengelola anggota komunitas | Must Have |
| FR-CO-06 | Mengelola role anggota | Must Have |
| FR-CO-07 | Membuat dan mengelola event | Must Have |
| FR-CO-08 | Mengelola galeri (foto/video) | Should Have |
| FR-CO-09 | Chat sederhana antar anggota | Should Have |
| FR-CO-10 | Mengelola kolaborasi dengan brand | Must Have |
| FR-CO-11 | Dashboard komunitas (statistik anggota, event, dll) | Must Have |
| FR-CO-12 | Melihat dan approve/menolak permintaan join | Must Have |
| FR-CO-13 | Membuat post/announcement | Should Have |

### 1.5 Brand Owner

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BO-01 | Membuat profil brand (menunggu approval) | Must Have |
| FR-BO-02 | Mengelola profil brand | Must Have |
| FR-BO-03 | Melihat daftar komunitas | Must Have |
| FR-BO-04 | Membuat campaign | Must Have |
| FR-BO-05 | Mengajukan kolaborasi ke komunitas | Must Have |
| FR-BO-06 | Melihat dashboard brand | Must Have |
| FR-BO-07 | Melihat statistik campaign | Should Have |

### 1.6 Superadmin

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SA-01 | Dashboard dengan revenue overview | Must Have |
| FR-SA-02 | Approval center (role, komunitas, brand, event) | Must Have |
| FR-SA-03 | Mengelola data member | Must Have |
| FR-SA-04 | Mengelola data komunitas | Must Have |
| FR-SA-05 | Mengelola data brand | Must Have |
| FR-SA-06 | Mengelola data event | Must Have |
| FR-SA-07 | Melihat laporan/reports | Should Have |
| FR-SA-08 | Approve/Reject pengajuan role | Must Have |
| FR-SA-09 | Approve/Reject komunitas baru | Must Have |
| FR-SA-10 | Approve/Reject brand baru | Must Have |
| FR-SA-11 | Approve/Reject event | Must Have |

### 1.7 Wallet & Payment (Simulasi)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-WAL-01 | Wallet ledger internal (bukan real money) | Must Have |
| FR-WAL-02 | Top up simulasi | Must Have |
| FR-WAL-03 | Donasi ke komunitas via wallet | Should Have |
| FR-WAL-04 | Riwayat transaksi | Must Have |
| FR-WAL-05 | Tidak ada withdrawal real money | Must Have |

## 2. Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | Responsive design (mobile-first) | Must Have |
| NFR-02 | Load time < 3 detik | Should Have |
| NFR-03 | Role-based access control | Must Have |
| NFR-04 | Input validation di semua form | Must Have |
| NFR-05 | CSRF protection | Must Have |
| NFR-06 | XSS protection | Must Have |
| NFR-07 | SQL injection prevention (via Eloquent) | Must Have |
| NFR-08 | File upload validation (size, type) | Must Have |
| NFR-09 | Audit log untuk aksi penting | Should Have |

## 3. User Stories

### Member
- Sebagai member, saya ingin bisa mencari dan join komunitas sehingga saya bisa terhubung dengan orang yang memiliki minat sama.
- Sebagai member, saya ingin bisa mendaftar event sehingga saya bisa menghadiri acara komunitas.
- Sebagai member, saya ingin bisa mengajukan role sebagai community/brand owner sehingga saya bisa mengelola komunitas atau brand saya sendiri.

### Community Owner
- Sebagai community owner, saya ingin bisa membuat dan mengelola komunitas sehingga saya bisa membangun komunitas saya sendiri.
- Sebagai community owner, saya ingin bisa membuat event sehingga anggota komunitas bisa berpartisipasi.
- Sebagai community owner, saya ingin bisa mengelola anggota sehingga saya bisa menjaga kualitas komunitas.

### Brand Owner
- Sebagai brand owner, saya ingin bisa membuat profil brand sehingga brand saya dikenal di platform.
- Sebagai brand owner, saya ingin bisa membuat campaign sehingga saya bisa mempromosikan produk/brand saya.
- Sebagai brand owner, saya ingin bisa mengajukan kolaborasi ke komunitas sehingga saya bisa bekerja sama dengan komunitas yang relevan.

### Superadmin
- Sebagai superadmin, saya ingin bisa approve/reject pengajuan sehingga platform tetap terjaga kualitasnya.
- Sebagai superadmin, saya ingin bisa melihat dashboard revenue sehingga saya bisa memantau performa platform.
