<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollaborationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'sender_community_id',
        'community_id',
        'created_by',
        'collaboration_type',
        'title',
        'proposal',
        'budget',
        'event_date',
        'contact_person',
        'contact_email',
        'contact_phone',
        'status',
        'response_notes',
        'responded_at',
    ];

    protected $casts = [
        'event_date' => 'date',
        'budget' => 'decimal:2',
        'responded_at' => 'datetime',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function senderCommunity()
    {
        return $this->belongsTo(Community::class, 'sender_community_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isFromBrand(): bool
    {
        return $this->brand_id !== null && $this->sender_community_id === null;
    }

    public function isFromCommunity(): bool
    {
        return $this->sender_community_id !== null;
    }

    public function canBeAccepted(): bool
    {
        return $this->status === 'pending';
    }

    public function canBeCancelled(): bool
    {
        return $this->status === 'pending';
    }
}
