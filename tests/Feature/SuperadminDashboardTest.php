<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Community;
use App\Models\CommunityCategory;
use Tests\TestCase;

class SuperadminDashboardTest extends TestCase
{

    private function createSuperadmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('superadmin');
        return $user;
    }

    public function test_superadmin_dashboard_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/dashboard');
        $response->assertStatus(200);
    }

    public function test_members_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/members');
        $response->assertStatus(200);
    }

    public function test_communities_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/communities');
        $response->assertStatus(200);
    }

    public function test_events_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/events');
        $response->assertStatus(200);
    }

    public function test_brands_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/brands');
        $response->assertStatus(200);
    }

    public function test_companies_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/companies');
        $response->assertStatus(200);
    }

    public function test_cms_dashboard_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/cms');
        $response->assertStatus(200);
    }

    public function test_admin_chat_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/admin-chat');
        $response->assertStatus(200);
    }

    public function test_documentation_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/documentation');
        $response->assertStatus(200);
    }

    public function test_approval_center_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/approval-center');
        $response->assertStatus(200);
    }

    public function test_role_requests_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/role-requests');
        $response->assertStatus(200);
    }

    public function test_community_owners_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/community-owners');
        $response->assertStatus(200);
    }

    public function test_brand_owners_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/brand-owners');
        $response->assertStatus(200);
    }

    public function test_login_logs_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/login-logs');
        $response->assertStatus(200);
    }

    public function test_audit_logs_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/audit-logs');
        $response->assertStatus(200);
    }

    public function test_master_data_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/master-data');
        $response->assertStatus(200);
    }

    public function test_settings_profile_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/settings/profile');
        $response->assertStatus(200);
    }

    public function test_settings_password_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/settings/password');
        $response->assertStatus(200);
    }

    public function test_non_superadmin_gets_403(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/superadmin/dashboard');
        $response->assertStatus(403);
    }
}
