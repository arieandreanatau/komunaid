<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{

    private function createUserWithRole(string $role, array $overrides = []): User
    {
        $user = User::factory()->create($overrides);
        $user->assignRole($role);
        return $user;
    }

    public function test_guest_redirected_to_login_for_member_routes(): void
    {
        $response = $this->get('/member/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_guest_redirected_to_admin_login_for_superadmin_routes(): void
    {
        $response = $this->get('/superadmin/dashboard');
        $response->assertRedirect(route('admin.login'));
    }

    public function test_member_cannot_access_superadmin_dashboard(): void
    {
        $user = $this->createUserWithRole('member');
        $this->actingAs($user);

        $response = $this->get('/superadmin/dashboard');
        $response->assertStatus(403);
    }

    public function test_member_cannot_access_community_owner_dashboard(): void
    {
        $user = $this->createUserWithRole('member');
        $this->actingAs($user);

        $response = $this->get('/community-own/dashboard');
        $response->assertStatus(403);
    }

    public function test_community_owner_can_access_community_dashboard(): void
    {
        $user = $this->createUserWithRole('community_owner');
        $this->actingAs($user);

        $response = $this->get('/community-own/dashboard');
        $response->assertStatus(200);
    }

    public function test_community_owner_cannot_access_brand_dashboard(): void
    {
        $user = $this->createUserWithRole('community_owner');
        $this->actingAs($user);

        $response = $this->get('/brand/dashboard');
        $response->assertStatus(403);
    }

    public function test_brand_owner_can_access_brand_dashboard(): void
    {
        $user = $this->createUserWithRole('brand_owner');
        $this->actingAs($user);

        $response = $this->get('/brand/dashboard');
        $response->assertStatus(200);
    }

    public function test_brand_owner_cannot_access_company_dashboard(): void
    {
        $user = $this->createUserWithRole('brand_owner');
        $this->actingAs($user);

        $response = $this->get('/company-owner/dashboard');
        $response->assertStatus(403);
    }

    public function test_company_owner_can_access_company_dashboard(): void
    {
        $user = $this->createUserWithRole('company_owner');
        $this->actingAs($user);

        $response = $this->get('/company-owner/dashboard');
        $response->assertStatus(200);
    }

    public function test_superadmin_can_access_superadmin_dashboard(): void
    {
        $user = $this->createUserWithRole('superadmin');
        $this->actingAs($user);

        $response = $this->get('/superadmin/dashboard');
        $response->assertStatus(200);
    }

    public function test_platform_admin_can_access_superadmin_dashboard(): void
    {
        $user = $this->createUserWithRole('platform_admin');
        $this->actingAs($user);

        $response = $this->get('/superadmin/dashboard');
        $response->assertStatus(200);
    }

    public function test_member_can_access_member_dashboard(): void
    {
        $user = $this->createUserWithRole('member');
        $this->actingAs($user);

        $response = $this->get('/member/dashboard');
        $response->assertStatus(200);
    }

    public function test_banned_user_redirected_from_member_dashboard(): void
    {
        $user = $this->createUserWithRole('member', [
            'status' => 'banned',
            'banned_at' => now(),
        ]);
        $this->actingAs($user);

        $response = $this->get('/member/dashboard');
        $response->assertRedirect('/login');
    }
}
