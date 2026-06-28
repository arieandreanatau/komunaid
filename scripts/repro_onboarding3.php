<?php
$base = 'http://127.0.0.1:8000';
$jar = sys_get_temp_dir() . '/onb3_' . microtime() . '.txt';
@unlink($jar);

function fetchCsrf($base, $url, $jar) {
    $ch = curl_init($base . $url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
    $body = curl_exec($ch); curl_close($ch);
    preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
    return [$m[1] ?? '', $body];
}

// Login
$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch); curl_close($ch);
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
$token = $m[1];
$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'login' => 'onb-test@komuna.test', 'password' => 'password']), CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
curl_exec($ch); curl_close($ch);

// Visit form page
[$token, $body] = fetchCsrf($base, '/onboarding/role-request?role=community_owner', $jar);
echo "Token on form: $token\n";

// Extract form action
preg_match('/<form[^>]+action="([^"]+)"/', $body, $fm);
echo "Form action: " . ($fm[1] ?? '(none)') . "\n";

// Submit POST with same token
$ch = curl_init($base . ($fm[1] ?? '/onboarding/role-request'));
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'requested_role' => 'community_owner', 'motivation' => 'Test', 'community_name' => 'Test']),
    CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false,
]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$loc = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
curl_close($ch);
echo "POST: $code -> $loc\n";
if ($code >= 500 || strpos($body, 'Exception') !== false || strpos($body, 'Error') !== false) {
    echo substr($body, 0, 3000) . "\n";
}
@unlink($jar);
