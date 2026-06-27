<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Tests\TestCase;

class HttpPolicyEnforcementTest extends TestCase
{
    private function superadmin(): User
    {
        $u = User::factory()->create();
        $u->assignRole('superadmin');
        return $u;
    }

    private function companyOwner(): User
    {
        $u = User::factory()->create();
        $u->assignRole('company_owner');
        return $u;
    }

    private function member(): User
    {
        $u = User::factory()->create();
        $u->assignRole('member');
        return $u;
    }

    public function test_company_owner_cannot_edit_other_owners_company_via_http(): void
    {
        $ownerA = $this->companyOwner();
        $ownerB = $this->companyOwner();
        $companyB = Company::create([
            'owner_id' => $ownerB->id,
            'name' => 'B Co ' . uniqid(),
            'slug' => 'b-co-' . uniqid(),
            'status' => 'active',
            'created_by' => $ownerB->id,
        ]);

        $this->actingAs($ownerA);
        $response = $this->get("/company-owner/companies/{$companyB->id}/edit");
        $response->assertStatus(403);
    }

    public function test_superadmin_can_edit_any_company_via_http(): void
    {
        $owner = $this->companyOwner();
        $company = Company::create([
            'owner_id' => $owner->id,
            'name' => 'Owned Co ' . uniqid(),
            'slug' => 'owned-co-' . uniqid(),
            'status' => 'active',
            'created_by' => $owner->id,
        ]);

        $this->actingAs($this->superadmin());
        $response = $this->get("/superadmin/companies/{$company->id}");
        $response->assertStatus(200);
    }

    public function test_member_cannot_create_cms_blog_via_http(): void
    {
        $this->actingAs($this->member());
        $response = $this->get('/superadmin/cms/blogs/create');
        $response->assertStatus(403);
    }

    public function test_platform_admin_can_access_cms_via_http(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('platform_admin');
        $this->actingAs($admin);
        $response = $this->get('/superadmin/cms');
        $response->assertStatus(200);
    }

    public function test_member_cannot_access_documentation_via_http(): void
    {
        $this->actingAs($this->member());
        $response = $this->get('/superadmin/documentation');
        $response->assertStatus(403);
    }

    public function test_platform_admin_can_access_documentation_via_http(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('platform_admin');
        $this->actingAs($admin);
        $response = $this->get('/superadmin/documentation');
        $response->assertStatus(200);
    }
}
