<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FeatureLock extends Model
{
    use HasFactory;

    protected $fillable = [
        'feature_key', 'feature_name', 'description', 'is_premium',
        'is_trial_available', 'is_enabled',
    ];

    protected $casts = [
        'is_premium' => 'boolean',
        'is_trial_available' => 'boolean',
        'is_enabled' => 'boolean',
    ];
}
