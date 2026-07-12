# 11 — API Documentation: Admin Endpoints

> KomunaID Super Admin MVP — Platform Governance Module

Base URL: `/api/v1/admin`

Semua endpoint memerlukan autentikasi JWT dengan role `SUPER_ADMIN`. Header wajib:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1. Dashboard

### GET `/api/v1/admin/dashboard`

Mengambil ringkasan dashboard utama (total pengguna, komunitas, event, laporan aktif).

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalCommunities": 85,
    "totalEvents": 320,
    "activeReports": 12,
    "totalVolunteers": 450,
    "newUsersToday": 35,
    "newCommunitiesThisWeek": 5,
    "eventsThisMonth": 48
  }
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil |
| 401 | Token tidak valid |
| 403 | Bukan Super Admin |

---

### GET `/api/v1/admin/dashboard/growth`

Mengambil data pertumbuhan untuk grafik (harian/mingguan/bulanan).

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `period` (daily \| weekly \| monthly), `startDate`, `endDate` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "period": "daily",
    "labels": ["2026-07-01", "2026-07-02", "2026-07-03"],
    "users": [12, 18, 25],
    "communities": [1, 2, 0],
    "events": [3, 5, 2]
  }
}
```

---

## 2. Users Management

### GET `/api/v1/admin/users`

Mengambil daftar semua pengguna dengan pagination dan filter.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `search`, `role`, `status`, `sortBy`, `sortOrder` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "clx123...",
        "name": "Budi Santoso",
        "email": "budi@example.com",
        "role": "USER",
        "status": "ACTIVE",
        "avatar": "https://cdn.komuna.id/avatars/budi.jpg",
        "createdAt": "2026-01-15T08:00:00.000Z",
        "lastLoginAt": "2026-07-10T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1250,
      "totalPages": 63
    }
  }
}
```

---

### GET `/api/v1/admin/users/:id`

Mengambil detail satu pengguna berdasarkan ID.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `id` (string, user ID) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "+6281234567890",
    "role": "USER",
    "status": "ACTIVE",
    "avatar": "https://cdn.komuna.id/avatars/budi.jpg",
    "bio": "Aktivis sosial di Jakarta",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "communities": [
      { "id": "cly456...", "name": "Komunitas Peduli Lingkungan", "role": "MEMBER" }
    ],
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-07-10T14:30:00.000Z",
    "lastLoginAt": "2026-07-10T14:30:00.000Z"
  }
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil |
| 404 | Pengguna tidak ditemukan |

---

### PUT `/api/v1/admin/users/:userId/suspend`

Menangguhkan akun pengguna.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `userId` |
| Body | `{ "reason": "string (required)", "duration": "number (hari, opsional)" }` |

**Request Body:**

```json
{
  "reason": "Pelanggaran komunitas berulang",
  "duration": 30
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Pengguna berhasil ditangguhkan",
  "data": {
    "id": "clx123...",
    "status": "SUSPENDED",
    "suspendedAt": "2026-07-11T12:00:00.000Z",
    "suspendedUntil": "2026-08-10T12:00:00.000Z",
    "suspensionReason": "Pelanggaran komunitas berulang"
  }
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil ditangguhkan |
| 400 | Pengguna sudah ditangguhkan |
| 404 | Pengguna tidak ditemukan |

---

### PUT `/api/v1/admin/users/:userId/activate`

Mengaktifkan kembali pengguna yang ditangguhkan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `userId` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Pengguna berhasil diaktifkan",
  "data": {
    "id": "clx123...",
    "status": "ACTIVE"
  }
}
```

---

### PUT `/api/v1/admin/users/:userId/archive`

Mengarsipkan akun pengguna (soft delete).

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `userId` |
| Body | `{ "reason": "string (optional)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Pengguna berhasil diarsipkan",
  "data": {
    "id": "clx123...",
    "status": "ARCHIVED"
  }
}
```

---

### PUT `/api/v1/admin/users/:userId/restore`

Memulihkan pengguna yang sudah diarsipkan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `userId` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Pengguna berhasil dipulihkan",
  "data": {
    "id": "clx123...",
    "status": "ACTIVE"
  }
}
```

---

### PUT `/api/v1/admin/users/:userId/role`

Mengubah role pengguna.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `userId` |
| Body | `{ "role": "USER | COMMUNITY_ADMIN | SUPER_ADMIN" }` |

**Request Body:**

```json
{
  "role": "COMMUNITY_ADMIN"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Role pengguna berhasil diubah",
  "data": {
    "id": "clx123...",
    "role": "COMMUNITY_ADMIN"
  }
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil |
| 400 | Role tidak valid |
| 403 | Tidak boleh mengubah role Super Admin lain |

---

### PUT `/api/v1/admin/users/:userId/reset-password`

Meriset password pengguna dan mengirim email notifikasi.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `userId` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Password berhasil direset. Email notifikasi telah dikirim.",
  "data": {
    "id": "clx123...",
    "passwordResetAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

## 3. Roles

### GET `/api/v1/admin/roles`

Mengambil daftar semua role yang tersedia di sistem.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clz001...",
      "name": "SUPER_ADMIN",
      "displayName": "Super Administrator",
      "description": "Akses penuh ke seluruh platform",
      "userCount": 3
    },
    {
      "id": "clz002...",
      "name": "COMMUNITY_ADMIN",
      "displayName": "Admin Komunitas",
      "description": "Mengelola komunitas yang ditugaskan",
      "userCount": 85
    },
    {
      "id": "clz003...",
      "name": "USER",
      "displayName": "Pengguna",
      "description": "Pengguna standar platform",
      "userCount": 1162
    }
  ]
}
```

---

## 4. Communities Management

### GET `/api/v1/admin/communities`

Mengambil daftar semua komunitas dengan pagination dan filter.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "cly456...",
        "name": "Komunitas Peduli Lingkungan",
        "slug": "komunitas-peduli-lingkungan",
        "description": "Komunitas untuk pelestarian lingkungan",
        "status": "ACTIVE",
        "memberCount": 150,
        "eventCount": 12,
        "adminName": "Budi Santoso",
        "createdAt": "2026-02-01T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "totalPages": 5
    }
  }
}
```

---

### GET `/api/v1/admin/communities/:id`

Mengambil detail komunitas.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "cly456...",
    "name": "Komunitas Peduli Lingkungan",
    "slug": "komunitas-peduli-lingkungan",
    "description": "Komunitas untuk pelestarian lingkungan di Indonesia",
    "status": "ACTIVE",
    "logo": "https://cdn.komuna.id/logos/kpl.png",
    "coverImage": "https://cdn.komuna.id/covers/kpl.jpg",
    "location": "Jakarta Selatan",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "memberCount": 150,
    "eventCount": 12,
    "admin": {
      "id": "clx123...",
      "name": "Budi Santoso",
      "email": "budi@example.com"
    },
    "members": [
      { "id": "clx789...", "name": "Siti Aminah", "role": "MEMBER" }
    ],
    "createdAt": "2026-02-01T08:00:00.000Z",
    "updatedAt": "2026-07-10T10:00:00.000Z"
  }
}
```

---

### GET `/api/v1/admin/communities/review-queue`

Mengambil daftar komunitas yang menunggu persetujuan.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "cly999...",
        "name": "Komunitas Digital Indonesia",
        "description": "Komunitas teknologi digital",
        "status": "PENDING_APPROVAL",
        "submittedBy": {
          "id": "clx456...",
          "name": "Rina Wati"
        },
        "submittedAt": "2026-07-09T08:00:00.000Z",
        "documents": [
          { "type": "AKTA_PENDIRIAN", "url": "https://cdn.komuna.id/docs/akta-kdi.pdf" }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### PUT `/api/v1/admin/communities/:id/approve`

Menyetujui pendaftaran komunitas.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "notes": "string (optional)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Komunitas berhasil disetujui",
  "data": {
    "id": "cly999...",
    "status": "ACTIVE",
    "approvedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil |
| 400 | Komunitas tidak dalam status menunggu persetujuan |
| 404 | Komunitas tidak ditemukan |

---

### PUT `/api/v1/admin/communities/:id/suspend`

Menangguhkan komunitas.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "reason": "string (required)" }` |

**Request Body:**

```json
{
  "reason": "Pelanggaran kebijakan platform berulang"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Komunitas berhasil ditangguhkan",
  "data": {
    "id": "cly456...",
    "status": "SUSPENDED",
    "suspendedAt": "2026-07-11T12:00:00.000Z",
    "suspensionReason": "Pelanggaran kebijakan platform berulang"
  }
}
```

---

### PUT `/api/v1/admin/communities/:id/restore`

Memulihkan komunitas yang ditangguhkan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Komunitas berhasil dipulihkan",
  "data": {
    "id": "cly456...",
    "status": "ACTIVE"
  }
}
```

---

### PATCH `/api/v1/admin/communities/:id/reject`

Menolak pendaftaran komunitas.

| Field | Value |
|-------|-------|
| Method | `PATCH` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "reason": "string (required)" }` |

**Request Body:**

```json
{
  "reason": "Dokumen tidak lengkap. Akta pendirian tidak terbaca."
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Komunitas berhasil ditolak",
  "data": {
    "id": "cly999...",
    "status": "REJECTED",
    "rejectedAt": "2026-07-11T12:00:00.000Z",
    "rejectionReason": "Dokumen tidak lengkap. Akta pendirian tidak terbaca."
  }
}
```

---

### PATCH `/api/v1/admin/communities/:id/request-revision`

Meminta revisi dokumen komunitas sebelum disetujui.

| Field | Value |
|-------|-------|
| Method | `PATCH` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "message": "string (required)", "requiredDocuments": ["string"] }` |

**Request Body:**

```json
{
  "message": "Mohon perbarui dokumen akta pendirian dan lampirkan surat keterangan domisili.",
  "requiredDocuments": ["AKTA_PENDIRIAN", "SURAT_DOMISILI"]
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Permintaan revisi berhasil dikirim",
  "data": {
    "id": "cly999...",
    "status": "REVISION_REQUIRED",
    "revisionRequestedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

## 5. Events Management

### GET `/api/v1/admin/events`

Mengambil daftar semua event.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `search`, `status`, `communityId`, `startDate`, `endDate` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "clz789...",
        "title": "Clean Up Beach Canggu",
        "description": "Aksi bersih-bersih pantai Canggu",
        "status": "PUBLISHED",
        "startDate": "2026-07-20T06:00:00.000Z",
        "endDate": "2026-07-20T12:00:00.000Z",
        "location": "Pantai Canggu, Bali",
        "communityName": "Komunitas Peduli Pantai",
        "organizerName": "Made Wijaya",
        "registrationCount": 45,
        "maxParticipants": 100,
        "createdAt": "2026-07-01T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 320,
      "totalPages": 16
    }
  }
}
```

---

### GET `/api/v1/admin/events/:id`

Mengambil detail event.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "clz789...",
    "title": "Clean Up Beach Canggu",
    "description": "Aksi bersih-bersih pantai Canggu",
    "status": "PUBLISHED",
    "startDate": "2026-07-20T06:00:00.000Z",
    "endDate": "2026-07-20T12:00:00.000Z",
    "location": "Pantai Canggu, Bali",
    "latitude": -8.6478,
    "longitude": 115.1385,
    "community": {
      "id": "cly456...",
      "name": "Komunitas Peduli Pantai"
    },
    "organizer": {
      "id": "clx789...",
      "name": "Made Wijaya"
    },
    "registrationCount": 45,
    "maxParticipants": 100,
    "createdAt": "2026-07-01T08:00:00.000Z"
  }
}
```

---

### PUT `/api/v1/admin/events/:id/suspend`

Menangguhkan event.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "reason": "string (required)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Event berhasil ditangguhkan",
  "data": {
    "id": "clz789...",
    "status": "SUSPENDED"
  }
}
```

---

### PUT `/api/v1/admin/events/:id/restore`

Memulihkan event yang ditangguhkan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Event berhasil dipulihkan",
  "data": {
    "id": "clz789...",
    "status": "PUBLISHED"
  }
}
```

---

### PUT `/api/v1/admin/events/:id/archive`

Mengarsipkan event.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Event berhasil diarsipkan",
  "data": {
    "id": "clz789...",
    "status": "ARCHIVED"
  }
}
```

---

### PUT `/api/v1/admin/events/:id/cancel`

Membatalkan event.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "reason": "string (required)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Event berhasil dibatalkan",
  "data": {
    "id": "clz789...",
    "status": "CANCELLED"
  }
}
```

---

### PUT `/api/v1/admin/events/:id/publish`

Mempublikasikan event dari status draft.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Event berhasil dipublikasikan",
  "data": {
    "id": "clz789...",
    "status": "PUBLISHED",
    "publishedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### PUT `/api/v1/admin/events/:id/soft-delete`

Melakukan soft delete pada event.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Event berhasil dihapus",
  "data": {
    "id": "clz789...",
    "status": "DELETED"
  }
}
```

---

### GET `/api/v1/admin/events/:id/registrations`

Mengambil daftar pendaftar event.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `id` |
| Query Params | `page`, `limit`, `status` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "id": "crm001...",
        "user": {
          "id": "clx111...",
          "name": "Andi Pratama",
          "email": "andi@example.com"
        },
        "status": "CONFIRMED",
        "registeredAt": "2026-07-05T10:00:00.000Z",
        "attendedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

## 6. Volunteers Management

### GET `/api/v1/admin/volunteers`

Mengambil daftar semua relawan.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `search`, `status`, `skill`, `sortBy`, `sortOrder` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "volunteers": [
      {
        "id": "vol001...",
        "user": {
          "id": "clx222...",
          "name": "Siti Aminah",
          "email": "siti@example.com"
        },
        "status": "ACTIVE",
        "skills": ["First Aid", "Event Management", "Photography"],
        "totalHours": 120,
        "eventsCompleted": 8,
        "rating": 4.5,
        "joinedAt": "2026-03-01T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 450,
      "totalPages": 23
    }
  }
}
```

---

### GET `/api/v1/admin/volunteers/:id`

Mengambil detail relawan.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "vol001...",
    "user": {
      "id": "clx222...",
      "name": "Siti Aminah",
      "email": "siti@example.com",
      "phone": "+6281234567891",
      "avatar": "https://cdn.komuna.id/avatars/siti.jpg"
    },
    "status": "ACTIVE",
    "skills": ["First Aid", "Event Management", "Photography"],
    "bio": "Relawan aktif sejak 2026",
    "totalHours": 120,
    "eventsCompleted": 8,
    "rating": 4.5,
    "applications": [
      {
        "id": "app001...",
        "eventName": "Clean Up Beach Canggu",
        "status": "APPROVED",
        "appliedAt": "2026-07-05T10:00:00.000Z"
      }
    ],
    "joinedAt": "2026-03-01T08:00:00.000Z"
  }
}
```

---

### GET `/api/v1/admin/volunteers/:id/applications`

Mengambil daftar lamaran relawan.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `id` |
| Query Params | `page`, `limit`, `status` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app001...",
        "event": {
          "id": "clz789...",
          "title": "Clean Up Beach Canggu"
        },
        "status": "APPROVED",
        "message": "Saya memiliki sertifikat first aid",
        "appliedAt": "2026-07-05T10:00:00.000Z",
        "reviewedAt": "2026-07-06T08:00:00.000Z",
        "reviewedBy": "Admin Komunitas Peduli Pantai"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

---

### PUT `/api/v1/admin/volunteers/applications/:id/approve`

Menyetujui lamaran relawan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "notes": "string (optional)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Lamaran relawan berhasil disetujui",
  "data": {
    "id": "app001...",
    "status": "APPROVED",
    "approvedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### PUT `/api/v1/admin/volunteers/applications/:id/reject`

Menolak lamaran relawan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "reason": "string (required)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Lamaran relawan berhasil ditolak",
  "data": {
    "id": "app001...",
    "status": "REJECTED",
    "rejectedAt": "2026-07-11T12:00:00.000Z",
    "rejectionReason": "Kualifikasi tidak sesuai"
  }
}
```

---

### PUT `/api/v1/admin/volunteers/:id/suspend`

Menangguhkan relawan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "reason": "string (required)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Relawan berhasil ditangguhkan",
  "data": {
    "id": "vol001...",
    "status": "SUSPENDED"
  }
}
```

---

### PUT `/api/v1/admin/volunteers/:id/archive`

Mengarsipkan relawan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Relawan berhasil diarsipkan",
  "data": {
    "id": "vol001...",
    "status": "ARCHIVED"
  }
}
```

---

### PUT `/api/v1/admin/volunteers/:id/soft-delete`

Melakukan soft delete pada relawan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Relawan berhasil dihapus",
  "data": {
    "id": "vol001...",
    "status": "DELETED"
  }
}
```

---

### PUT `/api/v1/admin/volunteers/:id/restore`

Memulihkan relawan yang diarsipkan/dihapus.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | — |

**Response 200:**

```json
{
  "success": true,
  "message": "Relawan berhasil dipulihkan",
  "data": {
    "id": "vol001...",
    "status": "ACTIVE"
  }
}
```

---

## 7. Reports Management

### GET `/api/v1/admin/reports`

Mengambil daftar semua laporan.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `status`, `type`, `severity`, `sortBy`, `sortOrder` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "rpt001...",
        "type": "SPAM",
        "severity": "LOW",
        "status": "PENDING",
        "reporterName": "Andi Pratama",
        "targetType": "USER",
        "targetName": "Account Suspicious",
        "description": "Akun ini mengirim spam di forum",
        "createdAt": "2026-07-10T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 48,
      "totalPages": 3
    }
  }
}
```

---

### PUT `/api/v1/admin/reports/:id/resolve`

Menyelesaikan laporan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "resolution": "string (required)", "action": "string (optional)" }` |

**Request Body:**

```json
{
  "resolution": "Akun pengguna telah ditangguhkan karena melanggar kebijakan spam",
  "action": "SUSPENDED_USER"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Laporan berhasil diselesaikan",
  "data": {
    "id": "rpt001...",
    "status": "RESOLVED",
    "resolvedAt": "2026-07-11T12:00:00.000Z",
    "resolution": "Akun pengguna telah ditangguhkan karena melanggar kebijakan spam"
  }
}
```

---

### PUT `/api/v1/admin/reports/:id/under-review`

Menandai laporan sedang dalam pengkajian.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "notes": "string (optional)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Laporan ditandai sedang dikaji",
  "data": {
    "id": "rpt001...",
    "status": "UNDER_REVIEW",
    "reviewedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### POST `/api/v1/admin/reports/:id/warn`

Mengirim peringatan kepada pengguna terkait laporan.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "message": "string (required)", "sendEmail": "boolean (optional, default: true)" }` |

**Request Body:**

```json
{
  "message": "Akun Anda dilaporkan karena aktivitas mencurigakan. Mohon patuhi kebijakan platform.",
  "sendEmail": true
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Peringatan berhasil dikirim",
  "data": {
    "id": "rpt001...",
    "warningSentAt": "2026-07-11T12:00:00.000Z",
    "warningMessage": "Akun Anda dilaporkan karena aktivitas mencurigakan. Mohon patuhi kebijakan platform."
  }
}
```

---

## 8. CMS Management

### GET `/api/v1/admin/cms/pages`

Mengambil daftar semua halaman CMS.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `search`, `status` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": "cms001...",
        "title": "Tentang Kami",
        "slug": "tentang-kami",
        "status": "PUBLISHED",
        "authorName": "Admin KomunaID",
        "publishedAt": "2026-01-01T08:00:00.000Z",
        "createdAt": "2026-01-01T08:00:00.000Z",
        "updatedAt": "2026-06-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

### GET `/api/v1/admin/cms/pages/:slug`

Mengambil konten halaman CMS berdasarkan slug.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `slug` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "cms001...",
    "title": "Tentang Kami",
    "slug": "tentang-kami",
    "content": "<h1>Tentang KomunaID</h1><p>KomunaID adalah platform...</p>",
    "metaTitle": "Tentang Kami - KomunaID",
    "metaDescription": "Kenali lebih jauh tentang KomunaID",
    "status": "PUBLISHED",
    "author": {
      "id": "admin001...",
      "name": "Admin KomunaID"
    },
    "publishedAt": "2026-01-01T08:00:00.000Z",
    "createdAt": "2026-01-01T08:00:00.000Z",
    "updatedAt": "2026-06-15T10:00:00.000Z"
  }
}
```

---

### POST `/api/v1/admin/cms/pages`

Membuat halaman CMS baru.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth | Super Admin |
| Body | `{ "title": "string (required)", "slug": "string (optional, auto-generated)", "content": "string (required)", "metaTitle": "string (optional)", "metaDescription": "string (optional)", "status": "DRAFT | PUBLISHED" }` |

**Request Body:**

```json
{
  "title": "Kebijakan Privasi",
  "content": "<h1>Kebijakan Privasi KomunaID</h1><p>Kami menghargai privasi Anda...</p>",
  "metaTitle": "Kebijakan Privasi - KomunaID",
  "metaDescription": "Baca kebijakan privasi KomunaID",
  "status": "DRAFT"
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Halaman CMS berhasil dibuat",
  "data": {
    "id": "cms002...",
    "title": "Kebijakan Privasi",
    "slug": "kebijakan-privasi",
    "status": "DRAFT",
    "createdAt": "2026-07-11T12:00:00.000Z"
  }
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 201 | Berhasil dibuat |
| 400 | Validasi gagal |
| 409 | Slug sudah digunakan |

---

### PUT `/api/v1/admin/cms/pages/:id`

Memperbarui halaman CMS.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "title": "string", "content": "string", "metaTitle": "string", "metaDescription": "string", "status": "DRAFT | PUBLISHED" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Halaman CMS berhasil diperbarui",
  "data": {
    "id": "cms001...",
    "title": "Tentang Kami",
    "status": "PUBLISHED",
    "updatedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### DELETE `/api/v1/admin/cms/pages/:id`

Menghapus halaman CMS.

| Field | Value |
|-------|-------|
| Method | `DELETE` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "message": "Halaman CMS berhasil dihapus"
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil dihapus |
| 404 | Halaman tidak ditemukan |

---

### GET `/api/v1/admin/cms/banners`

Mengambil daftar semua banner.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `status` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "id": "bnr001...",
        "title": "Selamat Datang di KomunaID",
        "imageUrl": "https://cdn.komuna.id/banners/welcome.jpg",
        "linkUrl": "/tentang-kami",
        "position": "HOME_TOP",
        "status": "ACTIVE",
        "startDate": "2026-07-01T00:00:00.000Z",
        "endDate": "2026-07-31T23:59:59.000Z",
        "order": 1,
        "createdAt": "2026-07-01T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

---

### POST `/api/v1/admin/cms/banners`

Membuat banner baru.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth | Super Admin |
| Body | `{ "title": "string (required)", "imageUrl": "string (required)", "linkUrl": "string (optional)", "position": "HOME_TOP | HOME_MIDDLE | SIDEBAR", "status": "ACTIVE | INACTIVE", "startDate": "ISO8601 (required)", "endDate": "ISO8601 (required)", "order": "number (optional)" }` |

**Request Body:**

```json
{
  "title": "Promosi Event Bulan Juli",
  "imageUrl": "https://cdn.komuna.id/banners/july-event.jpg",
  "linkUrl": "/events",
  "position": "HOME_TOP",
  "status": "ACTIVE",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2026-07-31T23:59:59.000Z",
  "order": 1
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Banner berhasil dibuat",
  "data": {
    "id": "bnr002...",
    "title": "Promosi Event Bulan Juli",
    "status": "ACTIVE",
    "createdAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### PUT `/api/v1/admin/cms/banners/:id`

Memperbarui banner.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | Sama seperti POST kecuali tidak semua field wajib |

**Response 200:**

```json
{
  "success": true,
  "message": "Banner berhasil diperbarui",
  "data": {
    "id": "bnr001...",
    "title": "Selamat Datang di KomunaID - Updated",
    "updatedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### DELETE `/api/v1/admin/cms/banners/:id`

Menghapus banner.

| Field | Value |
|-------|-------|
| Method | `DELETE` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "message": "Banner berhasil dihapus"
}
```

---

## 9. Categories Management

### GET `/api/v1/admin/categories`

Mengambil daftar semua kategori.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `type` (community \| event) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat001...",
      "name": "Lingkungan Hidup",
      "slug": "lingkungan-hidup",
      "type": "COMMUNITY",
      "icon": "leaf",
      "color": "#22C55E",
      "communityCount": 25,
      "eventCount": 48,
      "isActive": true,
      "order": 1
    }
  ]
}
```

---

### POST `/api/v1/admin/categories`

Membuat kategori baru.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth | Super Admin |
| Body | `{ "name": "string (required)", "type": "COMMUNITY | EVENT", "icon": "string (optional)", "color": "string (optional)", "order": "number (optional)" }` |

**Request Body:**

```json
{
  "name": "Pendidikan",
  "type": "COMMUNITY",
  "icon": "book",
  "color": "#3B82F6",
  "order": 2
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Kategori berhasil dibuat",
  "data": {
    "id": "cat002...",
    "name": "Pendidikan",
    "slug": "pendidikan",
    "type": "COMMUNITY"
  }
}
```

---

### PUT `/api/v1/admin/categories/:id`

Memperbarui kategori.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | `{ "name": "string", "icon": "string", "color": "string", "isActive": "boolean", "order": "number" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Kategori berhasil diperbarui",
  "data": {
    "id": "cat001...",
    "name": "Lingkungan Hidup",
    "isActive": true,
    "updatedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### DELETE `/api/v1/admin/categories/:id`

Menghapus kategori.

| Field | Value |
|-------|-------|
| Method | `DELETE` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "message": "Kategori berhasil dihapus"
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil dihapus |
| 409 | Kategori masih digunakan oleh komunitas/event |

---

## 10. Master Data

### GET/PUT `/api/v1/admin/master-data/provinces`

**GET** — Mengambil daftar provinsi.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prov001...",
      "name": "DKI Jakarta",
      "code": "31",
      "isActive": true
    }
  ]
}
```

**PUT** — Memperbarui data provinsi.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Body | `{ "provinces": [{ "id": "string", "name": "string", "code": "string", "isActive": "boolean" }] }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Data provinsi berhasil diperbarui",
  "data": {
    "updated": 34
  }
}
```

---

### GET/PUT `/api/v1/admin/master-data/cities`

Sama seperti `/provinces`, struktur data:

```json
{
  "id": "city001...",
  "name": "Jakarta Selatan",
  "code": "31.71",
  "provinceId": "prov001...",
  "isActive": true
}
```

---

### GET/PUT `/api/v1/admin/master-data/countries`

Sama seperti `/provinces`, struktur data:

```json
{
  "id": "cntry001...",
  "name": "Indonesia",
  "code": "ID",
  "flag": "🇮🇩",
  "isActive": true
}
```

---

### GET/PUT `/api/v1/admin/master-data/districts`

Sama seperti `/provinces`, struktur data:

```json
{
  "id": "dist001...",
  "name": "Kebayoran Baru",
  "code": "31.71.01",
  "cityId": "city001...",
  "isActive": true
}
```

---

### GET/PUT `/api/v1/admin/master-data/kelurahan`

Sama seperti `/provinces`, struktur data:

```json
{
  "id": "kel001...",
  "name": "Senayan",
  "code": "31.71.01.1001",
  "districtId": "dist001...",
  "isActive": true
}
```

---

### GET/PUT `/api/v1/admin/master-data/interests`

Sama seperti `/provinces`, struktur data:

```json
{
  "id": "int001...",
  "name": "Lingkungan Hidup",
  "icon": "leaf",
  "color": "#22C55E",
  "isActive": true
}
```

---

### GET/PUT `/api/v1/admin/master-data/tags`

Sama seperti `/provinces`, struktur data:

```json
{
  "id": "tag001...",
  "name": "volunteer",
  "slug": "volunteer",
  "usageCount": 120,
  "isActive": true
}
```

---

## 11. Audit Logs

### GET `/api/v1/admin/audit-logs`

Mengambil log audit sistem.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `action`, `entityType`, `userId`, `startDate`, `endDate` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log001...",
        "userId": "admin001...",
        "userName": "Super Admin",
        "action": "USER_SUSPENDED",
        "entityType": "User",
        "entityId": "clx123...",
        "description": "Pengguna Budi Santoso ditangguhkan",
        "metadata": {
          "reason": "Pelanggaran kebijakan",
          "duration": 30
        },
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-07-11T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000,
      "totalPages": 250
    }
  }
}
```

---

### GET `/api/v1/admin/audit-logs/user/:userId`

Mengambil log audit untuk pengguna tertentu.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `userId` |
| Query Params | `page`, `limit`, `startDate`, `endDate` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "name": "Budi Santoso"
    },
    "logs": [
      {
        "id": "log001...",
        "action": "USER_SUSPENDED",
        "entityType": "User",
        "description": "Pengguna ditangguhkan",
        "createdAt": "2026-07-11T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

## 12. Notifications

### GET `/api/v1/admin/notifications`

Mengambil daftar notifikasi yang dikirim admin.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `type`, `status` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "ntf001...",
        "title": "Pemeliharaan Sistem",
        "message": "Platform akan mengalami pemeliharaan pada 15 Juli 2026",
        "type": "SYSTEM_ANNOUNCEMENT",
        "status": "SENT",
        "recipientCount": 1250,
        "sentAt": "2026-07-11T08:00:00.000Z",
        "createdAt": "2026-07-11T07:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2
    }
  }
}
```

---

### POST `/api/v1/admin/notifications/broadcast`

Mengirim notifikasi broadcast ke semua pengguna.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth | Super Admin |
| Body | `{ "title": "string (required)", "message": "string (required)", "type": "SYSTEM_ANNOUNCEMENT | MAINTENANCE | POLICY_UPDATE", "targetRoles": ["USER", "COMMUNITY_ADMIN"] (optional, default: all), "sendEmail": "boolean (optional)" }` |

**Request Body:**

```json
{
  "title": "Pembaruan Kebijakan Privasi",
  "message": "Kami telah memperbarui kebijakan privasi kami. Silakan baca di halaman Kebijakan Privasi.",
  "type": "POLICY_UPDATE",
  "targetRoles": ["USER", "COMMUNITY_ADMIN"],
  "sendEmail": true
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Notifikasi broadcast berhasil dikirim",
  "data": {
    "id": "ntf002...",
    "title": "Pembaruan Kebijakan Privasi",
    "recipientCount": 1247,
    "sentAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### GET `/api/v1/admin/notification-templates/:id`

Mengambil detail template notifikasi.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "tpl001...",
    "name": "Welcome Email",
    "subject": "Selamat Datang di KomunaID!",
    "body": "<h1>Selamat Datang, {{name}}!</h1><p>Terdaftar sebagai {{role}} di KomunaID.</p>",
    "variables": ["name", "role"],
    "type": "EMAIL",
    "createdAt": "2026-01-01T08:00:00.000Z"
  }
}
```

---

### POST `/api/v1/admin/notification-templates`

Membuat template notifikasi baru.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth | Super Admin |
| Body | `{ "name": "string (required)", "subject": "string (required, untuk EMAIL type)", "body": "string (required)", "type": "EMAIL | IN_APP | PUSH", "variables": ["string"] (optional) }` |

**Response 201:**

```json
{
  "success": true,
  "message": "Template notifikasi berhasil dibuat",
  "data": {
    "id": "tpl002...",
    "name": "Volunteer Approval",
    "type": "EMAIL",
    "createdAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### PUT `/api/v1/admin/notification-templates/:id`

Memperbarui template notifikasi.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `id` |
| Body | Sama seperti POST |

**Response 200:**

```json
{
  "success": true,
  "message": "Template notifikasi berhasil diperbarui",
  "data": {
    "id": "tpl001...",
    "name": "Welcome Email",
    "updatedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### DELETE `/api/v1/admin/notification-templates/:id`

Menghapus template notifikasi.

| Field | Value |
|-------|-------|
| Method | `DELETE` |
| Auth | Super Admin |
| Params | `id` |

**Response 200:**

```json
{
  "success": true,
  "message": "Template notifikasi berhasil dihapus"
}
```

---

## 13. Settings

### GET `/api/v1/admin/settings`

Mengambil semua pengaturan platform.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "key": "platform.name",
      "value": "KomunaID",
      "type": "STRING",
      "description": "Nama platform",
      "group": "general"
    },
    {
      "key": "platform.maintenance_mode",
      "value": "false",
      "type": "BOOLEAN",
      "description": "Mode pemeliharaan",
      "group": "general"
    }
  ]
}
```

---

### GET `/api/v1/admin/settings/:key`

Mengambil pengaturan berdasarkan key.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Params | `key` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "key": "platform.name",
    "value": "KomunaID",
    "type": "STRING",
    "description": "Nama platform",
    "group": "general",
    "updatedAt": "2026-01-01T08:00:00.000Z"
  }
}
```

---

### PUT `/api/v1/admin/settings/:key`

Memperbarui pengaturan.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Params | `key` |
| Body | `{ "value": "string | number | boolean | json (required)" }` |

**Request Body:**

```json
{
  "value": true
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Pengaturan berhasil diperbarui",
  "data": {
    "key": "platform.maintenance_mode",
    "value": true,
    "updatedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### GET `/api/v1/admin/settings/platform/general`

Mengambil pengaturan umum platform.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "platformName": "KomunaID",
    "platformTagline": "Platform Komunitas Indonesia",
    "logoUrl": "https://cdn.komuna.id/logo.png",
    "faviconUrl": "https://cdn.komuna.id/favicon.ico",
    "primaryColor": "#22C55E",
    "contactEmail": "info@komuna.id",
    "supportEmail": "support@komuna.id",
    "maintenanceMode": false,
    "registrationEnabled": true,
    "defaultLanguage": "id",
    "timezone": "Asia/Jakarta"
  }
}
```

---

### PUT `/api/v1/admin/settings/platform/general`

Memperbarui pengaturan umum platform.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Body | `{ "platformName": "string", "platformTagline": "string", "logoUrl": "string", "faviconUrl": "string", "primaryColor": "string", "contactEmail": "string", "supportEmail": "string", "maintenanceMode": "boolean", "registrationEnabled": "boolean", "defaultLanguage": "string", "timezone": "string" }` |

**Request Body:**

```json
{
  "platformName": "KomunaID",
  "platformTagline": "Platform Komunitas Indonesia",
  "maintenanceMode": false,
  "registrationEnabled": true,
  "defaultLanguage": "id",
  "timezone": "Asia/Jakarta"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Pengaturan platform berhasil diperbarui",
  "data": {
    "platformName": "KomunaID",
    "maintenanceMode": false,
    "updatedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

## 14. Security

### GET `/api/v1/admin/security/login-history`

Mengambil riwayat login semua pengguna.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `userId`, `startDate`, `endDate`, `status` (success \| failed) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "login001...",
        "userId": "clx123...",
        "userName": "Budi Santoso",
        "email": "budi@example.com",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0",
        "device": "Chrome 125 on Windows 10",
        "location": "Jakarta, Indonesia",
        "status": "SUCCESS",
        "loginAt": "2026-07-11T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15000,
      "totalPages": 750
    }
  }
}
```

---

### GET `/api/v1/admin/security/failed-logins`

Mengambil daftar login yang gagal.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `email`, `startDate`, `endDate` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "failedLogins": [
      {
        "id": "fail001...",
        "email": "budi@example.com",
        "ipAddress": "103.25.48.12",
        "userAgent": "Mozilla/5.0...",
        "attemptCount": 3,
        "lastAttemptAt": "2026-07-11T07:50:00.000Z",
        "isBlocked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  }
}
```

---

### GET `/api/v1/admin/security/suspicious-activity`

Mengambil aktivitas mencurigakan yang terdeteksi.

| Field | Value |
|-------|-------|
| Method | `GET` |
| Auth | Super Admin |
| Query Params | `page`, `limit`, `type`, `severity`, `status` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "susp001...",
        "type": "BRUTE_FORCE_ATTEMPT",
        "severity": "HIGH",
        "description": "Percobaan login berulang dari IP 103.25.48.12",
        "userId": "clx123...",
        "userName": "Budi Santoso",
        "ipAddress": "103.25.48.12",
        "status": "FLAGGED",
        "detectedAt": "2026-07-11T07:50:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

---

### POST `/api/v1/admin/security/force-logout`

Memaksa logout pengguna dari semua sesi.

| Field | Value |
|-------|-------|
| Method | `POST` |
| Auth | Super Admin |
| Body | `{ "userId": "string (required)", "reason": "string (optional)" }` |

**Request Body:**

```json
{
  "userId": "clx123...",
  "reason": "Aktivitas mencurigakan terdeteksi"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Pengguna berhasil dipaksa logout dari semua sesi",
  "data": {
    "userId": "clx123...",
    "sessionsTerminated": 3,
    "forcedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

### PUT `/api/v1/admin/security/lock-user`

Mengunci akun pengguna (mencegah login).

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Body | `{ "userId": "string (required)", "reason": "string (required)", "duration": "number (hari, opsional)" }` |

**Request Body:**

```json
{
  "userId": "clx123...",
  "reason": "Percobaan brute force login",
  "duration": 7
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Akun pengguna berhasil dikunci",
  "data": {
    "userId": "clx123...",
    "lockedAt": "2026-07-11T12:00:00.000Z",
    "lockedUntil": "2026-07-18T12:00:00.000Z",
    "reason": "Percobaan brute force login"
  }
}
```

| Status Code | Deskripsi |
|-------------|-----------|
| 200 | Berhasil |
| 400 | Pengguna sudah dikunci |
| 403 | Tidak boleh mengunci akun Super Admin lain |

---

### PUT `/api/v1/admin/security/unlock-user`

Membuka kunci akun pengguna.

| Field | Value |
|-------|-------|
| Method | `PUT` |
| Auth | Super Admin |
| Body | `{ "userId": "string (required)" }` |

**Response 200:**

```json
{
  "success": true,
  "message": "Akun pengguna berhasil dibuka kunci",
  "data": {
    "userId": "clx123...",
    "unlockedAt": "2026-07-11T12:00:00.000Z"
  }
}
```

---

## Error Response Format

Semua endpoint mengembalikan error dalam format yang konsisten:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "details": [
      {
        "field": "reason",
        "message": "Reason is required"
      }
    ]
  }
}
```

| Status Code | Error Code | Deskripsi |
|-------------|------------|-----------|
| 400 | `VALIDATION_ERROR` | Request body tidak valid |
| 401 | `UNAUTHORIZED` | Token tidak ada atau tidak valid |
| 403 | `FORBIDDEN` | Tidak memiliki izin |
| 404 | `NOT_FOUND` | Resource tidak ditemukan |
| 409 | `CONFLICT` | Konflik data (duplikat) |
| 422 | `UNPROCESSABLE_ENTITY` | Data tidak dapat diproses |
| 429 | `RATE_LIMITED` | Terlalu banyak request |
| 500 | `INTERNAL_SERVER_ERROR` | Kesalahan server internal |

---

## Rate Limiting

Semua endpoint admin dikenakan rate limiting:

| Scope | Limit | Window |
|-------|-------|--------|
| Per user | 100 requests | 1 menit |
| Per IP | 200 requests | 1 menit |
| Broadcast notification | 5 requests | 1 jam |
| Force logout | 10 requests | 1 menit |
