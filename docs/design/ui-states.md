# UI States — KomunaID

## State Matrix per Screen Type

### Loading State

| Trigger             | Display                   | Duration              |
| ------------------- | ------------------------- | --------------------- |
| Initial page load   | Skeleton placeholder      | Until data loaded     |
| API request pending | Spinner overlay or inline | Until response        |
| Form submission     | Button spinner + disabled | Until response        |
| Filter/search       | Inline spinner            | Until results         |
| Pagination          | Skeleton on content area  | Until new page loaded |

### Empty State

| Trigger               | Display                           | Action                 |
| --------------------- | --------------------------------- | ---------------------- |
| No data (first time)  | EmptyState with illustration      | CTA to create/learn    |
| No search results     | EmptyState "Tidak ditemukan"      | Clear filters button   |
| No filter results     | EmptyState "Tidak ada hasil"      | Clear filters button   |
| No notifications      | EmptyState "Belum ada notifikasi" | —                      |
| No bookmarks          | EmptyState "Belum ada bookmark"   | Browse communities CTA |
| No communities joined | EmptyState "Belum ada komunitas"  | Browse communities CTA |
| No events registered  | EmptyState "Belum ada event"      | Browse events CTA      |
| No reports submitted  | EmptyState "Belum ada laporan"    | —                      |
| No activity           | EmptyState "Belum ada aktivitas"  | —                      |

### Success State

| Trigger           | Display                               | Duration        |
| ----------------- | ------------------------------------- | --------------- |
| Form submitted    | Toast "Berhasil disimpan"             | 5 seconds       |
| Action completed  | Toast with success icon               | 5 seconds       |
| Community created | Toast + redirect                      | 5 seconds       |
| Event created     | Toast + redirect                      | 5 seconds       |
| Profile updated   | Toast "Profil berhasil diperbarui"    | 5 seconds       |
| Password changed  | Toast + re-login prompt               | Until dismissed |
| Report submitted  | Toast "Laporan berhasil dikirim"      | 5 seconds       |
| Join request sent | Toast "Permintaan bergabung terkirim" | 5 seconds       |
| Bookmark added    | Toast "Ditambahkan ke bookmark"       | 3 seconds       |
| Bookmark removed  | Toast "Dihapus dari bookmark"         | 3 seconds       |
| Member banned     | Toast "Anggota berhasil dibanned"     | 5 seconds       |
| Approved          | Toast "Berhasil disetujui"            | 5 seconds       |
| Rejected          | Toast "Berhasil ditolak"              | 5 seconds       |

### Warning State

| Trigger              | Display                                   | Duration     |
| -------------------- | ----------------------------------------- | ------------ |
| Unsaved changes      | Modal "Ada perubahan yang belum disimpan" | Until action |
| Action confirmation  | ConfirmDialog with warning                | Until action |
| Session expiring     | Toast warning "Sesi akan habis"           | 10 seconds   |
| Capacity nearly full | Badge "H tersisa" on event card           | Persistent   |
| Pending approval     | Badge "Menunggu persetujuan"              | Persistent   |

### Error State

| Trigger               | Display                                  | Duration          |
| --------------------- | ---------------------------------------- | ----------------- |
| API error             | Toast error with message                 | 5 seconds         |
| Network error         | Toast error "Koneksi terputus"           | Until retry       |
| Validation error      | Inline field errors                      | Until corrected   |
| Form submission error | Toast error + field highlights           | Until corrected   |
| Server error (500)    | ErrorState page with retry               | Persistent        |
| Not found (404)       | ErrorState page with home link           | Persistent        |
| Forbidden (403)       | ErrorState "Akses ditolak"               | Persistent        |
| Rate limited          | Toast warning "Terlalu banyak percobaan" | Duration from API |
| Session expired       | Redirect to /login                       | Immediate         |

### Permission Denied State

| Trigger                   | Display                                      | Behavior                 |
| ------------------------- | -------------------------------------------- | ------------------------ |
| Insufficient role         | ErrorState "Anda tidak memiliki akses"       | Show back button         |
| Community not approved    | Badge "Menunggu persetujuan"                 | Hide management features |
| Organization not approved | Badge "Menunggu persetujuan"                 | Hide management features |
| Event not approved        | Badge "Draft" or "Menunggu persetujuan"      | Hide publish features    |
| User suspended            | ErrorState "Akun Anda ditangguhkan" + reason | Block all actions        |
| Community suspended       | Badge "Ditangguhkan" + reason                | Hide join button         |
| Organization suspended    | Badge "Ditangguhkan" + reason                | Hide join button         |

### Maintenance State

| Trigger               | Display                               | Behavior         |
| --------------------- | ------------------------------------- | ---------------- |
| Platform maintenance  | Full page "Sedang dalam pemeliharaan" | Block all access |
| Scheduled maintenance | Banner + countdown                    | Allow read-only  |

### Offline State

| Trigger              | Display                     | Behavior            |
| -------------------- | --------------------------- | ------------------- |
| Network disconnected | Toast "Anda sedang offline" | Queue actions       |
| Network restored     | Toast "Koneksi kembali"     | Sync queued actions |

### Skeleton State

| Component  | Skeleton Pattern                                   |
| ---------- | -------------------------------------------------- |
| Card       | Rectangle (banner) + 2 lines (title + description) |
| Table row  | 4 columns of varying width                         |
| List item  | Circle (avatar) + 2 lines                          |
| Profile    | Circle (avatar) + 3 lines                          |
| Stats card | 1 large line (value) + 1 small line (label)        |

---

## State Transitions

### Form Submission Flow

```
Default → [Submit] → Loading → Success → Default
                                ↓ (error)
                              Error → [Retry] → Loading
```

### CRUD Flow

```
List (Empty/Loaded) → [Create] → Form → Loading → Success → List
List (Loaded) → [Edit] → Form → Loading → Success → List
List (Loaded) → [Delete] → Confirm → Loading → Success → List
```

### Approval Flow

```
Pending → [Approve] → Loading → Approved
Pending → [Reject] → Reason Input → Loading → Rejected
```

### Authentication Flow

```
Login Form → [Submit] → Loading → Dashboard
                         ↓ (error)
                       Error (invalid credentials)
                         ↓ (suspended)
                       Error (account suspended)
```

---

## State Component Mapping

| State              | Component                   | File                                     |
| ------------------ | --------------------------- | ---------------------------------------- |
| Loading (inline)   | `<Spinner>`                 | `components/feedback/spinner.tsx`        |
| Loading (page)     | `<LoadingState>`            | `components/ui/loading-state.tsx`        |
| Loading (skeleton) | `<Skeleton>`                | `components/ui/skeleton.tsx`             |
| Empty              | `<EmptyState>`              | `components/ui/empty-state.tsx`          |
| Error (page)       | `<ErrorState>`              | `components/ui/error-state.tsx`          |
| Error (inline)     | `<Alert variant="error">`   | `components/ui/alert.tsx`                |
| Success (toast)    | `<Toast variant="success">` | `components/feedback/toast.tsx`          |
| Warning (toast)    | `<Toast variant="warning">` | `components/feedback/toast.tsx`          |
| Warning (alert)    | `<Alert variant="warning">` | `components/ui/alert.tsx`                |
| Confirmation       | `<ConfirmDialog>`           | `components/feedback/confirm-dialog.tsx` |
| Progress           | `<ProgressBar>`             | `components/feedback/progress-bar.tsx`   |
