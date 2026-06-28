<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Restore soft-deleted users
$deleted = App\Models\User::onlyTrashed()->get();
foreach ($deleted as $u) {
    $u->restore();
    echo "Restored: {$u->email}\n";
}

// Also clean conflicting profiles
foreach (['platform_admin','member','community_owner','brand_owner','company_owner','banned_user','suspended_user'] as $uname) {
    $profiles = App\Models\Profile::where('username', $uname)->get();
    foreach ($profiles as $p) {
        $pUser = App\Models\User::withTrashed()->where('id', $p->user_id)->first();
        if ($pUser) $pUser->forceDelete();
        $p->delete();
    }
}

App\Models\User::withTrashed()->whereIn('email', ['admin@komuna.test','member@komuna.test','community.owner@komuna.test','brand.owner@komuna.test','company.owner@komuna.test','banned@komuna.test','suspended@komuna.test'])->get()
    ->each(function($u){
        $u->forceDelete();
    });

echo "Cleanup done\n";

$seeder = new Database\Seeders\Demo\DemoUserSeeder();
// Attach a dummy command so seeder's $this->command->info() doesn't crash
$reflection = new ReflectionClass($seeder);
$prop = $reflection->getProperty('command');
$prop->setAccessible(true);
$prop->setValue($seeder, new class {
    public function info($msg){ echo $msg . PHP_EOL; }
    public function warn($msg){ echo "WARN: " . $msg . PHP_EOL; }
    public function error($msg){ echo "ERROR: " . $msg . PHP_EOL; }
});
$seeder->run();
echo "Seeded demo users\n";
