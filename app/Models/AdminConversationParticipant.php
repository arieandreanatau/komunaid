<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdminConversationParticipant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'role',
        'is_muted',
        'last_read_at',
        'archived_at',
        'joined_at',
        'left_at',
    ];

    protected $casts = [
        'is_muted' => 'boolean',
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
        'last_read_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(AdminConversation::class, 'conversation_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }
}
