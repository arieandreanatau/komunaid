# 13 — ENVIRONMENT REQUIREMENT

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Local Development

```env
APP_NAME=KomunaID
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

- Data dummy boleh tersedia
- Seeder demo boleh dijalankan
- Hot reload via Vite

---

## 2. Development/Staging

```env
APP_NAME=KomunaID
APP_ENV=development
APP_DEBUG=true
APP_URL=https://dev.komuna.id

DB_CONNECTION=mysql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

- Database development terpisah
- Data dummy terbatas
- Testing integrasi
- Tidak memakai credential production

---

## 3. Production

```env
APP_NAME=KomunaID
APP_ENV=production
APP_DEBUG=false
APP_URL=https://komuna.id

DB_CONNECTION=mysql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

- APP_DEBUG=false
- Tidak menjalankan seeder demo
- Tidak menampilkan error detail ke user
- Credential tidak di source code
- .env tidak di-commit
- Backup database wajib
- Cache config/route/view digunakan
- SSL aktif

---

## 4. Production Safety

| ID | Requirement |
|----|-------------|
| ENV-001 | .env tidak di-commit ke Git |
| ENV-002 | .env.example di-commit (tanpa values) |
| ENV-003 | Credential production hanya di .env production server |
| ENV-004 | APP_DEBUG=false di production |
| ENV-005 | Error log ke file, bukan ke browser |
