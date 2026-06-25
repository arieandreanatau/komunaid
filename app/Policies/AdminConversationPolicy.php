<?php

namespace App\Policies;

use App\Models\AdminConversation;
use App\Models\AdminConversationParticipant;
use App\Models\User;

class AdminConversationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('superadmin') || $user->hasRole('platform_admin');
    }

    public function view(User $user, AdminConversation $conversation): bool
    {
        if (!$user->hasRole('superadmin') && !$user->hasRole('platform_admin')) {
            return false;
        }

        return AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasRole('superadmin') || $user->hasRole('platform_admin');
    }

    public function sendMessage(User $user, AdminConversation $conversation): bool
    {
        if ($conversation->status !== 'active') {
            return false;
        }

        return AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->exists();
    }

    public function archive(User $user, AdminConversation $conversation): bool
    {
        return AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->exists();
    }

    public function manageParticipants(User $user, AdminConversation $conversation): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return AdminConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->where('role', 'owner')
            ->whereNull('deleted_at')
            ->exists();
    }
}
