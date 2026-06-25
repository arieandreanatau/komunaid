<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Policies\CompanyPolicy;
use Tests\TestCase;

class CompanyPolicyTest extends TestCase
{
    private function makeCompany(User $owner): Company
    {
        return Company::create([
            'owner_id' => $owner->id,
            'name' => 'Test Co ' . uniqid(),
            'slug' => 'test-co-' . uniqid(),
            'status' => 'active',
            'created_by' => $owner->id,
        ]);
    }

    public function test_superadmin_can_view_any_company(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('superadmin');

        $owner = User::factory()->create();
        $owner->assignRole('company_owner');
        $company = $this->makeCompany($owner);

        $policy = new CompanyPolicy();
        $this->assertTrue($policy->view($admin, $company));
        $this->assertTrue($policy->viewAny($admin));
    }

    public function test_owner_can_view_own_company(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('company_owner');
        $company = $this->makeCompany($owner);

        $policy = new CompanyPolicy();
        $this->assertTrue($policy->view($owner, $company));
    }

    public function test_non_owner_cannot_view_company(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('company_owner');
        $company = $this->makeCompany($owner);

        $other = User::factory()->create();
        $other->assignRole('company_owner');

        $policy = new CompanyPolicy();
        $this->assertFalse($policy->view($other, $company));
    }

    public function test_only_company_owner_role_can_create(): void
    {
        $member = User::factory()->create();
        $member->assignRole('member');

        $owner = User::factory()->create();
        $owner->assignRole('company_owner');

        $policy = new CompanyPolicy();
        $this->assertFalse($policy->create($member));
        $this->assertTrue($policy->create($owner));
    }

    public function test_owner_can_update_own_company(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('company_owner');
        $company = $this->makeCompany($owner);

        $policy = new CompanyPolicy();
        $this->assertTrue($policy->update($owner, $company));
    }

    public function test_superadmin_can_update_any_company(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('company_owner');
        $company = $this->makeCompany($owner);

        $admin = User::factory()->create();
        $admin->assignRole('superadmin');

        $policy = new CompanyPolicy();
        $this->assertTrue($policy->update($admin, $company));
    }

    public function test_non_owner_cannot_update(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('company_owner');
        $company = $this->makeCompany($owner);

        $other = User::factory()->create();
        $other->assignRole('company_owner');

        $policy = new CompanyPolicy();
        $this->assertFalse($policy->update($other, $company));
    }

    public function test_only_superadmin_can_approve(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('company_owner');
        $company = $this->makeCompany($owner);

        $policy = new CompanyPolicy();
        $this->assertFalse($policy->approve($owner, $company));

        $admin = User::factory()->create();
        $admin->assignRole('superadmin');
        $this->assertTrue($policy->approve($admin, $company));
    }
}
