<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityCampaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'community_id', 'created_by', 'type', 'title', 'slug', 'description',
        'start_date', 'end_date', 'period_start', 'period_end', 'status',
        'requirements', 'positions', 'quota', 'is_premium',
    ];

    protected $casts = [
        'positions' => 'array',
        'is_premium' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
    ];

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications()
    {
        return $this->hasMany(CommunityCampaignApplication::class, 'campaign_id');
    }
}
