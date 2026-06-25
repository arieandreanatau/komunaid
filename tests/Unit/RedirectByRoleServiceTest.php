<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\Auth\RedirectByRoleService;
use Tests\TestCase;

class RedirectByRoleServiceTest extends TestCase
{

    private RedirectByRoleService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(RedirectByRoleService::class);
    }

    private function createUserWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);
        return $user;
    }

    public function test_banned_user_redirected_to_account_restricted(): void
    {
        $user = User::factory()->create(['banned_at' => now()]);
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('account.restricted'), $result);
    }

    public function test_suspended_user_redirected_to_account_restricted(): void
    {
        $user = User::factory()->create(['status' => 'suspended']);
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('account.restricted'), $result);
    }

    public function test_banned_status_user_redirected_to_account_restricted(): void
    {
        $user = User::factory()->create(['status' => 'banned']);
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('account.restricted'), $result);
    }

    public function test_superadmin_redirected_to_superadmin_dashboard(): void
    {
        $user = $this->createUserWithRole('superadmin');
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('superadmin.dashboard'), $result);
    }

    public function test_platform_admin_redirected_to_superadmin_dashboard(): void
    {
        $user = $this->createUserWithRole('platform_admin');
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('superadmin.dashboard'), $result);
    }

    public function test_company_owner_redirected_to_company_dashboard(): void
    {
        $user = $this->createUserWithRole('company_owner');
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('company-owner.dashboard'), $result);
    }

    public function test_brand_owner_redirected_to_brand_dashboard(): void
    {
        $user = $this->createUserWithRole('brand_owner');
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('brand.dashboard'), $result);
    }

    public function test_community_owner_redirected_to_community_dashboard(): void
    {
        $user = $this->createUserWithRole('community_owner');
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('community.dashboard'), $result);
    }

    public function test_member_redirected_to_member_dashboard(): void
    {
        $user = $this->createUserWithRole('member');
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('member.dashboard'), $result);
    }

    public function test_user_without_role_redirected_to_onboarding(): void
    {
        $user = User::factory()->create();
        $result = $this->service->getRedirectPath($user);
        $this->assertEquals(route('onboarding'), $result);
    }
}
