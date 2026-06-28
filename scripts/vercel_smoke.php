<?php
$endpoints = [
    '/' => 'Homepage',
    '/up' => 'Health',
    '/login' => 'Login',
    '/admin/login' => 'Admin login',
    '/komunitas' => 'Komunitas',
    '/events' => 'Events',
    '/about' => 'About',
    '/contact' => 'Contact',
    '/blog' => 'Blog',
    '/build/manifest.json' => 'Build manifest',
    '/favicon.ico' => 'Favicon',
    '/nonexistent' => '404',
    '/tentang-kami' => 'tentang-kami (404 expected per README)',
];

$base = 'https://komunaidv2-komuna.vercel.app';
echo "=== VERCEL LIVE TEST ===\n";
echo "Base: $base\n\n";
foreach ($endpoints as $path => $label) {
    $ch = curl_init($base . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HEADER => true,
        CURLOPT_NOBODY => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $h = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    $size = is_string($h) ? strlen($h) : 0;
    printf("%-32s %-4s %sb  %s\n", $path, $code ?: 'ERR', $size, $err ? "err=$err" : $label);
}
