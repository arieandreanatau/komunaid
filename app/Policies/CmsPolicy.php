<?php

namespace App\Policies;

use App\Models\User;

class CmsPolicy
{
    private const ADMIN_ROLES = ['superadmin', 'platform_admin'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function view(User $user, $resource): bool
    {
        if ($user->hasAnyRole(self::ADMIN_ROLES)) {
            return true;
        }
        if (property_exists($resource, 'is_published')) {
            return $resource->is_published === true;
        }
        if (property_exists($resource, 'status')) {
            return $resource->status === 'published';
        }
        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function update(User $user, $resource = null): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function delete(User $user, $resource = null): bool
    {
        return $user->hasRole('superadmin');
    }

    public function publish(User $user, $resource = null): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }
}
