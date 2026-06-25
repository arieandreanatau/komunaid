#!/bin/bash
# KomunaID V2 - Production Deployment Checklist Script
# This is a CHECKLIST, not automated deployment
# Review each step manually before proceeding

set -e

echo "============================================"
echo " KomunaID V2 - Production Deployment"
echo "============================================"
echo ""
echo "WARNING: This script provides step-by-step"
echo "instructions. Execute each step manually."
echo ""

# Configuration (UPDATE THESE)
APP_DIR="/var/www/komunaid"
PROD_BRANCH="main"
PRE_DEPLOY_TAG="v$(date +%Y%m%d-%H%M%S)-pre"

echo "=== PRE-DEPLOYMENT CHECKLIST ==="
echo ""
echo "Verify the following before proceeding:"
echo "[ ] 1. Database backup completed"
echo "[ ] 2. Storage backup completed"
echo "[ ] 3. Maintenance window confirmed"
echo "[ ] 4. .env production credentials ready"
echo "[ ] 5. SSL certificate valid"
echo "[ ] 6. Staging QA passed"
echo "[ ] 7. Staging smoke test passed"
echo "[ ] 8. Migration reviewed (no destructive)"
echo "[ ] 9. Stakeholders notified"
echo ""
read -p "All items confirmed? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled. Complete all checks first."
    exit 1
fi

echo ""
echo "=== STEP 1: BACKUP ==="
echo "Run these commands manually:"
echo "  mysqldump -u USER -p DB_NAME > backup_$(date +%Y%m%d).sql"
echo "  tar -czf storage_backup_$(date +%Y%m%d).tar.gz storage/app/public"
echo "  cd $APP_DIR && git tag -a $PRE_DEPLOY_TAG -m 'Pre-deploy backup'"
echo "  git push origin $PRE_DEPLOY_TAG"
echo ""
read -p "Backup completed? (y/n): " backup_ok
if [ "$backup_ok" != "y" ]; then
    echo "Deployment cancelled. Complete backup first."
    exit 1
fi

echo ""
echo "=== STEP 2: MAINTENANCE MODE ==="
cd $APP_DIR
php artisan down

echo ""
echo "=== STEP 3: PULL CODE ==="
git fetch origin
git checkout $PROD_BRANCH
git pull origin $PROD_BRANCH

echo ""
echo "=== STEP 4: INSTALL DEPENDENCIES ==="
composer install --no-dev --optimize-autoloader
npm ci
npm run build

echo ""
echo "=== STEP 5: MIGRATION ==="
echo "Review migration output carefully."
php artisan migrate --force

echo ""
echo "=== STEP 6: STORAGE LINK ==="
php artisan storage:link

echo ""
echo "=== STEP 7: PERMISSIONS ==="
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

echo ""
echo "=== STEP 8: CACHE ==="
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "=== STEP 9: BRING APP UP ==="
php artisan up

echo ""
echo "=== STEP 10: SMOKE TEST ==="
echo "Run smoke test: docs/deployment/SMOKE_TEST_CHECKLIST.md"
echo "Monitor logs: tail -f storage/logs/laravel.log"

echo ""
echo "============================================"
echo " Production deployment complete!"
echo " Run smoke test and monitor logs."
echo "============================================"
