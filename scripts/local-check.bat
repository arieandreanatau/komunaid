@echo off
echo ============================================
echo  KomunaID V2 - Local Setup Script
echo ============================================
echo.

cd /d C:\Xampp\htdocs\komunaid

echo [1/7] Clearing optimization cache...
php artisan optimize:clear
echo.

echo [2/7] Checking migration status...
php artisan migrate:status
echo.

echo [3/7] Checking application info...
php artisan about
echo.

echo [4/7] Running tests...
php artisan test
echo.

echo [5/7] Building frontend assets...
npm run build
echo.

echo [6/7] Creating storage link...
php artisan storage:link
echo.

echo [7/7] Setup complete!
echo.
echo ============================================
echo  To run: php artisan serve
echo  Open:   http://127.0.0.1:8000
echo ============================================
echo.
pause
