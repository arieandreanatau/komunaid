<?php

namespace App\Policies;

use App\Models\CollaborationRequest;
use App\Models\User;

class CollaborationRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'community_owner', 'brand_owner', 'brand_staff']);
    }

    public function view(User $user, CollaborationRequest $collaboration): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        if ($collaboration->brand_id && $collaboration->brand && $collaboration->brand->owner_id === $user->id) {
            return true;
        }
        if ($collaboration->community && $collaboration->community->owner_id === $user->id) {
            return true;
        }
        if ($collaboration->sender_community_id && $collaboration->senderCommunity && $collaboration->senderCommunity->owner_id === $user->id) {
            return true;
        }
        return false;
    }

    public function respond(User $user, CollaborationRequest $collaboration): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $collaboration->community && $collaboration->community->owner_id === $user->id;
    }

    public function cancel(User $user, CollaborationRequest $collaboration): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        if ($collaboration->brand_id && $collaboration->brand && $collaboration->brand->owner_id === $user->id) {
            return true;
        }
        if ($collaboration->sender_community_id && $collaboration->senderCommunity && $collaboration->senderCommunity->owner_id === $user->id) {
            return true;
        }
        return false;
    }
}
