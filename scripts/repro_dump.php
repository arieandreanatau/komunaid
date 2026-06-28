<?php
$base = 'http://127.0.0.1:8000';
$jar = sys_get_temp_dir() . '/onb4_' . microtime() . '.txt';
@unlink($jar);

// Login
$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch); curl_close($ch);
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
$token = $m[1];
$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'login' => 'onb-test@komuna.test', 'password' => 'password']), CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
curl_exec($ch); curl_close($ch);

// Get form page
$ch = curl_init("$base/onboarding/role-request?role=community_owner");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Status: $code\n";
echo "Body length: " . strlen($body) . "\n";
echo "BODY (first 3000 chars):\n";
echo substr($body, 0, 3000);
@unlink($jar);
