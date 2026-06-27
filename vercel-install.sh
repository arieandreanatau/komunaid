#!/bin/bash
set -e
curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
php /tmp/composer-setup.php --install-dir=/tmp --filename=composer
/tmp/composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
php artisan package:discover --ansi || true
php artisan view:cache --ansi || true
php artisan config:cache --ansi || true
php artisan route:cache --ansi || true
