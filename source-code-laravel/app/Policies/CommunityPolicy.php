<?php

namespace App\Policies;

use App\Models\Community;
use App\Models\User;

class CommunityPolicy
{
    public function view(User $user, Community $community): bool
    {
        return true;
    }

    public function update(User $user, Community $community): bool
    {
        return $user->id === $community->owner_id || $user->hasRole('superadmin');
    }

    public function delete(User $user, Community $community): bool
    {
        return $user->id === $community->owner_id || $user->hasRole('superadmin');
    }
}
