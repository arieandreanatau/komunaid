<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubCommunity extends Model
{
    protected $fillable = [
        'community_id',
        'name',
        'description',
        'type',
        'location',
    ];

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}
