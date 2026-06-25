<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CollaborationProposal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'proposer_type', 'proposer_id', 'target_type', 'target_id',
        'collaboration_type_id', 'title', 'description', 'objective',
        'target_audience', 'benefit_for_brand', 'benefit_for_community',
        'estimated_budget', 'timeline', 'attachment_path', 'status',
        'sent_at', 'reviewed_by', 'reviewed_at', 'response_note', 'created_by',
    ];

    protected $casts = [
        'estimated_budget' => 'decimal:2',
        'sent_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function proposer(): MorphTo
    {
        return $this->morphTo();
    }

    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    public function collaborationType()
    {
        return $this->belongsTo(CollaborationType::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForCommunityOwner($query, $userId)
    {
        return $query->where('target_type', 'community')
            ->whereHas('target', function ($q) use ($userId) {
                $q->where('owner_id', $userId);
            });
    }

    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isEditable(): bool
    {
        return in_array($this->status, ['draft']);
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, ['draft', 'sent', 'reviewed']);
    }
}
