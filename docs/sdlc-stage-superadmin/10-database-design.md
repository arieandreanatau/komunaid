# Database Design - KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan desain database lengkap untuk modul Platform Governance KomunaID. Database menggunakan MySQL dengan Prisma ORM. Semua model, field, relasi, dan indeks didefinisikan secara detail.

---

## 2. Database Overview

### 2.1 Tables

| Table | Deskripsi | Records Est. |
|-------|-----------|-------------|
| `admins` | Data admin panel | 10-50 |
| `login_history` | Riwayat login admin | 10,000-100,000 |
| `users` | Data pengguna platform | 10,000-1,000,000 |
| `communities` | Data komunitas | 100-10,000 |
| `community_approvals` | Pengajuan persetujuan komunitas | 500-50,000 |
| `community_categories` | Kategori komunitas | 10-100 |
| `community_members` | Anggota komunitas | 10,000-1,000,000 |
| `events` | Data event | 500-50,000 |
| `event_participants` | Peserta event | 10,000-500,000 |
| `volunteers` | Data volunteer | 500-10,000 |
| `volunteer_assignments` | Penugasan volunteer | 1,000-50,000 |
| `reports` | Laporan moderasi | 1,000-100,000 |
| `moderation_actions` | Tindakan moderasi | 500-50,000 |
| `cms_pages` | Halaman CMS | 10-100 |
| `cms_page_versions` | Versi halaman CMS | 50-500 |
| `cms_banners` | Banner CMS | 5-50 |
| `cms_media` | Media CMS | 100-1,000 |
| `notifications` | Notifikasi | 100,000-10,000,000 |
| `notification_templates` | Template notifikasi | 20-100 |
| `audit_logs` | Log audit aktivitas | 100,000-10,000,000 |
| `data_master_categories` | Kategori data master | 10-50 |
| `data_master_tags` | Tag data master | 50-500 |
| `data_master_skills` | Skill data master | 50-200 |
| `data_master_locations` | Lokasi data master | 100-500 |
| `platform_config` | Konfigurasi platform | 20-100 |
| `admin_sessions` | Sesi admin aktif | 5-50 |
| `ip_whitelist` | IP whitelist | 5-20 |
| `rate_limit_config` | Konfigurasi rate limiting | 10-50 |
| `password_policy` | Kebijakan password | 1-5 |
| `security_alerts` | Alert keamanan | 10-500 |

---

## 3. Prisma Models

### 3.1 Admin

```prisma
model Admin {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  passwordHash  String    @map("password_hash")
  role          AdminRole @default(PLATFORM_ADMIN)
  avatarUrl     String?   @map("avatar_url")
  bio           String?   @db.Text
  isActive      Boolean   @default(true) @map("is_active")
  twoFaEnabled  Boolean   @default(false) @map("two_fa_enabled")
  twoFaSecret   String?   @map("two_fa_secret")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  loginHistory      LoginHistory[]
  sessions          AdminSession[]
  auditLogs         AuditLog[]
  notifications     Notification[]            @relation("NotificationRecipient")

  @@map("admins")
}

enum AdminRole {
  SUPER_ADMIN
  PLATFORM_ADMIN
}
```

**Indexes:**
- `idx_admins_email` on `email` (unique)
- `idx_admins_role` on `role`
- `idx_admins_is_active` on `is_active`

---

### 3.2 LoginHistory

```prisma
model LoginHistory {
  id          String   @id @default(uuid())
  adminId     String   @map("admin_id")
  email       String
  ipAddress   String   @map("ip_address") @db.VarChar(45)
  userAgent   String   @map("user_agent") @db.VarChar(500)
  status      LoginStatus
  failureReason String? @map("failure_reason") @db.VarChar(200)
  createdAt   DateTime @default(now()) @map("created_at")

  admin Admin @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([createdAt])
  @@index([status])
  @@map("login_history")
}

enum LoginStatus {
  SUCCESS
  FAILED
  LOCKED
}
```

**Indexes:**
- `idx_login_history_admin_id` on `admin_id`
- `idx_login_history_created_at` on `created_at`
- `idx_login_history_status` on `status`
- `idx_login_history_email_status` on `email, status`

---

### 3.3 User

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String
  passwordHash    String    @map("password_hash")
  phone           String?   @db.VarChar(20)
  avatarUrl       String?   @map("avatar_url")
  bio             String?   @db.Text
  status          UserStatus @default(ACTIVE)
  role            UserRole  @default(MEMBER)
  warningCount    Int       @default(0) @map("warning_count")
  warningLevel    Int       @default(0) @map("warning_level")
  suspendedAt     DateTime? @map("suspended_at")
  suspendedUntil  DateTime? @map("suspended_until")
  suspendedBy     String?   @map("suspended_by")
  suspensionReason String?  @map("suspension_reason") @db.Text
  deactivatedAt   DateTime? @map("deactivated_at")
  deactivatedBy   String?   @map("deactivated_by")
  deactivationReason String? @map("deactivation_reason") @db.Text
  lastActiveAt    DateTime? @map("last_active_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  communityMemberships CommunityMember[]
  events               EventParticipant[]
  volunteerProfile     Volunteer?
  reportsFiled         Report[]              @relation("Reporter")
  reportsAgainst       Report[]              @relation("ReportedUser")
  moderationActions    ModerationAction[]
  notifications        Notification[]        @relation("NotificationRecipient")

  @@index([email])
  @@index([status])
  @@index([role])
  @@index([warning_count])
  @@index([created_at])
  @@map("users")
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PERMANENT_SUSPENDED
}

enum UserRole {
  MEMBER
  COMMUNITY_ADMIN
  PLATFORM_ADMIN
  SUPER_ADMIN
}
```

**Indexes:**
- `idx_users_email` on `email` (unique)
- `idx_users_status` on `status`
- `idx_users_role` on `role`
- `idx_users_warning_count` on `warning_count`
- `idx_users_created_at` on `created_at`
- `idx_users_name_search` on `name`

---

### 3.4 Community

```prisma
model Community {
  id              String          @id @default(uuid())
  name            String
  slug            String          @unique
  description     String          @db.Text
  logoUrl         String?         @map("logo_url")
  coverUrl        String?         @map("cover_url")
  categoryId      String?         @map("category_id")
  status          CommunityStatus @default(ACTIVE)
  suspendedAt     DateTime?       @map("suspended_at")
  suspendedBy     String?         @map("suspended_by")
  suspensionReason String?        @map("suspension_reason") @db.Text
  memberCount     Int             @default(0) @map("member_count")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  category        CommunityCategory? @relation(fields: [categoryId], references: [id])
  approval        CommunityApproval?
  members         CommunityMember[]
  events          Event[]

  @@index([slug])
  @@index([status])
  @@index([category_id])
  @@index([created_at])
  @@map("communities")
}

enum CommunityStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

**Indexes:**
- `idx_communities_slug` on `slug` (unique)
- `idx_communities_status` on `status`
- `idx_communities_category_id` on `category_id`
- `idx_communities_created_at` on `created_at`

---

### 3.5 CommunityApproval

```prisma
model CommunityApproval {
  id              String               @id @default(uuid())
  communityName   String               @map("community_name")
  description     String               @db.Text
  categoryId      String               @map("category_id")
  applicantId     String               @map("applicant_id")
  status          ApprovalStatus       @default(PENDING_REVIEW)
  logoUrl         String?              @map("logo_url")
  foundedByName   String?              @map("founded_by_name")
  reviewNotes     String?              @map("review_notes") @db.Text
  specificChanges String?              @map("specific_changes") @db.Text
  rejectionReason String?              @map("rejection_reason") @db.Text
  reviewedBy      String?              @map("reviewed_by")
  reviewedAt      DateTime?            @map("reviewed_at")
  createdAt       DateTime             @default(now()) @map("created_at")
  updatedAt       DateTime             @updatedAt @map("updated_at")

  applicant       User                 @relation(fields: [applicantId], references: [id])
  reviewer        Admin?               @relation(fields: [reviewedBy], references: [id])
  category        CommunityCategory    @relation(fields: [categoryId], references: [id])
  community       Community?

  @@index([status])
  @@index([applicant_id])
  @@index([reviewed_by])
  @@index([created_at])
  @@map("community_approvals")
}

enum ApprovalStatus {
  PENDING_REVIEW
  APPROVED
  NEED_REVISION
  REJECTED
}
```

**Indexes:**
- `idx_community_approvals_status` on `status`
- `idx_community_approvals_applicant_id` on `applicant_id`
- `idx_community_approvals_reviewed_by` on `reviewed_by`
- `idx_community_approvals_created_at` on `created_at`

---

### 3.6 CommunityCategory

```prisma
model CommunityCategory {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?   @db.Text
  slug        String    @unique
  sortOrder   Int       @default(0) @map("sort_order")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  communities  Community[]
  approvals    CommunityApproval[]

  @@map("community_categories")
}
```

**Indexes:**
- `idx_community_categories_name` on `name` (unique)
- `idx_community_categories_slug` on `slug` (unique)
- `idx_community_categories_is_active` on `is_active`

---

### 3.7 CommunityMember

```prisma
model CommunityMember {
  id          String             @id @default(uuid())
  communityId String             @map("community_id")
  userId      String             @map("user_id")
  role        CommunityMemberRole @default(MEMBER)
  joinedAt    DateTime           @default(now()) @map("joined_at")
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")

  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([communityId, userId])
  @@index([community_id])
  @@index([user_id])
  @@map("community_members")
}

enum CommunityMemberRole {
  MEMBER
  ADMIN
  MODERATOR
}
```

**Indexes:**
- `idx_community_members_community_user` on `community_id, user_id` (unique)
- `idx_community_members_community_id` on `community_id`
- `idx_community_members_user_id` on `user_id`

---

### 3.8 Event

```prisma
model Event {
  id              String      @id @default(uuid())
  communityId     String?     @map("community_id")
  title           String
  description     String      @db.Text
  location        String?
  startDate       DateTime    @map("start_date")
  endDate         DateTime    @map("end_date")
  maxParticipants Int?        @map("max_participants")
  status          EventStatus @default(UPCOMING)
  isPublic        Boolean     @default(true) @map("is_public")
  cancelledAt     DateTime?   @map("cancelled_at")
  cancelledBy     String?     @map("cancelled_by")
  cancellationReason String?  @map("cancellation_reason") @db.Text
  participantCount Int        @default(0) @map("participant_count")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  community   Community?         @relation(fields: [communityId], references: [id])
  participants EventParticipant[]
  volunteerAssignments VolunteerAssignment[]

  @@index([community_id])
  @@index([status])
  @@index([start_date])
  @@index([created_at])
  @@map("events")
}

enum EventStatus {
  UPCOMING
  ONGOING
  COMPLETED
  CANCELLED
}
```

**Indexes:**
- `idx_events_community_id` on `community_id`
- `idx_events_status` on `status`
- `idx_events_start_date` on `start_date`
- `idx_events_created_at` on `created_at`

---

### 3.9 EventParticipant

```prisma
model EventParticipant {
  id         String                @id @default(uuid())
  eventId    String                @map("event_id")
  userId     String                @map("user_id")
  status     ParticipantStatus     @default(REGISTERED)
  registeredAt DateTime            @default(now()) @map("registered_at")
  attendedAt DateTime?             @map("attended_at")
  createdAt  DateTime              @default(now()) @map("created_at")
  updatedAt  DateTime              @updatedAt @map("updated_at")

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@index([event_id])
  @@index([user_id])
  @@map("event_participants")
}

enum ParticipantStatus {
  REGISTERED
  CONFIRMED
  ATTENDED
  CANCELLED
}
```

**Indexes:**
- `idx_event_participants_event_user` on `event_id, user_id` (unique)
- `idx_event_participants_event_id` on `event_id`
- `idx_event_participants_user_id` on `user_id`

---

### 3.10 Volunteer

```prisma
model Volunteer {
  id           String         @id @default(uuid())
  userId       String         @unique @map("user_id")
  status       VolunteerStatus @default(ACTIVE)
  skills       String?        @db.Text
  availability String?        @map("availability") @db.VarChar(100)
  approvedAt   DateTime?      @map("approved_at")
  approvedBy   String?        @map("approved_by")
  revokedAt    DateTime?      @map("revoked_at")
  revokedBy    String?        @map("revoked_by")
  revokeReason String?        @map("revoke_reason") @db.Text
  assignmentCount Int          @default(0) @map("assignment_count")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  assignments VolunteerAssignment[]

  @@index([status])
  @@index([created_at])
  @@map("volunteers")
}

enum VolunteerStatus {
  ACTIVE
  INACTIVE
  PENDING
}
```

**Indexes:**
- `idx_volunteers_user_id` on `user_id` (unique)
- `idx_volunteers_status` on `status`
- `idx_volunteers_created_at` on `created_at`

---

### 3.11 VolunteerAssignment

```prisma
model VolunteerAssignment {
  id           String    @id @default(uuid())
  volunteerId  String    @map("volunteer_id")
  eventId      String    @map("event_id")
  roleInEvent  String?   @map("role_in_event") @db.VarChar(100)
  notes        String?   @db.Text
  assignedAt   DateTime  @default(now()) @map("assigned_at")
  assignedBy   String    @map("assigned_by")
  unassignedAt DateTime? @map("unassigned_at")
  unassignedBy String?   @map("unassigned_by")
  unassignReason String? @map("unassign_reason") @db.Text
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  volunteer Volunteer @relation(fields: [volunteerId], references: [id], onDelete: Cascade)
  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([volunteerId, eventId])
  @@index([volunteer_id])
  @@index([event_id])
  @@index([assigned_at])
  @@map("volunteer_assignments")
}
```

**Indexes:**
- `idx_volunteer_assignments_volunteer_event` on `volunteer_id, event_id` (unique)
- `idx_volunteer_assignments_volunteer_id` on `volunteer_id`
- `idx_volunteer_assignments_event_id` on `event_id`
- `idx_volunteer_assignments_assigned_at` on `assigned_at`

---

### 3.12 Report

```prisma
model Report {
  id              String       @id @default(uuid())
  reporterId      String       @map("reporter_id")
  reportedUserId  String       @map("reported_user_id")
  contentType     String       @map("content_type") @db.VarChar(50)
  contentId       String       @map("content_id")
  violationType   ViolationType @map("violation_type")
  description     String       @db.Text
  evidenceUrls    String?      @map("evidence_urls") @db.Text
  status          ReportStatus @default(REPORTED)
  createdAt       DateTime     @default(now()) @map("created_at")
  updatedAt       DateTime     @updatedAt @map("updated_at")

  reporter      User                @relation("Reporter", fields: [reporterId], references: [id])
  reportedUser  User                @relation("ReportedUser", fields: [reportedUserId], references: [id])
  moderationActions ModerationAction[]

  @@index([reporter_id])
  @@index([reported_user_id])
  @@index([status])
  @@index([violation_type])
  @@index([created_at])
  @@map("reports")
}

enum ViolationType {
  SPAM
  HARASSMENT
  HATE_SPEECH
  INAPPROPRIATE_CONTENT
  MISINFORMATION
  COPYRIGHT_VIOLATION
  SCAM
  OTHER
}

enum ReportStatus {
  REPORTED
  UNDER_REVIEW
  WARNING
  SUSPENDED
  PERMANENT_SUSPENDED
  DISMISSED
  APPEAL_PENDING
  APPEAL_UPHELD
  APPEAL_OVERTURNED
}
```

**Indexes:**
- `idx_reports_reporter_id` on `reporter_id`
- `idx_reports_reported_user_id` on `reported_user_id`
- `idx_reports_status` on `status`
- `idx_reports_violation_type` on `violation_type`
- `idx_reports_created_at` on `created_at`

---

### 3.13 ModerationAction

```prisma
model ModerationAction {
  id          String             @id @default(uuid())
  reportId    String             @map("report_id")
  adminId     String             @map("admin_id")
  action      ModerationActionType
  description String?            @db.Text
  durationDays Int?              @map("duration_days")
  expiresAt   DateTime?          @map("expires_at")
  createdAt   DateTime           @default(now()) @map("created_at")

  report Report @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([report_id])
  @@index([admin_id])
  @@index([action])
  @@index([created_at])
  @@map("moderation_actions")
}

enum ModerationActionType {
  WARNING
  SUSPEND
  PERMANENT_SUSPEND
  REMOVE_CONTENT
  DISMISS
  APPEAL_UPHELD
  APPEAL_OVERTURNED
}
```

**Indexes:**
- `idx_moderation_actions_report_id` on `report_id`
- `idx_moderation_actions_admin_id` on `admin_id`
- `idx_moderation_actions_action` on `action`
- `idx_moderation_actions_created_at` on `created_at`

---

### 3.14 CmsPage

```prisma
model CmsPage {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  content     String    @db.LongText
  excerpt     String?   @db.VarChar(500)
  status      CmsStatus @default(DRAFT)
  authorId    String    @map("author_id")
  publishedAt DateTime? @map("published_at")
  publishedBy String?   @map("published_by")
  version     Int       @default(1)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  author   Admin           @relation(fields: [authorId], references: [id])
  versions CmsPageVersion[]

  @@index([slug])
  @@index([status])
  @@index([author_id])
  @@index([created_at])
  @@map("cms_pages")
}

enum CmsStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Indexes:**
- `idx_cms_pages_slug` on `slug` (unique)
- `idx_cms_pages_status` on `status`
- `idx_cms_pages_author_id` on `author_id`
- `idx_cms_pages_created_at` on `created_at`

---

### 3.15 CmsPageVersion

```prisma
model CmsPageVersion {
  id        String   @id @default(uuid())
  pageId    String   @map("page_id")
  title     String
  content   String   @db.LongText
  version   Int
  changedBy String   @map("changed_by")
  changeNote String? @map("change_note") @db.VarChar(500)
  createdAt DateTime @default(now()) @map("created_at")

  page CmsPage @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@unique([pageId, version])
  @@index([page_id])
  @@index([created_at])
  @@map("cms_page_versions")
}
```

**Indexes:**
- `idx_cms_page_versions_page_version` on `page_id, version` (unique)
- `idx_cms_page_versions_page_id` on `page_id`
- `idx_cms_page_versions_created_at` on `created_at`

---

### 3.16 CmsBanner

```prisma
model CmsBanner {
  id          String    @id @default(uuid())
  title       String
  imageUrl    String    @map("image_url")
  targetUrl   String?   @map("target_url")
  altText     String?   @map("alt_text") @db.VarChar(200)
  sortOrder   Int       @default(0) @map("sort_order")
  isActive    Boolean   @default(true) @map("is_active")
  startAt     DateTime? @map("start_at")
  endAt       DateTime? @map("end_at")
  createdBy   String    @map("created_by")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  creator Admin @relation(fields: [createdBy], references: [id])

  @@index([is_active])
  @@index([sort_order])
  @@index([created_by])
  @@index([start_at, end_at])
  @@map("cms_banners")
}
```

**Indexes:**
- `idx_cms_banners_is_active` on `is_active`
- `idx_cms_banners_sort_order` on `sort_order`
- `idx_cms_banners_created_by` on `created_by`
- `idx_cms_banners_schedule` on `start_at, end_at`

---

### 3.17 CmsMedia

```prisma
model CmsMedia {
  id         String    @id @default(uuid())
  fileName   String    @map("file_name")
  fileUrl    String    @map("file_url")
  fileType   String    @map("file_type") @db.VarChar(50)
  fileSize   Int       @map("file_file_size")
  uploadedBy String    @map("uploaded_by")
  createdAt  DateTime  @default(now()) @map("created_at")

  uploader Admin @relation(fields: [uploadedBy], references: [id])

  @@index([file_type])
  @@index([uploaded_by])
  @@index([created_at])
  @@map("cms_media")
}
```

**Indexes:**
- `idx_cms_media_file_type` on `file_type`
- `idx_cms_media_uploaded_by` on `uploaded_by`
- `idx_cms_media_created_at` on `created_at`

---

### 3.18 Notification

```prisma
model Notification {
  id          String             @id @default(uuid())
  recipientId String?            @map("recipient_id")
  title       String
  message     String             @db.Text
  type        NotificationType
  channel     NotificationChannel
  status      NotificationStatus @default(PENDING)
  metadata    Json?              @db.Json
  readAt      DateTime?          @map("read_at")
  sentAt      DateTime?          @map("sent_at")
  createdAt   DateTime           @default(now()) @map("created_at")

  recipient   Admin?             @relation("NotificationRecipient", fields: [recipientId], references: [id])
  userRecipient User?            @relation("NotificationRecipient", fields: [recipientId], references: [id])

  @@index([recipient_id])
  @@index([type])
  @@index([channel])
  @@index([status])
  @@index([created_at])
  @@map("notifications")
}

enum NotificationType {
  COMMUNITY_APPROVED
  COMMUNITY_REVISION
  COMMUNITY_REJECTED
  EVENT_CANCELLED
  VOLUNTEER_ASSIGNED
  MODERATION_WARNING
  MODERATION_SUSPENDED
  MODERATION_CONTENT_REMOVED
  APPEAL_SUBMITTED
  APPEAL_DECISION
  SYSTEM
  MANUAL
}

enum NotificationChannel {
  EMAIL
  PUSH
  IN_APP
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  READ
}
```

**Indexes:**
- `idx_notifications_recipient_id` on `recipient_id`
- `idx_notifications_type` on `type`
- `idx_notifications_channel` on `channel`
- `idx_notifications_status` on `status`
- `idx_notifications_created_at` on `created_at`

---

### 3.19 NotificationTemplate

```prisma
model NotificationTemplate {
  id        String   @id @default(uuid())
  name      String   @unique
  subject   String
  body      String   @db.LongText
  variables Json?    @db.Json
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("notification_templates")
}
```

**Indexes:**
- `idx_notification_templates_name` on `name` (unique)

---

### 3.20 AuditLog

```prisma
model AuditLog {
  id           String   @id @default(uuid())
  adminId      String   @map("admin_id")
  action       String   @db.VarChar(100)
  resourceType String   @map("resource_type") @db.VarChar(50)
  resourceId   String?  @map("resource_id")
  beforeData   Json?    @map("before_data") @db.Json
  afterData    Json?    @map("after_data") @db.Json
  ipAddress    String   @map("ip_address") @db.VarChar(45)
  userAgent    String   @map("user_agent") @db.VarChar(500)
  sessionId    String?  @map("session_id") @db.VarChar(100)
  timestamp    DateTime @default(now())

  admin Admin @relation(fields: [adminId], references: [id])

  @@index([admin_id])
  @@index([action])
  @@index([resource_type])
  @@index([resource_id])
  @@index([timestamp])
  @@index([admin_id, timestamp])
  @@index([action, timestamp])
  @@map("audit_logs")
}
```

**Indexes:**
- `idx_audit_logs_admin_id` on `admin_id`
- `idx_audit_logs_action` on `action`
- `idx_audit_logs_resource_type` on `resource_type`
- `idx_audit_logs_resource_id` on `resource_id`
- `idx_audit_logs_timestamp` on `timestamp`
- `idx_audit_logs_admin_timestamp` on `admin_id, timestamp`
- `idx_audit_logs_action_timestamp` on `action, timestamp`

---

### 3.21 DataMasterCategory

```prisma
model DataMasterCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?  @db.Text
  slug        String   @unique
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("data_master_categories")
}
```

**Indexes:**
- `idx_dm_categories_name` on `name` (unique)
- `idx_dm_categories_slug` on `slug` (unique)

---

### 3.22 DataMasterTag

```prisma
model DataMasterTag {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?  @db.Text
  slug        String   @unique
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("data_master_tags")
}
```

**Indexes:**
- `idx_dm_tags_name` on `name` (unique)
- `idx_dm_tags_slug` on `slug` (unique)

---

### 3.23 DataMasterSkill

```prisma
model DataMasterSkill {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?  @db.Text
  category    String?  @db.VarChar(100)
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("data_master_skills")
}
```

**Indexes:**
- `idx_dm_skills_name` on `name` (unique)
- `idx_dm_skills_category` on `category`

---

### 3.24 DataMasterLocation

```prisma
model DataMasterLocation {
  id          String   @id @default(uuid())
  name        String
  province    String?  @db.VarChar(100)
  city        String?  @db.VarChar(100)
  district    String?  @db.VarChar(100)
  postalCode  String?  @map("postal_code") @db.VarChar(10)
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([name, province, city])
  @@index([province])
  @@index([city])
  @@map("data_master_locations")
}
```

**Indexes:**
- `idx_dm_locations_name_province_city` on `name, province, city` (unique)
- `idx_dm_locations_province` on `province`
- `idx_dm_locations_city` on `city`

---

### 3.25 PlatformConfig

```prisma
model PlatformConfig {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String   @db.Text
  description String?  @db.VarChar(500)
  group       String?  @db.VarChar(100)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("platform_config")
}
```

**Indexes:**
- `idx_platform_config_key` on `key` (unique)
- `idx_platform_config_group` on `group`

---

### 3.26 AdminSession

```prisma
model AdminSession {
  id           String    @id @default(uuid())
  adminId      String    @map("admin_id")
  token        String    @unique
  ipAddress    String    @map("ip_address") @db.VarChar(45)
  userAgent    String    @map("user_agent") @db.VarChar(500)
  isActive     Boolean   @default(true) @map("is_active")
  lastActiveAt DateTime  @map("last_active_at")
  expiresAt    DateTime  @map("expires_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  admin Admin @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([admin_id])
  @@index([token])
  @@index([is_active])
  @@index([expires_at])
  @@map("admin_sessions")
}
```

**Indexes:**
- `idx_admin_sessions_admin_id` on `admin_id`
- `idx_admin_sessions_token` on `token` (unique)
- `idx_admin_sessions_is_active` on `is_active`
- `idx_admin_sessions_expires_at` on `expires_at`

---

### 3.27 IpWhitelist

```prisma
model IpWhitelist {
  id          String   @id @default(uuid())
  ipAddress   String   @map("ip_address") @db.VarChar(45)
  cidr        String?  @db.VarChar(50)
  description String?  @db.VarChar(200)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([ip_address])
  @@map("ip_whitelist")
}
```

**Indexes:**
- `idx_ip_whitelist_ip_address` on `ip_address` (unique)

---

### 3.28 RateLimitConfig

```prisma
model RateLimitConfig {
  id              String   @id @default(uuid())
  endpoint        String
  maxRequests     Int      @map("max_requests")
  windowMs        Int      @map("window_ms")
  description     String?  @db.VarChar(200)
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@unique([endpoint])
  @@map("rate_limit_config")
}
```

**Indexes:**
- `idx_rate_limit_config_endpoint` on `endpoint` (unique)

---

### 3.29 PasswordPolicy

```prisma
model PasswordPolicy {
  id               String   @id @default(uuid())
  minLength        Int      @default(8) @map("min_length")
  maxLength        Int      @default(128) @map("max_length")
  requireUppercase Boolean  @default(true) @map("require_uppercase")
  requireLowercase Boolean  @default(true) @map("require_lowercase")
  requireNumber    Boolean  @default(true) @map("require_number")
  requireSymbol    Boolean  @default(true) @map("require_symbol")
  expiryDays       Int      @default(90) @map("expiry_days")
  maxAttempts      Int      @default(5) @map("max_attempts")
  lockoutMinutes   Int      @default(30) @map("lockout_minutes")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@map("password_policy")
}
```

---

### 3.30 SecurityAlert

```prisma
model SecurityAlert {
  id          String          @id @default(uuid())
  type        SecurityAlertType
  severity    AlertSeverity
  title       String
  message     String          @db.Text
  metadata    Json?           @db.Json
  isResolved  Boolean         @default(false) @map("is_resolved")
  resolvedAt  DateTime?       @map("resolved_at")
  resolvedBy  String?         @map("resolved_by")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  @@index([type])
  @@index([severity])
  @@index([is_resolved])
  @@index([created_at])
  @@map("security_alerts")
}

enum SecurityAlertType {
  MULTIPLE_FAILED_LOGINS
  SUSPICIOUS_ACTIVITY
  UNUSUAL_IP
  BRUTE_FORCE_DETECTED
  SESSION_HIJACK_ATTEMPT
  RATE_LIMIT_EXCEEDED
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

**Indexes:**
- `idx_security_alerts_type` on `type`
- `idx_security_alerts_severity` on `severity`
- `idx_security_alerts_is_resolved` on `is_resolved`
- `idx_security_alerts_created_at` on `created_at`

---

## 4. Entity Relationship Diagram

```
Admin ──1:N──> LoginHistory
Admin ──1:N──> AdminSession
Admin ──1:N──> AuditLog
Admin ──1:N──> CmsPage (as author)
Admin ──1:N──> CmsBanner (as creator)
Admin ──1:N──> CmsMedia (as uploader)
Admin ──1:N──> CommunityApproval (as reviewer)
Admin ──1:N──> Notification

User ──1:1──> Volunteer
User ──1:N──> CommunityMember
User ──1:N──> EventParticipant
User ──1:N──> Report (as reporter)
User ──1:N──> Report (as reported user)
User ──1:N──> ModerationAction
User ──1:N──> Notification

Community ──1:1──> CommunityApproval
Community ──N:1──> CommunityCategory
Community ──1:N──> CommunityMember
Community ──1:N──> Event

Event ──1:N──> EventParticipant
Event ──1:N──> VolunteerAssignment

Volunteer ──1:N──> VolunteerAssignment

Report ──1:N──> ModerationAction

CmsPage ──1:N──> CmsPageVersion
CmsPage ──N:1──> Admin (as author)

CmsBanner ──N:1──> Admin (as creator)
CmsMedia ──N:1──> Admin (as uploader)
```

---

## 5. Migration Strategy

### 5.1 Initial Migration

| Step | Action | Tables |
|------|--------|--------|
| 1 | Create admin tables | `admins`, `login_history`, `admin_sessions` |
| 2 | Create user tables | `users` |
| 3 | Create community tables | `communities`, `community_approvals`, `community_categories`, `community_members` |
| 4 | Create event tables | `events`, `event_participants` |
| 5 | Create volunteer tables | `volunteers`, `volunteer_assignments` |
| 6 | Create moderation tables | `reports`, `moderation_actions` |
| 7 | Create CMS tables | `cms_pages`, `cms_page_versions`, `cms_banners`, `cms_media` |
| 8 | Create notification tables | `notifications`, `notification_templates` |
| 9 | Create audit tables | `audit_logs` |
| 10 | Create data master tables | `data_master_categories`, `data_master_tags`, `data_master_skills`, `data_master_locations` |
| 11 | Create system tables | `platform_config`, `ip_whitelist`, `rate_limit_config`, `password_policy`, `security_alerts` |
| 12 | Seed default data | Admin accounts, default categories, platform config |

### 5.2 Seed Data

| Table | Records | Description |
|-------|---------|-------------|
| `admins` | 2 | SUPER_ADMIN default + PLATFORM_ADMIN default |
| `community_categories` | 10 | Kategori default komunitas |
| `platform_config` | 20 | Konfigurasi default platform |
| `password_policy` | 1 | Kebijakan password default |
| `rate_limit_config` | 5 | Rate limiting default |
| `notification_templates` | 15 | Template notifikasi default |
