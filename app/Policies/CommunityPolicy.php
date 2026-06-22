<?php

namespace App\Policies;

use App\Models\Community;
use App\Models\User;

class CommunityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'community_owner']);
    }

    public function view(User $user, Community $community): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $community->owner_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('community_owner');
    }

    public function update(User $user, Community $community): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $community->owner_id;
    }

    public function delete(User $user, Community $community): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $community->owner_id;
    }

    public function manageMembers(User $user, Community $community): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $community->owner_id;
    }

    public function manageRegions(User $user, Community $community): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $community->owner_id;
    }

    public function manageSubgroups(User $user, Community $community): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $community->owner_id;
    }

    public function approve(User $user, Community $community): bool
    {
        return $user->hasRole('superadmin');
    }
}
