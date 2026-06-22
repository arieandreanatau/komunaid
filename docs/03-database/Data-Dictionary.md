# KomunaID — Data Dictionary

## Overview

Data dictionary ini mendeskripsikan seluruh tabel, kolom, tipe data, constraint, dan contoh nilai untuk database KomunaID.

---

## 1. users

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | User ID | `1` |
| `name` | `VARCHAR(255)` | NO | — | — | Full name | `Budi Santoso` |
| `email` | `VARCHAR(255)` | NO | — | UNIQUE | Email address | `budi@example.com` |
| `email_verified_at` | `TIMESTAMP` | YES | NULL | — | Email verification timestamp | `2026-01-15 10:30:00` |
| `password` | `VARCHAR(255)` | NO | — | — | Hashed password | `$2y$12$...` |
| `avatar` | `VARCHAR(255)` | YES | NULL | — | Avatar file path | `avatars/1_abc123.jpg` |
| `phone` | `VARCHAR(20)` | YES | NULL | — | Phone number | `+62812345678` |
| `role_id` | `BIGINT UNSIGNED` | NO | `1` | FK | Current role | `1` |
| `is_active` | `TINYINT(1)` | NO | `1` | — | Account active status | `1` |
| `deleted_at` | `TIMESTAMP` | YES | NULL | — | Soft delete timestamp | `NULL` |
| `remember_token` | `VARCHAR(100)` | YES | NULL | — | Remember me token | `abc123def456` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

---

## 2. profiles

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Profile ID | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | UNIQUE, FK | Owner user | `1` |
| `bio` | `TEXT` | YES | NULL | — | Short biography | `Founder of KomunaID` |
| `address` | `VARCHAR(500)` | YES | NULL | — | Street address | `Jl. Sudirman No. 123` |
| `city` | `VARCHAR(100)` | YES | NULL | — | City | `Jakarta` |
| `province` | `VARCHAR(100)` | YES | NULL | — | Province/State | `DKI Jakarta` |
| `country` | `VARCHAR(100)` | NO | `Indonesia` | — | Country | `Indonesia` |
| `website` | `VARCHAR(255)` | YES | NULL | — | Personal website | `https://budisantoso.com` |
| `social_instagram` | `VARCHAR(255)` | YES | NULL | — | Instagram username | `@budisantoso` |
| `social_twitter` | `VARCHAR(255)` | YES | NULL | — | Twitter/X username | `@budisantoso` |
| `social_facebook` | `VARCHAR(255)` | YES | NULL | — | Facebook profile URL | `https://facebook.com/budisantoso` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

---

## 3. roles

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Role ID | `1` |
| `name` | `VARCHAR(255)` | NO | — | — | Role display name | `Member` |
| `slug` | `VARCHAR(255)` | NO | — | UNIQUE | Role slug identifier | `member` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Seed Data:**

| id | name | slug |
|----|------|------|
| 1 | Member | `member` |
| 2 | Community Owner | `community_owner` |
| 3 | Brand Owner | `brand_owner` |
| 4 | Superadmin | `superadmin` |

---

## 4. role_requests

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Role request ID | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Requesting user | `1` |
| `role_id` | `BIGINT UNSIGNED` | NO | — | FK | Requested role | `2` |
| `motivation` | `VARCHAR(1000)` | YES | NULL | — | Reason for request | `Saya ingin membuat komunitas fotografi` |
| `supporting_documents` | `TEXT` | YES | NULL | — | URL/path to documents | `role_requests/1_doc.pdf` |
| `status` | `ENUM` | NO | `pending` | — | Request status | `pending` |
| `reviewed_by` | `BIGINT UNSIGNED` | YES | NULL | FK | Superadmin reviewer | `4` |
| `reviewed_at` | `TIMESTAMP` | YES | NULL | — | Review timestamp | `2026-01-16 14:00:00` |
| `review_notes` | `TEXT` | YES | NULL | — | Reviewer notes | `Disetujui, selamat bergabung` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-16 14:00:00` |

**Status Enum:** `pending`, `approved`, `rejected`, `suspended`

---

## 5. community_categories

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Category ID | `1` |
| `name` | `VARCHAR(255)` | NO | — | UNIQUE | Category name | `Teknologi` |
| `slug` | `VARCHAR(255)` | NO | — | UNIQUE | URL slug | `teknologi` |
| `icon` | `VARCHAR(100)` | YES | NULL | — | Icon identifier | `laptop` |
| `description` | `VARCHAR(500)` | YES | NULL | — | Category description | `Komunitas teknologi dan programming` |
| `sort_order` | `INT` | NO | `0` | — | Display order | `1` |
| `is_active` | `TINYINT(1)` | NO | `1` | — | Active status | `1` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Seed Data:**

| id | name | slug | icon |
|----|------|------|------|
| 1 | Teknologi | `teknologi` | `laptop` |
| 2 | Bisnis | `bisnis` | `briefcase` |
| 3 | Seni & Desain | `seni-dan-desain` | `palette` |
| 4 | Olahraga | `olahraga` | `football` |
| 5 | Pendidikan | `pendidikan` | `book` |
| 6 | Sosial & Lingkungan | `sosial-dan-lingkungan` | `globe` |
| 7 | Kesehatan | `kesehatan` | `heart` |
| 8 | Musik | `musik` | `music` |
| 9 | Kuliner | `kuliner` | `food` |
| 10 | Lainnya | `lainnya` | `dots` |

---

## 6. communities

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Community ID | `1` |
| `name` | `VARCHAR(255)` | NO | — | — | Community name | `Jakarta Developer Community` |
| `slug` | `VARCHAR(255)` | NO | — | UNIQUE | URL slug | `jakarta-developer-community` |
| `description` | `TEXT` | YES | NULL | — | Community description | `Komunitas developer di Jakarta` |
| `owner_id` | `BIGINT UNSIGNED` | NO | — | FK | Community owner | `1` |
| `category_id` | `BIGINT UNSIGNED` | YES | NULL | FK | Category | `1` |
| `banner` | `VARCHAR(255)` | YES | NULL | — | Banner image path | `banners/community_1_abc.jpg` |
| `logo` | `VARCHAR(255)` | YES | NULL | — | Logo image path | `logos/community_1_xyz.png` |
| `location` | `VARCHAR(255)` | YES | NULL | — | Primary location | `Jakarta Selatan` |
| `website` | `VARCHAR(255)` | YES | NULL | — | Website URL | `https://jakartadev.id` |
| `is_public` | `TINYINT(1)` | NO | `1` | — | Public visibility | `1` |
| `is_active` | `TINYINT(1)` | NO | `1` | — | Active status | `1` |
| `status` | `ENUM` | NO | `pending` | — | Approval status | `approved` |
| `approved_at` | `TIMESTAMP` | YES | NULL | — | Approval timestamp | `2026-01-16 14:00:00` |
| `approved_by` | `BIGINT UNSIGNED` | YES | NULL | FK | Approving superadmin | `4` |
| `deleted_at` | `TIMESTAMP` | YES | NULL | — | Soft delete timestamp | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Status Enum:** `pending`, `approved`, `rejected`, `suspended`

---

## 7. community_members

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Membership ID | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Community | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Member | `1` |
| `subgroup_id` | `BIGINT UNSIGNED` | YES | NULL | FK | Subgroup assignment | `1` |
| `role` | `ENUM` | NO | `member` | — | Role in community | `admin` |
| `status` | `ENUM` | NO | `pending` | — | Membership status | `approved` |
| `joined_at` | `TIMESTAMP` | YES | NULL | — | Approval timestamp | `2026-01-16 14:00:00` |
| `deleted_at` | `TIMESTAMP` | YES | NULL | — | Soft delete timestamp | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Constraints:** `UNIQUE(community_id, user_id)`

**Role Enum:** `owner`, `admin`, `member`
**Status Enum:** `pending`, `approved`, `rejected`, `suspended`

---

## 8. community_regions

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Region ID | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Community | `1` |
| `province` | `VARCHAR(100)` | YES | NULL | — | Province/State | `DKI Jakarta` |
| `city` | `VARCHAR(100)` | YES | NULL | — | City | `Jakarta Selatan` |
| `district` | `VARCHAR(100)` | YES | NULL | — | District | `Kebayoran Baru` |
| `address` | `VARCHAR(500)` | YES | NULL | — | Detailed address | `Jl. Sudirman No. 123` |
| `latitude` | `DECIMAL(10,8)` | YES | NULL | — | Latitude coordinate | `-6.20876340` |
| `longitude` | `DECIMAL(11,8)` | YES | NULL | — | Longitude coordinate | `106.84558920` |
| `is_primary` | `TINYINT(1)` | NO | `0` | — | Primary region flag | `1` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

---

## 9. community_subgroups

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Subgroup ID | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Parent community | `1` |
| `name` | `VARCHAR(255)` | NO | — | — | Subgroup name | `Frontend Developer` |
| `description` | `VARCHAR(500)` | YES | NULL | — | Subgroup description | `Tim frontend development` |
| `type` | `ENUM` | NO | `chapter` | — | Subgroup type | `chapter` |
| `is_active` | `TINYINT(1)` | NO | `1` | — | Active status | `1` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Type Enum:** `chapter`, `division`, `team`, `interest_group`

---

## 10. brands

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Brand ID | `1` |
| `name` | `VARCHAR(255)` | NO | — | — | Brand name | `TechCorp Indonesia` |
| `slug` | `VARCHAR(255)` | NO | — | UNIQUE | URL slug | `techcorp-indonesia` |
| `description` | `TEXT` | YES | NULL | — | Brand description | `Perusahaan teknologi terdepan` |
| `owner_id` | `BIGINT UNSIGNED` | NO | — | FK | Brand owner | `1` |
| `logo` | `VARCHAR(255)` | YES | NULL | — | Logo image path | `logos/brand_1_abc.png` |
| `banner` | `VARCHAR(255)` | YES | NULL | — | Banner image path | `banners/brand_1_xyz.jpg` |
| `website` | `VARCHAR(255)` | YES | NULL | — | Website URL | `https://techcorp.id` |
| `industry` | `VARCHAR(100)` | YES | NULL | — | Industry category | `Technology` |
| `is_active` | `TINYINT(1)` | NO | `1` | — | Active status | `1` |
| `status` | `ENUM` | NO | `pending` | — | Approval status | `approved` |
| `approved_at` | `TIMESTAMP` | YES | NULL | — | Approval timestamp | `2026-01-16 14:00:00` |
| `approved_by` | `BIGINT UNSIGNED` | YES | NULL | FK | Approving superadmin | `4` |
| `deleted_at` | `TIMESTAMP` | YES | NULL | — | Soft delete timestamp | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Status Enum:** `pending`, `approved`, `rejected`, `suspended`

---

## 11. brand_members

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Brand membership ID | `1` |
| `brand_id` | `BIGINT UNSIGNED` | NO | — | FK | Brand | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Member | `1` |
| `role` | `ENUM` | NO | `member` | — | Role in brand | `admin` |
| `status` | `ENUM` | NO | `pending` | — | Membership status | `approved` |
| `joined_at` | `TIMESTAMP` | YES | NULL | — | Approval timestamp | `2026-01-16 14:00:00` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Constraints:** `UNIQUE(brand_id, user_id)`

**Role Enum:** `owner`, `admin`, `member`
**Status Enum:** `pending`, `approved`, `rejected`

---

## 12. events

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Event ID | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Parent community | `1` |
| `title` | `VARCHAR(255)` | NO | — | — | Event title | `Meetup Jakarta Dev 2026` |
| `slug` | `VARCHAR(255)` | NO | — | UNIQUE | URL slug | `meetup-jakarta-dev-2026` |
| `description` | `TEXT` | YES | NULL | — | Event description | `Meetup tahunan komunitas developer Jakarta` |
| `location` | `VARCHAR(255)` | YES | NULL | — | Event location | `Gedung Teknologi, Jakarta Selatan` |
| `start_time` | `DATETIME` | NO | — | — | Event start time | `2026-03-15 09:00:00` |
| `end_time` | `DATETIME` | YES | NULL | — | Event end time | `2026-03-15 17:00:00` |
| `banner` | `VARCHAR(255)` | YES | NULL | — | Banner image path | `banners/event_1_abc.jpg` |
| `status` | `ENUM` | NO | `draft` | — | Event status | `published` |
| `is_published` | `TINYINT(1)` | NO | `0` | — | Published status | `1` |
| `ticket_price` | `DECIMAL(10,2)` | NO | `0.00` | — | Ticket price (0 = free) | `50000.00` |
| `max_attendees` | `INT` | YES | NULL | — | Maximum attendees (NULL = unlimited) | `100` |
| `created_by` | `BIGINT UNSIGNED` | NO | — | FK | Event creator | `1` |
| `deleted_at` | `TIMESTAMP` | YES | NULL | — | Soft delete timestamp | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Status Enum:** `draft`, `published`, `cancelled`, `completed`

---

## 13. event_registrations

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Registration ID | `1` |
| `event_id` | `BIGINT UNSIGNED` | NO | — | FK | Event | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Registrant | `1` |
| `status` | `ENUM` | NO | `registered` | — | Registration status | `confirmed` |
| `payment_method` | `VARCHAR(50)` | YES | NULL | — | Payment method | `bank_transfer` |
| `payment_status` | `ENUM` | NO | `unpaid` | — | Payment status | `paid` |
| `amount_paid` | `DECIMAL(10,2)` | NO | `0.00` | — | Amount paid | `50000.00` |
| `registered_at` | `TIMESTAMP` | YES | NULL | — | Registration timestamp | `2026-01-15 10:30:00` |
| `checked_in_at` | `TIMESTAMP` | YES | NULL | — | Check-in timestamp | `2026-03-15 08:55:00` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Constraints:** `UNIQUE(event_id, user_id)`

**Status Enum:** `registered`, `confirmed`, `cancelled`, `attended`
**Payment Status Enum:** `unpaid`, `paid`, `refunded`

---

## 14. event_galleries

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Gallery ID | `1` |
| `event_id` | `BIGINT UNSIGNED` | NO | — | FK | Event | `1` |
| `uploaded_by` | `BIGINT UNSIGNED` | NO | — | FK | Uploader user | `1` |
| `file_path` | `VARCHAR(500)` | NO | — | — | File storage path | `galleries/event_1/photo1.jpg` |
| `file_type` | `VARCHAR(50)` | NO | `image` | — | File type | `image` |
| `caption` | `VARCHAR(500)` | YES | NULL | — | Photo caption | `Opening ceremony` |
| `sort_order` | `INT` | NO | `0` | — | Display order | `1` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-03-15 12:00:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-03-15 12:00:00` |

**File Type Enum:** `image`, `video`, `document`

---

## 15. event_chats

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Chat ID | `1` |
| `event_id` | `BIGINT UNSIGNED` | NO | — | FK | Event | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Message author | `1` |
| `message` | `TEXT` | NO | — | — | Chat message | `Halo semua, siap hadir!` |
| `attachment` | `VARCHAR(500)` | YES | NULL | — | Attachment path | `chats/event_1/attachment.pdf` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-03-15 09:00:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-03-15 09:00:00` |

---

## 16. event_chat_threads

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Thread ID | `1` |
| `event_chat_id` | `BIGINT UNSIGNED` | NO | — | FK | Parent chat message | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Reply author | `2` |
| `message` | `TEXT` | NO | — | — | Reply message | `Saya juga mau hadir!` |
| `attachment` | `VARCHAR(500)` | YES | NULL | — | Attachment path | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-03-15 09:05:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-03-15 09:05:00` |

---

## 17. community_chats

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Chat ID | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Community | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Message author | `1` |
| `message` | `TEXT` | NO | — | — | Chat message | `Ada event minggu depan!` |
| `attachment` | `VARCHAR(500)` | YES | NULL | — | Attachment path | `chats/community_1/file.pdf` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

---

## 18. community_chat_threads

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Thread ID | `1` |
| `community_chat_id` | `BIGINT UNSIGNED` | NO | — | FK | Parent chat message | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Reply author | `2` |
| `message` | `TEXT` | NO | — | — | Reply message | `Wah keren!` |
| `attachment` | `VARCHAR(500)` | YES | NULL | — | Attachment path | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:35:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:35:00` |

---

## 19. collaboration_requests

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Collaboration ID | `1` |
| `brand_id` | `BIGINT UNSIGNED` | NO | — | FK | Initiating brand | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Target community | `1` |
| `initiated_by` | `BIGINT UNSIGNED` | NO | — | FK | Initiator user | `1` |
| `title` | `VARCHAR(255)` | NO | — | — | Collaboration title | `Sponsorship Jakarta Dev Meetup` |
| `description` | `TEXT` | YES | NULL | — | Collaboration details | `TechCorp ingin mensponsori meetup bulanan` |
| `type` | `ENUM` | NO | `partnership` | — | Collaboration type | `sponsorship` |
| `status` | `ENUM` | NO | `pending` | — | Approval status | `approved` |
| `budget` | `DECIMAL(12,2)` | YES | NULL | — | Proposed budget | `5000000.00` |
| `proposed_start_date` | `DATETIME` | YES | NULL | — | Proposed start | `2026-02-01 00:00:00` |
| `proposed_end_date` | `DATETIME` | YES | NULL | — | Proposed end | `2026-06-30 23:59:59` |
| `terms` | `TEXT` | YES | NULL | — | Terms and conditions | `TechCorp akan menyediakan booth di setiap meetup` |
| `reviewed_by` | `BIGINT UNSIGNED` | YES | NULL | FK | Reviewer | `4` |
| `reviewed_at` | `TIMESTAMP` | YES | NULL | — | Review timestamp | `2026-01-20 10:00:00` |
| `review_notes` | `TEXT` | YES | NULL | — | Review notes | `Disetujui, silakan lanjut` |
| `deleted_at` | `TIMESTAMP` | YES | NULL | — | Soft delete timestamp | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-20 10:00:00` |

**Type Enum:** `partnership`, `sponsorship`, `event_collab`, `campaign`, `other`
**Status Enum:** `pending`, `approved`, `rejected`, `in_progress`, `completed`, `cancelled`

---

## 20. campaigns

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Campaign ID | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Host community | `1` |
| `brand_id` | `BIGINT UNSIGNED` | YES | NULL | FK | Sponsor brand | `1` |
| `name` | `VARCHAR(255)` | NO | — | — | Campaign name | `Galang Dana Komunitas` |
| `slug` | `VARCHAR(255)` | NO | — | UNIQUE | URL slug | `galang-dana-komunitas` |
| `description` | `TEXT` | YES | NULL | — | Campaign description | `Dana untuk acara tahunan komunitas` |
| `banner` | `VARCHAR(255)` | YES | NULL | — | Banner image path | `banners/campaign_1_abc.jpg` |
| `target_amount` | `DECIMAL(12,2)` | NO | `0.00` | — | Fundraising target | `10000000.00` |
| `current_amount` | `DECIMAL(12,2)` | NO | `0.00` | — | Current raised amount | `2500000.00` |
| `start_date` | `DATETIME` | NO | — | — | Campaign start | `2026-02-01 00:00:00` |
| `end_date` | `DATETIME` | NO | — | — | Campaign end | `2026-03-01 23:59:59` |
| `status` | `ENUM` | NO | `draft` | — | Campaign status | `active` |
| `deleted_at` | `TIMESTAMP` | YES | NULL | — | Soft delete timestamp | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Status Enum:** `draft`, `active`, `completed`, `cancelled`

---

## 21. donations

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Donation ID | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Donor | `1` |
| `community_id` | `BIGINT UNSIGNED` | NO | — | FK | Recipient community | `1` |
| `campaign_id` | `BIGINT UNSIGNED` | YES | NULL | FK | Linked campaign | `1` |
| `wallet_id` | `BIGINT UNSIGNED` | YES | NULL | FK | Donor wallet | `1` |
| `amount` | `DECIMAL(12,2)` | NO | — | — | Donation amount | `100000.00` |
| `payment_method` | `VARCHAR(50)` | NO | — | — | Payment method | `wallet` |
| `payment_status` | `ENUM` | NO | `pending` | — | Payment status | `completed` |
| `notes` | `TEXT` | YES | NULL | — | Donation notes | `Semoga bermanfaat` |
| `proof_image` | `VARCHAR(500)` | YES | NULL | — | Payment proof path | `donations/1_proof.jpg` |
| `donated_at` | `TIMESTAMP` | YES | NULL | — | Donation timestamp | `2026-02-15 14:00:00` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-02-15 14:00:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-02-15 14:00:00` |

**Payment Status Enum:** `pending`, `completed`, `failed`, `refunded`
**Payment Method Enum:** `wallet`, `bank_transfer`, `ewallet`, `manual`

---

## 22. wallets

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Wallet ID | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | UNIQUE, FK | Wallet owner | `1` |
| `balance` | `DECIMAL(12,2)` | NO | `0.00` | — | Current balance | `500000.00` |
| `status` | `ENUM` | NO | `active` | — | Wallet status | `active` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-02-15 14:00:00` |

**Status Enum:** `active`, `frozen`, `closed`

---

## 23. wallet_transactions

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Transaction ID | `1` |
| `wallet_id` | `BIGINT UNSIGNED` | NO | — | FK | Wallet | `1` |
| `type` | `ENUM` | NO | — | — | Transaction type | `credit` |
| `amount` | `DECIMAL(12,2)` | NO | — | — | Transaction amount | `100000.00` |
| `balance_before` | `DECIMAL(12,2)` | NO | — | — | Balance before | `400000.00` |
| `balance_after` | `DECIMAL(12,2)` | NO | — | — | Balance after | `500000.00` |
| `reference_type` | `VARCHAR(100)` | YES | NULL | — | Polymorphic type | `App\Models\Donation` |
| `reference_id` | `BIGINT UNSIGNED` | YES | NULL | — | Polymorphic ID | `1` |
| `description` | `VARCHAR(500)` | YES | NULL | — | Transaction description | `Donasi ke Komunitas Jakarta Dev` |
| `status` | `ENUM` | NO | `completed` | — | Transaction status | `completed` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-02-15 14:00:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-02-15 14:00:00` |

**Type Enum:** `credit`, `debit`, `topup`, `withdrawal`, `refund`
**Status Enum:** `pending`, `completed`, `failed`, `reversed`

---

## 24. notifications

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Notification ID | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Recipient user | `1` |
| `type` | `VARCHAR(100)` | NO | — | — | Notification type | `role_approved` |
| `title` | `VARCHAR(255)` | NO | — | — | Notification title | `Role Disetujui` |
| `message` | `TEXT` | NO | — | — | Notification body | `Permintaan role Community Owner Anda telah disetujui` |
| `data` | `JSON` | YES | NULL | — | Additional data payload | `{"role": "community_owner"}` |
| `is_read` | `TINYINT(1)` | NO | `0` | — | Read status | `0` |
| `read_at` | `TIMESTAMP` | YES | NULL | — | Read timestamp | `NULL` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-16 14:00:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-16 14:00:00` |

**Notification Types:**
- `role_approved` — Role upgrade approved
- `role_rejected` — Role upgrade rejected
- `community_approved` — Community approved
- `community_rejected` — Community rejected
- `membership_approved` — Community membership approved
- `membership_rejected` — Community membership rejected
- `event_created` — New event in community
- `event_cancelled` — Event cancelled
- `collaboration_received` — Collaboration request received
- `collaboration_approved` — Collaboration approved
- `donation_received` — Donation received
- `campaign_update` — Campaign status update
- `wallet_credit` — Wallet credited
- `wallet_debit` — Wallet debited

---

## 25. approval_logs

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Log ID | `1` |
| `loggable_type` | `VARCHAR(100)` | NO | — | — | Polymorphic model type | `App\Models\Community` |
| `loggable_id` | `BIGINT UNSIGNED` | NO | — | — | Polymorphic model ID | `1` |
| `user_id` | `BIGINT UNSIGNED` | NO | — | FK | Approving user | `4` |
| `action` | `ENUM` | NO | — | — | Approval action | `approved` |
| `reason` | `TEXT` | YES | NULL | — | Reason for action | `Memenuhi kriteria komunitas` |
| `old_values` | `JSON` | YES | NULL | — | Previous values | `{"status": "pending"}` |
| `new_values` | `JSON` | YES | NULL | — | New values | `{"status": "approved"}` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-16 14:00:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-16 14:00:00` |

**Action Enum:** `approved`, `rejected`, `suspended`, `activated`, `deactivated`

---

## 26. audit_logs

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Audit ID | `1` |
| `user_id` | `BIGINT UNSIGNED` | YES | NULL | FK | Acting user | `1` |
| `auditable_type` | `VARCHAR(100)` | NO | — | — | Auditable model type | `App\Models\User` |
| `auditable_id` | `BIGINT UNSIGNED` | NO | — | — | Auditable model ID | `1` |
| `event` | `ENUM` | NO | — | — | Audit event | `updated` |
| `old_values` | `JSON` | YES | NULL | — | Previous values | `{"name": "Old Name"}` |
| `new_values` | `JSON` | YES | NULL | — | New values | `{"name": "New Name"}` |
| `ip_address` | `VARCHAR(45)` | YES | NULL | — | IP address | `192.168.1.100` |
| `user_agent` | `VARCHAR(500)` | YES | NULL | — | User agent string | `Mozilla/5.0...` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-01-15 10:30:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-01-15 10:30:00` |

**Event Enum:** `created`, `updated`, `deleted`

---

## 27. platform_fees

| Column | Data Type | Nullable | Default | Key | Description | Example |
|--------|-----------|----------|---------|-----|-------------|---------|
| `id` | `BIGINT UNSIGNED` | NO | AUTO_INCREMENT | PK | Fee ID | `1` |
| `donation_id` | `BIGINT UNSIGNED` | NO | — | UNIQUE, FK | Related donation | `1` |
| `percentage` | `DECIMAL(5,2)` | NO | — | — | Fee percentage | `5.00` |
| `amount` | `DECIMAL(12,2)` | NO | — | — | Fee amount | `5000.00` |
| `net_amount` | `DECIMAL(12,2)` | NO | — | — | Net amount after fee | `95000.00` |
| `status` | `ENUM` | NO | `pending` | — | Fee status | `collected` |
| `created_at` | `TIMESTAMP` | YES | NULL | — | Created timestamp | `2026-02-15 14:00:00` |
| `updated_at` | `TIMESTAMP` | YES | NULL | — | Updated timestamp | `2026-02-15 14:00:00` |

**Status Enum:** `pending`, `collected`, `refunded`
