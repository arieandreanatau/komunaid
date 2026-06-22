<?php

namespace App\Policies;

use App\Models\Brand;
use App\Models\User;

class BrandPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'brand_owner', 'brand_staff']);
    }

    public function view(User $user, Brand $brand): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        if ($user->id === $brand->owner_id) {
            return true;
        }

        return $user->hasRole('brand_staff') && $brand->activeMembers()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasRole('brand_owner');
    }

    public function update(User $user, Brand $brand): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $brand->owner_id;
    }

    public function delete(User $user, Brand $brand): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $brand->owner_id;
    }

    public function manageMembers(User $user, Brand $brand): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $user->id === $brand->owner_id;
    }

    public function approve(User $user, Brand $brand): bool
    {
        return $user->hasRole('superadmin');
    }
}
