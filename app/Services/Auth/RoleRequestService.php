<?php

namespace App\Services\Auth;

use App\Models\ApprovalLog;
use App\Models\RoleRequest;
use App\Models\User;
use App\Support\Enums\RoleRequestStatusEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleRequestService
{
    public function approve(RoleRequest $request, User $reviewer, ?string $note = null): bool
    {
        if (!$request->status instanceof RoleRequestStatusEnum
            ? !in_array($request->status, [RoleRequestStatusEnum::Pending->value], true)
            : !$request->status === RoleRequestStatusEnum::Pending) {
            return false;
        }

        return DB::transaction(function () use ($request, $reviewer, $note) {
            $request->update([
                'status' => RoleRequestStatusEnum::Approved->value,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            $user = $request->user;
            if ($user && !$user->hasRole($request->requested_role)) {
                $user->assignRole($request->requested_role);
            }

            ApprovalLog::create([
                'subject_type' => User::class,
                'subject_id' => $user?->id,
                'action' => 'role_request.approved',
                'reviewer_id' => $reviewer->id,
                'note' => $note,
                'metadata' => ['requested_role' => $request->requested_role],
            ]);

            Log::info('role_request.approved', [
                'role_request_id' => $request->id,
                'user_id' => $user?->id,
                'requested_role' => $request->requested_role,
                'reviewer_id' => $reviewer->id,
            ]);

            return true;
        });
    }

    public function reject(RoleRequest $request, User $reviewer, ?string $note = null): bool
    {
        if ($request->status === RoleRequestStatusEnum::Approved->value
            || $request->status === RoleRequestStatusEnum::Rejected->value
            || $request->status === RoleRequestStatusEnum::Cancelled->value) {
            return false;
        }

        return DB::transaction(function () use ($request, $reviewer, $note) {
            $request->update([
                'status' => RoleRequestStatusEnum::Rejected->value,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            ApprovalLog::create([
                'subject_type' => User::class,
                'subject_id' => $request->user_id,
                'action' => 'role_request.rejected',
                'reviewer_id' => $reviewer->id,
                'note' => $note,
                'metadata' => ['requested_role' => $request->requested_role],
            ]);

            Log::info('role_request.rejected', [
                'role_request_id' => $request->id,
                'user_id' => $request->user_id,
                'requested_role' => $request->requested_role,
                'reviewer_id' => $reviewer->id,
            ]);

            return true;
        });
    }

    public function cancel(RoleRequest $request, User $user): bool
    {
        if ($request->user_id !== $user->id) {
            return false;
        }
        if ($request->status !== RoleRequestStatusEnum::Pending->value) {
            return false;
        }

        $request->update(['status' => RoleRequestStatusEnum::Cancelled->value]);
        return true;
    }
}
