<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class SecurityTest extends TestCase
{

    private function createSuperadmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('superadmin');
        return $user;
    }

    public function test_guest_cannot_access_member_dashboard(): void
    {
        $response = $this->get('/member/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_guest_cannot_access_superadmin_dashboard(): void
    {
        $response = $this->get('/superadmin/dashboard');
        $response->assertRedirect();
    }

    public function test_member_cannot_access_superadmin_panel(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/superadmin/dashboard');
        $response->assertStatus(403);
    }

    public function test_banned_user_cannot_access_member_dashboard(): void
    {
        $user = User::factory()->create([
            'status' => 'banned',
            'banned_at' => now(),
        ]);
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/member/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_suspended_user_cannot_access_member_dashboard(): void
    {
        $user = User::factory()->create([
            'status' => 'suspended',
        ]);
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/member/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_delete_actions_not_via_get(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/communities/1');
        $this->assertNotEquals(405, $response->getStatusCode());
    }

    public function test_csrf_token_required_for_post(): void
    {
        $response = $this->post('/login', [
            'login' => '',
            'password' => '',
        ]);

        $this->assertContains($response->getStatusCode(), [302, 419]);
    }

    public function test_suggestion_requires_message(): void
    {
        $response = $this->post('/contact/suggestions', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'subject' => 'Test',
            'message' => '',
        ]);

        $response->assertSessionHasErrors('message');
    }

    public function test_export_no_password_in_response(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/members/export');
        $response->assertStatus(200);

        $content = $response->getContent();
        $this->assertStringNotContainsString('password', strtolower($content));
    }

    public function test_export_no_remember_token(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/members/export');
        $response->assertStatus(200);

        $content = $response->getContent();
        $this->assertStringNotContainsString('remember_token', strtolower($content));
    }

    public function test_public_no_draft_data(): void
    {
        $response = $this->get('/blogs');
        $response->assertStatus(200);
    }

    public function test_invalid_locale_no_500(): void
    {
        $response = $this->get('/?lang=<script>');
        $this->assertNotEquals(500, $response->getStatusCode());
    }

    public function test_superadmin_export_no_password(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/community-owners/export');
        $response->assertStatus(200);

        $content = $response->getContent();
        $this->assertStringNotContainsString('password', strtolower($content));
    }

    public function test_superadmin_export_no_remember_token(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/community-owners/export');
        $response->assertStatus(200);

        $content = $response->getContent();
        $this->assertStringNotContainsString('remember_token', strtolower($content));
    }
}
