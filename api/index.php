<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/../vendor/autoload.php';

// On Vercel the project filesystem is read-only; only /tmp is writable.
// We redirect:
//  - storage/             → /tmp/storage    (Laravel runtime writable paths)
//  - bootstrap/cache/     → /tmp/bootcache  (Laravel writes services.php, packages.php,
//                                            config.php, route-v7.php, view cache here)
if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    $storage = '/tmp/storage';
    foreach ([
        $storage . '/framework/views',
        $storage . '/framework/cache/data',
        $storage . '/framework/sessions',
        $storage . '/logs',
        $storage . '/app/public',
    ] as $dir) {
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }

    $bootCache = '/tmp/bootcache';
    if (! is_dir($bootCache)) {
        @mkdir($bootCache, 0755, true);
    }

    // Override the framework cache path BEFORE the app boots so any
    // Cache::store('file') or FileCache writes go to /tmp.
    $app = require __DIR__ . '/../bootstrap/app.php';

    $app->useStoragePath($storage);
    $app->useBootstrapPath($storage . '/bootstrap');
    $app->useCachePath($bootCache);
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
)->send();

$kernel->terminate($request, $response);
