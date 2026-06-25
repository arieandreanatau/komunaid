#!/bin/bash
# KomunaID V2 - Staging Deployment Script (Placeholder)
# Review each step before running in actual staging environment

set -e

echo "============================================"
echo " KomunaID V2 - Staging Deployment"
echo "============================================"

# Configuration (UPDATE THESE)
APP_DIR="/var/www/komunaid-staging"
BRANCH="develop"

echo ""
echo "Pre-deployment checks..."
echo "TODO: Verify staging database backup exists"
echo "TODO: Verify .env is configured for staging"
read -p "Continue with deployment? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "[1/8] Pulling code..."
cd $APP_DIR
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

echo ""
echo "[2/8] Installing dependencies..."
composer install --no-dev --optimize-autoloader

echo ""
echo "[3/8] Building assets..."
npm ci
npm run build

echo ""
echo "[4/8] Running migration..."
php artisan migrate --force

echo ""
echo "[5/8] Running seeders (safe only)..."
# Only run safe seeders, not demo data
# php artisan db:seed --class=RoleSeeder --force
# php artisan db:seed --class=PermissionSeeder --force

echo ""
echo "[6/8] Setting permissions..."
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

echo ""
echo "[7/8] Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "[8/8] Creating storage link..."
php artisan storage:link

echo ""
echo "============================================"
echo " Deployment complete!"
echo " Run smoke test: docs/deployment/SMOKE_TEST_CHECKLIST.md"
echo "============================================"
