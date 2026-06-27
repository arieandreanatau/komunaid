<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Static Asset Server
|--------------------------------------------------------------------------
| The Vercel PHP runtime (vercel-php@0.8.0) does NOT serve files from
| the outputDirectory (public/) for URLs that have a function registered.
| Since api/index.php is registered as the default handler, every URL
| gets routed to it - including /build/manifest.json, /build/assets/*.js
| and /build/assets/*.css - which then return the full HTML page instead
| of the JS/CSS the browser is asking for.
|
| This script acts as a manual static file server for /build/* paths:
| - Strips the /build/ prefix
| - Reads the file from public/build/<path>
| - Sets the right Content-Type
| - Sends a Cache-Control header for long-term caching
|
| It is wired up in vercel.json with a route that matches /build/(.*)
| BEFORE the catch-all that routes to api/index.php.
|
| IMPORTANT: This file is ONLY loaded when the route matches. For
| non-build paths, the normal api/index.php handles the request.
*/

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/'
);

$path = preg_replace('#^/build/#', '', $uri);
$fullPath = __DIR__ . '/../public/build/' . $path;

// Path traversal protection
$realBase = realpath(__DIR__ . '/../public/build');
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

// MIME type detection
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
