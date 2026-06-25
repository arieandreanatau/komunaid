<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class CommunityModuleTest extends TestCase
{

    private function createCommunityOwner(): User
    {
        $user = User::factory()->create();
        $user->assignRole('community_owner');
        return $user;
    }

    public function test_community_owner_dashboard_loads(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/dashboard');
        $response->assertStatus(200);
    }

    public function test_community_owner_communities_index(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/communities');
        $response->assertStatus(200);
    }

    public function test_community_owner_create_community_form(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/communities/create');
        $response->assertStatus(200);
    }

    public function test_community_owner_events_index(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/events');
        $response->assertStatus(200);
    }

    public function test_community_owner_collaborations_index(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/collaborations');
        $response->assertStatus(200);
    }

    public function test_community_owner_proposals_index(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/proposals');
        $response->assertStatus(200);
    }

    public function test_community_owner_wallet_index(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/wallet');
        $response->assertStatus(200);
    }

    public function test_community_owner_donations_index(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/donations');
        $response->assertStatus(200);
    }

    public function test_member_cannot_access_community_owner_routes(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/community-own/dashboard');
        $response->assertStatus(403);
    }
}
