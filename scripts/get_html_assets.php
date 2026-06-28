<?php
$body = file_get_contents('https://komunaidv2-komuna.vercel.app/');
preg_match_all('/<link[^>]+href="([^"]+)"|<script[^>]+src="([^"]+)"/i', $body, $m);
$urls = array_filter(array_merge($m[1] ?? [], $m[2] ?? []));
foreach ($urls as $u) {
    echo "  $u\n";
}
