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

// Static file serving for Vercel PHP runtime
// The Vercel PHP runtime does NOT serve files from public/build/ when
// outputDirectory is set. We intercept /build/* requests here and serve
// the files directly. Try multiple locations because the Vercel build
// may place files at different paths depending on outputDirectory config.
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');

if (preg_match('#^/build/(.*)$#', $uri, $matches)) {
    $path = $matches[1];

    // Try multiple candidate locations for the build files
    $candidates = [
        __DIR__ . '/../public/build/' . $path,
        __DIR__ . '/../build/' . $path,
        __DIR__ . '/public/build/' . $path,
        __DIR__ . '/build/' . $path,
    ];

    $resolved = null;
    foreach ($candidates as $candidate) {
        $realBase = realpath(dirname($candidate) . '/..');
        $realPath = realpath($candidate);
        if (
            $realPath !== false &&
            $realBase !== false &&
            str_starts_with($realPath, $realBase) &&
            is_file($realPath)
        ) {
            $resolved = $realPath;
            break;
        }
    }

    if ($resolved !== null) {
        $extension = strtolower(pathinfo($resolved, PATHINFO_EXTENSION));
        $mimeTypes = [
            'js'    => 'application/javascript; charset=utf-8',
            'mjs'   => 'application/javascript; charset=utf-8',
            'css'   => 'text/css; charset=utf-8',
            'json'  => 'application/json; charset=utf-8',
            'map'   => 'application/json; charset=utf-8',
            'png'   => 'image/png',
            'jpg'   => 'image/jpeg',
            'jpeg'  => 'image/jpeg',
            'gif'   => 'image/gif',
            'svg'   => 'image/svg+xml',
            'webp'  => 'image/webp',
            'ico'   => 'image/x-icon',
            'woff'  => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf'   => 'font/ttf',
            'otf'   => 'font/otf',
            'eot'   => 'application/vnd.ms-fontobject',
            'txt'   => 'text/plain; charset=utf-8',
            'html'  => 'text/html; charset=utf-8',
            'xml'   => 'application/xml; charset=utf-8',
        ];
        $contentType = $mimeTypes[$extension] ?? 'application/octet-stream';

        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($resolved));
        header('Cache-Control: public, max-age=31536000, immutable');
        header('Access-Control-Allow-Origin: *');
        header('X-Content-Type-Options: nosniff');

        readfile($resolved);
        exit;
    }
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
