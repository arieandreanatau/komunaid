<?php
$baseUrl = 'https://komunaidv2-komuna.vercel.app';

$users = [
    ['email' => 'company@komuna.id',          'expected' => 'company-owner/dashboard'],
    ['email' => 'platform@komuna.id',         'expected' => 'superadmin/dashboard'],
    ['email' => 'community-staff@komuna.id',  'expected' => 'member/dashboard'],
    ['email' => 'brand-staff@komuna.id',      'expected' => 'brand/dashboard'],
    ['email' => 'community-admin@komuna.id', 'expected' => 'member/dashboard'],
    ['email' => 'volunteer@komuna.id',        'expected' => 'member/dashboard'],
    ['email' => 'banned@komuna.id',           'expected' => 'login'],
    ['email' => 'premium@komuna.id',          'expected' => 'member/dashboard'],
    ['email' => 'member@komuna.id',           'expected' => 'member/dashboard'],
    ['email' => 'community@komuna.id',        'expected' => 'community-own/dashboard'],
    ['email' => 'brand@komuna.id',            'expected' => 'brand/dashboard'],
    ['email' => 'superadmin@komuna.test',     'expected' => 'superadmin/dashboard'],
];

$password = 'Password123!';

echo "=== TESTING LOGIN FLOW ===\n\n";

foreach ($users as $u) {
    $email = $u['email'];
    $cookieFile = sys_get_temp_dir() . "/cookie_" . md5($email) . ".txt";
    @unlink($cookieFile);

    // Step 1: GET /login
    $ch = curl_init("$baseUrl/login");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_COOKIEJAR => $cookieFile,
        CURLOPT_COOKIEFILE => $cookieFile,
    ]);
    $body = curl_exec($ch);
    curl_close($ch);

    // Extract csrf-token from meta tag
    preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
    $token = $m[1] ?? '';

    if (!$token) {
        echo "  X $email - no CSRF token\n";
        continue;
    }

    // Step 2: POST /login
    $ch = curl_init("$baseUrl/login");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            '_token' => $token,
            'email' => $email,
            'password' => $password,
        ]),
        CURLOPT_COOKIEJAR => $cookieFile,
        CURLOPT_COOKIEFILE => $cookieFile,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $redirect = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    curl_close($ch);

    $dest = $redirect ? parse_url($redirect, PHP_URL_PATH) : '(no redirect)';
    $passed = strpos((string) $dest, $u['expected']) !== false;
    $icon = $passed ? 'OK' : ($status === 302 ? 'X ' : '--');
    echo sprintf("  %s %-32s -> %s (status %d)\n", $icon, $email, $dest, $status);
    if (!$passed && $status === 302) {
        echo "      expected: /{$u['expected']}\n";
    }
}

echo "\nDone.\n";
