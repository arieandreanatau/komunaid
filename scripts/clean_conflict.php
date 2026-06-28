<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

App\Models\Profile::where('username','member')->delete();
App\Models\User::where('email','member@komuna.test')->delete();
echo "cleaned\n";
