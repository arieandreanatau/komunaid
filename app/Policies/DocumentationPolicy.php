<?php

namespace App\Policies;

use App\Models\DocumentationFile;
use App\Models\User;

class DocumentationPolicy
{
    private const ADMIN_ROLES = ['superadmin', 'platform_admin'];

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function view(User $user, DocumentationFile $file): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function generate(User $user): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function download(User $user, DocumentationFile $file): bool
    {
        return $user->hasAnyRole(self::ADMIN_ROLES);
    }

    public function delete(User $user, DocumentationFile $file): bool
    {
        return $user->hasRole('superadmin');
    }
}
