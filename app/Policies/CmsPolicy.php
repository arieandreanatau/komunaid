<?php

namespace App\Policies;

use App\Models\CmsPage;
use App\Models\User;

class CmsPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function view(User $user, CmsPage $page): bool
    {
        if ($user->hasAnyRole(['superadmin', 'admin_platform'])) {
            return true;
        }
        return $page->is_published === true || $page->status === 'published';
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function update(User $user, CmsPage $page): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function delete(User $user, CmsPage $page): bool
    {
        return $user->hasRole('superadmin');
    }

    public function publish(User $user, CmsPage $page): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }
}
