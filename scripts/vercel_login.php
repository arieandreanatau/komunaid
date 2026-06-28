<?php
$base = 'https://komunaidv2-komuna.vercel.app';
$users = [
    ['email' => 'superadmin@komuna.test', 'expected' => '/superadmin/dashboard'],
    ['email' => 'admin@komuna.test', 'expected' => '/superadmin/dashboard'],
    ['email' => 'member@komuna.test', 'expected' => '/member/dashboard'],
    ['email' => 'community.owner@komuna.test', 'expected' => '/community-own/dashboard'],
    ['email' => 'brand.owner@komuna.test', 'expected' => '/brand/dashboard'],
    ['email' => 'company.owner@komuna.test', 'expected' => '/company-owner/dashboard'],
    ['email' => 'banned@komuna.test', 'expected' => '/account-restricted'],
    ['email' => 'suspended@komuna.test', 'expected' => '/account-restricted'],
];

$password = 'password';

echo "=== VERCEL LOGIN FLOW ===\n\n";
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
