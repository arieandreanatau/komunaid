<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityCampaignApplication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'campaign_id', 'user_id', 'position_applied', 'motivation',
        'answers', 'status', 'reviewed_by', 'reviewed_at', 'reason',
    ];

    protected $casts = [
        'answers' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function campaign()
    {
        return $this->belongsTo(CommunityCampaign::class, 'campaign_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
