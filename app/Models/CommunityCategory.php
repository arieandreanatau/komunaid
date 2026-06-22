<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommunityCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function communities()
    {
        return $this->hasMany(Community::class, 'category_id');
    }

    public function getActiveCommunitiesCountAttribute(): int
    {
        return $this->communities()->where('status', 'approved')->count();
    }
}
