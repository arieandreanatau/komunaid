# 14 — Prisma Schema Changes

> KomunaID Super Admin MVP — Platform Governance Module

---

## Ringkasan Perubahan

Modul Super Admin MVP menambahkan tabel baru dan memodifikasi tabel yang sudah ada untuk mendukung CMS, audit logging, keamanan, dan manajemen master data.

### Tabel Baru: LoginHistory, CmsPage, CmsBanner, Setting, Notification, NotificationTemplate, Registration, VolunteerApplication, Province, City, District, Kelurahan, Country, Interest, Tag

### Tabel Modifikasi: User, Community, Event, Volunteer, Report, Category

---

## 1. LoginHistory (BARU)

Mencatat seluruh percobaan login untuk keamanan dan audit.

```prisma
model LoginHistory {
  id            String       @id @default(cuid())
  userId        String?
  email         String
  ipAddress     String?
  userAgent     String?
  device        String?
  location      String?
  status        LoginStatus
  failureReason String?
  metadata      Json?
  createdAt     DateTime     @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([email])
  @@index([ipAddress])
  @@index([status])
  @@index([createdAt])
  @@map("login_history")
}

enum LoginStatus {
  SUCCESS
  FAILED
  BLOCKED
}
```

---

## 2. CmsPage (BARU)

Halaman konten statis (Tentang Kami, Kebijakan Privasi, Syarat dan Ketentuan).

```prisma
model CmsPage {
  id              String         @id @default(cuid())
  title           String
  slug            String         @unique
  content         String         @db.LongText
  metaTitle       String?
  metaDescription String?
  status          CmsPageStatus  @default(DRAFT)
  authorId        String
  publishedAt     DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  author User @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@index([slug])
  @@index([status])
  @@index([authorId])
  @@map("cms_pages")
}

enum CmsPageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

---

## 3. CmsBanner (BARU)

Banner promosi di halaman utama.

```prisma
model CmsBanner {
  id        String         @id @default(cuid())
  title     String
  imageUrl  String
  linkUrl   String?
  position  BannerPosition
  status    BannerStatus   @default(ACTIVE)
  startDate DateTime
  endDate   DateTime
  order     Int            @default(0)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  @@index([position])
  @@index([status])
  @@index([startDate, endDate])
  @@index([order])
  @@map("cms_banners")
}

enum BannerPosition {
  HOME_TOP
  HOME_MIDDLE
  SIDEBAR
}

enum BannerStatus {
  ACTIVE
  INACTIVE
}
```

---

## 4. User (MODIFIKASI)

Field tambahan untuk status, suspensi, lock, dan login tracking.

```diff
model User {
  id                String         @id @default(cuid())
  name              String
  email             String         @unique
+  status            UserStatus     @default(ACTIVE)
+  suspendedAt       DateTime?
+  suspendedUntil    DateTime?
+  suspensionReason  String?
+  archivedAt        DateTime?
+  lastLoginAt       DateTime?
+  failedLoginCount  Int            @default(0)
+  lockedAt          DateTime?
+  lockedUntil       DateTime?
+  lockReason        String?
+  loginHistory      LoginHistory[]
+  auditLogs         AuditLog[]
+  reports           Report[]       @relation("ReportReporter")
  @@map("users")
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
  DELETED
}
```

---

## 5. Community (MODIFIKASI)

Field tambahan untuk status approval dan moderasi.

```diff
model Community {
  id          String          @id @default(cuid())
  name        String
  slug        String          @unique
+  status      CommunityStatus @default(ACTIVE)
+  suspendedAt DateTime?
+  suspensionReason String?
+  rejectedAt  DateTime?
+  rejectionReason String?
+  revisionNote String?
+  reviewedBy  String?
+  reviewedAt  DateTime?
+  approvedAt  DateTime?
  @@map("communities")
}

enum CommunityStatus {
  PENDING_APPROVAL
  ACTIVE
  SUSPENDED
  REJECTED
  REVISION_REQUIRED
}
```

---

## 6. Event (MODIFIKASI)

Field tambahan untuk lifecycle event.

```diff
model Event {
  id          String      @id @default(cuid())
  title       String
+  status      EventStatus @default(DRAFT)
+  suspendedAt DateTime?
+  suspensionReason String?
+  cancelledAt DateTime?
+  cancellationReason String?
+  archivedAt  DateTime?
+  deletedAt   DateTime?
+  publishedAt DateTime?
+  registrations Registration[]
  @@map("events")
}

enum EventStatus {
  DRAFT
  PUBLISHED
  SUSPENDED
  CANCELLED
  ARCHIVED
  DELETED
}
```

---

## 7. Volunteer (MODIFIKASI)

Field tambahan untuk status relawan.

```diff
model Volunteer {
  id          String          @id @default(cuid())
  userId      String
+  status      VolunteerStatus @default(ACTIVE)
+  suspendedAt DateTime?
+  archivedAt  DateTime?
+  deletedAt   DateTime?
+  applications VolunteerApplication[]
  @@map("volunteers")
}

enum VolunteerStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
  DELETED
}
```

---

## 8. Report (MODIFIKASI)

Field tambahan untuk moderasi laporan.

```diff
model Report {
  id          String            @id @default(cuid())
+  reporterId  String?
+  targetType  ReportTargetType
+  targetId    String
+  type        ReportType
+  severity    ReportSeverity   @default(MEDIUM)
+  status      ReportStatus     @default(PENDING)
+  description String?
+  resolution  String?
+  resolvedAt  DateTime?
+  resolvedBy  String?
+  reviewedAt  DateTime?
+  warnedAt    DateTime?
+  warningMessage String?
+  createdAt   DateTime         @default(now())
+  updatedAt   DateTime         @updatedAt
+  reporter    User?            @relation("ReportReporter", fields: [reporterId], references: [id], onDelete: SetNull)
  @@map("reports")
}

enum ReportTargetType { USER, COMMUNITY, EVENT, VOLUNTEER }
enum ReportType { SPAM, ABUSE, INAPPROPRIATE_CONTENT, HARASSMENT, FAKE_ACCOUNT, OTHER }
enum ReportSeverity { LOW, MEDIUM, HIGH, CRITICAL }
enum ReportStatus { PENDING, UNDER_REVIEW, RESOLVED, DISMISSED }
```

---

## 9. AuditLog (BARU atau MODIFIKASI)

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String
  entityType  String
  entityId    String?
  description String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([action])
  @@index([entityType])
  @@index([entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 10. Setting (BARU)

```prisma
model Setting {
  id          String      @id @default(cuid())
  key         String      @unique
  value       String      @db.Text
  type        SettingType @default(STRING)
  description String?
  group       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([key])
  @@index([group])
  @@map("settings")
}

enum SettingType { STRING, NUMBER, BOOLEAN, JSON }
```

---

## 11. Notification (BARU)

```prisma
model Notification {
  id             String             @id @default(cuid())
  title          String
  message        String             @db.Text
  type           NotificationType
  status         NotificationStatus @default(DRAFT)
  targetRoles    String[]
  recipientCount Int                @default(0)
  sendEmail      Boolean            @default(false)
  sentAt         DateTime?
  createdBy      String?
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  @@index([type])
  @@index([status])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType { SYSTEM_ANNOUNCEMENT, MAINTENANCE, POLICY_UPDATE, CUSTOM }
enum NotificationStatus { DRAFT, SENT, FAILED }
```

---

## 12. NotificationTemplate (BARU)

```prisma
model NotificationTemplate {
  id        String       @id @default(cuid())
  name      String       @unique
  subject   String?
  body      String       @db.LongText
  variables String[]
  type      TemplateType
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@map("notification_templates")
}

enum TemplateType { EMAIL, IN_APP, PUSH }
```

---

## 13. Category (MODIFIKASI)

```diff
model Category {
  id        String       @id @default(cuid())
  name      String
  slug      String       @unique
+  type      CategoryType
+  icon      String?
+  color     String?
+  isActive  Boolean      @default(true)
+  order     Int          @default(0)
+  createdAt DateTime     @default(now())
+  updatedAt DateTime     @updatedAt
  @@index([type])
  @@index([isActive])
  @@map("categories")
}

enum CategoryType { COMMUNITY, EVENT }
```

---

## 14. Master Data Models (BARU)

```prisma
model Province {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique
  isActive  Boolean  @default(true)
  cities    City[]
  createdAt DateTime @default(now())
  @@map("provinces")
}

model City {
  id         String    @id @default(cuid())
  name       String
  code       String    @unique
  provinceId String
  isActive   Boolean   @default(true)
  province   Province  @relation(fields: [provinceId], references: [id])
  districts  District[]
  @@index([provinceId])
  @@map("cities")
}

model District {
  id        String    @id @default(cuid())
  name      String
  code      String    @unique
  cityId    String
  isActive  Boolean   @default(true)
  city      City      @relation(fields: [cityId], references: [id])
  kelurahan Kelurahan[]
  @@index([cityId])
  @@map("districts")
}

model Kelurahan {
  id         String   @id @default(cuid())
  name       String
  code       String   @unique
  districtId String
  isActive   Boolean  @default(true)
  district   District @relation(fields: [districtId], references: [id])
  @@index([districtId])
  @@map("kelurahan")
}

model Country {
  id       String  @id @default(cuid())
  name     String
  code     String  @unique
  flag     String?
  isActive Boolean @default(true)
  @@map("countries")
}

model Interest {
  id       String  @id @default(cuid())
  name     String  @unique
  icon     String?
  color    String?
  isActive Boolean @default(true)
  @@map("interests")
}

model Tag {
  id         String  @id @default(cuid())
  name       String  @unique
  slug       String  @unique
  usageCount Int     @default(0)
  isActive   Boolean @default(true)
  @@map("tags")
}
```

---

## 15. Registration (BARU)

```prisma
model Registration {
  id           String             @id @default(cuid())
  eventId      String
  userId       String
  status       RegistrationStatus @default(PENDING)
  registeredAt DateTime           @default(now())
  attendedAt   DateTime?

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
  @@index([status])
  @@map("registrations")
}

enum RegistrationStatus { PENDING, CONFIRMED, ATTENDED, CANCELLED }
```

---

## 16. VolunteerApplication (BARU)

```prisma
model VolunteerApplication {
  id              String            @id @default(cuid())
  volunteerId     String
  eventId         String
  message         String?           @db.Text
  status          ApplicationStatus @default(PENDING)
  appliedAt       DateTime          @default(now())
  reviewedAt      DateTime?
  reviewedBy      String?
  rejectionReason String?
  notes           String?           @db.Text

  volunteer Volunteer @relation(fields: [volunteerId], references: [id], onDelete: Cascade)
  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([volunteerId, eventId])
  @@index([volunteerId])
  @@index([eventId])
  @@index([status])
  @@map("volunteer_applications")
}

enum ApplicationStatus { PENDING, APPROVED, REJECTED }
```

---

## Migration Notes

### Urutan Migrasi

1. Tabel Master Data (provinces, cities, countries, districts, kelurahan, interests, tags)
2. Tabel User modifikasi (tambah field status, suspensi, lock)
3. Tabel LoginHistory (FK ke users)
4. Tabel AuditLog (FK ke users)
5. Tabel Setting
6. Tabel Community modifikasi
7. Tabel Category modifikasi
8. Tabel Event modifikasi
9. Tabel Registration (FK ke events, users)
10. Tabel Volunteer modifikasi
11. Tabel VolunteerApplication (FK ke volunteers, events)
12. Tabel Report modifikasi
13. Tabel CmsPage (FK ke users)
14. Tabel CmsBanner
15. Tabel Notification
16. Tabel NotificationTemplate

### Data Migration

- Field `isActive` pada User diubah ke enum `UserStatus`
- Semua user `isActive = true` mendapat status `ACTIVE`
- Field `isApproved` pada Community diubah ke enum `CommunityStatus`
- Komunitas `isApproved = true` mendapat status `ACTIVE`
- Komunitas `isApproved = false` mendapat status `PENDING_APPROVAL`
- Field status Event existing di-mapping ke enum baru

### Rollback

- Simpan backup database sebelum migrasi
- Migrasi bersifat additive (field baru, tabel baru)
- Field lama tidak dihapus, hanya ditambahkan field baru
- Rollback dilakukan dengan restore backup
