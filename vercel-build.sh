#!/bin/bash
set -e
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
npm ci --no-audit --no-fund
npm run build
php artisan package:discover --ansi || true
php artisan view:cache --ansi || true
php artisan config:cache --ansi || true
php artisan route:cache --ansi || true
