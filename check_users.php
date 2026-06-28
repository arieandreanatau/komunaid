<?php
chdir('C:\xampp\htdocs\komunaid');
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Now override DB config (after bootstrap, config helper works)
config([
    'database.connections.mysql.host' => 'srv1761.hstgr.io',
    'database.connections.mysql.port' => 3306,
    'database.connections.mysql.database' => 'u519165229_arie',
    'database.connections.mysql.username' => 'u519165229_arie',
    'database.connections.mysql.password' => 'ArieAndreanaTaufiq1998',
]);
DB::purge('mysql');
DB::reconnect('mysql');

echo "=== EXISTING ROLES ===\n";
$roles = Spatie\Permission\Models\Role::pluck('name')->toArray();
foreach ($roles as $r) echo "  - $r\n";

echo "\n=== EXISTING USERS (first 10) ===\n";
$users = App\Models\User::with('roles')->take(10)->get();
foreach ($users as $u) {
    $roleList = $u->roles->pluck('name')->implode(', ') ?: '(none)';
    echo "  - {$u->email} [{$u->status}, banned=" . ($u->banned_at ? 'Y' : 'N') . "] roles: $roleList\n";
}
