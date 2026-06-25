# 12 — MULTILANGUAGE REQUIREMENT

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Bahasa yang Didukung

| Kode | Bahasa | Status MVP |
|------|--------|------------|
| `id` | Indonesia | Default |
| `en` | Inggris | MVP |
| `sun` | Sunda | MVP |

---

## 2. Requirement

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| ML-001 | Public website bisa ganti bahasa | Should Have | V2 |
| ML-002 | Dashboard minimal mendukung label utama | Should Have | V2 |
| ML-003 | Konten CMS bisa punya versi bahasa | Could Have | Phase 2 |
| ML-004 | Bahasa default Indonesia | Must Have | MVP |
| ML-005 | Fallback ke Indonesia jika translation belum ada | Must Have | MVP |
| ML-006 | Language switcher di navbar/footer | Should Have | V2 |
| ML-007 | Translation file menggunakan Laravel lang | Must Have | MVP |
| ML-008 | Database content translation | — | Phase 2 |

---

## 3. Implementation Plan

### MVP: Laravel lang files

```
resources/lang/id/   (default)
resources/lang/en/
resources/lang/sun/
```

### Phase 2: Database-based CMS translation

**Table: cms_translations**

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | PK |
| page_id | bigint | FK → cms_pages |
| locale | string | id, en, sun |
| content | text | Translated content |
| created_at | timestamp | Created |
| updated_at | timestamp | Updated |

### Premium: Advanced localization

- Date/time formatting per locale
- Number formatting per locale
- RTL support (jika diperlukan)
