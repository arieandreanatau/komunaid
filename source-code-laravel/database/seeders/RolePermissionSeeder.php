<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $saPermissions = [
            'manage_members', 'manage_communities', 'manage_brands', 'manage_events',
            'manage_roles', 'approve_communities', 'approve_brands', 'approve_events',
            'approve_role_requests', 'view_revenue', 'manage_platform',
        ];

        $coPermissions = [
            'manage_own_community', 'manage_community_members', 'manage_community_roles',
            'manage_community_events', 'manage_community_gallery', 'manage_community_posts',
            'manage_community_messages', 'manage_community_collaborations', 'manage_sub_communities',
        ];

        $boPermissions = [
            'manage_own_brand', 'manage_brand_campaigns', 'browse_communities',
            'manage_brand_collaborations',
        ];

        $memberPermissions = [
            'view_profile', 'edit_profile', 'join_community', 'leave_community',
            'register_event', 'donate', 'request_role', 'view_own_history',
        ];

        foreach (array_merge($saPermissions, $coPermissions, $boPermissions, $memberPermissions) as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Roles and assign permissions
        $superadmin = Role::create(['name' => 'superadmin']);
        $superadmin->givePermissionTo(Permission::all());

        $communityOwner = Role::create(['name' => 'community_owner']);
        $communityOwner->givePermissionTo(array_merge($coPermissions, $memberPermissions, ['edit_profile', 'view_profile']));

        $brandOwner = Role::create(['name' => 'brand_owner']);
        $brandOwner->givePermissionTo(array_merge($boPermissions, $memberPermissions, ['edit_profile', 'view_profile']));

        $member = Role::create(['name' => 'member']);
        $member->givePermissionTo($memberPermissions);
    }
}
