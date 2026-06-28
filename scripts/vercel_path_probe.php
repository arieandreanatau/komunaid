<?php
$base = 'https://komunaidv2-komuna.vercel.app';
$urls = [
    '/assets/',
    '/build/assets/',
    '/build/',
    '/build/assets/app-B_bpLXJ6.css',
    '/build/assets/app-CIomGrQN.js',
    '/public/build/assets/app-B_bpLXJ6.css',
    '/storage/',
    '/storage/logo.png',
    '/assets/brand/komunaid-logo-full.png',
    '/images/logo.png',
    '/favicon.ico',
    '/apple-touch-icon.png',
];
foreach ($urls as $u) {
    $ch = curl_init($base . $u);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_NOBODY => true, CURLOPT_TIMEOUT => 10, CURLOPT_SSL_VERIFYPEER => false]);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    printf("%-55s %s\n", $u, $code);
}
