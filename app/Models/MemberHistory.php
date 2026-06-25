<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MemberHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'type', 'title', 'description',
        'reference_type', 'reference_id', 'metadata',
    ];

    protected $casts = ['metadata' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
