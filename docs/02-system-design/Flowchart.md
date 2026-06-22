# KomunaID — Flowchart

## 1. Register sebagai Member

```mermaid
flowchart TD
    A([Start]) --> B[Guest mengakses halaman register]
    B --> C[Input: name, email, phone, password]
    C --> D{Validasi Input}
    D -->|Invalid| E[Tampilkan Error Message]
    E --> C
    D -->|Valid| F[Cek Email Unique]
    F -->|Duplicate| G[Tampilkan Error: Email sudah terdaftar]
    G --> C
    F -->|Unique| H[Buat User Record]
    H --> I[Assign Role: Member]
    I --> J[Hash Password]
    J --> K[Simpan ke Database]
    K --> L[Generate Session / Login]
    L --> M[Flash Message: Registrasi Berhasil]
    M --> N[Redirect ke Member Dashboard]
    N --> O([End])
```

---

## 2. Ajukan Community Owner

```mermaid
flowchart TD
    A([Start]) --> B[Member Login]
    B --> C[Mengakses halaman Role Approval]
    C --> D{Ada Pending Request?}
    D -->|Yes| E[Tampilkan: Request Sedang Diproses]
    E --> Z([End])
    D -->|No| F[Pilih Role: Community Owner]
    F --> G[Isi Form: Motivasi / Notes]
    G --> H{Validasi Form}
    H -->|Invalid| I[Tampilkan Error]
    I --> G
    H -->|Valid| J[Buat role_approval Record]
    J --> K[Status: pending]
    K --> L[Flash Message: Ajuan Terkirim]
    L --> M[Tunggu Superadmin Review]
    M --> N{Superadmin Decision}
    N -->|Approve| O[Update User Role: community_owner]
    O --> P[Update role_approval: approved]
    P --> Q[Flash Message: Role Disetujui]
    Q --> R[Redirect ke Community Dashboard]
    R --> S([End])
    N -->|Reject| T[Update role_approval: rejected]
    T --> U[Add Rejection Notes]
    U --> V[Flash Message: Role Ditolak]
    V --> W([End])
```

---

## 3. Ajukan Brand Owner

```mermaid
flowchart TD
    A([Start]) --> B[Member Login]
    B --> C[Mengakses halaman Role Approval]
    C --> D{Ada Pending Request?}
    D -->|Yes| E[Tampilkan: Request Sedang Diproses]
    E --> Z([End])
    D -->|No| F[Pilih Role: Brand Owner]
    F --> G[Isi Form: Motivasi / Notes]
    G --> H{Validasi Form}
    H -->|Invalid| I[Tampilkan Error]
    I --> G
    H -->|Valid| J[Buat role_approval Record]
    J --> K[Status: pending]
    K --> L[Flash Message: Ajuan Terkirim]
    L --> M[Tunggu Superadmin Review]
    M --> N{Superadmin Decision}
    N -->|Approve| O[Update User Role: brand_owner]
    O --> P[Update role_approval: approved]
    P --> Q[Flash Message: Role Disetujui]
    Q --> R[Redirect ke Brand Dashboard]
    R --> S([End])
    N -->|Reject| T[Update role_approval: rejected]
    T --> U[Add Rejection Notes]
    U --> V[Flash Message: Role Ditolak]
    V --> W([End])
```

---

## 4. Community Owner Membuat Komunitas

```mermaid
flowchart TD
    A([Start]) --> B[Community Owner Login]
    B --> C[Mengakses Community Dashboard]
    C --> D[Klik: Buat Komunitas Baru]
    D --> E[Isi Form: name, description, category, location]
    E --> F[Upload Banner & Logo - Optional]
    F --> G{Validasi Form}
    G -->|Invalid| H[Tampilkan Error]
    H --> E
    G -->|Valid| I[Buat Community Record]
    I --> J[Generate Slug dari Nama]
    J --> K[Simpan ke Database]
    K --> L{is_public = true?}
    L -->|Yes| M[Community Langsung Aktif]
    L -->|No| N[Menunggu Approval Superadmin]
    M --> O[Flash Message: Komunitas Berhasil Dibuat]
    N --> P[Flash Message: Komunitas Menunggu Approval]
    O --> Q[Redirect ke Community Detail]
    P --> Q
    Q --> R([End])
```

---

## 5. Brand Owner Membuat Brand

```mermaid
flowchart TD
    A([Start]) --> B[Brand Owner Login]
    B --> C[Mengakses Brand Dashboard]
    C --> D[Klik: Buat Brand Baru]
    D --> E[Isi Form: name, description, industry, website]
    E --> F[Upload Logo & Banner - Optional]
    F --> G{Validasi Form}
    G -->|Invalid| H[Tampilkan Error]
    H --> E
    G -->|Valid| I[Buat Brand Record]
    I --> J[Generate Slug dari Nama]
    J --> K[Simpan ke Database]
    K --> L{Status Brand}
    L -->|Auto-approve| M[Brand Aktif]
    L -->|Need approval| N[Menunggu Approval Superadmin]
    M --> O[Flash Message: Brand Berhasil Dibuat]
    N --> P[Flash Message: Brand Menunggu Approval]
    O --> Q[Redirect ke Brand Detail]
    P --> Q
    Q --> R([End])
```

---

## 6. Member Join Community

```mermaid
flowchart TD
    A([Start]) --> B[Member Login]
    B --> C[Mengakses Halaman Komunitas]
    C --> D[Klik: Join Community]
    D --> E{Sudah Login?}
    E -->|No| F[Redirect ke Login]
    F --> Z([End])
    E -->|Yes| G{Sudah Menjadi Member?}
    G -->|Yes| H[Tampilkan: Sudah Bergabung]
    H --> Z
    G -->|No| I[Buat community_member Record]
    I --> J[Status: pending]
    J --> K[Flash Message: Request Join Terkirim]
    K --> L[Notify Community Owner]
    L --> M[Community Owner Melihat Daftar Member]
    M --> N{Decision}
    N -->|Approve| O[Update Status: approved]
    O --> P[Set joined_at timestamp]
    P --> Q[Flash Message: Selamat Datang!]
    Q --> R[Member Bisa Akses Komunitas]
    R --> S([End])
    N -->|Reject| T[Update Status: rejected]
    T --> U[Flash Message: Join Ditolak]
    U --> V([End])
```

---

## 7. Member Register Event Paid

```mermaid
flowchart TD
    A([Start]) --> B[Member Login]
    B --> C[Mengakses Event Detail]
    C --> D{Event Berbayar?}
    D -->|No| E[RSVP Gratis: Going / Maybe]
    E --> F[Selesai]
    F --> Z([End])
    D -->|Yes| G[Klik: Register Event]
    G --> H{Telah Menjadi Member Komunitas?}
    H -->|No| I[Harus Join Komunitas Dulu]
    I --> Z
    H -->|Yes| J[Menampilkan Info Harga & Pembayaran]
    J --> K[Member Melakukan Pembayaran Manual]
    K --> L[Upload Bukti Pembayaran]
    L --> M{Bukti Valid?}
    M -->|Invalid| N[Error: Format Tidak Sesuai]
    N --> L
    M -->|Valid| O[Buat payment Record]
    O --> P[Status: pending_verification]
    P --> Q[Flash Message: Bukti Terkirim]
    Q --> R[Community Owner Verifikasi]
    R --> S{Terverifikasi?}
    S -->|Yes| T[Status: paid]
    T --> U[Buat event_attendee Record]
    U --> V[Flash Message: Pendaftaran Berhasil]
    V --> W([End])
    S -->|No| X[Status: rejected]
    X --> Y[Flash Message: Pembayaran Ditolak]
    Y --> Z
```

---

## 8. Brand Mengajukan Kolaborasi

```mermaid
flowchart TD
    A([Start]) --> B[Brand Owner Login]
    B --> C[Mengakses Halaman Kolaborasi]
    C --> D[Pilih Komunitas Target]
    D --> E[Isi Form Kolaborasi]
    E --> F[Deskripsi: tujuan, benefit, durasi]
    F --> G{Validasi Form}
    G -->|Invalid| H[Tampilkan Error]
    H --> E
    G -->|Valid| I[Buat collaboration Record]
    I --> J[Status: pending]
    J --> K[Flash Message: Ajuan Kolaborasi Terkirim]
    K --> L[Notify Community Owner]
    L --> M[Community Owner Membuka Collaboration Page]
    M --> N{Decision}
    N -->|Accept| O[Status: accepted]
    O --> P[Buka Channel Kolaborasi]
    P --> Q[Flash Message: Kolaborasi Diterima]
    Q --> R([End])
    N -->|Decline| S[Status: declined]
    S --> T[Add Alasan Penolakan]
    T --> U[Flash Message: Kolaborasi Ditolak]
    U --> V([End])
```

---

## 9. Superadmin Approval

```mermaid
flowchart TD
    A([Start]) --> B[Superadmin Login]
    B --> C[Mengakses Superadmin Dashboard]
    C --> D[Lihat Approval Queue]
    D --> E{Jenis Approval}
    E -->|Role Request| F[Daftar role_approvals pending]
    E -->|Community Moderation| G[Daftar communities pending]
    E -->|Brand Moderation| H[Daftar brands pending]

    F --> F1[Klik Detail Request]
    F1 --> F2[Lihat: User Info, Role Requested, Notes]
    F2 --> F3{Decision}
    F3 -->|Approve| F4[Update role_approval: approved]
    F4 --> F5[Update user.role_id]
    F5 --> F6[Flash Message: Role Disetujui]
    F6 --> F7[Redirect ke Queue]
    F3 -->|Reject| F8[Isi Catatan Penolakan]
    F8 --> F9[Update role_approval: rejected]
    F9 --> F10[Flash Message: Role Ditolak]
    F10 --> F7

    G --> G1[Klik Detail Komunitas]
    G1 --> G2[Lihat: Info Komunitas, Owner]
    G2 --> G3{Decision}
    G3 -->|Approve| G4[Set is_active = true]
    G4 --> G5[Flash Message: Komunitas Diaktifkan]
    G5 --> G6[Redirect ke Queue]
    G3 -->|Reject| G7[Isi Alasan Penolakan]
    G7 --> G8[Notify Community Owner]
    G8 --> G6

    H --> H1[Klik Detail Brand]
    H1 --> H2[Lihat: Info Brand, Owner]
    H2 --> H3{Decision}
    H3 -->|Approve| H4[Set is_active = true]
    H4 --> H5[Flash Message: Brand Diaktifkan]
    H5 --> H6[Redirect ke Queue]
    H3 -->|Reject| H7[Isi Alasan Penolakan]
    H7 --> H8[Notify Brand Owner]
    H8 --> H6

    F7 --> I{Masih Ada Pending?}
    G6 --> I
    H6 --> I
    I -->|Yes| D
    I -->|No| J[Flash Message: Semua Approval Selesai]
    J --> K([End])
```
