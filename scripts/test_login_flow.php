<?php
// Test full login → dashboard flow for each role
$users = [
    ['email' => 'superadmin@komuna.test', 'password' => 'password', 'expect' => '/superadmin'],
    ['email' => 'admin@komuna.test',      'password' => 'password', 'expect' => '/superadmin'],
    ['email' => 'member@komuna.test',     'password' => 'password', 'expect' => '/member'],
    ['email' => 'community.owner@komuna.test', 'password' => 'password', 'expect' => '/community-own'],
    ['email' => 'brand.owner@komuna.test',     'password' => 'password', 'expect' => '/brand'],
    ['email' => 'company.owner@komuna.test',   'password' => 'password', 'expect' => '/company-owner'],
    ['email' => 'banned@komuna.test',     'password' => 'password', 'expect' => '/account-restricted'],
    ['email' => 'suspended@komuna.test',  'password' => 'password', 'expect' => '/account-restricted'],
    ['email' => 'member@komuna.test',     'password' => 'WRONG',     'expect' => '/login'],
];

echo "=== LOGIN FLOW TEST ===\n\n";
foreach ($users as $u) {
    $email = $u['email'];
    $jar = sys_get_temp_dir() . '/cookie_' . md5($email . microtime()) . '.txt';
    @unlink($jar);

    // GET /login
    $ch = curl_init('http://127.0.0.1:8000/login');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
    $body = curl_exec($ch); curl_close($ch);
    preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
    $token = $m[1] ?? '';

    // POST /login
    $ch = curl_init('http://127.0.0.1:8000/login');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'login' => $email, 'password' => $u['password']]),
        CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $loc  = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    curl_close($ch);

    $path = $loc ? parse_url($loc, PHP_URL_PATH) : '(no redirect)';
    $passed = strpos((string)$path, $u['expect']) !== false;
    $icon = $passed ? 'OK' : 'X ';
    printf("  %s %-38s -> %-30s (status %s)\n", $icon, $email, $path, $code);
    if (!$passed) printf("      expected: %s\n", $u['expect']);
    @unlink($jar);
}
