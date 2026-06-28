# 50 — ROLLBACK PLAN

## 50.1 Pre-deploy
1. `git tag -a vX.Y.Z -m "release X.Y.Z"` on the commit.
2. `mysqldump` the production DB.
3. `php artisan storage:link` and snapshot of `storage/app/public`.

## 50.2 Deploy
- For Vercel: rollback via Vercel dashboard (instant).
- For Forge / Ploi / VPS: redeploy the previous tag (`git checkout vX.Y.Z && php artisan optimize:clear && php artisan migrate`).

## 50.3 Post-rollback
1. Restore DB from dump if migrations were run forward.
2. Clear queues: `php artisan queue:flush`.
3. Clear cache: `php artisan optimize:clear`.
4. Smoke `/`, `/login`, `/register`, `/admin/login`.

## 50.4 Communication
- Notify all roles in `custom_notifications` if the rollback affects user-visible data.
- Post a banner on the public landing for 30 minutes.
