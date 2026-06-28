<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create a fresh user with no role
$email = 'onb-test@komuna.test';
App\Models\User::withTrashed()->where('email', $email)->forceDelete();

$u = App\Models\User::create([
    'name' => 'Onboarding Test',
    'email' => $email,
    'username' => 'onb_test_' . substr(md5(microtime()), 0, 6),
    'password' => Illuminate\Support\Facades\Hash::make('password'),
    'email_verified_at' => now(),
    'status' => 'active',
]);
echo "Created user id={$u->id} email={$u->email} roles=" . $u->getRoleNames()->implode(',') . "\n";

// Test login redirect target
$redirect = app(\App\Services\Auth\RedirectByRoleService::class)->getRedirectPath($u);
echo "Redirect path: $redirect\n";
