<?php
$endpoints = ['/', '/member', '/superadmin', '/community-own', '/brand', '/company-owner', '/admin'];
foreach ($endpoints as $e) {
    $ch = curl_init('http://127.0.0.1:8000' . $e);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_HEADER => true,
        CURLOPT_NOBODY => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $h = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $loc = '';
    if (preg_match('/^Location:\s*(.+)$/mi', $h, $m)) $loc = trim($m[1]);
    curl_close($ch);
    printf("%-20s %-4s loc=%s\n", $e, $code, $loc);
}
