<?php

namespace Database\Seeders\Master;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $existing = DB::table('users')->where('email', 'superadmin@komuna.id')->orWhere('username', 'superadmin')->first();

        if ($existing) {
            DB::table('users')->where('id', $existing->id)->update([
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password'),
                'email_verified_at' => Carbon::now(),
                'status' => 'active',
            ]);
            $user = User::find($existing->id);
        } else {
            $user = User::create([
                'email' => 'superadmin@komuna.id',
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password'),
                'email_verified_at' => Carbon::now(),
                'status' => 'active',
            ]);
        }

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
