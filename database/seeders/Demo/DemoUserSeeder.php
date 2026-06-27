<?php

namespace Database\Seeders\Demo;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $demoUsers = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@komuna.test',
                'username' => 'superadmin',
                'role' => 'superadmin',
                'bio' => 'Platform administrator KomunaID',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
            ],
            [
                'name' => 'Platform Admin',
                'email' => 'admin@komuna.test',
                'username' => 'platform_admin',
                'role' => 'platform_admin',
                'bio' => 'Platform admin KomunaID',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
            ],
            [
                'name' => 'Member User',
                'email' => 'member@komuna.test',
                'username' => 'member',
                'role' => 'member',
                'bio' => 'Anggota aktif KomunaID',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
            ],
            [
                'name' => 'Community Owner',
                'email' => 'community.owner@komuna.test',
                'username' => 'community_owner',
                'role' => 'community_owner',
                'bio' => 'Pemilik komunitas di KomunaID',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
            ],
            [
                'name' => 'Brand Owner',
                'email' => 'brand.owner@komuna.test',
                'username' => 'brand_owner',
                'role' => 'brand_owner',
                'bio' => 'Pemilik brand di KomunaID',
                'city' => 'Surabaya',
                'province' => 'Jawa Timur',
            ],
            [
                'name' => 'Company Owner',
                'email' => 'company.owner@komuna.test',
                'username' => 'company_owner',
                'role' => 'company_owner',
                'bio' => 'Pemilik perusahaan di KomunaID',
                'city' => 'Yogyakarta',
                'province' => 'DI Yogyakarta',
            ],
            [
                'name' => 'Banned User',
                'email' => 'banned@komuna.test',
                'username' => 'banned_user',
                'role' => 'member',
                'bio' => 'User yang dibanned',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'status' => 'banned',
            ],
            [
                'name' => 'Suspended User',
                'email' => 'suspended@komuna.test',
                'username' => 'suspended_user',
                'role' => 'member',
                'bio' => 'User yang disuspend',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'status' => 'suspended',
            ],
        ];

        foreach ($demoUsers as $data) {
            $status = $data['status'] ?? 'active';

            $existing = User::where('username', $data['username'])->first();
            if ($existing) {
                $user = $existing;
                $user->update([
                    'email' => $data['email'],
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => Carbon::now(),
                    'status' => $status,
                    'banned_at' => $status === 'banned' ? Carbon::now() : null,
                ]);
            } else {
                $user = User::updateOrCreate(
                    ['email' => $data['email']],
                    [
                        'name' => $data['name'],
                        'username' => $data['username'],
                        'password' => Hash::make('password'),
                        'email_verified_at' => Carbon::now(),
                        'status' => $status,
                        'banned_at' => $status === 'banned' ? Carbon::now() : null,
                    ]
                );
            }

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'display_name' => $data['name'],
                    'username' => $data['username'],
                    'bio' => $data['bio'],
                    'city' => $data['city'],
                    'province' => $data['province'],
                    'privacy' => 'public',
                ]
            );

            $role = Role::where('name', $data['role'])->first();
            if ($role && !$user->hasRole($data['role'])) {
                $user->assignRole($role);
            }

            if (!$user->hasRole('member') && $data['role'] !== 'member') {
                $memberRole = Role::where('name', 'member')->first();
                if ($memberRole && !$user->hasRole('member')) {
                    $user->assignRole('member');
                }
            }
        }

        $this->command->info('Demo users seeded successfully.');
        $this->command->info('  superadmin@komuna.test / password');
        $this->command->info('  admin@komuna.test / password');
        $this->command->info('  member@komuna.test / password');
        $this->command->info('  community.owner@komuna.test / password');
        $this->command->info('  brand.owner@komuna.test / password');
        $this->command->info('  company.owner@komuna.test / password');
        $this->command->info('  banned@komuna.test / password (banned)');
        $this->command->info('  suspended@komuna.test / password (suspended)');
    }
}
