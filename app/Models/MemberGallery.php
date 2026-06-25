<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class MemberGallery extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'community_id', 'event_id', 'image_path',
        'caption', 'activity_date', 'visibility',
    ];

    protected $casts = ['activity_date' => 'date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
