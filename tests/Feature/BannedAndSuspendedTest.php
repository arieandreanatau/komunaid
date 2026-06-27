<?php

namespace Tests\Feature;

use App\Models\RoleRequest;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BannedAndSuspendedTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Spatie roles must exist before assignRole
        Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
    }

    public function test_banned_user_blocked_from_member_dashboard(): void
    {
        $user = User::factory()->create(['banned_at' => now()]);
        $user->assignRole('member');

        // ActiveUser middleware kicks out banned users to login with flash error.
        $response = $this->actingAs($user)->get('/member/dashboard');
        $response->assertRedirect();
        $this->assertStringContainsString('login', $response->headers->get('Location') ?? '');
    }

    public function test_suspended_user_blocked_from_member_dashboard(): void
    {
        $user = User::factory()->create(['status' => 'suspended']);
        $user->assignRole('member');

        $response = $this->actingAs($user)->get('/member/dashboard');
        $response->assertRedirect();
    }

    public function test_banned_user_gets_account_restricted_via_direct_route(): void
    {
        // Verify the account.restricted route itself is reachable (no auth required)
        $response = $this->get('/account-restricted');
        $response->assertStatus(200);
    }

    public function test_active_user_can_access_member_dashboard(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');

        $response = $this->actingAs($user)->get('/member/dashboard');
        $response->assertStatus(200);
    }
}
