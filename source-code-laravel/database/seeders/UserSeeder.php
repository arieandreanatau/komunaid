<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Superadmin
        $sa = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@komunaid.com',
            'password' => Hash::make('password'),
        ]);
        $sa->assignRole('superadmin');
        UserProfile::create(['user_id' => $sa->id, 'full_name' => 'Super Admin']);
        Wallet::create(['user_id' => $sa->id, 'balance' => 0]);

        // Community Owners
        $co1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@komunaid.com',
            'password' => Hash::make('password'),
        ]);
        $co1->assignRole('community_owner');
        UserProfile::create(['user_id' => $co1->id, 'full_name' => 'Budi Santoso', 'phone' => '081234567890']);
        Wallet::create(['user_id' => $co1->id, 'balance' => 100000]);

        $co2 = User::create([
            'name' => 'Rina Wijaya',
            'email' => 'rina@komunaid.com',
            'password' => Hash::make('password'),
        ]);
        $co2->assignRole('community_owner');
        UserProfile::create(['user_id' => $co2->id, 'full_name' => 'Rina Wijaya', 'phone' => '081234567891']);
        Wallet::create(['user_id' => $co2->id, 'balance' => 50000]);

        // Brand Owners
        $bo1 = User::create([
            'name' => 'Ahmad Fauzi',
            'email' => 'ahmad@komunaid.com',
            'password' => Hash::make('password'),
        ]);
        $bo1->assignRole('brand_owner');
        UserProfile::create(['user_id' => $bo1->id, 'full_name' => 'Ahmad Fauzi', 'phone' => '081234567892']);
        Wallet::create(['user_id' => $bo1->id, 'balance' => 200000]);

        $bo2 = User::create([
            'name' => 'Sari Dewi',
            'email' => 'sari@komunaid.com',
            'password' => Hash::make('password'),
        ]);
        $bo2->assignRole('brand_owner');
        UserProfile::create(['user_id' => $bo2->id, 'full_name' => 'Sari Dewi', 'phone' => '081234567893']);
        Wallet::create(['user_id' => $bo2->id, 'balance' => 150000]);

        // Members
        $members = [
            ['name' => 'Andi Pratama', 'email' => 'andi@komunaid.com'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@komunaid.com'],
            ['name' => 'Fajar Nugroho', 'email' => 'fajar@komunaid.com'],
            ['name' => 'Gita Putri', 'email' => 'gita@komunaid.com'],
            ['name' => 'Hadi Kurniawan', 'email' => 'hadi@komunaid.com'],
            ['name' => 'Indah Sari', 'email' => 'indah@komunaid.com'],
            ['name' => 'Joko Susilo', 'email' => 'joko@komunaid.com'],
            ['name' => 'Kartika Dewi', 'email' => 'kartika@komunaid.com'],
            ['name' => 'Luthfi Hakim', 'email' => 'luthfi@komunaid.com'],
            ['name' => 'Maya Anggraini', 'email' => 'maya@komunaid.com'],
        ];

        foreach ($members as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
            ]);
            $user->assignRole('member');
            UserProfile::create(['user_id' => $user->id, 'full_name' => $data['name']]);
            Wallet::create(['user_id' => $user->id, 'balance' => rand(0, 50000)]);
        }
    }
}
