<?php

namespace App\Policies;

use App\Models\DocumentationFile;
use App\Models\User;

class DocumentationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function view(User $user, DocumentationFile $file): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function generate(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function download(User $user, DocumentationFile $file): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform']);
    }

    public function delete(User $user, DocumentationFile $file): bool
    {
        return $user->hasRole('superadmin');
    }
}
