<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityVolunteer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'community_volunteers';

    protected $fillable = [
        'community_id', 'user_id', 'position', 'task_description',
        'start_date', 'end_date', 'active_until_year', 'status',
        'is_verified', 'created_by', 'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_verified' => 'boolean',
    ];

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
