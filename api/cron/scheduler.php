<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Vercel Cron Entry Point
|--------------------------------------------------------------------------
| Hit by Vercel cron per the schedule in vercel.json. The path includes a
| ?token=__CRON_SECRET__ parameter that the VerifyCronToken middleware
| validates. This file is intentionally a thin wrapper that bootstraps
| Laravel and delegates to the existing CronController@run.
*/

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
    $storage = '/tmp/storage';
    foreach ([
        $storage . '/framework/views',
        $storage . '/framework/cache/data',
        $storage . '/framework/sessions',
        $storage . '/logs',
    ] as $dir) {
        if (! is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
    $app->useStoragePath($storage);
}

$kernel = $app->make(Kernel::class);

$request = Request::capture();

$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
