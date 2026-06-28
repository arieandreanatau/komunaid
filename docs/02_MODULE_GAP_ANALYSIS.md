# KomunaID — Module Gap Analysis

> Dibandingkan dengan target MVP dan Advanced feature pada brief.
> Status: **Critical (C)**, **High (H)**, **Medium (M)**, **Low (L)**.

## 1. Public & SEO

| # | Gap | Severity | Lokasi yang terpengaruh |
|---|-----|----------|-------------------------|
| G01 | README mendokumentasikan route yang tidak ada (`/tentang-kami`, `/hubungi-kami`, `/event` singular). | **H** | `README.md` ↔ `routes/modules/public.php` |
| G02 | Tidak ada public page untuk `Campaign` (campaign yang sudah disetujui brand tidak tampil di public area). | M | New: `Public/CampaignController` |
| G03 | Tidak ada sitemap.xml / robots.txt | M | `public/` |
| G04 | OpenGraph/SEO meta di homepage parsial (hanya description). | L | `resources/views/public/home.blade.php` |

## 2. Auth & Onboarding

| # | Gap | Severity |
|---|-----|----------|
| G05 | Tidak ada halaman register khusus "owner komunitas/brand/perusahaan". Onboarding hanya `RoleRequest` setelah jadi `member`. | M (desain) |
| G06 | Email verification belum eksplisit (meskipun `email_verified_at` cast ada, tidak ada middleware `verified`). | M |
| G07 | Tidak ada 2FA untuk superadmin. | L (advanced) |

## 3. Member

| # | Gap | Severity |
|---|-----|----------|
| G08 | Tidak ada Member-side report download. | M |
| G09 | Notification center belum punya UI bell-icon + halaman `/notifications`. | M |
| G10 | Tidak ada upload foto profile (perlu verifikasi controller). | H (jika hilang) |

## 4. Community / Event / Collaboration

| # | Gap | Severity |
|---|-----|----------|
| G11 | Event tidak bisa dibuat brand/perusahaan (hanya komunitas). | M |
| G12 | Tidak ada QR check-in untuk event. | M |
| G13 | Tidak ada sertifikat generator untuk peserta. | L (advanced) |
| G14 | Chat komunitas (non-event) tidak ada. | M |
| G15 | Tap-in tidak ada sebagai entitas terpisah. | L (advanced) |

## 5. Brand / Company

| # | Gap | Severity |
|---|-----|----------|
| G16 | Product & product category tidak ada. | M |
| G17 | Job/internship marketplace tidak ada. | L (advanced) |
| G18 | CSR tidak punya tipe kolaborasi khusus. | L |
| G19 | Tidak ada sponsorship package. | L (advanced) |

## 6. Superadmin

| # | Gap | Severity |
|---|-----|----------|
| G20 | Revenue dashboard — verifikasi apakah metrik `total_revenue` benar-benar ada di `DashboardController`. | M |
| G21 | Approval untuk sub-komunitas / regional tidak eksplisit. | M |
| G22 | Data master `suspend_reason`, `report_reason`, `badge`, `language` tidak ada. | M |
| G23 | Notifikasi broadcast ke semua member belum ada. | L |

## 7. Payment / Wallet / Finance

| # | Gap | Severity |
|---|-----|----------|
| G24 | Tidak ada payment gateway (Midtrans/Xendit). | **H** (advanced) |
| G25 | Tidak ada top-up wallet. | M |
| G26 | Tidak ada refund / invoice / settlement. | M |
| G27 | Tidak ada payment method master. | M |

## 8. CMS

| # | Gap | Severity |
|---|-----|----------|
| G28 | FAQ tidak ada. | M |
| G29 | Terms & Privacy hanya via `CmsPage` (tidak ada template default). | M |
| G30 | Translation hanya 1 file (`admin_chat.php`); Bahasa Inggris tidak lengkap. | H |

## 9. Data Master

| # | Gap | Severity |
|---|-----|----------|
| G31 | `ticket_types`, `product_categories`, `brand_categories`, `company_categories`, `payment_methods`, `report_reasons`, `suspend_reasons`, `badges`, `notification_templates`, `email_templates`, `cms_page_types` master tidak ada. | M |
| G32 | `regions` dan `master_regions` ada dua tabel — tidak konsisten. | M |

## 10. Testing

| # | Gap | Severity |
|---|-----|----------|
| G33 | Tidak ada automated test. | **H** |
| G34 | Tidak ada e2e (Dusk tidak ada). | M |
| G35 | Tidak ada CI workflow. | M |

## 11. Observability & Security

| # | Gap | Severity |
|---|-----|----------|
| G36 | Tidak ada rate-limit global (hanya auth endpoints). | M |
| G37 | Tidak ada 2FA superadmin. | L |
| G38 | `.env` mungkin ter-commit (cek `.gitignore`). | H (security) |
| G39 | Tidak ada CSP / security headers. | M |
| G40 | Tidak ada backup/restore utility. | M |

## 12. Vercel-specific

| # | Gap | Severity |
|---|-----|----------|
| G41 | `SESSION_DRIVER=file` di `.env` lokal. | M (config drift) |
| G42 | `CACHE_STORE` tidak di-set di `.env` lokal (default Laravel: `file`). | M |
| G43 | `vercel.json` cron `__CRON_SECRET__` placeholder perlu diisi di dashboard Vercel. | M |
| G44 | Tidak ada health check publik selain `/up` (Laravel default). | L |

---

## Ringkasan Prioritas

* **Critical/High (perlu immediate fix dalam audit ini):** G01, G10 (verifikasi), G30, G33, G38
* **Medium (di-enhancement backlog):** G02, G04, G08, G09, G11, G14, G16, G20, G24, G25, G28, G31, G32, G36, G39, G41, G42
* **Low / Advanced:** sisanya
