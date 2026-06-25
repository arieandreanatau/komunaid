<?php

namespace Database\Seeders;

use App\Models\AdminConversation;
use App\Models\AdminConversationParticipant;
use App\Models\AdminMessage;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoAdminChatSeeder extends Seeder
{
    public function run(): void
    {
        $superadmin = User::where('email', 'superadmin@komuna.id')->first()
            ?? User::where('email', 'superadmin@komuna.test')->first();
        $admin = User::where('email', 'admin@komuna.test')->first();

        if (!$superadmin || !$admin) {
            $this->command->warn('Required demo users missing. Skipping DemoAdminChatSeeder.');
            return;
        }

        $conversation = AdminConversation::updateOrCreate(
            ['title' => 'Koordinasi Launching KomunaID V2'],
            [
                'type' => 'group',
                'created_by' => $superadmin->id,
                'status' => 'active',
            ]
        );

        AdminConversationParticipant::updateOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $superadmin->id],
            ['role' => 'admin']
        );

        AdminConversationParticipant::updateOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $admin->id],
            ['role' => 'member']
        );

        $hasMessages = AdminMessage::where('conversation_id', $conversation->id)->exists();

        if (!$hasMessages) {
            AdminMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $superadmin->id,
                'body' => 'Halo, mari koordinasi untuk launching KomunaID V2.',
                'message_type' => 'system',
            ]);

            AdminMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $admin->id,
                'body' => 'Baik, saya sudah mengecek semua modul. Siap untuk launching.',
                'message_type' => 'text',
            ]);

            AdminMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $superadmin->id,
                'body' => 'Bagus. Pastikan semua demo data sudah ter-seed dengan benar.',
                'message_type' => 'text',
            ]);
        }
    }
}
