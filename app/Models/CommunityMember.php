<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunityMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_id',
        'user_id',
        'role',
        'status',
        'banned_at',
        'ban_reason',
        'joined_at',
    ];

    protected $casts = [
        'banned_at' => 'datetime',
        'joined_at' => 'datetime',
    ];

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function memberRoles()
    {
        return $this->hasMany(CommunityMemberRole::class, 'user_id')
            ->where('community_id', $this->community_id);
    }
}
