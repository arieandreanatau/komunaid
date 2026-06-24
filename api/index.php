<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

// On Vercel the project filesystem is read-only; only /tmp is writable.
// Redirect Laravel's writable storage (compiled views, cache, sessions, logs)
// to /tmp so view compilation and logging don't crash at runtime.
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
    $app->useStoragePath($storage);
}

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
