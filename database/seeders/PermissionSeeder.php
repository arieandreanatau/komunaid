<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'superadmin' => [
                'access superadmin dashboard',
                'manage users',
                'manage members',
                'manage community owners',
                'manage brand owners',
                'manage companies',
                'manage communities',
                'manage events',
                'manage master data',
                'manage cms',
                'manage suggestions',
                'manage role requests',
                'manage premium trials',
                'view metrics',
                'view login logs',
                'view audit logs',
                'use admin chat',
            ],
            'platform_admin' => [
                'access superadmin dashboard',
                'manage users',
                'manage communities',
                'manage events',
                'manage role requests',
            ],
            'member' => [
                'access member dashboard',
                'edit own profile',
                'manage own interests',
                'view own communities',
                'view own events',
                'manage own bookmarks',
                'manage own friends',
                'manage own gallery',
                'request role',
            ],
            'community_owner' => [
                'access community owner dashboard',
                'manage own communities',
                'manage community members',
                'manage community management',
                'manage community volunteers',
                'manage community campaigns',
                'manage community events',
                'view community reports',
            ],
            'brand_owner' => [
                'access brand owner dashboard',
                'manage own brands',
                'create collaboration proposal',
                'view brand collaborations',
            ],
            'company_owner' => [
                'access company owner dashboard',
                'manage own companies',
                'manage company brands',
                'view company collaborations',
            ],
        ];

        foreach ($permissions as $roleName => $permissionList) {
            $role = Role::where('name', $roleName)->first();
            if (!$role) {
                continue;
            }

            foreach ($permissionList as $permissionName) {
                $permission = Permission::firstOrCreate(
                    ['name' => $permissionName, 'guard_name' => 'web']
                );

                if (!$role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                }
            }
        }
    }
}
