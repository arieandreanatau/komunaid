<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventVolunteerCampaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id', 'created_by', 'title', 'description', 'positions',
        'quota', 'start_date', 'end_date', 'requirements', 'status',
    ];

    protected $casts = [
        'positions' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications()
    {
        return $this->hasMany(EventVolunteerApplication::class, 'event_volunteer_campaign_id');
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }
}
