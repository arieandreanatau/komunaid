<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Soft-delete an existing demo user
$u = App\Models\User::where('email', 'member@komuna.test')->first();
if ($u) {
    $u->delete();
    echo "Soft-deleted: {$u->email}\n";
} else {
    echo "No member@komuna.test found, creating + soft-deleting\n";
    $reflection = new ReflectionClass($seeder ?? new stdClass);
}

// Now try to re-seed
$seeder = new Database\Seeders\Demo\DemoUserSeeder();
$prop = (new ReflectionClass($seeder))->getProperty('command');
$prop->setAccessible(true);
$prop->setValue($seeder, new class {
    public function info($m){ echo $m . PHP_EOL; }
    public function warn($m){ echo "WARN: $m\n"; }
    public function error($m){ echo "ERROR: $m\n"; }
});
$seeder->run();
echo "Re-seeded OK\n";
