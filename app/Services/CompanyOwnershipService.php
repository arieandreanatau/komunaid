<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Company;
use App\Models\AuditLog;
use App\Models\User;

class CompanyOwnershipService
{
    public function canManageCompany(Company $company, User $user): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        return $company->owner_id === $user->id;
    }

    public function canManageBrandUnderCompany(Brand $brand, Company $company, User $user): bool
    {
        if (!$this->canManageCompany($company, $user)) {
            return false;
        }

        return $brand->company_id === $company->id;
    }

    public function getCompanyBrands(Company $company)
    {
        return $company->brands()->latest()->get();
    }

    public function attachBrandToCompany(Brand $brand, Company $company, User $user): bool
    {
        $brand->update(['company_id' => $company->id]);

        AuditLog::log(
            'brand_attached_to_company',
            $brand,
            "Brand #{$brand->id} ({$brand->name}) attached to company #{$company->id} ({$company->name}) by user #{$user->id}",
            ['company_id' => null],
            ['company_id' => $company->id]
        );

        return true;
    }

    public function detachBrandFromCompany(Brand $brand, Company $company, User $user): bool
    {
        $oldCompanyId = $brand->company_id;
        $brand->update(['company_id' => null]);

        AuditLog::log(
            'brand_detached_from_company',
            $brand,
            "Brand #{$brand->id} ({$brand->name}) detached from company #{$company->id} ({$company->name}) by user #{$user->id}",
            ['company_id' => $oldCompanyId],
            ['company_id' => null]
        );

        return true;
    }
}
