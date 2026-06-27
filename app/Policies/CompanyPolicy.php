<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['superadmin', 'admin_platform', 'company_owner']);
    }

    public function view(User $user, Company $company): bool
    {
        if ($user->hasAnyRole(['superadmin', 'admin_platform'])) {
            return true;
        }
        return $company->isOwnedBy($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('company_owner');
    }

    public function update(User $user, Company $company): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $company->isOwnedBy($user);
    }

    public function delete(User $user, Company $company): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $company->isOwnedBy($user);
    }

    public function manageBrands(User $user, Company $company): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }
        return $company->isOwnedBy($user);
    }

    public function approve(User $user, Company $company): bool
    {
        return $user->hasRole('superadmin');
    }
}
