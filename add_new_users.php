<?php
/*
|--------------------------------------------------------------------------
| New Users + Roles Seeder
|--------------------------------------------------------------------------
| Adds 8 new test users covering roles that need test coverage.
| Idempotent: uses firstOrCreate so re-running won't create duplicates.
|
| Run from project root:  php add_new_users.php
|
| Default password for all new users:  Password123!
|--------------------------------------------------------------------------
*/

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Allow DB override via env var
$envHost = getenv('DB_HOST');
if ($envHost) {
    config([
        'database.connections.mysql.host' => $envHost,
        'database.connections.mysql.port' => getenv('DB_PORT') ?: 3306,
        'database.connections.mysql.database' => getenv('DB_DATABASE') ?: 'u519165229_arie',
        'database.connections.mysql.username' => getenv('DB_USERNAME') ?: 'u519165229_arie',
        'database.connections.mysql.password' => getenv('DB_PASSWORD') ?: 'ArieAndreanaTaufiq1998',
    ]);
    \DB::purge('mysql');
    \DB::reconnect('mysql');
}

$password = 'Password123!';

// Define new users with their roles
$users = [
    [
        'email' => 'company@komuna.id',
        'name' => 'PT Komuna Indonesia (Company Owner)',
        'username' => 'company',
        'roles' => ['company_owner'],
        'status' => 'active',
    ],
    [
        'email' => 'platform@komuna.id',
        'name' => 'Platform Admin',
        'username' => 'platform',
        'roles' => ['platform_admin', 'member'],
        'status' => 'active',
    ],
    [
        'email' => 'community-staff@komuna.id',
        'name' => 'Community Staff Test',
        'username' => 'communitystaff',
        'roles' => ['community_staff', 'member'],
        'status' => 'active',
    ],
    [
        'email' => 'brand-staff@komuna.id',
        'name' => 'Brand Staff Test',
        'username' => 'brandstaff',
        'roles' => ['brand_staff', 'member'],
        'status' => 'active',
    ],
    [
        'email' => 'community-admin@komuna.id',
        'name' => 'Community Admin Test',
        'username' => 'communityadmin',
        'roles' => ['community_admin', 'member'],
        'status' => 'active',
    ],
    [
        'email' => 'volunteer@komuna.id',
        'name' => 'Volunteer Test',
        'username' => 'volunteer',
        'roles' => ['community_volunteer', 'member'],
        'status' => 'active',
    ],
    [
        'email' => 'banned@komuna.id',
        'name' => 'Banned User Test',
        'username' => 'banned',
        'roles' => ['member'],
        'status' => 'banned',
        'banned_at' => now(),
    ],
    [
        'email' => 'premium@komuna.id',
        'name' => 'Premium Member',
        'username' => 'premium',
        'roles' => ['member'],
        'status' => 'active',
    ],
];

$created = 0;
$existing = 0;
$roleAssigned = 0;

foreach ($users as $userData) {
    $user = \App\Models\User::firstOrCreate(
        ['email' => $userData['email']],
        [
            'name' => $userData['name'],
            'username' => $userData['username'],
            'password' => bcrypt($password),
            'email_verified_at' => now(),
            'status' => $userData['status'],
            'banned_at' => $userData['banned_at'] ?? null,
        ]
    );

    if ($user->wasRecentlyCreated) {
        $created++;
        echo "  + Created user: {$userData['email']}\n";
    } else {
        $existing++;
        echo "  = User exists:  {$userData['email']}\n";
    }

    foreach ($userData['roles'] as $roleName) {
        $role = \Spatie\Permission\Models\Role::where('name', $roleName)->first();
        if (!$role) {
            echo "    ! Role not found: $roleName (skipping)\n";
            continue;
        }
        if (!$user->hasRole($roleName)) {
            $user->assignRole($roleName);
            $roleAssigned++;
            echo "    + Assigned role: $roleName\n";
        }
    }
}

echo "\n=== SUMMARY ===\n";
echo "  Users created:  $created\n";
echo "  Users existing: $existing\n";
echo "  Roles assigned: $roleAssigned\n";
echo "\n  Default password: $password\n";
echo "\n  Test URLs:\n";
echo "    /login                                (login form)\n";
echo "    /superadmin/dashboard                 (superadmin@komuna.test / Password123!)\n";
echo "    /company-owner/dashboard              (company@komuna.id / Password123!)\n";
echo "    /member/dashboard                     (member@komuna.id / Password123!)\n";
echo "    /community-own/dashboard              (community@komuna.id / Password123!)\n";
echo "    /brand/dashboard                      (brand@komuna.id / Password123!)\n";
echo "    /account-restricted                   (banned@komuna.id / Password123!)\n";
