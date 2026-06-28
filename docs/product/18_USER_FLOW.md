# 18 — USER FLOW

## 18.1 Member end-to-end
```
Landing → /events → filter free → event detail → /register
  → onboarding (interests) → /communities → community detail
  → join → bookmark → /events/{slug} → register
  → (free) confirm → /member/dashboard
  → /member/profile → update photo
  → /member/wallet → (P3) topup
  → /member/notifications → mark all read
  → /member/reports → download CSV
```

## 18.2 Community owner end-to-end
```
/community-owner/dashboard
  → "Buat Komunitas" → submit (pending)
  → wait notification
  → notification: approved
  → /community-owner/communities/{id} → edit profile
  → /community-owner/communities/{id}/sub → add sub
  → /community-owner/communities/{id}/regions → add region
  → /community-owner/members → manage roles
  → /community-owner/events → create event
  → /community-owner/collaborations → list proposals
  → /community-owner/donations → see donations
  → /community-owner/reports → export CSV
```

## 18.3 Brand owner end-to-end
```
/brand-owner/dashboard
  → "Tambah Brand" → submit (pending)
  → wait notification
  → notification: approved
  → /brand-owner/brands/{id} → edit profile
  → /brand-owner/products → (P2) add product
  → /brand-owner/campaigns → create campaign
  → /brand-owner/collaborations → send proposal
  → /brand-owner/events → create event
  → /brand-owner/finance → view report
```

## 18.4 Company owner end-to-end
```
/company-owner/dashboard
  → "Tambah Perusahaan" → submit (pending)
  → wait notification
  → /company-owner/companies/{id} → edit profile
  → "Tambah Brand" → attach to company
  → "CSR" → (P2) add program
  → /company-owner/employees → manage staff
  → /company-owner/reports → export
```

## 18.5 Superadmin end-to-end
```
/admin/login → /superadmin/dashboard
  → pending queues (community, brand, company, role request)
  → bulk approve / reject with reason
  → /superadmin/audit-logs → search
  → /superadmin/login-logs → anomaly detection
  → /superadmin/users → suspend / freeze / delete
  → /superadmin/master-data → edit master
  → /superadmin/cms → update blog, about, contact
  → /superadmin/revenue → platform fee roll-up
  → /superadmin/health → system health
```
