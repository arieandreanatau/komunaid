<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventChatThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_chat_id',
        'created_by',
        'message',
        'status',
    ];

    public function chat()
    {
        return $this->belongsTo(EventChat::class, 'event_chat_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
