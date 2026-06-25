<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class BrandCompanyCollaborationTest extends TestCase
{

    private function createBrandOwner(): User
    {
        $user = User::factory()->create();
        $user->assignRole('brand_owner');
        return $user;
    }

    private function createCompanyOwner(): User
    {
        $user = User::factory()->create();
        $user->assignRole('company_owner');
        return $user;
    }

    public function test_brand_owner_dashboard_loads(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/dashboard');
        $response->assertStatus(200);
    }

    public function test_brand_owner_brands_index(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/brands');
        $response->assertStatus(200);
    }

    public function test_brand_owner_create_brand_form(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/brands/create');
        $response->assertStatus(200);
    }

    public function test_brand_owner_campaigns_index(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/campaigns');
        $response->assertStatus(200);
    }

    public function test_brand_owner_collaborations_index(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/collaborations');
        $response->assertStatus(200);
    }

    public function test_brand_owner_proposals_index(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/proposals');
        $response->assertStatus(200);
    }

    public function test_brand_owner_community_directory(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/communities');
        $response->assertStatus(200);
    }

    public function test_brand_owner_settings_loads(): void
    {
        $user = $this->createBrandOwner();
        $this->actingAs($user);

        $response = $this->get('/brand/settings/profile');
        $response->assertStatus(200);
    }

    public function test_company_owner_dashboard_loads(): void
    {
        $user = $this->createCompanyOwner();
        $this->actingAs($user);

        $response = $this->get('/company-owner/dashboard');
        $response->assertStatus(200);
    }

    public function test_company_owner_companies_index(): void
    {
        $user = $this->createCompanyOwner();
        $this->actingAs($user);

        $response = $this->get('/company-owner/companies');
        $response->assertStatus(200);
    }

    public function test_company_owner_create_company_form(): void
    {
        $user = $this->createCompanyOwner();
        $this->actingAs($user);

        $response = $this->get('/company-owner/companies/create');
        $response->assertStatus(200);
    }

    public function test_company_owner_collaborations_index(): void
    {
        $user = $this->createCompanyOwner();
        $this->actingAs($user);

        $response = $this->get('/company-owner/collaborations');
        $response->assertStatus(200);
    }

    public function test_company_owner_settings_loads(): void
    {
        $user = $this->createCompanyOwner();
        $this->actingAs($user);

        $response = $this->get('/company-owner/settings/profile');
        $response->assertStatus(200);
    }

    public function test_member_cannot_access_brand_routes(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/brand/dashboard');
        $response->assertStatus(403);
    }

    public function test_member_cannot_access_company_routes(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/company-owner/dashboard');
        $response->assertStatus(403);
    }
}
