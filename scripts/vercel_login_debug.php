<?php
$base = 'https://komunaidv2-komuna.vercel.app';
$email = 'member@komuna.id';
$password = 'Password123!';

$jar = sys_get_temp_dir() . '/cookie_dbg_' . microtime() . '.txt';
@unlink($jar);

$ch = curl_init("$base/login");
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_FOLLOWLOCATION => false, CURLOPT_SSL_VERIFYPEER => false]);
$body = curl_exec($ch); curl_close($ch);
preg_match('/<meta name="csrf-token" content="([^"]+)"/', $body, $m);
$token = $m[1];

$ch = curl_init("$base/login");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(['_token' => $token, 'login' => $email, 'password' => $password]),
    CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar,
    CURLOPT_FOLLOWLOCATION => false, CURLOPT_SSL_VERIFYPEER => false,
]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "Body: $body\n";
echo "Code: $code\n";
