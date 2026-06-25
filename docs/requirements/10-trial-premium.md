# 10 — TRIAL PREMIUM CONCEPT

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Definisi

Trial premium adalah masa percobaan fitur premium yang diberikan kepada user tertentu tanpa perlu pembayaran.

---

## 2. Requirement

| ID | Requirement | Priority |
|----|-------------|----------|
| TP-001 | Trial duration: 14 atau 30 hari | Must Have |
| TP-002 | Trial bisa diberikan ke community_owner | Must Have |
| TP-003 | Trial bisa diberikan ke brand_owner | Must Have |
| TP-004 | Trial bisa diberikan ke company_owner | Must Have |
| TP-005 | Trial status: active, expired, cancelled | Must Have |
| TP-006 | Tidak perlu payment gateway | Must Have |
| TP-007 | Superadmin bisa activate/deactivate manual | Must Have |
| TP-008 | Setelah trial selesai → fitur premium terkunci | Must Have |
| TP-009 | User mendapat notifikasi sebelum trial expired | Should Have |
| TP-010 | Trial bisa diperpanjang oleh superadmin | Should Have |

---

## 3. Trial Status Flow

```
[inactive] → SA Activate → [active] → Time expires → [expired]
                                                        ↓
                                    SA Deactivate → [cancelled]
```

---

## 4. Database Requirements (untuk Prompt 3)

**Table: trial_subscriptions**

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | PK |
| user_id | bigint | FK → users |
| plan_type | string | e.g. "community_owner", "brand_owner" |
| starts_at | timestamp | Mulai trial |
| ends_at | timestamp | Akhir trial |
| status | enum | active, expired, cancelled |
| activated_by | bigint | FK → users (superadmin) |
| created_at | timestamp | Created |
| updated_at | timestamp | Updated |

---

## 5. MVP Approach

Untuk MVP awal, semua premium bisa dibuka sementara melalui **config/feature flag**:

```php
// config/features.php
return [
    'export_member_data' => env('FEATURE_EXPORT_MEMBER_DATA', true),
    'export_event_data' => env('FEATURE_EXPORT_EVENT_DATA', true),
    'advanced_analytics' => env('FEATURE_ADVANCED_ANALYTICS', true),
    'community_custom_page' => env('FEATURE_COMMUNITY_CUSTOM_PAGE', true),
    'finance_report_advanced' => env('FEATURE_FINANCE_REPORT_ADVANCED', true),
];
```

### Feature Flag Usage

```php
// Blade
@if(config('features.export_member_data'))
    <a href="{{ route('...') }}">Export</a>
@else
    <span class="badge-premium">Premium</span>
@endif
```

```php
// Controller
if (!config('features.advanced_analytics')) {
    abort(403, 'This feature requires premium access.');
}
```

---

## 6. UI Indicators

- Fitur premium: tampilkan badge "Premium" atau lock icon
- CTA: "Upgrade ke Premium" atau "Aktifkan Trial"
- Disabled state untuk fitur terkunci
- Tooltip: "Fitur ini membutuhkan akses premium"
