<?php

namespace App\Services;

use App\Models\AdminConversation;
use App\Models\AdminConversationParticipant;
use App\Models\AdminMessage;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminChatService
{
    public function getConversationsForUser(User $user, array $filters = [])
    {
        $query = AdminConversation::query()
            ->with(['latestMessage.sender', 'participants.user'])
            ->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id)->whereNull('deleted_at');
            });

        $status = $filters['status'] ?? null;
        if ($status === 'archived') {
            $query->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->whereNotNull('archived_at')
                    ->whereNull('deleted_at');
            });
        } elseif ($status === 'active') {
            $query->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->whereNull('archived_at')
                    ->whereNull('deleted_at');
            });
        }

        $search = $filters['search'] ?? null;
        if ($search) {
            $query->search($search);
        }

        return $query->orderByDesc('last_message_at')->orderByDesc('created_at');
    }

    public function createConversation(User $creator, array $participantIds, string $messageBody, ?string $title = null): AdminConversation
    {
        return DB::transaction(function () use ($creator, $participantIds, $messageBody, $title) {
            $allParticipantIds = array_unique(array_merge([$creator->id], $participantIds));

            $type = count($allParticipantIds) > 2 ? 'group' : 'direct';
            if (!$title) {
                if ($type === 'direct') {
                    $otherUser = User::whereIn('id', $participantIds)->first();
                    $title = $otherUser ? $otherUser->name : 'Percakapan Admin';
                } else {
                    $title = 'Percakapan Admin';
                }
            }

            $conversation = AdminConversation::create([
                'title' => $title,
                'type' => $type,
                'created_by' => $creator->id,
                'status' => 'active',
            ]);

            $now = now();
            foreach ($allParticipantIds as $index => $userId) {
                AdminConversationParticipant::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $userId,
                    'role' => $userId === $creator->id ? 'owner' : 'member',
                    'joined_at' => $now,
                    'last_read_at' => $userId === $creator->id ? $now : null,
                ]);
            }

            $message = AdminMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $creator->id,
                'body' => $messageBody,
                'message_type' => 'text',
            ]);

            $conversation->update(['last_message_at' => $message->created_at]);

            AuditLog::log(
                'admin_conversation_created',
                $conversation,
                "Conversation '{$title}' created by {$creator->name}"
            );

            return $conversation->fresh(['latestMessage.sender', 'participants.user']);
        });
    }

    public function sendMessage(AdminConversation $conversation, User $sender, string $body): AdminMessage
    {
        $this->ensureParticipant($conversation, $sender);

        if ($conversation->status !== 'active') {
            throw new \Exception('Tidak bisa mengirim pesan ke percakapan yang sudah diarsipkan.');
        }

        $body = e($body);

        $message = AdminMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'body' => $body,
            'message_type' => 'text',
        ]);

        $conversation->update(['last_message_at' => $message->created_at]);

        $conversation->participants()
            ->where('user_id', $sender->id)
            ->update(['last_read_at' => now()]);

        return $message;
    }

    public function markAsRead(AdminConversation $conversation, User $user): void
    {
        AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->update(['last_read_at' => now()]);
    }

    public function unreadCountForUser(User $user): int
    {
        try {
            $conversations = AdminConversation::whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id)->whereNull('deleted_at');
            })->with(['participants' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])->get();

            $total = 0;
            foreach ($conversations as $conv) {
                $participant = $conv->participants->first();
                if (!$participant) {
                    continue;
                }
                $count = AdminMessage::where('conversation_id', $conv->id)
                    ->where('sender_id', '!=', $user->id)
                    ->whereNull('deleted_at')
                    ->where(function ($q) use ($participant) {
                        if ($participant->last_read_at) {
                            $q->where('created_at', '>', $participant->last_read_at);
                        }
                    })
                    ->count();
                $total += $count;
            }

            return $total;
        } catch (\Exception $e) {
            return 0;
        }
    }

    public function unreadCountForConversation(AdminConversation $conversation, User $user): int
    {
        try {
            $participant = AdminConversationParticipant::where('conversation_id', $conversation->id)
                ->where('user_id', $user->id)
                ->whereNull('deleted_at')
                ->first();

            if (!$participant) {
                return 0;
            }

            $query = AdminMessage::where('conversation_id', $conversation->id)
                ->where('sender_id', '!=', $user->id)
                ->whereNull('deleted_at');

            if ($participant->last_read_at) {
                $query->where('created_at', '>', $participant->last_read_at);
            }

            return $query->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    public function archiveForUser(AdminConversation $conversation, User $user): void
    {
        $this->ensureParticipant($conversation, $user);

        AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->update(['archived_at' => now()]);

        AuditLog::log(
            'admin_conversation_archived',
            $conversation,
            "Conversation archived by {$user->name}"
        );
    }

    public function unarchiveForUser(AdminConversation $conversation, User $user): void
    {
        $this->ensureParticipant($conversation, $user);

        AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->update(['archived_at' => null]);

        AuditLog::log(
            'admin_conversation_unarchived',
            $conversation,
            "Conversation unarchived by {$user->name}"
        );
    }

    public function addParticipant(AdminConversation $conversation, User $actor, User $target): void
    {
        $this->ensureParticipant($conversation, $actor);
        $this->ensureCanManageParticipants($conversation, $actor);

        if (!$target->hasRole('superadmin') && !$target->hasRole('platform_admin')) {
            throw new \Exception('Hanya admin platform yang bisa ditambahkan ke percakapan.');
        }

        if ($target->isBannedOrSuspended()) {
            throw new \Exception('User yang dibanned atau ditangguhkan tidak bisa ditambahkan.');
        }

        $existing = AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $target->id)
            ->first();

        if ($existing && $existing->deleted_at === null) {
            throw new \Exception('User sudah menjadi peserta percakapan ini.');
        }

        if ($existing) {
            $existing->update([
                'deleted_at' => null,
                'archived_at' => null,
                'joined_at' => now(),
            ]);
        } else {
            AdminConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'user_id' => $target->id,
                'role' => 'member',
                'joined_at' => now(),
            ]);
        }

        AdminMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $actor->id,
            'body' => "{$actor->name} menambahkan {$target->name} ke percakapan.",
            'message_type' => 'system',
        ]);

        AuditLog::log(
            'admin_participant_added',
            $conversation,
            "{$target->name} added to conversation by {$actor->name}"
        );
    }

    public function removeParticipant(AdminConversation $conversation, User $actor, AdminConversationParticipant $participant): void
    {
        $this->ensureCanManageParticipants($conversation, $actor);

        if ($participant->conversation_id !== $conversation->id) {
            throw new \Exception('Peserta tidak ditemukan di percakapan ini.');
        }

        if ($participant->role === 'owner' && $conversation->created_by === $participant->user_id) {
            $activeCount = AdminConversationParticipant::where('conversation_id', $conversation->id)
                ->whereNull('deleted_at')
                ->where('id', '!=', $participant->id)
                ->count();
            if ($activeCount === 0) {
                throw new \Exception('Tidak bisa menghapus satu-satunya peserta aktif.');
            }
        }

        $removedUser = $participant->user;

        $participant->update(['deleted_at' => now()]);

        AdminMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $actor->id,
            'body' => "{$actor->name} menghapus {$removedUser->name} dari percakapan.",
            'message_type' => 'system',
        ]);

        AuditLog::log(
            'admin_participant_removed',
            $conversation,
            "{$removedUser->name} removed from conversation by {$actor->name}"
        );
    }

    public function ensureParticipant(AdminConversation $conversation, User $user): void
    {
        $participant = AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->first();

        if (!$participant) {
            abort(403, 'Anda bukan peserta percakapan ini.');
        }
    }

    public function ensureCanManageParticipants(AdminConversation $conversation, User $actor): void
    {
        $participant = AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $actor->id)
            ->whereNull('deleted_at')
            ->first();

        if (!$participant) {
            abort(403, 'Anda bukan peserta percakapan ini.');
        }

        if ($participant->role !== 'owner' && !$actor->hasRole('superadmin')) {
            abort(403, 'Hanya pemilik atau superadmin yang bisa mengelola peserta.');
        }
    }
}
