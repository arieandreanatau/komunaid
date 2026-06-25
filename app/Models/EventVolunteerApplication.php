<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventVolunteerApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_volunteer_campaign_id', 'user_id', 'position_applied',
        'motivation', 'answers', 'status', 'reviewed_by', 'reviewed_at', 'reason',
    ];

    protected $casts = [
        'answers' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(EventVolunteerCampaign::class, 'event_volunteer_campaign_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}
