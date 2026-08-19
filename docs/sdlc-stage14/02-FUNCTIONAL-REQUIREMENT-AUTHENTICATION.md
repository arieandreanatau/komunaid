# KomunaID - Functional Requirement Authentication Module

**Status:** Draft for approval  
**Owner:** Product Owner, Business Analyst, Engineering, QA, Security  
**Scope:** Member login, forgot/reset password, logout.  
**Out of scope:** Registration, MFA, social login, admin login, role authorization, change-password, session management UI.

## Requirement Analysis

Dokumen ini adalah single source of truth requirement target. Implementasi saat ini hanya baseline, bukan pengganti requirement ini.

| ID | Finding | Disposition |
| --- | --- | --- |
| RA-AUTH-001 | Istilah `Disabled/Inactive` ambigu. Model data saat ini memiliki `SUSPENDED`, `DEACTIVATED`, dan soft-deleted. | Gunakan istilah normatif **akun tidak aktif**; mapping status perlu konfirmasi. |
| RA-AUTH-002 | Prompt meminta forgot password dengan email atau username. UI/API baseline hanya menerima email. | FR-AUTH-002 mendukung identifier email atau username. Kontrak API/UI perlu diselaraskan. |
| RA-AUTH-003 | "Token harus dapat diinvalidasi" tidak menentukan token scope dan event invalidasi. | Dipisahkan ke NFR-SEC-AUTH-003 dan NFR-SEC-AUTH-008. |
| RA-AUTH-004 | "Proteksi login berulang" belum punya batas, key, respons, atau pencegahan account-denial attack. | Dipisahkan ke NFR-SEC-AUTH-004. Nilai operasional menjadi open question. |
| RA-AUTH-005 | Respons berbeda untuk akun tidak ditemukan, soft-deleted, suspended, dan deactivated memungkinkan account enumeration. | NFR-SEC-AUTH-005 mewajibkan respons eksternal login konsisten. |
| RA-AUTH-006 | Browser back dapat menampilkan browser cache walau sesi telah selesai. | FR-AUTH-003 melarang akses data/API baru. Policy cache ada di NFR-SEC-AUTH-003. |
| RA-AUTH-007 | Hashing, password policy, JWT, cookie, CSRF, dan logging adalah security/non-functional concern. | Dipisahkan dari FR ke NFR-SEC-AUTH-001 s.d. NFR-SEC-AUTH-012. |
| RA-AUTH-008 | Reset tanpa confirmation atau atomic single-use check rawan kesalahan dan race condition. | FR-AUTH-002 dan NFR-SEC-AUTH-007 mewajibkan keduanya. |
| RA-AUTH-009 | Password reuse policy, normalisasi identifier, email verification, retensi log, dan detail arsitektur token belum diputuskan. | Dicatat sebagai Open Questions. |
| RA-AUTH-010 | Baseline logout hanya revoke refresh token. Access JWT lama bisa valid sampai expiry. | Gap terhadap FR-AUTH-003/AC-AUTH-003-03. Harus diperbaiki sebelum sign-off. |

## 1. Functional Requirement

### FR-AUTH-001 - Member Login

| Field | Requirement |
| --- | --- |
| Actor | Member terdaftar. |
| Trigger | Member mengirim form login. |
| Preconditions | Akun ada, tidak soft-deleted, dan berstatus aktif sesuai OQ-AUTH-001. |
| Input | `identifier` berisi username atau email; `password`. Kedua field wajib. |
| Main process | 1. Validasi field wajib dan format identifier. 2. Cari akun menurut tipe identifier. 3. Verifikasi password. 4. Validasi status akun. 5. Jika lulus, buat sesi autentikasi. 6. Catat event sukses tanpa credential. 7. Arahkan client ke dashboard atau URL redirect internal tervalidasi. |
| Success output | Sesi/token aktif; Member dapat mengakses resource terautentikasi; dashboard tampil. |
| Failed output | Tidak ada sesi/token baru. Error aman sesuai NFR-SEC-AUTH-005 dan NFR-SEC-AUTH-006. |
| Postconditions | Login sukses/gagal tercatat sesuai NFR-SEC-AUTH-009 tanpa credential. |

### FR-AUTH-002 - Forgot and Reset Password

| Field | Requirement |
| --- | --- |
| Actor | Member tidak terautentikasi. |
| Trigger | Member meminta reset password atau mengirim password baru dari reset link. |
| Preconditions request | Tidak ada. Identifier boleh tidak terdaftar; respons eksternal tetap generik. |
| Preconditions reset | Reset token valid, belum expired, belum digunakan, dan akun memenuhi policy status. |
| Input request | `identifier` berisi email atau username. |
| Input reset | `token`, `password`, `confirmPassword`. |
| Request process | 1. Member memilih Forgot Password. 2. Sistem validasi identifier. 3. Sistem menjalankan proteksi request berulang. 4. Jika akun eligible ditemukan, sistem membuat reset token aman dan mengirim instruksi ke email terdaftar. 5. Sistem selalu memberi respons generik untuk identifier valid. |
| Reset process | 1. Member membuka reset link. 2. Validasi token dan password baru. 3. Pastikan password dan confirmation sama. 4. Perbarui password dengan aman. 5. Konsumsi token secara atomik agar hanya sukses sekali. 6. Invalidasi sesi/token relevan. 7. Catat event tanpa password/token. |
| Success output | Password baru tersimpan; token tidak dapat dipakai ulang; sesi/token lama terinvalidasi; Member dapat login memakai password baru. |
| Failed output | Password tidak berubah. Token invalid, expired, atau used ditolak dengan pesan aman. |

### FR-AUTH-003 - Member Logout

| Field | Requirement |
| --- | --- |
| Actor | Member terautentikasi. |
| Trigger | Member memilih Logout. |
| Preconditions | Sesi autentikasi valid. |
| Process | 1. Member mengirim logout. 2. Sistem menginvalidasi sesi/token saat ini pada server. 3. Sistem menghapus credential client. 4. Sistem mencatat logout tanpa token. 5. Client diarahkan ke login atau halaman publik. |
| Success output | Logout berhasil; credential client dihapus; sesi/token sebelumnya tidak dapat mengakses API atau halaman terautentikasi; halaman tujuan tampil. |
| Failed output | Bila sesi telah invalid/expired, client tetap menghapus credential lokal dan diarahkan ke login/public. Respons tidak boleh memulihkan akses. |
| Postconditions | Request berikutnya memakai sesi/token yang dilogout ditolak. Browser back boleh menampilkan shell/cache, tetapi tidak boleh memuat atau memperlihatkan data terautentikasi dari request baru tanpa sesi valid. |

## 2. Business Rules

| ID | Rule | Applies to |
| --- | --- | --- |
| BR-AUTH-001 | Identifier login adalah tepat satu username atau email. Identifier kosong tidak boleh diautentikasi. | FR-AUTH-001 |
| BR-AUTH-002 | Hanya akun aktif dapat memperoleh sesi baru. | FR-AUTH-001, FR-AUTH-002 |
| BR-AUTH-003 | Sesi/token hanya dibuat setelah identifier, password, dan status akun tervalidasi. | FR-AUTH-001 |
| BR-AUTH-004 | Kegagalan login karena akun tidak ada, password salah, akun tidak aktif, atau akun terhapus memakai respons eksternal yang tidak membedakan keberadaan akun. | FR-AUTH-001 |
| BR-AUTH-005 | Request reset untuk identifier berformat valid memakai respons eksternal sama, terlepas dari akun ada, eligible, atau email delivery gagal. | FR-AUTH-002 |
| BR-AUTH-006 | Reset hanya mengubah password bila token valid, belum expired, belum digunakan, password policy lulus, dan confirmation cocok. | FR-AUTH-002 |
| BR-AUTH-007 | Satu reset token hanya boleh menghasilkan satu perubahan password, termasuk saat request paralel. | FR-AUTH-002 |
| BR-AUTH-008 | Logout mengakhiri sesi/token saat ini. Sesi/token sama tidak boleh dipakai ulang. | FR-AUTH-003 |
| BR-AUTH-009 | Redirect setelah login hanya boleh ke dashboard atau path internal tervalidasi. URL eksternal ditolak. | FR-AUTH-001 |
| BR-AUTH-010 | Pesan validasi field dapat spesifik; pesan autentikasi dan reset token tidak boleh membocorkan state akun atau detail internal. | FR-AUTH-001, FR-AUTH-002 |

## 3. Acceptance Criteria

### FR-AUTH-001

| ID | Given / When / Then |
| --- | --- |
| AC-AUTH-001-01 | Given akun aktif dan username valid, when password benar dikirim, then sistem menerima login dan membuat sesi/token. |
| AC-AUTH-001-02 | Given akun aktif dan email valid, when password benar dikirim, then sistem menerima login dan membuat sesi/token. |
| AC-AUTH-001-03 | Given identifier valid, when password salah dikirim, then sistem menolak login, tidak membuat sesi/token, dan memberi generic authentication error. |
| AC-AUTH-001-04 | Given username/email tidak terdaftar, when kredensial dikirim, then sistem menolak login, tidak membuat sesi/token, dan memberi generic authentication error yang sama seperti AC-AUTH-001-03. |
| AC-AUTH-001-05 | Given akun tidak aktif, when kredensial benar dikirim, then sistem menolak login, tidak membuat sesi/token, dan memberi generic authentication error yang sama seperti AC-AUTH-001-03. |
| AC-AUTH-001-06 | Given percobaan identifier terdaftar dan tidak terdaftar, when respons dibandingkan, then pesan, status HTTP, struktur body, dan tidak adanya cookie autentikasi setara kecuali metadata rate-limit. |
| AC-AUTH-001-07 | Given login valid, when respons diterima, then sesi/token memiliki expiry dan memenuhi NFR-SEC-AUTH-003. |
| AC-AUTH-001-08 | Given login valid, when client menyelesaikan respons, then Member diarahkan ke dashboard atau redirect internal tervalidasi. |
| AC-AUTH-001-09 | Given identifier/password kosong atau email berformat invalid, when form dikirim, then sistem menolak input dan tidak mencari/membuat sesi akun. |
| AC-AUTH-001-10 | Given login melewati rate limit, when request berikutnya dikirim dalam window aktif, then sistem menolak HTTP 429 dengan `Retry-After`, tanpa membuat sesi. |

### FR-AUTH-002

| ID | Given / When / Then |
| --- | --- |
| AC-AUTH-002-01 | Given identifier berformat valid, when Member meminta reset password, then sistem menerima request dan memberi respons generik. |
| AC-AUTH-002-02 | Given identifier menunjuk akun aktif eligible, when request reset diterima, then sistem mengirim instruksi reset ke email terdaftar tanpa memasukkan password dalam email. |
| AC-AUTH-002-03 | Given reset token valid dan password baru memenuhi policy, when password dan confirmation cocok dikirim, then password diperbarui dan token dikonsumsi. |
| AC-AUTH-002-04 | Given reset token expired, when reset dikirim, then sistem menolak perubahan password dan memberi error token aman. |
| AC-AUTH-002-05 | Given reset token sudah sukses dipakai, when token sama dipakai lagi, then sistem menolak perubahan password. |
| AC-AUTH-002-06 | Given token valid, when password kurang dari policy atau confirmation berbeda, then sistem menolak perubahan dan password lama tetap valid. |
| AC-AUTH-002-07 | Given reset password sukses, when Member login dengan password baru, then login berhasil; login dengan password lama gagal. |
| AC-AUTH-002-08 | Given identifier terdaftar dan tidak terdaftar berformat valid, when masing-masing meminta reset, then respons eksternal setara dan tidak mengungkap akun. |
| AC-AUTH-002-09 | Given dua reset paralel memakai token sama, when keduanya diproses, then tepat satu request dapat mengubah password. |
| AC-AUTH-002-10 | Given reset password sukses, when sesi/token lama dipakai, then sistem menolak sesuai NFR-SEC-AUTH-008. |

### FR-AUTH-003

| ID | Given / When / Then |
| --- | --- |
| AC-AUTH-003-01 | Given Member memiliki sesi valid, when memilih Logout, then sistem memproses logout. |
| AC-AUTH-003-02 | Given logout diproses, when respons sukses/unauthenticated diterima, then client menghapus credential lokal dan mengarahkan Member ke halaman login atau publik. |
| AC-AUTH-003-03 | Given logout selesai, when access token atau refresh token sesi sama dipakai, then server menolak request terautentikasi. |
| AC-AUTH-003-04 | Given logout selesai, when Member membuka authenticated page atau API, then sistem meminta login ulang dan tidak mengembalikan data terautentikasi. |
| AC-AUTH-003-05 | Given logout selesai, when Member memakai browser back/forward, then halaman tidak dapat memuat data terautentikasi tanpa login ulang. |

## 4. Security / Non-Functional Requirement

### NFR-SEC-AUTH-001 - Password Storage

Password wajib di-hash memakai fungsi password-hashing adaptif, one-way, dan memory-hard atau work-factor configurable. Baseline saat ini memakai `bcrypt` dengan cost `12`; perubahan algoritma/cost perlu security review. Password tidak boleh disimpan plaintext, dienkripsi reversible sebagai pengganti hash, dikembalikan lewat API, ditulis ke log/audit/analytics, atau ditampilkan kembali ke user.

**Verification:** inspeksi konfigurasi, database fixture, respons API, log aplikasi, audit log, dan telemetry.

### NFR-SEC-AUTH-002 - Password Policy

Password baru wajib minimal 8 karakter, mengandung minimal satu huruf besar, satu huruf kecil, dan satu angka. `confirmPassword` wajib sama dengan password. Batas maksimum aman untuk mencegah resource exhaustion wajib ditentukan dan divalidasi server-side. Password reuse policy tidak diberlakukan sampai OQ-AUTH-003 disetujui. Sistem harus memberi pesan validasi field tanpa mengembalikan nilai password.

**Verification:** boundary test 7/8 karakter, kelas karakter, confirmation mismatch, input oversize, dan inspeksi respons/log.

### NFR-SEC-AUTH-003 - Session / Token Security

1. Setiap access session/token dan refresh token wajib memiliki expiry.
2. Sesi/token wajib ditolak sesudah logout, revoke, password reset, password change, account disable, expiry, atau mismatch versi sesi.
3. Token berbasis JWT wajib memiliki `exp`, `iat`, subject, token type, dan versi/claim invalidasi yang diverifikasi server-side.
4. Verifikasi JWT wajib membatasi algoritma yang diizinkan, memverifikasi signature, expiry, token type, dan claims wajib. Algoritma `none` dan algorithm confusion wajib ditolak.
5. Refresh token wajib opaque atau diperlakukan sebagai credential rahasia, disimpan server-side hanya dalam bentuk hash, dirotasi per penggunaan, dan reuse wajib memicu revoke scope sesuai policy.
6. Credential autentikasi tidak boleh disimpan pada `localStorage`, `sessionStorage`, URL, query string, client log, atau error telemetry.
7. Halaman dan API terautentikasi wajib menolak token tidak valid. Respons data sensitif harus menggunakan cache-control yang mencegah shared/browser cache memberi akses pasca logout.
8. Access-token expiry, refresh-token expiry, revocation scope, dan clock-skew tolerance mengikuti keputusan OQ-AUTH-004.

**Verification:** uji expiry, signature salah, token `type` salah, algoritma salah, refresh rotation/reuse, token setelah revoke, storage scan, dan cache/back-forward test.

### NFR-SEC-AUTH-004 - Brute Force and Credential Stuffing Protection

Login, forgot-password, reset-password, dan refresh wajib rate-limited server-side memakai key gabungan sesuai endpoint. Limit harus efektif lintas instance produksi. Sistem wajib mencatat kegagalan auth dan request rate-limit. Gunakan progressive delay/rate limit per IP dan per identifier; jangan membuat hard account lock yang dapat dipicu attacker tanpa mekanisme pemulihan aman. HTTP 429 wajib menyertakan `Retry-After` saat diblokir. Threshold/window ada pada OQ-AUTH-005.

**Verification:** request berulang dari IP/identifier sama dan berbeda, multi-instance test, header `Retry-After`, serta uji bahwa attacker tidak dapat mengunci akun korban permanen.

### NFR-SEC-AUTH-005 - Account Enumeration Protection

1. Login gagal karena identifier tidak ada, password salah, akun suspended/deactivated, atau soft-deleted wajib memiliki status, body, pesan user-facing, dan cookie behavior sama.
2. Forgot-password untuk identifier berformat valid wajib selalu memberi status/body/pesan sama. Delivery email, eligibility, dan account state tidak boleh terungkap.
3. Registration, bila tersedia, perlu review terpisah karena conflict response saat ini dapat mengungkap email/username. Behavior target tercatat pada OQ-AUTH-006.
4. Timing response tidak boleh sengaja memperjelas ada/tidaknya akun; implementasi harus memakai mitigasi yang proporsional dan dapat diukur.

**Verification:** bandingkan status, headers, body, Set-Cookie, dan waktu respons dari akun ada/tidak ada/states berbeda.

### NFR-SEC-AUTH-006 - Secure Error Handling

Error autentikasi tidak boleh membocorkan password, password hash, reset token, access/refresh token, query database, stack trace, service/provider detail, secret, atau internal system information. Client menerima pesan aman dan actionable. Detail diagnostik hanya pada log terproteksi dan tetap disanitasi.

**Verification:** forced-error test, log inspection, SAST/DAST, dan contract test response error.

### NFR-SEC-AUTH-007 - Password Reset Token Security

Reset token wajib dibuat dari cryptographically secure mechanism, berentropy cukup, signed atau disimpan hashed server-side, scoped hanya untuk reset password, memiliki expiry, dan single-use. Token tidak boleh muncul pada log, audit log, analytics, referer ke third party, atau email selain reset link. Konsumsi token dan update password harus atomik. Link reset wajib memakai HTTPS production. TTL dan mekanisme invalidasi token baru setelah request reset berulang ada pada OQ-AUTH-007.

**Verification:** entropy/source review, valid/invalid/expired/reused/race test, log/referrer inspection, dan email test.

### NFR-SEC-AUTH-008 - Session Invalidation

Sistem wajib menginvalidasi sesi/token relevan setelah logout, password reset, password change, account disable, dan refresh-token reuse. Reset/change password dan token-reuse harus menginvalidasi seluruh sesi user kecuali OQ-AUTH-008 menetapkan scope lain. Logout tunggal minimal menginvalidasi access dan refresh credential sesi saat ini sebelum respons sukses dikembalikan.

**Verification:** pakai credential lama pada protected API dan refresh endpoint setelah tiap event invalidasi.

### NFR-SEC-AUTH-009 - Authentication Logging

Sistem wajib mencatat successful login, failed login, rate-limit block, logout, password reset request, successful/failed password reset, invalidation, dan refresh-token reuse. Log minimal memuat timestamp, event type, outcome, correlation ID, dan actor/account ID bila tersedia; IP/user-agent hanya sesuai privacy policy. Log tidak boleh memuat password, reset token, access token, refresh token, cookie header, atau credential sensitif. Retensi, akses, masking, dan alerting mengikuti OQ-AUTH-009.

**Verification:** audit event fixture dan negative scan untuk data rahasia.

### NFR-SEC-AUTH-010 - HTTPS / Transport Security

Credential, session/token, reset token, dan data sensitif hanya boleh ditransmisikan melalui HTTPS/TLS pada production. HTTP harus ditolak atau dialihkan sebelum credential dikirim. TLS configuration dan HSTS mengikuti infrastructure security standard KomunaID.

**Verification:** production configuration review dan transport scan.

### NFR-SEC-AUTH-011 - Cookie Security

Bila memakai cookie untuk autentikasi, access dan refresh cookie wajib memakai `HttpOnly`, `Secure` pada production, `SameSite` sesuai threat model, path/domain minimal, expiry sesuai token, dan tidak boleh dapat dibaca JavaScript. Cookie reset token tidak digunakan. Nilai final `SameSite`, domain, dan cross-site requirement ada pada OQ-AUTH-010.

**Verification:** inspeksi `Set-Cookie` pada production-like environment dan uji path/domain scope.

### NFR-SEC-AUTH-012 - CSRF Protection

Bila browser otomatis mengirim cookie autentikasi pada state-changing endpoint, endpoint tersebut wajib memiliki CSRF protection defense-in-depth sesuai arsitektur, selain `SameSite`. Mekanisme wajib diverifikasi server-side dan berlaku untuk logout, password change, session revoke, serta endpoint state-changing terautentikasi lain. Endpoint, token lifecycle, dan trusted origin ada pada OQ-AUTH-011.

**Verification:** forged cross-site POST/PUT/DELETE tanpa token CSRF ditolak; request valid dari first-party diterima.

## 5. Traceability Matrix

`Test Result`, `Defect`, dan `UAT` diisi saat test execution. Nilai awal: `Not Run`.

| Requirement ID | Acceptance Criteria | Test Case | Test Result | Defect | UAT |
| --- | --- | --- | --- | --- | --- |
| FR-AUTH-001 | AC-AUTH-001-01 | TC-AUTH-001 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-02 | TC-AUTH-002 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-03 | TC-AUTH-003 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-04, AC-AUTH-001-06 | TC-AUTH-004 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-05 | TC-AUTH-005 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-07 | TC-AUTH-006 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-08 | TC-AUTH-007 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-09 | TC-AUTH-008 | Not Run |  |  |
| FR-AUTH-001 | AC-AUTH-001-10 | TC-AUTH-009 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-01 | TC-AUTH-010 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-02 | TC-AUTH-011 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-03 | TC-AUTH-012 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-04 | TC-AUTH-013 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-05, AC-AUTH-002-09 | TC-AUTH-014 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-06 | TC-AUTH-015 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-07 | TC-AUTH-016 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-08 | TC-AUTH-017 | Not Run |  |  |
| FR-AUTH-002 | AC-AUTH-002-10 | TC-AUTH-018 | Not Run |  |  |
| FR-AUTH-003 | AC-AUTH-003-01 | TC-AUTH-019 | Not Run |  |  |
| FR-AUTH-003 | AC-AUTH-003-02 | TC-AUTH-020 | Not Run |  |  |
| FR-AUTH-003 | AC-AUTH-003-03 | TC-AUTH-021 | Not Run | GAP-AUTH-001 |  |
| FR-AUTH-003 | AC-AUTH-003-04 | TC-AUTH-022 | Not Run | GAP-AUTH-001 |  |
| FR-AUTH-003 | AC-AUTH-003-05 | TC-AUTH-023 | Not Run |  |  |
| NFR-SEC-AUTH-001 | NFR verification | TC-AUTH-024 | Not Run |  | Security sign-off |
| NFR-SEC-AUTH-002 | NFR verification | TC-AUTH-025 | Not Run |  | Security sign-off |
| NFR-SEC-AUTH-003 | NFR verification | TC-AUTH-026 | Not Run | GAP-AUTH-001 | Security sign-off |
| NFR-SEC-AUTH-004 | NFR verification | TC-AUTH-027 | Not Run |  | Security sign-off |
| NFR-SEC-AUTH-005 | NFR verification | TC-AUTH-028 | Not Run | GAP-AUTH-002 | Security sign-off |
| NFR-SEC-AUTH-006 | NFR verification | TC-AUTH-029 | Not Run |  | Security sign-off |
| NFR-SEC-AUTH-007 | NFR verification | TC-AUTH-030 | Not Run |  | Security sign-off |
| NFR-SEC-AUTH-008 | NFR verification | TC-AUTH-031 | Not Run | GAP-AUTH-001 | Security sign-off |
| NFR-SEC-AUTH-009 | NFR verification | TC-AUTH-032 | Not Run |  | Audit sign-off |
| NFR-SEC-AUTH-010 | NFR verification | TC-AUTH-033 | Not Run |  | Security sign-off |
| NFR-SEC-AUTH-011 | NFR verification | TC-AUTH-034 | Not Run |  | Security sign-off |
| NFR-SEC-AUTH-012 | NFR verification | TC-AUTH-035 | Not Run |  | Security sign-off |

## 6. Test Scenario

| Scenario ID | Type | Coverage | Related Requirement | Expected Result |
| --- | --- | --- | --- | --- |
| TS-AUTH-001 | Positive | Login username valid + password valid | FR-AUTH-001 | Login sukses, sesi/token dibuat, dashboard tampil. |
| TS-AUTH-002 | Positive | Login email valid + password valid | FR-AUTH-001 | Login sukses, sesi/token dibuat, dashboard tampil. |
| TS-AUTH-003 | Positive | Forgot password akun valid | FR-AUTH-002 | Respons generik sukses; instruksi reset terkirim ke email terdaftar. |
| TS-AUTH-004 | Positive | Reset token valid + password valid | FR-AUTH-002 | Password berubah; token dikonsumsi; sesi lama invalid. |
| TS-AUTH-005 | Positive | Login memakai password baru | FR-AUTH-002 | Password baru sukses; password lama gagal. |
| TS-AUTH-006 | Positive | Logout | FR-AUTH-003 | Credential client dihapus; sesi saat ini invalid; redirect terjadi. |
| TS-AUTH-007 | Negative | Password salah | FR-AUTH-001 | Generic error; tidak ada sesi/token. |
| TS-AUTH-008 | Negative | Username tidak ditemukan | FR-AUTH-001 | Generic error identik login gagal lain; tidak ada sesi/token. |
| TS-AUTH-009 | Negative | Email tidak ditemukan | FR-AUTH-001, FR-AUTH-002 | Login generic error; forgot response generik identik. |
| TS-AUTH-010 | Negative | Account disabled/inactive | FR-AUTH-001 | Login ditolak dengan respons anti-enumeration. |
| TS-AUTH-011 | Negative | Field kosong | FR-AUTH-001 | Validasi field; tidak ada query autentikasi atau sesi baru. |
| TS-AUTH-012 | Negative | Format email invalid | FR-AUTH-001, FR-AUTH-002 | Validasi input; tidak ada email reset. |
| TS-AUTH-013 | Negative | Password tidak memenuhi policy | FR-AUTH-002 | Reset ditolak; password lama tidak berubah. |
| TS-AUTH-014 | Negative | Reset token invalid | FR-AUTH-002 | Reset ditolak; password tidak berubah. |
| TS-AUTH-015 | Negative | Reset token expired | FR-AUTH-002 | Reset ditolak; password tidak berubah. |
| TS-AUTH-016 | Negative | Reset token reused | FR-AUTH-002 | Reset kedua ditolak; password tidak berubah lagi. |
| TS-AUTH-017 | Negative | Token/session expired | FR-AUTH-001, FR-AUTH-003 | Protected API ditolak; refresh sesuai policy atau login ulang. |
| TS-AUTH-018 | Negative | Authenticated page setelah logout | FR-AUTH-003 | API/page tidak memberi data terautentikasi. |
| TS-AUTH-019 | Security | Account enumeration login | NFR-SEC-AUTH-005 | Respons untuk identifier ada/tidak ada/status berbeda setara. |
| TS-AUTH-020 | Security | Account enumeration forgot password | NFR-SEC-AUTH-005 | Respons identifier ada/tidak ada setara. |
| TS-AUTH-021 | Security | Brute force + credential stuffing | NFR-SEC-AUTH-004 | Pembatasan efektif; `429` dan `Retry-After`; akun korban tidak hard-locked attacker. |
| TS-AUTH-022 | Security | Distributed rate limiting | NFR-SEC-AUTH-004 | Limit konsisten lintas instance aplikasi. |
| TS-AUTH-023 | Security | Password exposure | NFR-SEC-AUTH-001, NFR-SEC-AUTH-006, NFR-SEC-AUTH-009 | Password/hash tidak muncul dalam DB plaintext, response, log, audit, atau telemetry. |
| TS-AUTH-024 | Security | Token exposure | NFR-SEC-AUTH-003, NFR-SEC-AUTH-007 | Token tidak muncul di log/referrer/client storage; cookies aman. |
| TS-AUTH-025 | Security | Session fixation | NFR-SEC-AUTH-003 | Login membuat credential sesi baru; credential pra-login tidak menjadi sesi terautentikasi. |
| TS-AUTH-026 | Security | Session invalidation | NFR-SEC-AUTH-008 | Credential lama ditolak sesudah logout/reset/change/disable. |
| TS-AUTH-027 | Security | JWT validation | NFR-SEC-AUTH-003 | Signature/expiry/type/version/algoritma invalid ditolak. |
| TS-AUTH-028 | Security | Cookie security | NFR-SEC-AUTH-011 | Flags, path, domain, expiry sesuai requirement. |
| TS-AUTH-029 | Security | CSRF cookie-based auth | NFR-SEC-AUTH-012 | Forged state-changing request ditolak. |
| TS-AUTH-030 | Security | Authentication error disclosure | NFR-SEC-AUTH-006 | Tidak ada stack trace, DB, secret, atau credential pada error. |
| TS-AUTH-031 | Security | Reset-token security | NFR-SEC-AUTH-007 | Token kuat, expired, single-use, scoped, atomik, dan tidak leak. |
| TS-AUTH-032 | Audit | Authentication logging | NFR-SEC-AUTH-009 | Event wajib ada; data rahasia tidak ada; akses/retensi sesuai policy. |

### Test Case Index

| Test Case | Scenario | Primary evidence |
| --- | --- | --- |
| TC-AUTH-001 | TS-AUTH-001 | UI/API response, protected API access, audit event. |
| TC-AUTH-002 | TS-AUTH-002 | UI/API response, protected API access. |
| TC-AUTH-003 | TS-AUTH-007 | 401/contract response, no auth cookie. |
| TC-AUTH-004 | TS-AUTH-008, TS-AUTH-009, TS-AUTH-019 | Response/body/header/timing comparison. |
| TC-AUTH-005 | TS-AUTH-010 | Generic rejected response, no cookie. |
| TC-AUTH-006 | TS-AUTH-017, TS-AUTH-027 | Token claims/header, expiry, verification. |
| TC-AUTH-007 | TS-AUTH-001, TS-AUTH-002 | Browser redirect test, open-redirect test. |
| TC-AUTH-008 | TS-AUTH-011, TS-AUTH-012 | Server validation and no session. |
| TC-AUTH-009 | TS-AUTH-021 | Repeated attempt response and headers. |
| TC-AUTH-010 | TS-AUTH-003 | Generic response and outbound email mock. |
| TC-AUTH-011 | TS-AUTH-003, TS-AUTH-024 | Email content and referrer check. |
| TC-AUTH-012 | TS-AUTH-004 | DB password hash, atomic update, token consumption. |
| TC-AUTH-013 | TS-AUTH-015 | Expired token response; unchanged password. |
| TC-AUTH-014 | TS-AUTH-016, TS-AUTH-031 | Reuse and parallel requests; one success max. |
| TC-AUTH-015 | TS-AUTH-013 | Boundary/password-confirmation validation. |
| TC-AUTH-016 | TS-AUTH-005 | Login new vs old password. |
| TC-AUTH-017 | TS-AUTH-020 | Forgot response compare and mail mock. |
| TC-AUTH-018 | TS-AUTH-026 | Old access/refresh credentials rejected. |
| TC-AUTH-019 | TS-AUTH-006 | Logout response, client cookie clearing, audit. |
| TC-AUTH-020 | TS-AUTH-006 | Redirect and local credential clear after success/expired session. |
| TC-AUTH-021 | TS-AUTH-018, TS-AUTH-026 | Reuse old access/refresh credential after logout. |
| TC-AUTH-022 | TS-AUTH-018 | Protected page/API request after logout. |
| TC-AUTH-023 | TS-AUTH-018 | Browser back/forward and cache-control inspection. |
| TC-AUTH-024 | TS-AUTH-023 | Source/config/DB/response/log secret scan. |
| TC-AUTH-025 | TS-AUTH-013 | Password policy boundary and oversized input test. |
| TC-AUTH-026 | TS-AUTH-017, TS-AUTH-024, TS-AUTH-025, TS-AUTH-027 | JWT, refresh, expiry, reuse, and storage suite. |
| TC-AUTH-027 | TS-AUTH-021, TS-AUTH-022 | Limit key/window/header and multi-instance suite. |
| TC-AUTH-028 | TS-AUTH-019, TS-AUTH-020 | Enumeration status/body/header/timing suite. |
| TC-AUTH-029 | TS-AUTH-030 | Forced-error/API/log disclosure suite. |
| TC-AUTH-030 | TS-AUTH-031 | Reset token generation, scope, race, leak suite. |
| TC-AUTH-031 | TS-AUTH-026 | Logout/reset/change/disable/reuse invalidation suite. |
| TC-AUTH-032 | TS-AUTH-032 | Audit log events and sensitive-field scan. |
| TC-AUTH-033 | Transport security | HTTPS/TLS/HSTS production scan. |
| TC-AUTH-034 | TS-AUTH-028 | Production-like `Set-Cookie` test. |
| TC-AUTH-035 | TS-AUTH-029 | Cross-site forged request suite. |

## 7. Requirement Dependencies

| Dependency ID | Requirement dependency | Owner | Impact if absent |
| --- | --- | --- | --- |
| DEP-AUTH-001 | User store dengan unique username/email, password hash, account status, soft-delete marker, dan token/session invalidation version. | Backend/DB | Login, reset, disable, invalidation tidak dapat diverifikasi. |
| DEP-AUTH-002 | Email service, domain pengirim, template reset, dan monitoring delivery. | Platform/Backend | Reset request tidak dapat menyampaikan instruksi. |
| DEP-AUTH-003 | Secret management untuk JWT/signing key, bcrypt config, cookie domain, APP URL, dan production fail-fast validation. | Platform/Security | Token/cookie security tidak dapat dipenuhi. |
| DEP-AUTH-004 | Shared rate-limit storage tersedia lintas instance produksi. | Platform/Backend | Brute-force protection bisa dibypass antar instance. |
| DEP-AUTH-005 | Frontend form/login redirect, cookie transport, protected-route guard, dan cache behavior. | Frontend | Acceptance redirect/logout/back-forward gagal. |
| DEP-AUTH-006 | Server middleware untuk authentication, authorization, token validation, session revoke, dan CSRF. | Backend/Security | Protected resources dapat diakses tanpa sesi valid. |
| DEP-AUTH-007 | Audit logging, log redaction, monitoring, retention, dan restricted log access. | Platform/Security | Audit/security review tidak dapat diselesaikan. |
| DEP-AUTH-008 | HTTPS, DNS/domain, reverse proxy, dan security headers production. | Platform | Credential/token transport tidak aman. |
| DEP-AUTH-009 | QA environment dengan mail mock, controllable clock, Redis/shared limiter, test users per status, dan browser automation. | QA/Platform | Token expiry/race/rate-limit/cookie test tidak reliabel. |
| DEP-AUTH-010 | Privacy policy/legal basis untuk IP, user-agent, audit records, dan retensi. | Legal/Product/Security | Logging dapat melanggar data governance. |

## 8. Open Questions / Assumptions

### Open Questions

| ID | Question | Owner | Blocks |
| --- | --- | --- | --- |
| OQ-AUTH-001 | Status mana yang berarti akun tidak aktif untuk login/reset: `SUSPENDED`, `DEACTIVATED`, soft-deleted, atau lainnya? Apakah user-facing response wajib identik untuk semua? | Product Owner + Security | BR-AUTH-002, AC-AUTH-001-05 |
| OQ-AUTH-002 | Forgot password final menerima email saja atau email/username seperti scope requirement ini? Bila username, apakah email terdaftar tetap satu-satunya tujuan delivery? | Product Owner | FR-AUTH-002 API/UI |
| OQ-AUTH-003 | Perlukah password history/reuse prevention? Jika ya, berapa riwayat dan bagaimana hash/retensi dikelola? | Product Owner + Security | NFR-SEC-AUTH-002 |
| OQ-AUTH-004 | Tetapkan access expiry, refresh expiry, refresh rotation, revoke scope, clock skew, dan maximum concurrent session. | Security + Architecture | NFR-SEC-AUTH-003 |
| OQ-AUTH-005 | Tetapkan threshold/window rate limit per IP dan identifier, progressive delay, response policy, serta alert threshold. | Security + Product Owner | NFR-SEC-AUTH-004 |
| OQ-AUTH-006 | Registration harus mencegah account enumeration atau boleh memberi conflict spesifik untuk UX? | Product Owner + Security | NFR-SEC-AUTH-005 |
| OQ-AUTH-007 | Tetapkan reset-token TTL, apakah request reset baru membatalkan token sebelumnya, dan batas request reset. | Security + Product Owner | NFR-SEC-AUTH-007 |
| OQ-AUTH-008 | Logout berarti revoke current session saja atau seluruh sesi? Reset/change password sudah harus revoke semua sesi, konfirmasi policy. | Product Owner + Security | NFR-SEC-AUTH-008 |
| OQ-AUTH-009 | Tetapkan retention, masking, monitoring, alerting, dan siapa yang dapat mengakses auth/audit log. | Security + Legal | NFR-SEC-AUTH-009 |
| OQ-AUTH-010 | Apakah web/API same-site atau cross-site? Tetapkan `SameSite`, `Domain`, `Path`, dan credentialed CORS final. | Architecture + Security | NFR-SEC-AUTH-011 |
| OQ-AUTH-011 | Mekanisme CSRF mana digunakan: synchronizer token, double-submit cookie, atau framework middleware? Tetapkan trusted origins dan token lifecycle. | Architecture + Security | NFR-SEC-AUTH-012 |
| OQ-AUTH-012 | Email harus terverifikasi sebelum reset password? Bagaimana flow user dengan email belum verified atau email berubah? | Product Owner + Security | FR-AUTH-002 |
| OQ-AUTH-013 | Aturan normalisasi identifier: trim input, lowercase email, dan case-sensitivity username? | Product Owner + Engineering | FR-AUTH-001, FR-AUTH-002 |

### Assumptions - Need Confirmation

| ID | Assumption | Validation needed |
| --- | --- | --- |
| ASM-AUTH-001 | KomunaID memakai browser cookie-based JWT: access token dan refresh token. | Cocokkan architecture/deployment production. |
| ASM-AUTH-002 | Reset token merupakan credential yang dikirim lewat reset link email dan tidak boleh muncul pada pihak ketiga. | Verifikasi email template, analytics, referrer policy. |
| ASM-AUTH-003 | `bcrypt` cost 12 adalah baseline saat ini dan masih memadai untuk hardware deployment. | Security performance review. |
| ASM-AUTH-004 | Redis/shared store tersedia pada production untuk rate limit. In-memory fallback tidak memadai untuk multi-instance production. | Platform verification. |
| ASM-AUTH-005 | UAT hanya dapat sign-off sesudah semua AC Must Have, NFR security tests, dan gap kritis lulus/ditutup. | QA/UAT governance approval. |

## Known Baseline Gaps

| Gap ID | Evidence | Requirement impact | Required action |
| --- | --- | --- | --- |
| GAP-AUTH-001 | `apps/api/src/routes/auth.ts` logout merevoke refresh token tetapi tidak menaikkan `tokenVersion`; `apps/api/src/middleware/auth.ts` menerima access JWT valid sampai expiry. | FR-AUTH-003; AC-AUTH-003-03/04; NFR-SEC-AUTH-003/008. | Revoke access credential server-side atau increment session/token version untuk sesi current scope. Tambahkan integration/E2E test. |
| GAP-AUTH-002 | Login baseline memberi `401` untuk akun tidak ada tetapi `403` dan pesan spesifik untuk soft-deleted/suspended/deactivated. | BR-AUTH-004; AC-AUTH-001-05/06; NFR-SEC-AUTH-005. | Samakan respons eksternal login gagal dan hindari cookie/session. Tetap simpan reason internal secara aman. |
| GAP-AUTH-003 | Forgot-password baseline menerima field `email`, bukan `identifier` username/email. | FR-AUTH-002; OQ-AUTH-002. | Konfirmasi scope; kemudian ubah schema, API, UI, dan test bila username disetujui. |
| GAP-AUTH-004 | Registration baseline mengembalikan conflict spesifik `Email sudah terdaftar` atau `Username sudah digunakan`. | NFR-SEC-AUTH-005 registration clause; OQ-AUTH-006. | Product/Security putuskan trade-off UX versus enumeration lalu selaraskan. |

## Approval Gate

Development, QA, UAT, Security Review, dan Audit dapat memakai dokumen ini setelah OQ yang memblokir disetujui. Production release authentication tidak boleh sign-off selama `GAP-AUTH-001` atau `GAP-AUTH-002` terbuka.
