<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OnboardingRoleRequestTest extends TestCase
{
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $email = 'onbtest-' . uniqid() . '@komuna.test';
        $this->user = User::create([
            'name' => 'Onboarding Test',
            'email' => $email,
            'username' => 'onbtest_' . substr(md5(uniqid()), 0, 8),
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'status' => 'active',
        ]);
    }

    public function test_role_request_page_loads_for_community_owner(): void
    {
        $response = $this->actingAs($this->user)->get('/onboarding/role-request?role=community_owner');
        $response->assertStatus(200);
    }

    public function test_role_request_page_redirects_for_invalid_role(): void
    {
        $response = $this->actingAs($this->user)->get('/onboarding/role-request?role=invalid_role');
        $response->assertStatus(302);
        $response->assertRedirect('/onboarding');
    }

    public function test_store_role_request_community_owner_succeeds(): void
    {
        $response = $this->actingAs($this->user)->post('/onboarding/role-request', [
            'requested_role' => 'community_owner',
            'motivation' => 'Saya ingin membuat komunitas teknologi',
            'community_name' => 'Komunitas Test',
            'community_category' => 'Teknologi',
        ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('role_requests', [
            'user_id' => $this->user->id,
            'requested_role' => 'community_owner',
            'status' => 'pending',
        ]);
    }

    public function test_store_role_request_brand_owner_succeeds(): void
    {
        $response = $this->actingAs($this->user)->post('/onboarding/role-request', [
            'requested_role' => 'brand_owner',
            'brand_name' => 'Brand Test',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('role_requests', [
            'user_id' => $this->user->id,
            'requested_role' => 'brand_owner',
        ]);
    }

    public function test_store_role_request_company_owner_succeeds(): void
    {
        $response = $this->actingAs($this->user)->post('/onboarding/role-request', [
            'requested_role' => 'company_owner',
            'company_name' => 'Perusahaan Test',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('role_requests', [
            'user_id' => $this->user->id,
            'requested_role' => 'company_owner',
        ]);
    }

    public function test_store_role_request_fails_with_invalid_role(): void
    {
        $response = $this->actingAs($this->user)->post('/onboarding/role-request', [
            'requested_role' => 'superadmin', // not allowed for self-request
        ]);
        $response->assertSessionHasErrors('requested_role');
    }

    public function test_store_role_request_fails_without_role(): void
    {
        $response = $this->actingAs($this->user)->post('/onboarding/role-request', [
            'motivation' => 'test',
        ]);
        $response->assertSessionHasErrors('requested_role');
    }

    public function test_store_role_request_rejects_duplicate_pending(): void
    {
        // First request
        $this->actingAs($this->user)->post('/onboarding/role-request', [
            'requested_role' => 'community_owner',
        ])->assertStatus(302);

        // Second request (should fail with "sudah ada pengajuan")
        $response = $this->actingAs($this->user)->post('/onboarding/role-request', [
            'requested_role' => 'community_owner',
        ]);
        $response->assertSessionHasErrors('requested_role');
    }

    public function test_role_request_status_page_loads(): void
    {
        $rr = $this->user->roleRequests()->create([
            'requested_role' => 'community_owner',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->get("/onboarding/role-request/status/{$rr->id}");
        $response->assertStatus(200);
        $response->assertSee('Status Pengajuan');
    }
}
