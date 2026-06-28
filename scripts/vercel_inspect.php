<?php
$urls = [
    'https://komunaidv2-komuna.vercel.app/',
    'https://komunaidv2-komuna.vercel.app/komunitas',
    'https://komunaidv2-komuna.vercel.app/blog',
    'https://komunaidv2-komuna.vercel.app/build/manifest.json',
    'https://komunaidv2-komuna.vercel.app/nonexistent',
];
foreach ($urls as $u) {
    $ch = curl_init($u);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HEADER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $r = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if (is_string($r)) {
        // split header/body
        $parts = explode("\r\n\r\n", $r, 2);
        $headers = $parts[0] ?? '';
        $body = $parts[1] ?? '';
        $headersOnly = explode("\r\n", $headers);
        echo "===== $u (HTTP $code) =====\n";
        echo "  HEADERS: " . implode(' | ', array_slice($headersOnly, 0, 6)) . "\n";
        echo "  BODY (first 600 chars):\n";
        echo "  " . substr($body, 0, 600) . "\n\n";
    }
}
