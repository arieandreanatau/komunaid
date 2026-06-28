<?php
$base = 'https://komunaidv2-komuna.vercel.app';
$urls = [
    '/',
    '/build/manifest.json',
    '/assets/app-B_bpLXJ6.css',
    '/assets/app-CIomGrQN.js',
    '/favicon.ico',
];
foreach ($urls as $u) {
    $ch = curl_init($base . $u);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_HEADER => true, CURLOPT_TIMEOUT => 15, CURLOPT_SSL_VERIFYPEER => false]);
    $r = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headers = substr($r, 0, strpos($r, "\r\n\r\n"));
    curl_close($ch);
    $cache = '';
    if (preg_match('/cache-control:\s*([^\r\n]+)/i', $headers, $m)) $cache = $m[1];
    $ct = '';
    if (preg_match('/content-type:\s*([^\r\n]+)/i', $headers, $m)) $ct = $m[1];
    printf("%-45s %-4s ct=%-30s cache=%s\n", $u, $code, $ct, $cache);
}
