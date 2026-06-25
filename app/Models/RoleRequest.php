<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\ApprovalStatus;
use Illuminate\Database\Eloquent\Builder;

class RoleRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'requested_role',
        'status',
        'reviewed_by',
        'reviewed_at',
        'reason',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'status' => ApprovalStatus::class,
            'reviewed_at' => 'datetime',
            'payload' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', ApprovalStatus::PENDING);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', ApprovalStatus::APPROVED);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', ApprovalStatus::REJECTED);
    }

    public function scopeByRequestedRole(Builder $query, string $role): Builder
    {
        return $query->where('requested_role', $role);
    }

    public function getStatusBadgeClass(): string
    {
        return match ($this->status) {
            ApprovalStatus::PENDING => 'bg-yellow-100 text-yellow-800',
            ApprovalStatus::APPROVED => 'bg-green-100 text-green-800',
            ApprovalStatus::REJECTED => 'bg-red-100 text-red-800',
            ApprovalStatus::CANCELLED => 'bg-gray-100 text-gray-600',
        };
    }
}
