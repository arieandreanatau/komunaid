<?php

namespace App\Services;

use App\Models\RoleRequest;
use App\Models\User;
use App\Enums\ApprovalStatus;

class RoleRequestService
{
    public function createRequest(User $user, array $data): RoleRequest
    {
        $requestedRole = $data['requested_role'];

        $payload = array_filter([
            'motivation' => $data['motivation'] ?? null,
            'community_name' => $data['community_name'] ?? null,
            'community_category' => $data['community_category'] ?? null,
            'community_description' => $data['community_description'] ?? null,
            'community_regional' => $data['community_regional'] ?? null,
            'brand_name' => $data['brand_name'] ?? null,
            'brand_industry' => $data['brand_industry'] ?? null,
            'brand_website' => $data['brand_website'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'company_industry' => $data['company_industry'] ?? null,
            'company_website' => $data['company_website'] ?? null,
        ]);

        return $user->roleRequests()->create([
            'requested_role' => $requestedRole,
            'status' => 'pending',
            'payload' => $payload ?: null,
        ]);
    }

    public function canRequestRole(User $user, string $requestedRole): ?string
    {
        if ($user->isBannedOrSuspended()) {
            return 'Akun Anda sedang dibatasi.';
        }

        if ($user->hasRole($requestedRole)) {
            return 'Anda sudah memiliki role ini.';
        }

        if ($user->hasPendingRoleRequest($requestedRole)) {
            return 'Anda sudah memiliki pengajuan role yang sedang diproses.';
        }

        return null;
    }
}
