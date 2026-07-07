# Role Access Overview — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Role List

| Code | Role               | Level | Scope                   | Description                 |
| ---- | ------------------ | ----- | ----------------------- | --------------------------- |
| R-01 | Guest / Visitor    | 0     | Global                  | Pengunjung belum login      |
| R-02 | Member / User      | 10    | Global                  | User terdaftar              |
| R-03 | Community Owner    | 40    | Community ID            | Pemilik komunitas           |
| R-04 | Community Admin    | 30    | Community ID            | Admin operasional komunitas |
| R-05 | Event Manager      | 20    | Event ID / Community ID | Pengelola event             |
| R-06 | Organization Owner | 60    | Organization ID         | Pemilik organisasi          |
| R-07 | Organization Admin | 50    | Organization ID         | Admin organisasi            |
| R-08 | Platform Admin     | 80    | Global                  | Admin internal platform     |
| R-09 | Super Admin        | 100   | Global                  | Kontrol penuh platform      |

---

## 2. Role Hierarchy

```
Super Admin (100)
  └── Platform Admin (80)
       └── Organization Owner (60)
       │    └── Organization Admin (50)
       └── Community Owner (40)
       │    └── Community Admin (30)
       │         └── Event Manager (20)
       └── Member (10)
            └── Guest (0)
```

---

## 3. Permission Matrix

### 3.1 Public Pages

| Action                   | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| ------------------------ | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| View landing page        | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| View community directory | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| View community detail    | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| View event directory     | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| View event detail        | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| View about, FAQ, contact | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |

### 3.2 Authentication

| Action          | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| --------------- | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| Register        | ✅    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Login           | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Logout          | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Forgot password | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Reset password  | ✅    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Admin login     | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |

### 3.3 Profile

| Action           | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| ---------------- | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| View own profile | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Edit own profile | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Upload avatar    | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Change password  | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |

### 3.4 Community

| Action                    | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| ------------------------- | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| Create community          | ❌    | ✅     | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Edit own community        | ❌    | ❌     | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Delete own community      | ❌    | ❌     | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Join community (open)     | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Join community (approval) | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Leave community           | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Approve member            | ❌    | ❌     | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Reject member             | ❌    | ❌     | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Ban member                | ❌    | ❌     | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Assign community admin    | ❌    | ❌     | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Create post               | ❌    | ✅*    | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Moderate post             | ❌    | ❌     | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Approve/suspend community | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |

*only for members of that community

### 3.5 Event

| Action              | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| ------------------- | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| Create event        | ❌    | ❌     | ✅  | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  |
| Edit event          | ❌    | ❌     | ✅  | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  |
| Delete event        | ❌    | ❌     | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| Register for event  | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Cancel registration | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| View attendees      | ❌    | ❌     | ✅  | ✅  | ✅  | ❌  | ❌  | ❌  | ❌  |
| Check-in attendee   | ❌    | ❌     | ✅  | ❌  | ✅  | ❌  | ❌  | ❌  | ❌  |
| Approve event       | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |

### 3.6 Organization

| Action              | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| ------------------- | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| Create organization | ❌    | ✅     | ✅  | ❌  | ❌  | ✅  | ❌  | ❌  | ❌  |
| Edit organization   | ❌    | ❌     | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | ❌  |
| Delete organization | ❌    | ❌     | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | ❌  |
| Invite team         | ❌    | ❌     | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | ❌  |
| Assign org admin    | ❌    | ❌     | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | ❌  |
| Approve org         | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |

### 3.7 Notification

| Action             | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| ------------------ | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| View notifications | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Mark as read       | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| Mark all as read   | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |

### 3.8 Report

| Action         | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| -------------- | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| Submit report  | ❌    | ✅     | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| View reports   | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |
| Resolve report | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |

### 3.9 Admin

| Action            | Guest | Member | CO  | CA  | EM  | OO  | OA  | PA  | SA  |
| ----------------- | ----- | ------ | --- | --- | --- | --- | --- | --- | --- |
| View dashboard    | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |
| View users        | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |
| Suspend user      | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |
| Assign role       | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  |
| Manage categories | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  |
| View audit log    | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  |
| Manage settings   | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  |
| Manage admins     | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  |
| View analytics    | ❌    | ❌     | ❌  | ❌  | ❌  | ❌  | ❌  | ✅  | ✅  |

---

## 4. Scoped Permission Rules

| Rule  | Description                                                              |
| ----- | ------------------------------------------------------------------------ |
| SP-01 | Community Owner hanya bisa mengedit komunitas miliknya                   |
| SP-02 | Community Admin hanya bisa mengakses komunitas yang di-assign            |
| SP-03 | Event Manager hanya bisa mengelola event yang di-assign                  |
| SP-04 | Organization Owner hanya bisa mengedit organisasi miliknya               |
| SP-05 | Organization Admin hanya bisa mengakses organisasi yang di-assign        |
| SP-06 | Approval tidak boleh dilakukan oleh pemilik request                      |
| SP-07 | Super Admin bisa akses semua scope                                       |
| SP-08 | Platform Admin bisa akses semua scope kecuali settings & role management |

---

## 5. Dashboard Routes

| Role               | Dashboard Route |
| ------------------ | --------------- |
| Guest              | `/` (landing)   |
| Member             | `/dashboard`    |
| Community Owner    | `/dashboard`    |
| Community Admin    | `/dashboard`    |
| Event Manager      | `/dashboard`    |
| Organization Owner | `/dashboard`    |
| Organization Admin | `/dashboard`    |
| Platform Admin     | `/admin`        |
| Super Admin        | `/admin`        |

---

## 6. Role Request Flow

1. Member mengajukan role tambahan dari dashboard
2. Pilih jenis: Community Owner, Organization Owner, Event Manager, dll
3. Isi data pendukung
4. Admin review & approve/reject
5. Jika approved, role scoped ditambahkan
6. Jika rejected, alasan disimpan

---

## 7. Notes

- Semua permission divalidasi di backend, bukan hanya frontend.
- Setiap entity harus dicek ownership/assignment.
- Approval tidak boleh dilakukan oleh pemilik request.
- Semua perubahan role, approval, suspend masuk audit log.
- Later scope: gamification, advanced analytics, public API.
