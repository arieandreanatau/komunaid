<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class EventModuleTest extends TestCase
{

    private function createCommunityOwner(): User
    {
        $user = User::factory()->create();
        $user->assignRole('community_owner');
        return $user;
    }

    public function test_community_owner_events_index(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/events');
        $response->assertStatus(200);
    }

    public function test_community_owner_create_event_form(): void
    {
        $user = $this->createCommunityOwner();
        $this->actingAs($user);

        $response = $this->get('/community-own/events/create');
        $response->assertStatus(200);
    }

    public function test_public_events_index(): void
    {
        $response = $this->get('/events');
        $response->assertStatus(200);
    }

    public function test_member_events_index(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/member/events');
        $response->assertStatus(200);
    }

    public function test_member_my_registrations(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/member/my-registrations');
        $response->assertStatus(200);
    }
}
