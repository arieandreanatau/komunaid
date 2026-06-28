# KomunaID — Database Audit

> 101 migrations, 69 Eloquent models, MySQL 8.0, charset `utf8mb4`.
> Verifikasi via `php artisan migrate:status` + `mysql -u root -e "SHOW DATABASES"` + `SHOW TABLES`.

## 1. Environment

* DB_CONNECTION=mysql, DB_HOST=127.0.0.1:3306, DB_DATABASE=komunaid (configured)
* Charset: utf8mb4, Collation: utf8mb4_unicode_ci
* `DB_CONNECTION=sqlite` fallback juga tersedia

## 2. Migration Status

Output `php artisan migrate:status`:

```
Semua migrasi (101 baris) berstatus "Ran" (kode [4]). Tidak ada pending.
```

## 3. Tabel yang signifikan

(Diperoleh dengan `SHOW TABLES` di DB `komunaid`)

### User & Auth
- `users` (soft deletes, banned_at, last_login_*)
- `password_reset_tokens`
- `personal_access_tokens` (Sanctum)
- `sessions` (DB session)
- `cache`, `cache_locks`
- `failed_jobs`, `jobs`, `job_batches`

### Spatie
- `roles`, `permissions`, `model_has_permissions`, `model_has_roles`, `role_has_permissions`

### Profile
- `profiles` (expanded)
- `interests`, `interest_user` (pivot)

### Community
- `community_categories`
- `communities`
- `community_members` (status, role)
- `member_join_histories`
- `community_regions`
- `community_subgroups`
- `community_bans`
- `community_member_roles`
- `community_internal_roles`
- `community_managements`
- `community_volunteers`
- `community_ownership_transfers`
- `community_bookmarks`

### Event
- `events` (status enum)
- `event_registrations`
- `event_payment_confirmations`
- `event_galleries`
- `event_chats`
- `event_chat_threads`
- `event_volunteer_campaigns`
- `event_volunteer_applications`
- `event_volunteers`
- `event_donations`
- `event_finance_transactions`
- `event_finance_summaries`

### Brand / Company
- `brands`
- `brand_members`
- `brand_ownership_transfers`
- `companies`
- `company_brand_members`
- `campaigns`
- `community_campaigns`
- `community_campaign_applications`

### Collaboration
- `collaboration_requests` (legacy)
- `collaboration_proposals` (polymorphic)
- `collaboration_types`

### Master
- `regions` + `master_regions` (doang)
- `event_types`
- `translations`
- `platform_fees`

### Wallet / Donation
- `wallets`
- `wallet_transactions`
- `donations`

### CMS
- `cms_pages`
- `blogs`
- `homepage_sections`
- `contact_settings`
- `suggestions`

### Admin Chat
- `admin_conversations`
- `admin_conversation_participants`
- `admin_messages`

### Premium
- `premium_plans`
- `subscriptions`
- `feature_locks`
- `feature_usages`

### Other
- `role_requests`, `role_approvals`
- `friendships`
- `member_galleries`
- `member_histories`
- `custom_notifications`
- `audit_logs`
- `approval_logs`
- `login_logs`
- `documentation_files`

## 4. Temuan Schema

| # | Tabel / Isu | Severity | Catatan |
|---|-------------|----------|---------|
| DB01 | `regions` dan `master_regions` keduanya ada | Medium | Tumpang tindih; perlu konsolidasi (lihat `02_MODULE_GAP_ANALYSIS.md` G32) |
| DB02 | `collaboration_requests` (legacy) + `collaboration_proposals` (baru) | Medium | Tidak ada deprecation marker; perlu klarifikasi |
| DB03 | Tidak ada tabel `products` / `product_categories` | Medium | Brand tidak punya produk persisten |
| DB04 | `event_payment_confirmations` ada, tapi tidak ada tabel `payments` terpusat | Medium | Payment manual tanpa gateway |
| DB05 | `translations` ada, tapi tidak ada tabel `languages` | Low | Master bahasa hilang |
| DB06 | `audit_logs` tidak punya index pada `created_at` | Low | Query lambat di tabel besar |
| DB07 | `login_logs` sudah nullable `user_id` (good) | ✅ | |
| DB08 | `users.email` sudah nullable (per `2026_06_25_010001`) | ✅ | Login by `username` dimungkinkan |
| DB09 | Soft deletes di `users` | ✅ | |
| DB10 | Foreign keys dengan `cascadeOnDelete` | perlu dicek — kebanyakan model pakai `belongsTo`/`hasMany` |
| DB11 | Tidak ada migration untuk `notifications` (Laravel default) | ✅ (uses `custom_notifications` instead) |
| DB12 | Tidak ada `jobs` & `failed_jobs` di seed default | ✅ (ada migration `create_jobs_table`) |
| DB13 | `personal_access_tokens` (Sanctum) ada, tapi tidak ada API routes | OK — siap untuk fase mobile |

## 5. Index & Performance

* Beberapa tabel sudah punya index di migration (`status`, `slug`).
* `audit_logs`, `login_logs` tidak punya index komposit — query reporting bisa lambat.
* `event_registrations` perlu index `(event_id, user_id)` jika ada banyak peserta (perlu dicek).

## 6. Rekomendasi

1. Konsolidasi `regions` vs `master_regions` di migration baru.
2. Tambah tabel master: `products`, `product_categories`, `payment_methods`, `languages`, `notification_templates`, `email_templates`, `report_reasons`, `suspend_reasons`, `badges`.
3. Tambah index komposit: `(created_at)`, `(user_id, created_at)`, `(event_id, user_id)` di tabel yang relevan.
4. Hapus/deprecate `collaboration_requests` jika `collaboration_proposals` adalah sumber kebenaran (atau dokumentasikan kedua untuk transisi).
5. Backup schema sebelum enhancement fase F.

## 7. Backup yang dilakukan

Tidak ada backup otomatis. **Sebelum enhancement F**, snapshot struktur DB:

```bash
mysqldump -u root --no-data komunaid > storage/qa/db_schema_2026_06_28.sql
```

(Lihat di `bugfix/01_BUG_FIXING_REPORT.md` apakah sudah dieksekusi.)
