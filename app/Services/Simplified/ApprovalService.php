<?php

declare(strict_types=1);

namespace App\Services\Simplified;

use App\Models\Brand;
use App\Models\BrandMember;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Company;
use App\Models\CompanyMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class ApprovalService
{
    public function __construct(
        private AuditLogService $audit,
        private NotificationService $notifications,
    ) {}

    /**
     * Approve a community/brand/company entity and grant owner role.
     */
    public function approve(Model $entity, User $admin, ?Request $request = null): bool
    {
        $config = $this->resolveConfig($entity);
        if (! $config) {
            return false;
        }

        $oldStatus = $entity->status;

        $entity->update([
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'rejection_reason' => null,
            'revision_notes' => null,
        ]);

        $this->promoteOwnerCandidate($entity, $config, $admin);

        $this->grantOwnerRole($entity->owner_id ?? null, $config['owner_role']);

        $this->notifications->notifyUser(
            User::find($entity->owner_id),
            $config['approved_type'],
            $config['approved_title'],
            $config['approved_message'],
            ['entity_id' => $entity->id, 'name' => $entity->name]
        );

        $this->audit->log(
            actorId: $admin->id,
            action: $config['audit_approved'],
            subject: $entity,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'approved'],
            request: $request,
        );

        return true;
    }

    public function reject(Model $entity, string $reason, User $admin, ?Request $request = null): bool
    {
        $config = $this->resolveConfig($entity);
        if (! $config) {
            return false;
        }

        $oldStatus = $entity->status;
        $entity->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        $this->rejectMember($entity, $config);

        $this->notifications->notifyUser(
            User::find($entity->owner_id),
            $config['rejected_type'],
            $config['rejected_title'],
            $reason,
            ['entity_id' => $entity->id, 'name' => $entity->name]
        );

        $this->audit->log(
            actorId: $admin->id,
            action: $config['audit_rejected'],
            subject: $entity,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'rejected', 'rejection_reason' => $reason],
            request: $request,
        );

        return true;
    }

    public function requestRevision(Model $entity, string $notes, User $admin, ?Request $request = null): bool
    {
        $config = $this->resolveConfig($entity);
        if (! $config) {
            return false;
        }

        $oldStatus = $entity->status;
        $entity->update([
            'status' => 'need_revision',
            'revision_notes' => $notes,
        ]);

        $this->notifications->notifyUser(
            User::find($entity->owner_id),
            $config['revision_type'],
            $config['revision_title'],
            $notes,
            ['entity_id' => $entity->id, 'name' => $entity->name]
        );

        $this->audit->log(
            actorId: $admin->id,
            action: $config['audit_revision'],
            subject: $entity,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'need_revision', 'revision_notes' => $notes],
            request: $request,
        );

        return true;
    }

    public function suspend(Model $entity, string $reason, User $admin, ?Request $request = null): bool
    {
        $config = $this->resolveConfig($entity);
        if (! $config) {
            return false;
        }

        $oldStatus = $entity->status;
        $entity->update([
            'status' => 'suspended',
        ]);

        $this->audit->log(
            actorId: $admin->id,
            action: $config['audit_suspended'] ?? ($config['audit_rejected'].'_suspended'),
            subject: $entity,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'suspended'],
            request: $request,
        );

        return true;
    }

    private function resolveConfig(Model $entity): ?array
    {
        if ($entity instanceof Community) {
            return [
                'owner_role' => 'community_owner',
                'approved_type' => 'community_approved',
                'approved_title' => 'Komunitas Disetujui',
                'approved_message' => 'Selamat! Komunitas kamu telah disetujui oleh admin KomunaID.',
                'rejected_type' => 'community_rejected',
                'rejected_title' => 'Komunitas Ditolak',
                'revision_type' => 'community_revision',
                'revision_title' => 'Komunitas Perlu Revisi',
                'audit_approved' => 'community_approved',
                'audit_rejected' => 'community_rejected',
                'audit_revision' => 'community_revision_requested',
                'audit_suspended' => 'community_suspended',
            ];
        }
        if ($entity instanceof Brand) {
            return [
                'owner_role' => 'brand_owner',
                'approved_type' => 'brand_approved',
                'approved_title' => 'Brand Disetujui',
                'approved_message' => 'Selamat! Brand kamu telah disetujui oleh admin KomunaID.',
                'rejected_type' => 'brand_rejected',
                'rejected_title' => 'Brand Ditolak',
                'revision_type' => 'brand_revision',
                'revision_title' => 'Brand Perlu Revisi',
                'audit_approved' => 'brand_approved',
                'audit_rejected' => 'brand_rejected',
                'audit_revision' => 'brand_revision_requested',
                'audit_suspended' => 'brand_suspended',
            ];
        }
        if ($entity instanceof Company) {
            return [
                'owner_role' => 'company_owner',
                'approved_type' => 'company_approved',
                'approved_title' => 'Perusahaan Disetujui',
                'approved_message' => 'Selamat! Perusahaan kamu telah disetujui oleh admin KomunaID.',
                'rejected_type' => 'company_rejected',
                'rejected_title' => 'Perusahaan Ditolak',
                'revision_type' => 'company_revision',
                'revision_title' => 'Perusahaan Perlu Revisi',
                'audit_approved' => 'company_approved',
                'audit_rejected' => 'company_rejected',
                'audit_revision' => 'company_revision_requested',
                'audit_suspended' => 'company_suspended',
            ];
        }
        return null;
    }

    private function promoteOwnerCandidate(Model $entity, array $config, User $admin): void
    {
        if ($entity instanceof Community) {
            CommunityMember::where('community_id', $entity->id)
                ->where('user_id', $entity->owner_id)
                ->update([
                    'role' => 'owner',
                    'status' => 'active',
                    'approved_by' => $admin->id,
                    'approved_at' => now(),
                ]);
        } elseif ($entity instanceof Brand) {
            BrandMember::where('brand_id', $entity->id)
                ->where('user_id', $entity->owner_id)
                ->update([
                    'role' => 'owner',
                    'status' => 'active',
                    'joined_at' => now(),
                ]);
        } elseif ($entity instanceof Company) {
            CompanyMember::where('company_id', $entity->id)
                ->where('user_id', $entity->owner_id)
                ->update([
                    'role' => 'owner',
                    'status' => 'active',
                    'joined_at' => now(),
                ]);
        }
    }

    private function rejectMember(Model $entity, array $config): void
    {
        if ($entity instanceof Community) {
            CommunityMember::where('community_id', $entity->id)
                ->where('user_id', $entity->owner_id)
                ->update(['status' => 'rejected']);
        } elseif ($entity instanceof Brand) {
            BrandMember::where('brand_id', $entity->id)
                ->where('user_id', $entity->owner_id)
                ->update(['status' => 'rejected']);
        } elseif ($entity instanceof Company) {
            CompanyMember::where('company_id', $entity->id)
                ->where('user_id', $entity->owner_id)
                ->update(['status' => 'rejected']);
        }
    }

    private function grantOwnerRole(?int $userId, string $roleName): void
    {
        if (! $userId) {
            return;
        }
        $user = User::find($userId);
        if (! $user) {
            return;
        }
        $role = Role::where('name', $roleName)->first();
        if ($role && ! $user->hasRole($roleName)) {
            $user->assignRole($role);
        }
    }
}
