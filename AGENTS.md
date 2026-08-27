# Push & Deploy Procedure — KomunaID

Scope: langkah manual untuk operator. Tidak ada rahasia/token yang disimpan di repo.

## Prasyarat

- Working tree bersih atau sudah di-commit.
- E2E suite create event lulus.
- Remote GitHub sudah dikonfigurasi.
- Akun deploy (Vercel/Netlify) sudah ditautkan ke repo.

## 1. Tambah Remote (sekali)

```powershell
git remote add origin https://github.com/<owner>/KomunaID.git
git remote -v
```

## 2. Branch & Commit (hanya perubahan event fix)

```powershell
git checkout -b fix/event-create
git add apps/web/app/dashboard/events/create/page.tsx
git add apps/api/src/routes/events.ts
git add packages/shared/src/index.ts
git commit -m "fix(events): send ISO datetime + map organizer from profile"
```

File lain yang masih modified/untracked di working tree HARUS dipisah ke branch lain atau di-stash. Jangan dicampur dengan event fix.

## 3. Push Branch

```powershell
git push -u origin fix/event-create
```

## 4. Verifikasi Sebelum Deploy

Jalankan dari root monorepo:

```powershell
pnpm install --frozen-lockfile
pnpm --filter @komunaid/api exec tsc --noEmit
pnpm --filter @komunaid/web exec tsc --noEmit
pnpm --filter @komunaid/api exec vitest run
pnpm --filter @komunaid/web test:e2e -- e2e/events.spec.ts
```

Deploy hanya jika semua hijau.

## 5. Deploy ke Vercel (web)

Proyek Vercel harus menunjuk root monorepo dan `apps/web` sebagai direktori build.

```powershell
# Login sekali per mesin
vercel login

# Preview deploy (opsional)
vercel

# Production deploy
vercel --prod
```

Environment variables diset di Vercel dashboard untuk project, BUKAN di file `.env` yang di-commit:

- `NEXT_PUBLIC_API_URL` (web → API)
- `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL` (API — diwajibkan; `JWT_SECRET` ≥32 char di production, dipakai juga utk refresh-token signing: access & refresh memakai secret yang sama)
- `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN` (opsional, default 15m/30d)
- `BCRYPT_ROUNDS`, `NODE_ENV`, `APP_URL`, `API_URL`, `COOKIE_DOMAIN`, `CORS_ORIGIN`, `TRUSTED_PROXIES` (API)
- `RESEND_API_KEY` ATAU `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` (email; tanpa keduanya email tidak terkirim)
- Upload: `UPLOAD_DIR` (local) atau `S3_ENDPOINT`/`S3_BUCKET`/`S3_ACCESS_KEY`/`S3_SECRET_KEY`/`S3_REGION` (object storage)
- Catatan audit: `CSRF_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` TIDAK dibaca oleh kode saat ini (CSRF memakai double-submit random token; refresh-token memakai `JWT_SECRET`) — jangan set sekadar ikut dokumen lama.

## 6. Deploy API

Vercel bisa deploy API via `apps/api` jika entry point kompatibel. Alternatif: Fly.io / Railway.

Fly.io:

```powershell
cd apps/api
fly launch --no-deploy
fly secrets set DATABASE_URL=... JWT_SECRET=... JWT_REFRESH_SECRET=... CSRF_SECRET=...
fly deploy
```

## 7. Migrasi Database

Jalankan sebelum atau setelah deploy, TIDAK sebelum branch terpush:

```powershell
pnpm db:migrate:prod
```

## 8. Post-Deploy Smoke Test

- `GET /api/v1/health` (atau endpoint setara) balas 200.
- Login sebagai owner komunitas, submit create event end-to-end.
- Verifikasi `eventDate` tersimpan di DB dengan offset yang benar.

## Peringatan

- JANGAN commit `.env`, `.env.local`, `.env.production`.
- JANGAN push langsung ke `master` jika protected branch rules aktif.
- JANGAN deploy jika working tree masih kotor.
- JANGAN skip E2E untuk perubahan event.
