<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityInternalRole extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'community_id', 'name', 'slug', 'description', 'permissions', 'is_active',
    ];

    protected $casts = ['permissions' => 'array', 'is_active' => 'boolean'];

    public function community()
    {
        return $this->belongsTo(Community::class);
    }
}
