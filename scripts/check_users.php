<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$emails = ['community.owner@komuna.test','brand.owner@komuna.test','company.owner@komuna.test','admin@komuna.test','superadmin@komuna.id','superadmin@komuna.test','banned@komuna.test','suspended@komuna.test','member@komuna.test'];

foreach ($emails as $email) {
    $u = App\Models\User::where('email',$email)->first();
    if (!$u) { echo "$email : NOT FOUND\n"; continue; }
    $p = $u->profile;
    $roles = $u->getRoleNames()->implode(',');
    echo "$email : id={$u->id} status={$u->status} banned_at=" . ($u->banned_at ?: 'null') . " roles=[$roles]\n";
    if ($p) echo "   profile.username={$p->username}\n";
}
