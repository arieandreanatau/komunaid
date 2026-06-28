<?php
$base = 'http://127.0.0.1:8000';
$jar = sys_get_temp_dir() . '/onb_real_' . microtime() . '.txt';
@unlink($jar);

// Step 1: GET login page to set up session + get cookies
$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch); curl_close($ch);
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
$token = $m[1];

// Step 2: Login
$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'login' => 'onb-test@komuna.test', 'password' => 'password']), CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
curl_exec($ch); curl_close($ch);

// Step 3: GET the role-request form (preserves session, gets fresh CSRF)
$ch = curl_init("$base/onboarding/role-request?role=community_owner");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
$token = $m[1] ?? '';
echo "Form page: $code, token: " . substr($token, 0, 20) . "...\n";

// Step 4: POST the form with the token from the same page
$ch = curl_init("$base/onboarding/role-request");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'requested_role' => 'community_owner', 'motivation' => 'Saya ingin membuat komunitas teknologi', 'community_name' => 'Komunitas Test', 'community_category' => 'Teknologi', 'community_description' => 'Test description']),
    CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false,
]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$loc = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
curl_close($ch);
echo "POST: $code -> $loc\n";
if ($code >= 400) {
    echo "RESPONSE BODY (first 3000):\n";
    echo substr($body, 0, 3000) . "\n";
}
@unlink($jar);
