<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CommunityRegion extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_id',
        'owner_id',
        'name',
        'slug',
        'description',
        'city',
        'province',
        'status',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($region) {
            if (empty($region->slug)) {
                $region->slug = Str::slug($region->name);
            }
        });
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(CommunityMember::class);
    }
}
