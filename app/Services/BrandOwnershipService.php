<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\BrandOwnershipTransfer;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BrandOwnershipService
{
    public function transferBrand(Brand $brand, User $newOwner, ?string $reason = null): bool
    {
        return DB::transaction(function () use ($brand, $newOwner, $reason) {
            $oldOwnerId = $brand->owner_id;
            $currentUser = Auth::user();

            $brand->update(['owner_id' => $newOwner->id]);

            if (!$newOwner->hasRole('brand_owner')) {
                $newOwner->assignRole('brand_owner');
            }

            BrandOwnershipTransfer::create([
                'brand_id' => $brand->id,
                'old_owner_id' => $oldOwnerId,
                'new_owner_id' => $newOwner->id,
                'transferred_by' => $currentUser->id,
                'reason' => $reason,
                'transferred_at' => now(),
                'status' => 'completed',
            ]);

            AuditLog::log(
                'brand_ownership_transferred',
                $brand,
                "Brand ownership transferred from user #{$oldOwnerId} to user #{$newOwner->id}" . ($reason ? ". Reason: {$reason}" : ''),
                ['owner_id' => $oldOwnerId],
                ['owner_id' => $newOwner->id]
            );

            return true;
        });
    }

    public function attachToCompany(Brand $brand, int $companyId): bool
    {
        $brand->update(['company_id' => $companyId]);

        AuditLog::log(
            'brand_attached_to_company',
            $brand,
            "Brand #{$brand->id} attached to company #{$companyId}",
            ['company_id' => null],
            ['company_id' => $companyId]
        );

        return true;
    }

    public function detachFromCompany(Brand $brand): bool
    {
        $oldCompanyId = $brand->company_id;
        $brand->update(['company_id' => null]);

        AuditLog::log(
            'brand_detached_from_company',
            $brand,
            "Brand #{$brand->id} detached from company #{$oldCompanyId}",
            ['company_id' => $oldCompanyId],
            ['company_id' => null]
        );

        return true;
    }

    public function archiveBrand(Brand $brand): bool
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'archived']);

        AuditLog::log('brand_archived', $brand, "Brand archived: {$brand->name}", $old, ['status' => 'archived']);

        return true;
    }

    public function canManageBrand(Brand $brand, User $user): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        if ($brand->owner_id === $user->id) {
            return true;
        }

        if ($brand->company_id && $user->hasRole('company_owner')) {
            return \App\Models\Company::where('id', $brand->company_id)
                ->where('owner_id', $user->id)
                ->exists();
        }

        return false;
    }
}
