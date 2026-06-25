# 06 — NON-FUNCTIONAL REQUIREMENTS

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Halaman beranda load time | < 2 detik |
| NFR-002 | Dashboard load time | < 3 detik |
| NFR-003 | Image upload max size | 5MB |
| NFR-004 | Pagination default | 15 item/halaman |

---

## 2. Security

| ID | Requirement |
|----|-------------|
| NFR-010 | HTTPS untuk production |
| NFR-011 | CSRF token di semua form |
| NFR-012 | XSS sanitization |
| NFR-013 | SQL injection prevention (Eloquent/Query Builder) |
| NFR-014 | Password minimum 8 karakter |
| NFR-015 | Rate limiting login (5 attempt/menit) |
| NFR-016 | Session timeout 24 jam |
| NFR-017 | .env tidak di-commit |
| NFR-018 | Credential production tidak di source code |
| NFR-019 | Audit log untuk semua aksi sensitif |

---

## 3. Usability

| ID | Requirement |
|----|-------------|
| NFR-030 | Responsive design (mobile, tablet, desktop) |
| NFR-031 | Accessibility minimum WCAG 2.1 AA |
| NFR-032 | Konsisten brand guidelines |
| NFR-033 | Empty state untuk semua list kosong |
| NFR-034 | Loading indicator untuk operasi async |
| NFR-035 | Success/error message untuk semua aksi user |

---

## 4. Compatibility

| ID | Requirement |
|----|-------------|
| NFR-040 | Browser: Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-041 | Mobile: iOS Safari, Android Chrome |
| NFR-042 | Screen: 320px - 2560px width |

---

## 5. Reliability

| ID | Requirement |
|----|-------------|
| NFR-050 | Database backup daily (production) |
| NFR-051 | Graceful error handling tanpa stack trace ke user |
| NFR-052 | Logging untuk debugging |
