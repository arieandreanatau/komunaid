<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'superadmin@komuna.id'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password'),
                'email_verified_at' => Carbon::now(),
                'status' => 'active',
            ]
        );

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'display_name' => 'Super Admin',
                'bio' => 'Platform administrator KomunaID',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'privacy' => 'public',
            ]
        );

        if (!$user->hasRole('superadmin')) {
            $user->assignRole('superadmin');
        }
    }
}
