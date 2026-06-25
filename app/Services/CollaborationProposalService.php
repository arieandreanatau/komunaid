<?php

namespace App\Services;

use App\Models\CollaborationProposal;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CollaborationProposalService
{
    public function createDraft(array $data, User $creator): CollaborationProposal
    {
        $data['status'] = 'draft';
        $data['created_by'] = $creator->id;

        $proposal = CollaborationProposal::create($data);

        AuditLog::log(
            'collaboration_proposal_created',
            $proposal,
            "Collaboration proposal draft created: {$proposal->title}",
            [],
            ['title' => $proposal->title, 'status' => 'draft']
        );

        return $proposal;
    }

    public function sendProposal(CollaborationProposal $proposal): bool
    {
        if ($proposal->status !== 'draft') {
            return false;
        }

        $proposal->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        AuditLog::log(
            'collaboration_proposal_sent',
            $proposal,
            "Collaboration proposal sent: {$proposal->title}",
            ['status' => 'draft'],
            ['status' => 'sent']
        );

        return true;
    }

    public function reviewProposal(CollaborationProposal $proposal, User $reviewer): bool
    {
        if (!in_array($proposal->status, ['sent'])) {
            return false;
        }

        $proposal->update([
            'status' => 'reviewed',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        AuditLog::log(
            'collaboration_proposal_reviewed',
            $proposal,
            "Collaboration proposal reviewed: {$proposal->title}",
            ['status' => 'sent'],
            ['status' => 'reviewed']
        );

        return true;
    }

    public function acceptProposal(CollaborationProposal $proposal, ?string $note = null): bool
    {
        if (!in_array($proposal->status, ['sent', 'reviewed'])) {
            return false;
        }

        $proposal->update([
            'status' => 'accepted',
            'response_note' => $note,
        ]);

        AuditLog::log(
            'collaboration_proposal_accepted',
            $proposal,
            "Collaboration proposal accepted: {$proposal->title}" . ($note ? ". Note: {$note}" : ''),
            ['status' => $proposal->getOriginal('status')],
            ['status' => 'accepted']
        );

        return true;
    }

    public function rejectProposal(CollaborationProposal $proposal, string $reason): bool
    {
        if (!in_array($proposal->status, ['sent', 'reviewed'])) {
            return false;
        }

        $proposal->update([
            'status' => 'rejected',
            'response_note' => $reason,
        ]);

        AuditLog::log(
            'collaboration_proposal_rejected',
            $proposal,
            "Collaboration proposal rejected: {$proposal->title}. Reason: {$reason}",
            ['status' => $proposal->getOriginal('status')],
            ['status' => 'rejected']
        );

        return true;
    }

    public function completeProposal(CollaborationProposal $proposal): bool
    {
        if ($proposal->status !== 'accepted') {
            return false;
        }

        $proposal->update(['status' => 'completed']);

        AuditLog::log(
            'collaboration_proposal_completed',
            $proposal,
            "Collaboration proposal completed: {$proposal->title}",
            ['status' => 'accepted'],
            ['status' => 'completed']
        );

        return true;
    }

    public function cancelProposal(CollaborationProposal $proposal, ?string $reason = null): bool
    {
        if (!in_array($proposal->status, ['draft', 'sent', 'reviewed'])) {
            return false;
        }

        $proposal->update(['status' => 'cancelled']);

        AuditLog::log(
            'collaboration_proposal_cancelled',
            $proposal,
            "Collaboration proposal cancelled: {$proposal->title}" . ($reason ? ". Reason: {$reason}" : ''),
            ['status' => $proposal->getOriginal('status')],
            ['status' => 'cancelled']
        );

        return true;
    }

    public function canManageProposal(CollaborationProposal $proposal, User $user): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        if ($proposal->created_by === $user->id) {
            return true;
        }

        if ($proposal->target_type === 'community') {
            return \App\Models\Community::where('id', $proposal->target_id)
                ->where('owner_id', $user->id)
                ->exists();
        }

        return false;
    }

    public function canRespondToProposal(CollaborationProposal $proposal, User $user): bool
    {
        if ($user->hasRole('superadmin')) {
            return true;
        }

        if ($proposal->target_type === 'community') {
            return \App\Models\Community::where('id', $proposal->target_id)
                ->where('owner_id', $user->id)
                ->exists();
        }

        return false;
    }
}
