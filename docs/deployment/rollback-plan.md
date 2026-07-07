# Rollback Plan

## Overview

This document describes the rollback procedure for KomunaID deployments.

## Frontend Rollback (Vercel)

### Via Vercel Dashboard

1. Go to Vercel Dashboard > komunaid > Deployments
2. Find the last known working deployment
3. Click "..." > "Promote to Production"
4. Verify the rollback at the production URL

### Via CLI

```bash
vercel promote <deployment-url>
```

## API Rollback (Vercel)

Same as frontend rollback — promote a previous deployment.

## Database Rollback

### If migration caused issues

```bash
# Option 1: Revert to previous migration
pnpm db:reset

# Option 2: Manually revert SQL
# Connect to MySQL and run reverse migration SQL
```

### Before running migrations

Always backup before production migrations:

```bash
mysqldump -u USER -p DATABASE_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Emergency Procedure

1. **Stop new deployments**: Do not push to `main`
2. **Rollback frontend**: Promote previous Vercel deployment
3. **Rollback API**: Promote previous Vercel deployment
4. **Database**: Restore from backup if needed
5. **Verify**: Check health endpoint and key flows
6. **Communicate**: Notify team of rollback status

## Post-Rollback

1. Investigate root cause
2. Fix the issue on a feature branch
3. Test thoroughly
4. Create new deployment with fix
5. Document lessons learned
