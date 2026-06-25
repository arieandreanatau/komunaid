# KOMUNAID V2 — REQUIREMENTS DOCUMENTATION INDEX

**Version:** 2.0
**Date:** 2026-06-25
**Status:** Draft — Prompt 2 Output
**Tagline:** CONNECT • COMMUNITY • GROW

---

## Daftar Dokumen

| No | File | Judul | Deskripsi |
|----|------|-------|-----------|
| 00 | [00-index.md](00-index.md) | Documentation Index | Halaman ini — navigasi semua dokumen |
| 01 | [01-platform-overview.md](01-platform-overview.md) | Platform Overview & Enhancement | Ringkasan platform, existing features, gap analysis |
| 02 | [02-scope.md](02-scope.md) | Scope MVP, V2, Phase 2 | Pemetaan fitur per phase |
| 03 | [03-actors-roles.md](03-actors-roles.md) | Actor & Role Definition | Daftar aktor, permission matrix, approval flow |
| 04 | [04-module-list.md](04-module-list.md) | Module List | 52 modul teridentifikasi |
| 05 | [05-functional-requirements.md](05-functional-requirements.md) | Functional Requirements | Detail requirement per 52 modul (M01-M52) |
| 06 | [06-non-functional-requirements.md](06-non-functional-requirements.md) | Non-Functional Requirements | Performance, Security, Usability, Compatibility |
| 07 | [07-user-stories.md](07-user-stories.md) | User Stories | 46 user stories semua aktor |
| 08 | [08-use-cases.md](08-use-cases.md) | Use Cases | 30 use cases dengan flow detail |
| 09 | [09-premium-matrix.md](09-premium-matrix.md) | Premium Feature Matrix | 43 fitur: Free, Premium, Phase 2 |
| 10 | [10-trial-premium.md](10-trial-premium.md) | Trial Premium Concept | Mekanisme trial premium |
| 11 | [11-login-separation.md](11-login-separation.md) | Login Separation | URL, redirect, middleware login |
| 12 | [12-multilanguage.md](12-multilanguage.md) | Multilanguage Requirement | 3 bahasa: ID, EN, SUN |
| 13 | [13-environment.md](13-environment.md) | Environment Requirement | Local, Development, Production |
| 14 | [14-ui-ux.md](14-ui-ux.md) | UI/UX Requirement | Design token, components, navigation |
| 15 | [15-ui-flow.md](15-ui-flow.md) | UI Flow Summary | 5 main user flows |
| 16 | [16-sdlc-gap.md](16-sdlc-gap.md) | SDLC Gap & Draft Structure | Gap analysis dokumen SDLC |
| 17 | [17-rtm.md](17-rtm.md) | Requirement Traceability Matrix | 50 entries RTM draft |
| 18 | [18-dev-readiness.md](18-dev-readiness.md) | Development Readiness Checklist | Checklist kesiapan development |
| 19 | [19-risks.md](19-risks.md) | Risks & Notes | Risiko, catatan, DB tables baru |
| 20 | [20-recommendations.md](20-recommendations.md) | Rekomendasi Prompt 3 | Panduan untuk Database & Migration |

---

## Summary Statistics

| Metric | Jumlah |
|--------|--------|
| Modul | 52 |
| User Stories | 46 |
| Use Cases | 30 |
| Functional Requirements | 350+ |
| RTM Entries | 50 |
| New DB Tables (V2) | 16 |
| Existing Features Mapped | 42 |
| Gap Items Identified | 28 |

---

## Priority Distribution

| Phase | Must Have | Should Have | Could Have | Total |
|-------|-----------|-------------|------------|-------|
| MVP | 35 | 2 | 0 | 37 |
| V2 | 0 | 24 | 0 | 24 |
| Phase 2 | 0 | 0 | 24 | 24 |
| **Total** | **35** | **26** | **24** | **85** |

---

## Navigation

```
Prompt 0 — Audit Project Existing
    ↓
Prompt 1 — Fix Bug & Stabilization
    ↓
Prompt 2 — Update Requirement ← (ANDA DI SINI)
    ↓
Prompt 3 — Database & Migration Enhancement ← NEXT
    ↓
Prompt 4+ — Development Features
```
