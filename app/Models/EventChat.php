<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventChat extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'created_by',
        'title',
        'message',
        'is_pinned',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function threads()
    {
        return $this->hasMany(EventChatThread::class);
    }

    public function approvedThreads()
    {
        return $this->threads()->where('status', 'approved');
    }
}
