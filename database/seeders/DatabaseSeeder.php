<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        // Superadmin
        $superadmin = User::updateOrCreate(
            ['email' => 'superadmin@komuna.id'],
            ['name' => 'Super Admin', 'password' => Hash::make('password')]
        );
        $superadmin->profile()->updateOrCreate(
            ['user_id' => $superadmin->id],
            ['username' => 'superadmin', 'bio' => 'Superadmin KomunaID']
        );
        if (!$superadmin->hasRole('superadmin')) {
            $superadmin->assignRole('superadmin');
        }

        // Member
        $member = User::updateOrCreate(
            ['email' => 'member@komuna.id'],
            ['name' => 'Member User', 'password' => Hash::make('password')]
        );
        $member->profile()->updateOrCreate(
            ['user_id' => $member->id],
            ['username' => 'member', 'bio' => 'Anggota KomunaID', 'city' => 'Jakarta', 'province' => 'DKI Jakarta']
        );
        if (!$member->hasRole('member')) {
            $member->assignRole('member');
        }

        // Community Owner
        $community = User::updateOrCreate(
            ['email' => 'community@komuna.id'],
            ['name' => 'Community Owner', 'password' => Hash::make('password')]
        );
        $community->profile()->updateOrCreate(
            ['user_id' => $community->id],
            ['username' => 'community_owner', 'bio' => 'Pemilik komunitas di KomunaID', 'city' => 'Bandung', 'province' => 'Jawa Barat']
        );
        if (!$community->hasRole('community_owner')) {
            $community->assignRole('community_owner');
        }

        // Brand Owner
        $brand = User::updateOrCreate(
            ['email' => 'brand@komuna.id'],
            ['name' => 'Brand Owner', 'password' => Hash::make('password')]
        );
        $brand->profile()->updateOrCreate(
            ['user_id' => $brand->id],
            ['username' => 'brand_owner', 'bio' => 'Pemilik brand di KomunaID', 'city' => 'Surabaya', 'province' => 'Jawa Timur']
        );
        if (!$brand->hasRole('brand_owner')) {
            $brand->assignRole('brand_owner');
        }

        $this->call([
            CommunityCategorySeeder::class,
            CommunitySeeder::class,
            CommunityOwnerSeeder::class,
        ]);
    }
}
