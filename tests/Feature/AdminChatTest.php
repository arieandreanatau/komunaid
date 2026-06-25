<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\AdminConversation;
use Tests\TestCase;

class AdminChatTest extends TestCase
{

    private function createSuperadmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('superadmin');
        return $user;
    }

    public function test_admin_chat_index_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/admin-chat');
        $response->assertStatus(200);
    }

    public function test_admin_chat_create_page_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/admin-chat/create');
        $response->assertStatus(200);
    }

    public function test_admin_chat_search_loads(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->get('/superadmin/admin-chat/search');
        $response->assertStatus(200);
    }

    public function test_member_cannot_access_admin_chat(): void
    {
        $user = User::factory()->create();
        $user->assignRole('member');
        $this->actingAs($user);

        $response = $this->get('/superadmin/admin-chat');
        $response->assertStatus(403);
    }

    public function test_admin_chat_create_conversation(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $response = $this->post('/superadmin/admin-chat', [
            'title' => 'Test Conversation',
            'type' => 'group',
            'participant_ids' => [$user->id],
            'first_message' => 'Hello everyone!',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('admin_conversations', ['title' => 'Test Conversation']);
    }

    public function test_admin_chat_show_conversation(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $conversation = AdminConversation::factory()->create([
            'created_by' => $user->id,
        ]);

        \App\Models\AdminConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->get("/superadmin/admin-chat/{$conversation->id}");
        $response->assertStatus(200);
    }

    public function test_admin_chat_send_message(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $conversation = AdminConversation::factory()->create([
            'created_by' => $user->id,
        ]);

        \App\Models\AdminConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->post("/superadmin/admin-chat/{$conversation->id}/messages", [
            'body' => 'Hello, this is a test message.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('admin_messages', [
            'conversation_id' => $conversation->id,
            'body' => 'Hello, this is a test message.',
        ]);
    }

    public function test_admin_chat_message_escapes_html(): void
    {
        $user = $this->createSuperadmin();
        $this->actingAs($user);

        $conversation = AdminConversation::factory()->create([
            'created_by' => $user->id,
        ]);

        \App\Models\AdminConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->post("/superadmin/admin-chat/{$conversation->id}/messages", [
            'body' => '<script>alert("xss")</script>',
        ]);

        $response->assertRedirect();
        $message = \App\Models\AdminMessage::where('conversation_id', $conversation->id)->first();
        $this->assertNotNull($message);
        $this->assertStringNotContainsString('<script>', $message->body);
    }
}
