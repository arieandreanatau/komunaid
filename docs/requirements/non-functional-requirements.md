# Non Functional Requirements — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |
| **Status**  | Approved    |

---

## 1. Performance

| ID       | Requirement               | Target                               | Priority | Acceptance Criteria                                                                 |
| -------- | ------------------------- | ------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| NFR-PF01 | Page load time            | < 3 detik (3G), < 1.5 detik (4G)     | High     | GIVEN user membuka halaman WHEN load selesai THEN Lighthouse Performance score ≥ 80 |
| NFR-PF02 | API response time         | < 500ms (p50), < 1500ms (p95)        | High     | GIVEN API endpoint dipanggil WHEN response diterima THEN response time ≤ target     |
| NFR-PF03 | Time to First Byte (TTFB) | < 800ms                              | Medium   | GIVEN user request halaman WHEN server merespon THEN TTFB ≤ 800ms                   |
| NFR-PF04 | Concurrent users          | 100 concurrent (MVP)                 | Medium   | GIVEN 100 user simultan WHEN mengakses platform THEN error rate < 1%                |
| NFR-PF05 | Database query time       | < 200ms (p50)                        | High     | GIVEN query dijalankan WHEN hasil dikembalikan THEN query time ≤ 200ms              |
| NFR-PF06 | Image optimization        | WebP/AVIF, lazy loading              | Medium   | GIVEN gambar dimuat WHEN render THEN gambar ter-optimize dan lazy loaded            |
| NFR-PF07 | Bundle size               | < 250KB (initial JS)                 | Medium   | GIVEN build selesai WHEN bundle dianalisis THEN size ≤ 250KB                        |
| NFR-PF08 | Lighthouse score          | Performance ≥ 80, Accessibility ≥ 90 | High     | GIVEN Lighthouse audit WHEN audit selesai THEN score sesuai target                  |

---

## 2. Availability

| ID       | Requirement                   | Target                 | Priority | Acceptance Criteria                                                                      |
| -------- | ----------------------------- | ---------------------- | -------- | ---------------------------------------------------------------------------------------- |
| NFR-AV01 | Uptime                        | 99.5% (MVP)            | High     | GIVEN bulan berlalu WHEN uptime dihitung THEN ≥ 99.5%                                    |
| NFR-AV02 | Maintenance window            | Minggu 02:00-04:00 WIB | Medium   | GIVEN maintenance diperlukan WHEN dijalankan THEN diluar jam operasional                 |
| NFR-AV03 | Planned downtime notification | 24 jam sebelumnya      | Medium   | GIVEN maintenance terjadwal WHEN notifikasi dikirim THEN user menerima 24 jam sebelumnya |
| NFR-AV04 | Health check endpoint         | GET /api/v1/health     | High     | GIVEN health check dipanggil WHEN server aktif THEN response 200 OK                      |

---

## 3. Scalability

| ID       | Requirement        | Target                                         | Priority | Acceptance Criteria                                                                     |
| -------- | ------------------ | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| NFR-SC01 | Horizontal scaling | Stateless API, bisa scale horizontally         | Medium   | GIVEN load meningkat WHEN instance ditambah THEN性能 linear                             |
| NFR-SC02 | Database scaling   | Read replica-ready schema                      | Low      | GIVEN data meningkat WHEN read replica ditambahkan THEN query tidak error               |
| NFR-SC03 | Storage scaling    | S3-compatible, auto-expanding                  | Medium   | GIVEN file upload meningkat WHEN storage dicek THEN tidak ada batas硬编码               |
| NFR-SC04 | Database growth    | Handle 100K users, 10K communities, 50K events | Medium   | GIVEN data mencapai target WHEN query dijalankan THEN performance tetap sesuai NFR-PF05 |

---

## 4. Security

| ID       | Requirement              | Target                                      | Priority | Acceptance Criteria                                                                                                           |
| -------- | ------------------------ | ------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| NFR-SE01 | Authentication           | JWT access + refresh token                  | High     | GIVEN user login WHEN token diterima THEN access token ≤ 7d, refresh ≤ 30d                                                    |
| NFR-SE02 | Authorization            | RBAC scope-based, 9 role                    | High     | GIVEN user request resource WHEN authorization dicek THEN role dan scope valid                                                |
| NFR-SE03 | Password hashing         | bcrypt, salt rounds ≥ 12                    | High     | GIVEN password di-hash WHEN hash dihasilkan THEN menggunakan bcrypt ≥ 12 rounds                                               |
| NFR-SE04 | Audit log                | Semua mutation action logged                | High     | GIVEN action penting terjadi WHEN audit log dicek THEN action tercatat dengan userId, action, entityType, entityId, timestamp |
| NFR-SE05 | Rate limiting            | Login: 5 attempts/5min, API: 100 req/min    | High     | GIVEN request melebihi batas WHEN dicek THEN response 429 Too Many Requests                                                   |
| NFR-SE06 | Input validation         | Whitelist + transform, forbidNonWhitelisted | High     | GIVEN request diterima WHEN validation dicek THEN unknown properties di-strip                                                 |
| NFR-SE07 | HTTPS                    | Enforced di production                      | High     | GIVEN HTTP request masuk WHEN redirect terjadi THEN redirect ke HTTPS                                                         |
| NFR-SE08 | Session management       | Server-side token invalidation on logout    | High     | GIVEN user logout WHEN token dicek THEN token tidak valid                                                                     |
| NFR-SE09 | CORS                     | Restricted ke configured origin             | High     | GIVEN cross-origin request WHEN CORS dicek THEN hanya origin yang diizinkan                                                   |
| NFR-SE10 | SQL injection prevention | Parameterized queries via Prisma ORM        | High     | GIVEN user input WHEN query dibuat THEN tidak ada raw SQL concatenation                                                       |
| NFR-SE11 | XSS prevention           | Input sanitization, Content Security Policy | High     | GIVEN user input WHEN render THEN tidak ada script injection                                                                  |
| NFR-SE12 | CSRF protection          | SameSite cookies, CSRF token                | High     | GIVEN state-changing request WHEN CSRF dicek THEN token valid                                                                 |

---

## 5. Reliability

| ID       | Requirement           | Target                                    | Priority | Acceptance Criteria                                                                            |
| -------- | --------------------- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| NFR-RL01 | Error handling        | Standardized error response format        | High     | GIVEN error terjadi WHEN response dikirim THEN format { success: false, message, errors }      |
| NFR-RL02 | Retry policy          | Exponential backoff untuk external calls  | Medium   | GIVEN external call gagal WHEN retry dilakukan THEN delay berlipat ganda                       |
| NFR-RL03 | Graceful degradation  | Fallback untuk non-critical features      | Medium   | GIVEN service external down WHEN feature terkait diakses THEN error message jelas, tidak crash |
| NFR-RL04 | Request ID            | x-request-id header di semua response     | Medium   | GIVEN request masuk WHEN response dikirim THEN header x-request-id ada                         |
| NFR-RL05 | Transaction integrity | Database transaction untuk operasi kritis | High     | GIVEN operasi multi-step WHEN transaction gagal THEN rollback otomatis                         |

---

## 6. Backup & Recovery

| ID       | Requirement         | Target                 | Priority | Acceptance Criteria                                            |
| -------- | ------------------- | ---------------------- | -------- | -------------------------------------------------------------- |
| NFR-BK01 | Database backup     | Daily automated backup | High     | GIVEN hari berlalu WHEN backup dicek THEN backup ada dan valid |
| NFR-BK02 | Backup retention    | 30 hari                | Medium   | GIVEN backup berumur > 30 hari WHEN dicek THEN sudah di-rotate |
| NFR-BK03 | Backup verification | Weekly restore test    | Low      | GIVEN backup di-restore WHEN dicek THEN data lengkap           |
| NFR-BK04 | File backup         | S3 versioning enabled  | Medium   | GIVEN file di-upload WHEN version dicek THEN versi tersimpan   |

---

## 7. Recovery

| ID       | Requirement                    | Target               | Priority | Acceptance Criteria                                                       |
| -------- | ------------------------------ | -------------------- | -------- | ------------------------------------------------------------------------- |
| NFR-RC01 | RTO (Recovery Time Objective)  | < 4 jam (MVP)        | High     | GIVEN system down WHEN recovery dilakukan THEN system aktif dalam ≤ 4 jam |
| NFR-RC02 | RPO (Recovery Point Objective) | < 24 jam (MVP)       | High     | GIVEN data loss WHEN restore dilakukan THEN data loss ≤ 24 jam            |
| NFR-RC03 | Disaster recovery plan         | Documented procedure | Medium   | GIVEN disaster terjadi WHEN recovery plan diakses THEN procedure jelas    |

---

## 8. Logging

| ID       | Requirement              | Target                            | Priority | Acceptance Criteria                                                                             |
| -------- | ------------------------ | --------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| NFR-LG01 | Application logging      | Structured JSON logging           | High     | GIVEN event terjadi WHEN log ditulis THEN format JSON dengan timestamp, level, message, context |
| NFR-LG02 | Log levels               | ERROR, WARN, INFO, DEBUG          | Medium   | GIVEN log ditulis WHEN level diperiksa THEN sesuai severity                                     |
| NFR-LG03 | Sensitive data filtering | Password, token, PII tidak di-log | High     | GIVEN log ditulis WHEN content diperiksa THEN tidak ada sensitive data                          |
| NFR-LG04 | Log retention            | 90 hari                           | Medium   | GIVEN log berumur > 90 hari WHEN dicek THEN sudah di-rotate                                     |

---

## 9. Monitoring

| ID       | Requirement            | Target                                  | Priority | Acceptance Criteria                                                                   |
| -------- | ---------------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| NFR-MN01 | Health check           | GET /api/v1/health returns 200          | High     | GIVEN health check dipanggil WHEN server aktif THEN response 200                      |
| NFR-MN02 | Error tracking         | Structured error logging dengan context | Medium   | GIVEN error terjadi WHEN log dicek THEN error punya context (userId, endpoint, stack) |
| NFR-MN03 | Performance monitoring | Response time tracking                  | Medium   | GIVEN request selesai WHEN metrics dicek THEN response time tercatat                  |
| NFR-MN04 | Uptime monitoring      | External uptime check setiap 5 menit    | Medium   | GIVEN sistem aktif WHEN uptime dicek THEN status UP                                   |

---

## 10. Maintainability

| ID       | Requirement          | Target                                 | Priority | Acceptance Criteria                                                      |
| -------- | -------------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------ |
| NFR-MT01 | Code standard        | ESLint + Prettier, zero error          | High     | GIVEN code ditulis WHEN lint dicek THEN zero error                       |
| NFR-MT02 | Documentation        | API docs (Swagger), README per package | Medium   | GIVEN package dibuat WHEN docs dicek THEN dokumentasi ada                |
| NFR-MT03 | Modular architecture | Feature modules, shared package        | High     | GIVEN code dianalisis WHEN structure dicek THEN modular dan terorganisir |
| NFR-MT04 | Type safety          | TypeScript strict mode                 | High     | GIVEN code ditulis WHEN type check dicek THEN zero type errors           |
| NFR-MT05 | Test coverage        | Unit test ≥ 60% (MVP)                  | Medium   | GIVEN test dijalankan WHEN coverage dicek THEN ≥ 60%                     |

---

## 11. Usability

| ID       | Requirement       | Target                                           | Priority | Acceptance Criteria                                                            |
| -------- | ----------------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------ |
| NFR-US01 | Responsive design | Mobile, tablet, desktop                          | High     | GIVEN user mengakses WHEN device dicek THEN layout responsive                  |
| NFR-US02 | Browser support   | Chrome, Firefox, Safari, Edge (2 versi terakhir) | Medium   | GIVEN browser digunakan WHEN fitur dicek THEN berfungsi normal                 |
| NFR-US03 | Navigation        | Konsisten, intuitive, max 3 clicks to target     | Medium   | GIVEN user navigasi WHEN path dicek THEN ≤ 3 clicks ke target                  |
| NFR-US04 | Error messages    | User-friendly, actionable                        | High     | GIVEN error terjadi WHEN pesan ditampilkan THEN jelas dan bisa ditindaklanjuti |
| NFR-US05 | Loading states    | Skeleton/spinner untuk async operations          | Medium   | GIVEN data dimuat WHEN loading dicek THEN indicator ada                        |

---

## 12. Accessibility

| ID       | Requirement           | Target                                 | Priority | Acceptance Criteria                                                                     |
| -------- | --------------------- | -------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| NFR-AC01 | WCAG 2.1 Level AA     | Color contrast, alt text, keyboard nav | Medium   | GIVEN accessibility audit WHEN dicek THEN WCAG AA compliance                            |
| NFR-AC02 | Screen reader support | Semantic HTML, ARIA labels             | Low      | GIVEN screen reader digunakan WHEN content dicek THEN terbaca dengan benar              |
| NFR-AC03 | Keyboard navigation   | Tab order, focus management            | Medium   | GIVEN keyboard digunakan WHEN navigasi dicek THEN semua interactive elements accessible |

---

## 13. Compatibility

| ID       | Requirement           | Target                                           | Priority | Acceptance Criteria                                      |
| -------- | --------------------- | ------------------------------------------------ | -------- | -------------------------------------------------------- |
| NFR-CP01 | Browser compatibility | Chrome 90+, Firefox 90+, Safari 14+, Edge 90+    | Medium   | GIVEN browser digunakan WHEN fitur dicek THEN berfungsi  |
| NFR-CP02 | Device compatibility  | Desktop (1920px), tablet (768px), mobile (375px) | High     | GIVEN device digunakan WHEN layout dicek THEN responsive |
| NFR-CP03 | OS compatibility      | Windows, macOS, iOS, Android                     | Medium   | GIVEN OS digunakan WHEN akses dicek THEN berfungsi       |

---

## 14. Localization

| ID       | Requirement      | Target                             | Priority | Acceptance Criteria                                            |
| -------- | ---------------- | ---------------------------------- | -------- | -------------------------------------------------------------- |
| NFR-LC01 | Primary language | Bahasa Indonesia                   | High     | GIVEN UI ditampilkan WHEN bahasa dicek THEN Indonesia          |
| NFR-LC02 | Date format      | DD MMMM YYYY (contoh: 7 Juli 2026) | Medium   | GIVEN tanggal ditampilkan WHEN format dicek THEN sesuai format |
| NFR-LC03 | Currency format  | IDR (Rp)                           | Medium   | GIVEN harga ditampilkan WHEN format dicek THEN format IDR      |
| NFR-LC04 | Timezone         | Asia/Jakarta (WIB)                 | Medium   | GIVEN waktu ditampilkan WHEN timezone dicek THEN WIB           |

---

## 15. Deployment

| ID       | Requirement            | Target                                  | Priority | Acceptance Criteria                                               |
| -------- | ---------------------- | --------------------------------------- | -------- | ----------------------------------------------------------------- |
| NFR-DP01 | Frontend deployment    | Vercel (auto-deploy from main)          | High     | GIVEN code push ke main WHEN deploy dicek THEN Vercel auto-deploy |
| NFR-DP02 | Backend deployment     | Vercel / Hostinger VPS                  | High     | GIVEN API deploy WHEN endpoint dicek THEN berfungsi               |
| NFR-DP03 | Database hosting       | MySQL 8.x di Hostinger                  | High     | GIVEN database dicek WHEN koneksi dicek THEN remote MySQL aktif   |
| NFR-DP04 | CI/CD                  | GitHub Actions                          | High     | GIVEN PR dibuat WHEN CI dicek THEN pipeline berjalan              |
| NFR-DP05 | Environment management | .env.example, production secrets di平台 | High     | GIVEN env dicek WHEN secrets dicek THEN tidak ada di repository   |

---

## 16. Internationalization (Future)

| ID       | Requirement            | Target                                  | Priority | Acceptance Criteria                                     |
| -------- | ---------------------- | --------------------------------------- | -------- | ------------------------------------------------------- |
| NFR-IF01 | Multi-language support | Bahasa Indonesia (MVP), English (later) | Low      | GIVEN language switch WHEN UI dicek THEN konten berubah |
