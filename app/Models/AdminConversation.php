<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class AdminConversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'type',
        'created_by',
        'last_message_at',
        'status',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants()
    {
        return $this->hasMany(AdminConversationParticipant::class, 'conversation_id');
    }

    public function activeParticipants()
    {
        return $this->hasMany(AdminConversationParticipant::class, 'conversation_id')
            ->whereNull('deleted_at')
            ->whereNull('archived_at');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'admin_conversation_participants', 'conversation_id', 'user_id')
            ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(AdminMessage::class, 'conversation_id');
    }

    public function latestMessage()
    {
        return $this->hasOne(AdminMessage::class, 'conversation_id')->latestOfMany();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->where('status', 'archived');
    }

    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId)->whereNull('deleted_at');
        });
    }

    public function scopeSearch(Builder $query, ?string $keyword): Builder
    {
        if (empty($keyword)) {
            return $query;
        }

        return $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
                ->orWhereHas('messages', function ($mq) use ($keyword) {
                    $mq->where('body', 'like', "%{$keyword}%");
                })
                ->orWhereHas('users', function ($uq) use ($keyword) {
                    $uq->where('name', 'like', "%{$keyword}%");
                });
        });
    }
}
