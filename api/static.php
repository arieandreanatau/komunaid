<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Static Asset Server
|--------------------------------------------------------------------------
| Vercel PHP runtime does not auto-serve /build/*, /assets/*, or
| /favicon.ico from the outputDirectory (public/). This script serves
| those paths directly from public/.
*/

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/'
);

if ($uri === '/favicon.ico') {
    $base = __DIR__ . '/../public/assets';
    $path = 'brand/komunaid-logo-full.png';
} elseif (str_starts_with($uri, '/build/')) {
    $base = __DIR__ . '/../public/build';
    $path = preg_replace('#^/build/#', '', $uri);
} elseif (str_starts_with($uri, '/assets/')) {
    $base = __DIR__ . '/../public/assets';
    $path = preg_replace('#^/assets/#', '', $uri);
} else {
    http_response_code(404);
    echo "404 Not Found";
    return;
}

$fullPath = $base . '/' . $path;
$realBase = realpath($base);
$realPath = realpath($fullPath);

if (
    $realPath === false ||
    $realBase === false ||
    !str_starts_with($realPath, $realBase) ||
    !is_file($realPath)
) {
    http_response_code(404);
    header('Content-Type: text/plain');
    echo "404 Not Found: " . htmlspecialchars($path, ENT_QUOTES, 'UTF-8') . "\n";
    return;
}

$extension = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
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
header('Content-Length: ' . filesize($realPath));
header('Cache-Control: public, max-age=31536000, immutable');
header('Access-Control-Allow-Origin: *');
header('X-Content-Type-Options: nosniff');

readfile($realPath);
