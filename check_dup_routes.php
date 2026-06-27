<?php
chdir('C:\Xampp\htdocs\komunaid');
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();
$names = [];
foreach (Illuminate\Support\Facades\Route::getRoutes() as $r) {
    $n = $r->getName();
    if ($n) $names[] = $n;
}
$dups = array_count_values($names);
ksort($dups);
foreach ($dups as $name => $c) {
    if ($c > 1) echo "$c× $name\n";
}
echo 'TOTAL: '.count($names)." named routes\n";
