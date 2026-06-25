<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRolesIfNeeded();
    }

    protected function seedRolesIfNeeded(): void
    {
        $roles = [
            ['name' => 'superadmin', 'guard_name' => 'web', 'display_name' => 'Superadmin'],
            ['name' => 'platform_admin', 'guard_name' => 'web', 'display_name' => 'Platform Admin'],
            ['name' => 'member', 'guard_name' => 'web', 'display_name' => 'Member'],
            ['name' => 'community_owner', 'guard_name' => 'web', 'display_name' => 'Community Owner'],
            ['name' => 'brand_owner', 'guard_name' => 'web', 'display_name' => 'Brand Owner'],
            ['name' => 'company_owner', 'guard_name' => 'web', 'display_name' => 'Company Owner'],
            ['name' => 'community_staff', 'guard_name' => 'web', 'display_name' => 'Community Staff'],
            ['name' => 'brand_staff', 'guard_name' => 'web', 'display_name' => 'Brand Staff'],
            ['name' => 'event_volunteer', 'guard_name' => 'web', 'display_name' => 'Event Volunteer'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name'], 'guard_name' => $role['guard_name']],
                ['display_name' => $role['display_name']]
            );
        }
    }
}
