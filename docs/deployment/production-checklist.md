# Production Checklist

## Pre-Launch

- [ ] All environment variables set in Vercel
- [ ] Production database created on Hostinger
- [ ] DATABASE_URL configured and tested
- [ ] JWT secrets are unique and secure (64+ chars)
- [ ] CORS_ORIGIN set to production domain
- [ ] NODE_ENV=production
- [ ] Prisma migrations run on production DB
- [ ] Seed data loaded (roles, permissions, categories)
- [ ] Default admin accounts created or disabled
- [ ] HTTPS enabled on custom domain
- [ ] DNS configured correctly

## Security

- [ ] All secrets rotated from development values
- [ ] Helmet enabled (verified in main.ts)
- [ ] Rate limiting configured (verified in app.module.ts)
- [ ] CORS restricted to production domain
- [ ] Swagger docs disabled in production
- [ ] Database password is strong (32+ chars)
- [ ] No secrets in git history
- [ ] .env files in .gitignore

## Performance

- [ ] Compression enabled (verified in main.ts)
- [ ] Database connection pooling configured
- [ ] Static assets cached via Vercel CDN
- [ ] Images optimized (Next.js Image component)

## Monitoring

- [ ] Health endpoint accessible: `GET /api/v1/health`
- [ ] Error logging configured
- [ ] Database backups enabled (Hostinger)
- [ ] Vercel deployment notifications configured

## Testing

- [ ] All unit tests passing
- [ ] API endpoints tested manually
- [ ] Authentication flow tested
- [ ] Registration flow tested
- [ ] Community creation flow tested
- [ ] Event creation flow tested
- [ ] Admin panel accessible
- [ ] Mobile responsiveness verified

## Rollback Plan

- [ ] Previous deployment ID noted
- [ ] Database migration rollback strategy documented
- [ ] Team notified of deployment window
