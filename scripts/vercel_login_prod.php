<?php
$base = 'https://komunaidv2-komuna.vercel.app';
$users = [
    ['email' => 'company@komuna.id',         'expected' => '/company-owner/dashboard'],
    ['email' => 'platform@komuna.id',        'expected' => '/superadmin/dashboard'],
    ['email' => 'community-staff@komuna.id', 'expected' => '/member/dashboard'],
    ['email' => 'brand-staff@komuna.id',     'expected' => '/brand/dashboard'],
    ['email' => 'community-admin@komuna.id','expected' => '/member/dashboard'],
    ['email' => 'volunteer@komuna.id',       'expected' => '/member/dashboard'],
    ['email' => 'banned@komuna.id',          'expected' => '/account-restricted'],
    ['email' => 'premium@komuna.id',         'expected' => '/member/dashboard'],
    ['email' => 'member@komuna.id',          'expected' => '/member/dashboard'],
    ['email' => 'community@komuna.id',       'expected' => '/community-own/dashboard'],
    ['email' => 'brand@komuna.id',           'expected' => '/brand/dashboard'],
];

$password = 'Password123!'; // per test_logins.php

echo "=== VERCEL LOGIN FLOW (komuna.id users, password per test_logins.php) ===\n\n";
foreach ($users as $u) {
    $email = $u['email'];
    $jar = sys_get_temp_dir() . '/cookie_v_' . md5($email . microtime()) . '.txt';
    @unlink($jar);

    // GET /login
    $ch = curl_init("$base/login");
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false, CURLOPT_SSL_VERIFYPEER => false, CURLOPT_TIMEOUT => 15]);
    $body = curl_exec($ch); curl_close($ch);
    preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
    $token = $m[1] ?? '';

    if (!$token) { echo "  X $email - no CSRF token\n"; continue; }

    // POST /login
    $ch = curl_init("$base/login");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'login' => $email, 'password' => $password]),
        CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar,
        CURLOPT_FOLLOWLOCATION => false, CURLOPT_SSL_VERIFYPEER => false, CURLOPT_TIMEOUT => 15,
    ]);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $loc  = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    curl_close($ch);

    $path = $loc ? parse_url($loc, PHP_URL_PATH) : '(no redirect)';
    $passed = strpos((string)$path, $u['expected']) !== false;
    $icon = $passed ? 'OK' : 'X ';
    printf("  %s %-38s -> %-30s (status %s)\n", $icon, $email, $path, $code);
    if (!$passed) printf("      expected: %s\n", $u['expected']);
    @unlink($jar);
}
