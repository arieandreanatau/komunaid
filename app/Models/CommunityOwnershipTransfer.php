<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommunityOwnershipTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_id', 'old_owner_id', 'new_owner_id', 'transferred_by',
        'reason', 'transferred_at', 'status',
    ];

    protected $casts = ['transferred_at' => 'datetime'];

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function oldOwner()
    {
        return $this->belongsTo(User::class, 'old_owner_id');
    }

    public function newOwner()
    {
        return $this->belongsTo(User::class, 'new_owner_id');
    }
}
