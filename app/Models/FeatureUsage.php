<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FeatureUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'feature_key', 'usage_count', 'limit_count',
        'period_start', 'period_end',
    ];

    protected $casts = [
        'usage_count' => 'integer',
        'limit_count' => 'integer',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
