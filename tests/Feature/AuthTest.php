<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AuthTest extends TestCase
{

    private array $roles = [
        'superadmin', 'platform_admin', 'member',
        'community_owner', 'brand_owner', 'company_owner',
    ];

    private function createUserWithRole(string $role, array $overrides = []): User
    {
        $user = User::factory()->create($overrides);
        $user->assignRole($role);
        return $user;
    }

    public function test_login_page_loads(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_register_page_loads(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_register_with_email_and_password(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/onboarding');
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_register_with_username_and_password(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'username' => 'testuser',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/onboarding');
        $this->assertDatabaseHas('users', ['username' => 'testuser']);
    }

    public function test_register_without_email_and_username_fails(): void
    {
        $response = $this->post('/register', [
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('username');
    }

    public function test_register_assigns_member_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'Role Test',
            'email' => 'roletest@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $user = User::where('email', 'roletest@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('member'));
    }

    public function test_login_with_email(): void
    {
        $user = $this->createUserWithRole('member');

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('member.dashboard'));
    }

    public function test_login_with_username(): void
    {
        $user = $this->createUserWithRole('member');

        $response = $this->post('/login', [
            'login' => $user->username,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('member.dashboard'));
    }

    public function test_login_wrong_password_fails(): void
    {
        $user = $this->createUserWithRole('member');

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors('login');
    }

    public function test_superadmin_login_via_superadmin_panel(): void
    {
        $user = $this->createUserWithRole('superadmin');

        $response = $this->post('/admin/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('superadmin.dashboard'));
    }

    public function test_member_cannot_login_via_superadmin_panel(): void
    {
        $user = $this->createUserWithRole('member');

        $response = $this->post('/admin/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('login');
    }

    public function test_superadmin_rejected_from_user_login(): void
    {
        $user = $this->createUserWithRole('superadmin');

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('login');
    }

    public function test_banned_user_cannot_login(): void
    {
        $user = $this->createUserWithRole('member', [
            'status' => 'banned',
            'banned_at' => now(),
        ]);

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('account.restricted'));
    }

    public function test_suspended_user_cannot_login(): void
    {
        $user = $this->createUserWithRole('member', [
            'status' => 'suspended',
        ]);

        $response = $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('account.restricted'));
    }

    public function test_logout_invalidates_session(): void
    {
        $user = $this->createUserWithRole('member');

        $this->actingAs($user);
        $response = $this->post('/logout');
        $response->assertRedirect('/login');

        $response = $this->get('/member/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_superadmin_logout_redirects_to_admin_login(): void
    {
        $user = $this->createUserWithRole('superadmin');

        $this->actingAs($user);
        $response = $this->post('/admin/logout');
        $response->assertRedirect(route('admin.login'));
    }

    public function test_register_duplicate_email_fails(): void
    {
        $this->createUserWithRole('member', ['email' => 'dup@example.com']);

        $response = $this->post('/register', [
            'email' => 'dup@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_register_duplicate_username_fails(): void
    {
        $this->createUserWithRole('member', ['username' => 'dupuser']);

        $response = $this->post('/register', [
            'username' => 'dupuser',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('username');
    }

    public function test_forgot_password_page_loads(): void
    {
        $response = $this->get('/forgot-password');
        $response->assertStatus(200);
    }
}
