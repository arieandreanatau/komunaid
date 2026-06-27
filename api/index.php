<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/../vendor/autoload.php';

// On Vercel the project filesystem is read-only; only /tmp is writable.
// We redirect:
//  - storage/             → /tmp/storage         (Laravel runtime writable paths)
//  - bootstrap/cache/     → /tmp/storage/bootstrap/cache/  (Laravel writes
//                                                   services.php, packages.php,
//                                                   config.php, route-v7.php,
//                                                   view cache here)
//
// We do NOT call useCachePath() because it does not exist on
// Illuminate\Foundation\Application (the Laravel team exposes
// useBootstrapPath which covers the cache directory).
if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    $storage = '/tmp/storage';
    foreach ([
        $storage . '/framework/views',
        $storage . '/framework/cache/data',
        $storage . '/framework/sessions',
        $storage . '/logs',
        $storage . '/app/public',
        $storage . '/bootstrap/cache', // services.php, packages.php, config.php, route-v7.php
    ] as $dir) {
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }

    // Override the framework writable paths BEFORE the app boots.
    $app = require __DIR__ . '/../bootstrap/app.php';

    $app->useStoragePath($storage);
    $app->useBootstrapPath($storage . '/bootstrap');
} else {
    $app = require __DIR__ . '/../bootstrap/app.php';
}

// Surface errors during Vercel runtime so they appear in logs.
if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    ini_set('error_log', '/tmp/storage/logs/php-error.log');
    error_reporting(E_ALL);
}

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
);

// Prevent Vercel CDN from caching stale or auth-protected responses
// so logged-in Vercel users don't see SSO / login pages from a previous
// session instead of the actual Laravel response.
$response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
$response->headers->set('Pragma', 'no-cache');

$response->send();

$kernel->terminate($request, $response);
