<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class MemberModuleTest extends TestCase
{

    private function createMember(): User
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        return $user;
    }

    public function test_member_dashboard_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/dashboard');
        $response->assertStatus(200);
    }

    public function test_member_profile_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/profile');
        $response->assertStatus(200);
    }

    public function test_member_interests_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/interests');
        $response->assertStatus(200);
    }

    public function test_member_communities_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/communities');
        $response->assertStatus(200);
    }

    public function test_member_events_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/events');
        $response->assertStatus(200);
    }

    public function test_member_friends_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/friends');
        $response->assertStatus(200);
    }

    public function test_member_bookmarks_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/bookmarks');
        $response->assertStatus(200);
    }

    public function test_member_gallery_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/gallery');
        $response->assertStatus(200);
    }

    public function test_member_history_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/history');
        $response->assertStatus(200);
    }

    public function test_member_wallet_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/wallet');
        $response->assertStatus(200);
    }

    public function test_member_role_requests_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/role-requests');
        $response->assertStatus(200);
    }

    public function test_member_donations_loads(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->get('/member/donations');
        $response->assertStatus(200);
    }

    public function test_member_profile_update(): void
    {
        $user = $this->createMember();
        $this->actingAs($user);

        $response = $this->patch('/member/profile', [
            'bio' => 'Updated bio',
        ]);

        $response->assertSessionHasNoErrors();
    }
}
