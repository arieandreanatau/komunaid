<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CommunitySubgroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'community_id',
        'owner_id',
        'parent_id',
        'name',
        'slug',
        'description',
        'status',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($subgroup) {
            if (empty($subgroup->slug)) {
                $subgroup->slug = Str::slug($subgroup->name);
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

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }
}
