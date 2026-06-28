<?php
$base = 'http://127.0.0.1:8000';

// Login as member
$jar = sys_get_temp_dir() . '/onb_' . microtime() . '.txt';
@unlink($jar);

$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch); curl_close($ch);
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
$token = $m[1] ?? '';

$ch = curl_init("$base/login");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'login' => 'member@komuna.test', 'password' => 'password']),
    CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false,
]);
curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$loc  = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
curl_close($ch);
echo "Login: $code -> " . ($loc ?: '(no redirect)') . "\n";

// Now POST to role-request
$ch = curl_init("$base/onboarding/role-request");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "GET /onboarding/role-request: $code\n";
if ($code >= 500) {
    echo "BODY:\n$body\n";
}

// Try community_owner
$ch = curl_init("$base/onboarding/role-request?role=community_owner");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "GET /onboarding/role-request?role=community_owner: $code\n";
if ($code >= 500 || strpos($body, 'Error') !== false) {
    echo "BODY (first 2000 chars):\n" . substr($body, 0, 2000) . "\n";
}
@unlink($jar);
