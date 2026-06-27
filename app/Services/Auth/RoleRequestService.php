<?php

namespace App\Services\Auth;

use App\Enums\ApprovalStatus;
use App\Models\ApprovalLog;
use App\Models\RoleRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleRequestService
{
    public function approve(RoleRequest $request, User $reviewer, ?string $note = null): bool
    {
        if ($this->isTerminal($request->status)) {
            return false;
        }

        return DB::transaction(function () use ($request, $reviewer, $note) {
            $locked = RoleRequest::where('id', $request->id)
                ->where('status', ApprovalStatus::PENDING->value)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                return false;
            }

            $locked->update([
                'status' => ApprovalStatus::APPROVED->value,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            $user = $locked->user;
            if ($user && method_exists($user, 'hasRole') && !$user->hasRole($locked->requested_role)) {
                $user->assignRole($locked->requested_role);
            }

            if (class_exists(ApprovalLog::class)) {
                ApprovalLog::create([
                    'reviewed_by' => $reviewer->id,
                    'type' => 'role_request',
                    'approvable_id' => $locked->id,
                    'approvable_type' => RoleRequest::class,
                    'action' => 'approved',
                    'notes' => $note ?? 'Role request disetujui: ' . $locked->requested_role,
                ]);
            }

            Log::info('role_request.approved', [
                'role_request_id' => $locked->id,
                'user_id' => $user?->id,
                'requested_role' => $locked->requested_role,
                'reviewer_id' => $reviewer->id,
            ]);

            return true;
        });
    }

    public function reject(RoleRequest $request, User $reviewer, ?string $note = null): bool
    {
        if ($this->isTerminal($request->status)) {
            return false;
        }

        return DB::transaction(function () use ($request, $reviewer, $note) {
            $locked = RoleRequest::where('id', $request->id)
                ->where('status', ApprovalStatus::PENDING->value)
                ->lockForUpdate()
                ->first();

            if (!$locked) {
                return false;
            }

            $locked->update([
                'status' => ApprovalStatus::REJECTED->value,
                'reason' => $note,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            if (class_exists(ApprovalLog::class)) {
                ApprovalLog::create([
                    'reviewed_by' => $reviewer->id,
                    'type' => 'role_request',
                    'approvable_id' => $locked->id,
                    'approvable_type' => RoleRequest::class,
                    'action' => 'rejected',
                    'notes' => 'Role request ditolak: ' . ($note ?? 'tanpa alasan'),
                ]);
            }

            Log::info('role_request.rejected', [
                'role_request_id' => $locked->id,
                'user_id' => $locked->user_id,
                'requested_role' => $locked->requested_role,
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

        if ($request->status !== ApprovalStatus::PENDING) {
            return false;
        }

        $request->update(['status' => ApprovalStatus::CANCELLED->value]);
        return true;
    }

    private function isTerminal($status): bool
    {
        if ($status instanceof ApprovalStatus) {
            return in_array($status, [ApprovalStatus::APPROVED, ApprovalStatus::REJECTED, ApprovalStatus::CANCELLED], true);
        }
        if (is_string($status)) {
            return in_array($status, [
                ApprovalStatus::APPROVED->value,
                ApprovalStatus::REJECTED->value,
                ApprovalStatus::CANCELLED->value,
            ], true);
        }
        return false;
    }
}
